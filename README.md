# MindCat Web

Web client for MindCat, a mental health continuity platform that connects patients and psychologists between therapy sessions. This is the primary client of the [MindCat API](https://github.com/Kuligowskilucas/MindCatApi).

Built with Next.js and React, using the App Router.

## What it does

The application has three areas, separated by role.

Patients record a daily mood on a five-point scale, view a seven-day mood chart, write in a password-protected diary, and complete tasks assigned by their psychologist.

Psychologists work from a desktop-oriented panel: they link to patients through an invite code, read a clinical summary, and assign therapeutic tasks. Access to patient data requires an approved professional credential and active patient consent, both checked at read time.

Admins review the professional credential queue and approve or reject submissions.

There is also a public help page with crisis contacts and a clear statement that the platform is not an emergency service.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4, configured through CSS with `@theme` rather than a config file
- TanStack Query for server state

Server state is handled almost entirely by TanStack Query. There is a single auth context and no separate global state library.

## Authentication

The client holds a short-lived access token in memory and sends it as a bearer token. When a request returns 401, an interceptor calls the refresh endpoint once, using the `HttpOnly` refresh cookie, and retries the original request. Concurrent 401s are collapsed into a single refresh call so that token rotation does not drop the session.

Tokens are never written to `localStorage`, since the application handles sensitive health data. A full page reload starts with an empty token in memory, fails the first request, refreshes through the cookie, and continues.

## Requirements

- Node.js 20 or higher
- A running instance of the MindCat API

## Setup

```bash
git clone https://github.com/Kuligowskilucas/MindCatWeb.git
cd MindCatWeb
npm install
```

Create `.env.local` and set the API URL:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Use `http://localhost:8000` rather than the `127.0.0.1` form, since the browser treats them as different origins and the session cookie will not be sent on the IP form.

```bash
npm run dev
```

Open http://localhost:3000.

## Checks

```bash
npx tsc --noEmit
npx eslint
npm run build
```

## Related repositories

- API: https://github.com/Kuligowskilucas/MindCatApi

## Status

Live in production at mindcat.com.br

## License

This repository is public for portfolio purposes. It is not licensed for reuse.
