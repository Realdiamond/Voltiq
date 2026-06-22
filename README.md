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
- Configurable tariff that converts energy (kWh) to local currency, with daily and monthly projections.
- Light and dark themes, persisted across sessions.
- Installable as a PWA, with offline support via a service worker.
- Public landing page at `/` and the dashboard at `/dashboard`.

## Technology stack

| Area        | Technology                              |
|-------------|------------------------------------------|
| Framework   | Next.js 16 (App Router), React 19, TypeScript |
| Styling     | Tailwind CSS v4                          |
| Charts      | Chart.js                                 |
| Backend     | Firebase Realtime Database               |
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

## Firebase configuration

1. Create a Realtime Database in the Firebase Console.
2. Copy your web app configuration into `.env.local` (see `.env.example` for the required keys).
3. Publish the database rules. A development ruleset is provided in
   [`database.rules.json`](./database.rules.json):

```json
{
  "rules": {
    "readings": { ".read": true, ".write": true, ".indexOn": ["timestamp"] },
    "devices":  { ".read": true, ".write": true },
    "alerts":   { ".read": true, ".write": true, ".indexOn": ["timestamp"] }
  }
}
```

These rules allow open read and write access and are intended for development and demonstration only.
Restrict write access and add authentication before any production deployment.

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
