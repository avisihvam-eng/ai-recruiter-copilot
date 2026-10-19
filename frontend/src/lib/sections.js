import { IconChat, IconChecklist, IconDoc, IconSearch, IconShare } from '../components/Icons'

/**
 * sections.js — single source of truth for the five generated assets.
 *
 * Both the sticky workspace nav and the rendered section order read from this,
 * so they can never drift apart. The icon travels with the section so the nav
 * rail and the empty-state list stay in sync too.
 */

export const SECTIONS = [
  {
    id: 'role-brief',
    num: '01',
    label: 'Formatted job description',
    // Present participle: used only for the run-progress list, where the noun
    // form ("Formatted job description") reads as though the work were done.
    progress: 'Formatting job description',
    blurb: 'Job title, location, duties and skills',
    Icon: IconDoc,
  },
  {
    id: 'search-strings',
    num: '02',
    label: 'Search strings',
    progress: 'Writing Boolean searches',
    blurb: 'Strict \u00b7 balanced \u00b7 broad Boolean',
    Icon: IconSearch,
  },
  {
    id: 'outreach',
    num: '03',
    label: 'Candidate outreach',
    progress: 'Drafting outreach messages',
    blurb: 'Short and detailed messages',
    Icon: IconChat,
  },
  {
    id: 'linkedin-post',
    num: '04',
    label: 'LinkedIn post',
    progress: 'Writing the LinkedIn post',
    blurb: 'Formatted and ready to publish',
    Icon: IconShare,
  },
  {
    id: 'recruiter-prep',
    num: '05',
    label: 'Recruiter prep',
    progress: 'Preparing the intake brief',
    blurb: 'Screening questions and watch-outs',
    Icon: IconChecklist,
  },
]

export const SOURCE_ID = 'source-jd'
