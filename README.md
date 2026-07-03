<div align="center">
  <img src="public/logo.png" width="76" alt="Voltiq logo" />
  <h1>Voltiq</h1>
  <p>An IoT-based smart energy monitoring dashboard for the ESP32 + PZEM-004T platform.</p>
  <p>
    <a href="https://voltiq-one.vercel.app/">Live demo</a> ·
    <a href="https://github.com/Realdiamond/Voltiq">Repository</a>
  </p>
</div>

## Overview

Voltiq is the web dashboard component of an IoT-based Smart Energy Monitoring System. An ESP32
microcontroller reads electrical parameters from a PZEM-004T V3.0 meter and streams them to Firebase
Realtime Database. Voltiq subscribes to that data and presents it as live readings, trends, device
status, alerts and cost estimates. The application is a Progressive Web App and can be installed on
mobile or desktop.

## Features

- Real-time monitoring of voltage, current, power, energy, frequency and cost.
- Six views: Dashboard, Analytics, Devices, Energy and Cost, Alerts, and Settings.
- **AI-powered features** (see below): alert diagnosis, dashboard insights, cost advice, anomaly detection and a conversational assistant.
- Configurable tariff that converts energy (kWh) to local currency, with daily and monthly projections.
- Light and dark themes, persisted across sessions.
- Installable as a PWA, with offline support via a service worker.
- Public landing page at `/` and the dashboard at `/dashboard`.

## AI features

Voltiq goes beyond *detecting* problems to *explaining* them and recommending action. All AI runs
server-side through a single endpoint (`/api/ai`); the API key never reaches the browser.

| Feature | Where | What it does |
|---------|-------|--------------|
| Alert Diagnosis | Alerts / Dashboard | For any alert, explains the likely root cause, severity, and concrete steps to fix it. |
| AI Insights | Dashboard | Plain-English status of the system plus one actionable tip. |
| Cost Advisor | Energy | Turns the projected bill into specific ways to spend less. |
| Trend Analysis | Analytics | Narrates the recent trend and flags anomalies (spikes, sags, unstable voltage). |
| Ask Voltiq | Everywhere | Floating chat assistant grounded in your live readings. |

### Configuring AI

The AI layer is **provider-agnostic** and driven entirely by environment variables, so you can swap
the key — or the whole provider — in Vercel without touching code. The default provider is **OpenAI**.

1. Create a key at <https://platform.openai.com/api-keys>.
2. Add `OPENAI_API_KEY` to `.env.local` (local) or Vercel → Environment Variables (production).
3. That's it. To switch to Gemini/any OpenAI-compatible endpoint later, set `AI_PROVIDER`,
   `AI_API_KEY`, `AI_MODEL` and optionally `AI_BASE_URL` instead. See `.env.example`.

If no key is set, the AI features degrade gracefully with a setup hint — the rest of the app is unaffected.

### Demo / mock data

When Firebase has no readings yet (e.g. the hardware isn't connected), the dashboard falls back to
realistic demo data and shows a "demo data" banner; the AI features work on this too. Set
`NEXT_PUBLIC_ENABLE_MOCK=false` to disable it once live data is flowing.

## Technology stack

| Area        | Technology                              |
|-------------|------------------------------------------|
| Framework   | Next.js 16 (App Router), React 19, TypeScript |
| Styling     | Tailwind CSS v4                          |
| Charts      | Chart.js                                 |
| Backend     | Firebase Realtime Database               |
| AI          | OpenAI (provider-agnostic; swappable via env) |
| Icons       | lucide-react                             |

## Hardware

| Layer      | Component                                   |
|------------|---------------------------------------------|
| Sensing    | PZEM-004T V3.0 (Modbus-RTU over TTL-UART)    |
| Processing | ESP32 (Wi-Fi)                               |
| Storage    | Micro-SD card (offline buffer)              |
| Cloud      | Firebase Realtime Database                  |

## Getting started

```bash
git clone https://github.com/Realdiamond/Voltiq.git
cd Voltiq
npm install
cp .env.example .env.local   # add your Firebase configuration
npm run dev                  # http://localhost:3000
```

### Available scripts

| Command         | Description                  |
|-----------------|------------------------------|
| `npm run dev`   | Start the development server |
| `npm run build` | Create a production build    |
| `npm run start` | Serve the production build   |
| `npm run lint`  | Run the linter               |

## Authentication

Access to the dashboard is gated by **Firebase Authentication (email/password)**. Unauthenticated
visitors are redirected to `/login`; the Realtime Database rules deny all reads and writes unless a
request is authenticated.

To set it up:

1. In the Firebase Console → **Authentication → Sign-in method**, enable **Email/Password**.
2. Create a demo account either from the login page (there's a "Create one" link) or in the console
   under **Authentication → Users**.
3. Sign in at `/login`.

> **Hardware note:** because writes now require authentication, the ESP32 firmware must also
> authenticate to Firebase (e.g. sign in with a dedicated device email/password, or use a token).
> This is the correct production posture and replaces the previous open-write setup.

## Firebase configuration

1. Create a Realtime Database in the Firebase Console.
2. Copy your web app configuration into `.env.local` (see `.env.example` for the required keys).
3. Publish the database rules from [`database.rules.json`](./database.rules.json). They require
   authentication for every read and write, and validate the shape of incoming data:

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "readings": { ".read": "auth != null", ".write": "auth != null", ".indexOn": ["timestamp"] },
    "devices":  { ".read": "auth != null", ".write": "auth != null" },
    "alerts":   { ".read": "auth != null", ".write": "auth != null", ".indexOn": ["timestamp"] }
  }
}
```

### Data model

```
readings/<id>: { device_id, voltage, current, power, energy, frequency, cost, timestamp }
devices/<id>:  { name, status: "online" | "offline", location, last_updated }
alerts/<id>:   { type: "critical" | "warning" | "info", message, value, timestamp }
```

`timestamp` is an ISO 8601 string and is required; readings and alerts are ordered by it.

## Deployment

The application is deployed on Vercel at https://voltiq-one.vercel.app/.

To deploy your own instance:

1. Import the repository into Vercel.
2. Add the `NEXT_PUBLIC_FIREBASE_*` variables under Project Settings → Environment Variables.
   These are not committed to the repository, so they must be configured in Vercel.
3. Deploy. The resulting HTTPS URL can be installed as a PWA on mobile and desktop.

## License

Developed as a B.Tech project in Information Technology.
