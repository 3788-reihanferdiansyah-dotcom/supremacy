# $upremacy Dashboard Hub

Recovered standalone source for the `$upremacy` dashboard launcher.

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

Import this folder/repository into Vercel. Vercel detects Vite automatically.

- Build command: `npm run build`
- Output directory: `dist`

The launcher embeds existing dashboards using iframes. Whether an embedded dashboard opens on a phone without VPN still depends on that dashboard's own network access and iframe policy.
