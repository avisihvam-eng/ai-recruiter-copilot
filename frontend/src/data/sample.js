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
      'Owns the batch and streaming pipelines behind an analytics and machine learning platform on Google Cloud. Pairs reliability and cost discipline with mentoring two mid-level engineers.',
    responsibilities: [
      'Build and maintain batch and streaming pipelines on GCP.',
      'Own the dbt transformation layer in BigQuery.',
      'Partner with data scientists on feature engineering.',
      'Improve pipeline observability, alerting, and cost monitoring.',
      'Mentor two mid-level engineers and lead design reviews.',
    ],
    required_skills: [
      '6+ years in data engineering; 3+ hands-on with GCP.',
      'Strong Python for data processing and Airflow orchestration.',
      'Hands-on BigQuery and dbt, including dimensional modelling.',
      'Streaming pipelines with Pub/Sub or Kafka.',
      'Advanced SQL with large-scale query tuning.',
      'Terraform for infrastructure as code.',
    ],
    preferred_skills: ['Apache Beam or Dataflow pipeline experience.', 'Exposure to ML feature stores.'],
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

I'm recruiting a Senior Data Engineer for a platform team in Austin. The role owns batch and streaming pipelines on GCP and the dbt layer in BigQuery.

Your BigQuery and dbt background is a strong match, and the mentoring scope could be a good next step.

Worth a quick call?`,
  },

  linkedin_post: `\u{1F680} Hiring: Senior Data Engineer

Looking for someone strong in:
\u2022 BigQuery and dbt transformation modelling
\u2022 Python orchestration with Airflow or Cloud Composer
\u2022 Streaming pipelines on Pub/Sub or Kafka

Location: Austin, TX (Hybrid)
Experience: 6+ years

If this sounds like you or someone in your network, reach out.

\u{1F4E9} Send your resume to: avinash.shukla@agreeya.com`,

  recruiter_brief: {
    ideal_candidate:
      'A senior data engineer with GCP depth who owns batch and streaming pipelines and mentors two mid-level engineers.',
    screening_questions: [
      'Walk me through the largest pipeline you owned end to end.',
      'How did you structure a dbt project as it grew?',
      'Tell me about cutting pipeline cost without losing freshness.',
    ],
    watchouts: [
      'No salary band stated \u2014 confirm range and level.',
      'Hybrid cadence unspecified \u2014 confirm on-site days.',
    ],
  },
}

/** Shallow clone so demo mode can never mutate the fixture. */
export const cloneSampleResult = () => JSON.parse(JSON.stringify(SAMPLE_RESULT))
