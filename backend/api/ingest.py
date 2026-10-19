"""
ingest.py — turn an uploaded document into job-description text.

A JD often arrives as a PDF or a Word document with the hiring manager's
comments still in it. Extracting the text here is the difference between one
drag-and-drop and a manual select-and-copy out of a viewer.

Everything is best-effort by design. A document is not a structured format, so
extraction can come back thin or noisy. When it does, the caller is *told* —
with a character count and a warning — rather than being handed a few lines of
letterhead and charged a model call for it.

Nothing here writes to disk, and the response is bounded so an enormous file
cannot hold a worker open.
"""

import io
import re
import zipfile

# Below this, the extraction is almost certainly a letterhead or a signature
# block rather than a job description, and the user should be warned.
MIN_CHARS = 200

# Hard ceiling on anything we read.
MAX_BYTES = 8 * 1024 * 1024

SUPPORTED_UPLOADS = (".pdf", ".docx", ".txt", ".md", ".text")


class IngestError(Exception):
    """A failure worth showing the user, phrased for them."""


def _tidy(text: str) -> str:
    """Collapse the ragged whitespace that documents leave behind."""
    lines = [re.sub(r"[ \t\u00a0\u200b]+", " ", line).strip() for line in text.splitlines()]
    out: list[str] = []
    for line in lines:
        if line:
            out.append(line)
        elif out and out[-1] != "":
            # At most one blank line in a row — enough to separate paragraphs
            # without the double-spacing documents love.
            out.append("")
    return "\n".join(out).strip()


def from_docx(data: bytes) -> str:
    """Read a .docx by unzipping it. A .docx is XML in a zip, so no dependency."""
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            xml = archive.read("word/document.xml").decode("utf-8", "replace")
    except (zipfile.BadZipFile, KeyError) as exc:
        raise IngestError(
            "That file is not a readable Word document. Save it as .docx or paste the text instead."
        ) from exc

    # Paragraph ends and explicit breaks are the newlines; every other tag is
    # markup to drop. Tab runs become a space so text is not full of gaps.
    xml = re.sub(r"</w:p\s*>", "\n", xml)
    xml = re.sub(r"<w:br[^>]*/>", "\n", xml)
    xml = re.sub(r"<w:tab[^>]*/>", " ", xml)
    xml = re.sub(r"<[^>]+>", "", xml)
    return _tidy(xml)


def from_pdf(data: bytes) -> str:
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise IngestError(
            "PDF reading is not installed on this server. Upload a .docx, or copy the text out of the PDF."
        ) from exc

    try:
        reader = PdfReader(io.BytesIO(data))
        pages = [page.extract_text() or "" for page in reader.pages]
    except Exception as exc:  # noqa: BLE001 — every malformed PDF variant lands here
        raise IngestError("That PDF could not be read. Paste the text instead.") from exc

    return _tidy("\n".join(pages))


def from_plain(data: bytes) -> str:
    return _tidy(data.decode("utf-8", "replace"))


def from_file(filename: str, data: bytes) -> str:
    if not data:
        raise IngestError("That file was empty.")
    if len(data) > MAX_BYTES:
        raise IngestError("That file is larger than 8 MB. Paste the text instead.")

    lowered = (filename or "").lower()
    if lowered.endswith(".pdf"):
        return from_pdf(data)
    if lowered.endswith(".docx"):
        return from_docx(data)
    if lowered.endswith((".txt", ".md", ".text")):
        return from_plain(data)
    if lowered.endswith(".doc"):
        raise IngestError(
            "The old .doc format cannot be read. Open it in Word and save as .docx, or paste the text."
        )
    raise IngestError(f"Unsupported file type. Try one of: {', '.join(SUPPORTED_UPLOADS)}.")
