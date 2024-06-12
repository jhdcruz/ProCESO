# ProCESO

**Complete Title:**
ProCESO - Community Outreach Internal Management System with Feedback Sentiment Analysis and Automated Certificate Generation for TIP Manila - CESO Department.

> [!IMPORTANT]
> This system/application is **not meant for public usage**, and is specifically tailored for a specific client. This only serves as public reference for similar system or application.

## Features

Proposed feature **to be implemented**.

- Attendance Monitoring
- Event Management
  - Faculty Placement/Delegation
  - Event Analytics and Feedback Sentiment Analysis
- Event Calendar View
- Automated Certificate Generation


## Limitations

- The system only focuses on internal management and processes. External participants and/or processes are considered as out-of-scope.


## Tech Stack

Overview of current technologies and resources to be used in the system.

### Front-End

- React.js
- TypeScript
- Next.js
- [Mantine](https://mantine.dev/)
- TailwindCSS
- [@toast-ui/calendar](https://github.com/nhn/tui.calendar/tree/main/apps/react-calendar)  (Calendar UI)
- [@toast-ui/editor](https://github.com/nhn/tui.editor/tree/master/apps/react-editor) (Editor)

### Back-End

- Supabase (Database, Auth, Storage)
- Trigger.dev (Background Jobs, Cron Jobs)
- Resend (Email)
- Novu (Notifications)

### AI Models

- [cardiffnlp/twitter-roberta-base-sentiment-latest](https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest) (Sentiment Analysis)
- [mistralai/Mistral-7B-Instruct-v0.3](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3) (Text Generation)

> **NOTE:** Selected AI models should be self-hostable. See [Panel Questions](https://app.plane.so/deuz/projects/11d20b8a-9a14-409b-b87e-86167001e336/pages/219e3135-449a-4184-99aa-cb9329780317).
>
> For Mistral: <https://discuss.huggingface.co/t/run-with-docker-locally-registry-hf-space/35198/7>

### Utilities

- GitHub Actions (CI)
- Codacy (SAST)
- FOSSA (Pkgs License Compliance)
- Mend Renovate (Deps. Mgmt.)
- Mend Bolt (Deps. Vulnerability Scanner)

### Deployment

- Vercel
- Docker
- Kubernetes

## License

This work ("system") is distributed under [Apache License, Version 2.0](https://opensource.org/license/apache-2-0).

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fjhdcruz%2FProCESO.svg?type=large&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fjhdcruz%2FProCESO?ref=badge_large&issueType=license)

## Disclaimer

All trademarks, logos, and service marks displayed on this website are the property of their respective owners.

> T.I.P and the T.I.P logos are trademarks or registered trademarks of Technological Institute of the Philippines (T.I.P) in the Philippines.
