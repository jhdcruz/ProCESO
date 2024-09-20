# ProCESO – Community Outreach Management System

AI-Integrated Community Outreach Management System with Sentiment Analysis and Automated E-Certificate for TIP
Manila – CESO Department.

> [!IMPORTANT]
> This system/application is **not meant for public usage**, and is tailored for a specific client in academic
> institutional context.
>
> This "system" only serves as public reference for similar system or application.

## Project Objectives

This capstone project aims to develop an AI-integrated web-based community outreach management system that simplifies
and centralizes administrative tasks to enhance the efficiency and impact of the institution’s community extension
services in fostering sustainable community relationships.

1. **To develop a system feature that facilitates the planning and coordination of community outreach activities**, such
   as managing faculty delegation, event sorting and filtering, uploading of after-activity report, and student
   participation;
2. **To implement automated processes for generating, distributing, and validating e-certificates** of participants,
   thereby reducing manual workload and improving operational efficiency;
3. **To integrate AI models for analyzing and evaluating feedback**, such as sentiment analysis, alternative textual
   analytics and analytics dashboard to effectively collect feedback and support data-driven decision-making through
   AI-assisted summary and insights.

## Tech Stack

Overview of current technologies and resources to be used in the system.

### Front-End

- Next.js
- React
- TypeScript
- [Mantine](https://mantine.dev/)
- TailwindCSS

### Core Packages

- [fullcalendar](https://www.npmjs.com/package/fullcalendar)
- [@mantine/tiptap](https://mantine.dev/x/tiptap/)
- [pdfkit](https://pdfkit.org/)
- [jimp](https://www.npmjs.com/package/jimp)

### Back-End

- Supabase (Database, Auth, Storage)
- Trigger.dev (Background Jobs, Cron Jobs)
- Resend (Email)

### AI Models

- [finiteautomata/bertweet-base-sentiment-analysis](https://huggingface.co/finiteautomata/bertweet-base-sentiment-analysis) (
  Sentiment Analysis)
- [microsoft/Phi-3-mini-128k-instruct](https://huggingface.co/microsoft/Phi-3-mini-128k-instruct) (Text Generation)
- [google/tapas-large-finetuned-wtq](https://huggingface.co/google/tapas-large-finetuned-wtq) (Table QA)

### Utilities

- GitHub Actions (CI)
- Codacy (SAST)
- FOSSA (License Compliance)
- Mend Renovate (Deps. Mgmt.)
- Mend Bolt (Deps. Vulnerability Scanner)

### Deployment

- Vercel

### Monitoring

- OneUptime (Uptime Monitoring)
- Baselime.io (Observability)
- Snyk.io (Application Security)

## Development

### Prerequisites

1. Download and setup [bun](https://bun.sh).

2. Setup instances of the ff.

   - [Supabase](https://database.new)
   - Configs can be acvquired from `supabase/` directory.
   - [Trigger.dev](https://cloud.trigger.dev/)
   - [Resend](https://resend.com/login)
   - [HuggingFace](https://huggingface.co/)

3. Install dependencies using `bun install` or `bun i`.

4. After setting up Supabase tables, generate types locally:

   ```sh
   SUPABASE_PROJECT=project-id bun gen:t
   ```

### Setup

1. Setup acquired environment variables from services above in `.env` file.

   > [!TIP]
   > A copy of `.env` file can be found in `.env.sample` file.

2. Configure Supabase Auth for [Google OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google).

3. Configure `trigger.config.ts`:

   ```ts
   export const config: TriggerConfig = {
     project: '', // change to your trigger.dev project api
     // ...
   };
   ```

4. Run the application

   ```sh
   bun dev     # or dev:t to use turbo
   bun dev:em  # to run email previews by react-email
   ```

### Doppler (Optional)

This project used [Doppler](https://doppler.com) ([CLI](https://docs.doppler.com/docs/install-cli))
for secrets management, therefore most scripts are
tailored for such env variables to be available when
running them using:

```sh
doppler run -- bun gen:t
```

Or you can do an alias to shorten it:

```sh
alias dp='doppler run --'

# now you can run scripts using:
dp bun gen:t
# or
dp bun dev
```

You can upload your existing `.env` file using:

```sh
doppler secret upload .env
```

> [!IMPORTANT]
>
> **You wouldn't need an `.env` file when using Doppler**.
> _(You can delete it)_
>
> It acquires the necessary secrets from doppler's dashboard
> using the CLI, and can be used across machines without manual transfers.

## Deployment

> [!NOTE]
> This project was deployed using [Vercel](https://vercel.com).
>
> Deploying to other providers are not tested, and is up to you.

After deploying the main application,
Don't forget to deploy the `Trigger.dev` triggers:

```sh
bun deploy:tr
# or
bunx trigger.dev@latest deploy
```

## License

This work is distributed under [Apache License, Version 2.0](https://opensource.org/license/apache-2-0).

[![FOSSA Status](https://app.fossa.com/api/projects/custom%2B26392%2Fgithub.com%2Fjhdcruz%2FProCESO.svg?type=large&issueType=license)](https://app.fossa.com/projects/custom%2B26392%2Fgithub.com%2Fjhdcruz%2FProCESO?ref=badge_large&issueType=license)

## Disclaimer

All trademarks, logos, and service marks displayed on this website are the property of their respective owners.

> **Technological Institute of the Philippines (T.I.P)**
>
> T.I.P and the T.I.P logos are trademarks or registered trademarks of Technological Institute of the Philippines (
> T.I.P) in the Philippines.

> **Google, LLC.**
>
> Google and the Google logos are trademarks or registered trademarks of Google LLC in the United States and other countries.
