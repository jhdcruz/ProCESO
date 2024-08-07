# ProCESO – Community Outreach Management System

**Complete Title:**
ProCESO – AI-Integrated Community Outreach Management System with Sentiment Analysis and Automated E-Certificate for TIP Manila – CESO Department

> [!IMPORTANT]
> This system/application is **not meant for public usage**, and is tailored for a specific client in academic institutional context.
>
> This "system" only serves as public reference for similar system or application.

## Project Objectives

This capstone project aims to develop an AI-integrated web-based community outreach management system that simplifies
and centralizes administrative tasks to enhance the efficiency and impact of the institution’s community extension
services in fostering sustainable community relationships.

- **Develop a feature that simplifies planning and participating in community outreach activities**, such as faculty
  delegations and student participants’ newsletters, increasing engagement and participation;
- **To implement automated processes for generating, distributing, and validating e-certificates** of participants, thereby reducing manual workload and improving operational efficiency; and
- **To integrate AI** for analyzing and evaluating feedback, such as sentiment analysis, to effectively collect feedback and support data-driven decision-making through AI-assisted summary and insights.

## Features

- Outreach Activities Mgmt.
  - Faculty Delegation
  - Event Timeline/Backtracking
- Automated E-Certificates (Generation, Distribution, Valdation)
- Feedback Analysis
  - Sentiment Analysis
  - AI-assisted Summary & Insights

## Tech Stack

Overview of current technologies and resources to be used in the system.

### Front-End

- Next.js
- React
- TypeScript
- [Mantine](https://mantine.dev/)
- TailwindCSS

### Core Packages

- [@toast-ui/calendar](https://github.com/nhn/tui.calendar/tree/main/apps/react-calendar)
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

## Monitoring

- OneUptime (Uptime Monitoring)
- Baselime.io (Observability)

## License

This work ("system") is distributed under [Apache License, Version 2.0](https://opensource.org/license/apache-2-0).

[![FOSSA Status](https://app.fossa.com/api/projects/custom%2B26392%2Fgithub.com%2Fjhdcruz%2FProCESO.svg?type=large&issueType=license)](https://app.fossa.com/projects/custom%2B26392%2Fgithub.com%2Fjhdcruz%2FProCESO?ref=badge_large&issueType=license)

## Disclaimer

All trademarks, logos, and service marks displayed on this website are the property of their respective owners.

> T.I.P and the T.I.P logos are trademarks or registered trademarks of Technological Institute of the Philippines (
> T.I.P) in the Philippines.
