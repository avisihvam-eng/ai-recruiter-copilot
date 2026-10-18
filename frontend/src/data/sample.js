/**
 * sample.js — fixture data for demo mode.
 *
 * Everything here is clearly labelled "Sample" in the UI. It exists so the
 * product can be previewed end to end without a Gemini key, and so the empty
 * state has something to show. It is never mixed with real API output.
 */

export const SAMPLE_JD = `Senior Data Engineer \u2014 Hybrid, Austin, TX

About the role
We are looking for a Senior Data Engineer to join our platform team and own the pipelines that power our analytics and machine learning products. You will work alongside data scientists, analysts, and product engineers in an environment where reliability and cost efficiency matter as much as speed.

What you'll do
- Design, build, and maintain batch and streaming data pipelines on Google Cloud Platform.
- Model data in BigQuery and own the transformation layer using dbt.
- Partner with data scientists to productionise feature engineering workflows.
- Improve pipeline observability, alerting, and cost monitoring.
- Mentor two mid-level engineers and lead design reviews.

Required
- 6+ years of data engineering experience, with at least 3 years hands-on with GCP.
- Strong Python for data processing and orchestration (Airflow or Cloud Composer).
- Hands-on experience with BigQuery, dbt, and dimensional data modelling.
- Experience building streaming pipelines with Pub/Sub or Kafka.
- Solid SQL skills and a track record of tuning large-scale queries.
- Familiarity with Terraform for infrastructure as code.

Preferred
- Experience with Apache Beam or Dataflow.
- Exposure to ML feature stores.
- Prior work in a regulated industry.`

export const SAMPLE_RESULT = {
  clean_jd: {
    title: 'Senior Data Engineer',
    location: 'Austin, TX (Hybrid)',
    experience: '6+ years',
    objective:
      'This role owns the data pipelines behind an analytics and machine learning platform, working across batch and streaming workloads on Google Cloud. The engineer partners closely with data scientists, analysts, and product engineers, and is expected to treat reliability, observability, and cost efficiency as first-class concerns. It also carries a mentoring responsibility for two mid-level engineers.',
    responsibilities: [
      'Design, build, and maintain batch and streaming data pipelines on Google Cloud Platform.',
      'Model data in BigQuery and own the transformation layer using dbt.',
      'Partner with data scientists to productionise feature engineering workflows.',
      'Improve pipeline observability, alerting, and cost monitoring.',
      'Mentor two mid-level engineers and lead design reviews.',
    ],
    required_skills: [
      'Six or more years of data engineering experience, including at least three years hands-on with Google Cloud Platform.',
      'Strong Python programming for data processing and workflow orchestration, using Airflow or Cloud Composer.',
      'Hands-on experience with BigQuery and dbt, including dimensional data modelling.',
      'Practical experience building streaming pipelines with Pub/Sub or Kafka.',
      'Advanced SQL skills with a demonstrated track record of tuning large-scale queries.',
      'Working familiarity with Terraform for infrastructure as code.',
    ],
    preferred_skills: [
      'Experience with Apache Beam or Google Cloud Dataflow for pipeline development.',
      'Exposure to machine learning feature stores.',
      'Prior experience working in a regulated industry.',
    ],
  },

  booleans: {
    strict:
      '("Data Engineer" OR "Senior Data Engineer") AND (BigQuery AND dbt) AND (Python AND Airflow) AND (GCP OR "Google Cloud Platform")',
    balanced:
      '(("Data Engineer" OR "Analytics Engineer" OR "Data Platform Engineer") AND (BigQuery OR Snowflake) AND (dbt AND Python) AND (Airflow OR "Cloud Composer" OR Dagster))',
    broad:
      '(("Data Engineer" OR "Analytics Engineer" OR "Platform Engineer" OR "ETL Developer") AND (BigQuery OR Snowflake OR Redshift OR Databricks) AND (Python OR Scala) AND (dbt OR "data modelling" OR "dimensional modelling"))',
  },

  outreach: {
    short: `Hi %FIRSTNAME%,

I'm hiring a Senior Data Engineer in Austin and your BigQuery plus dbt background lines up closely with what the team needs.

Would you be open to a short conversation this week?`,
    detailed: `Hi %FIRSTNAME%,

I'm recruiting a Senior Data Engineer for a platform team in Austin. The role owns batch and streaming pipelines on GCP and the dbt transformation layer in BigQuery, working directly alongside the data scientists.

Your background in BigQuery and dbt looks like a strong match, and the mentoring scope could be a good next step.

Worth a quick call to see if it fits?`,
  },

  linkedin_post: `\u{1F680} Hiring: Senior Data Engineer

Looking for someone strong in:
\u2022 BigQuery and dbt transformation modelling
\u2022 Python orchestration with Airflow or Cloud Composer
\u2022 Streaming pipelines on Pub/Sub or Kafka

Location: Austin, TX (Hybrid)
Experience: 6+ years

If this sounds like you or someone in your network, feel free to reach out.

Let me know and I'll share the details.`,

  recruiter_brief: {
    ideal_candidate:
      'A data engineer with six or more years of experience who has spent the last three on Google Cloud, owning both batch and streaming pipelines and the dbt transformation layer in BigQuery. They have productionised feature engineering work with data scientists and have carried mentoring responsibility for more junior engineers.',
    screening_questions: [
      'Walk me through the largest data pipeline you have owned end to end. What did reliability look like day to day?',
      'How have you structured a dbt project as it grew? Where did the modelling start to hurt?',
      'Tell me about a time you had to reduce pipeline cost without losing freshness or correctness.',
      'How have you handled a streaming pipeline failure in production, and what did you change afterwards?',
    ],
    watchouts: [
      'The JD does not state a compensation band \u2014 confirm the range and level before opening the search.',
      'Hybrid cadence in Austin is unspecified. Confirm the number of on-site days and whether relocation support exists.',
      'Mentoring two engineers is stated as a duty but no people-management expectation is defined \u2014 clarify whether this is IC scope or a lead track.',
    ],
  },
}

/** Shallow clone so demo mode can never mutate the fixture. */
export const cloneSampleResult = () => JSON.parse(JSON.stringify(SAMPLE_RESULT))
