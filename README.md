<div align="center">
  <img src="public/logo.png" width="84" alt="SmartBase logo" />
  <h1>SmartBase — IoT Smart Energy Monitoring Dashboard</h1>
  <p>Real-time, offline-resilient electrical energy monitoring powered by <b>ESP32 + PZEM-004T</b> and <b>Firebase</b>.</p>
</div>

---

SmartBase is the web dashboard for an IoT-based Smart Energy Monitoring System. An **ESP32** reads electrical
parameters from a **PZEM-004T V3.0** meter and streams them to **Firebase Realtime Database**; this Next.js app
visualises that data live — KPIs, trends, device health, alerts and cost projections — and installs as a PWA.

## ✨ Features

- **Real-time KPIs** — voltage, current, power, energy, frequency and cost, live from Firebase.
- **Six pages** — Dashboard, Analytics, Devices, Energy & Cost, Alerts, Settings.
- **Configurable tariff** — convert kWh → ₦ on your own tariff (Settings), with daily/monthly cost projections.
- **Light & dark themes** — class-based, persisted, no flash on load.
- **Installable PWA** — manifest, icons and a service worker; install on phone or desktop, works offline.
- **Public landing page** at `/`, dashboard at `/dashboard`.

## 🧱 Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Chart.js · Firebase Realtime Database · lucide-react

## 🔌 Hardware

| Layer      | Component            |
|------------|----------------------|
| Sensing    | PZEM-004T V3.0 (Modbus-RTU over TTL-UART) |
| Processing | ESP32 (Wi-Fi)        |
| Storage    | Micro-SD (offline buffer) |
| Cloud      | Firebase Realtime Database |

## 🚀 Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase config
npm run dev                  # http://localhost:3000
```

### Scripts

| Command          | Description                 |
|------------------|-----------------------------|
| `npm run dev`    | Start the dev server        |
| `npm run build`  | Production build            |
| `npm run start`  | Serve the production build  |
| `npm run lint`   | Lint                        |

## 🔥 Firebase setup

1. Create a Realtime Database in the Firebase Console.
2. Put your web config into `.env.local` (see `.env.example`).
3. Publish database rules. For development you can use [`database.rules.json`](./database.rules.json):

```json
{ "rules": {
  "readings": { ".read": true, ".write": true, ".indexOn": ["timestamp"] },
  "devices":  { ".read": true, ".write": true },
  "alerts":   { ".read": true, ".write": true, ".indexOn": ["timestamp"] }
} }
```

> ⚠️ These rules are open (read/write). Fine for development and demos — lock down `.write`
> (and add Auth) before any real deployment.

### Expected data shape

```
readings/<id>: { device_id, voltage, current, power, energy, frequency, cost, timestamp }
devices/<id>:  { name, status: "online" | "offline", location, last_updated }
alerts/<id>:   { type: "critical" | "warning" | "info", message, value, timestamp }
```

`timestamp` is an ISO string and is required (readings/alerts are ordered by it).

## ☁️ Deploy (Vercel)

1. Push this repo to GitHub and import it in Vercel.
2. Add the `NEXT_PUBLIC_FIREBASE_*` variables (from `.env.local`) in **Project → Settings → Environment Variables**.
3. Deploy. The resulting HTTPS URL is installable as a PWA on mobile and desktop.

## 📄 License

Academic project — B.Tech, Information Technology.
