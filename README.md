# Anomali Dashboard Recovery

Standalone Vite/React recovery of the published Validation Airwaybill Anomali dashboard.

## Data behavior

The dashboard starts with the 97 records recovered from the published dashboard on 15 September 2026. Reads, edits, and new records work without AIME authentication and persist in browser `localStorage`. The original Lark sheet remains linked for provenance, but the public build does not access or modify it.

## Run

```bash
npm install
npm run dev
```

Production build: `npm run build`.
