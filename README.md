# PICU Sedation & NMB Decision Support Tool

**Designed by Dr. Mohammed Shatari · King Saud Medical City · Pediatric Critical Care**

A mobile-friendly clinical reference tool for Pediatric ICUs covering weight-based drug dosing, assessment scales, and weaning protocols for sedation, analgesia, and neuromuscular blockade.

---

## Features

- Weight-based dose calculator (enter patient weight → see calculated doses)
- Sedation drugs: Midazolam, Lorazepam, Dexmedetomidine, Propofol, Ketamine, Chloral Hydrate
- Analgesia: Morphine, Fentanyl, Hydromorphone, Acetaminophen, Ibuprofen
- NMB: Rocuronium, Vecuronium, Cisatracurium, Succinylcholine, Atracurium
- Reversal agents: Flumazenil, Naloxone, Sugammadex, Neostigmine
- Assessment scales: RASS, COMFORT-B, FLACC, NRS, CPOT, WAT-1
- Weaning protocols: Opioid/benzo taper, Dexmedetomidine wean, NMB liberation, PAD bundle
- Drug search across all categories
- Mobile-responsive design

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router |
| Build | Vite |
| Styling | Tailwind CSS 3 |
| Language | TypeScript 5 |
| Deployment | Vercel (via Nitro) |

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option 1 — Vercel Dashboard (easiest)
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Select your GitHub repo
4. Leave all settings as default — Vercel auto-detects the config
5. Click **Deploy**

### Option 2 — Vercel CLI
```bash
npm install -g vercel
vercel
```

---

## Project Structure

```
picu-app/
├── src/
│   ├── components/
│   │   └── PICUTool.tsx      # Main app — all UI, data, logic
│   ├── routes/
│   │   ├── __root.tsx        # HTML shell
│   │   └── index.tsx         # Root route
│   ├── router.tsx            # TanStack Router setup
│   └── styles.css            # Tailwind imports
├── app.config.ts             # TanStack Start config (Vercel preset)
├── vite.config.ts            # Vite + Nitro config
├── vercel.json               # Vercel deployment config
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Medical Disclaimer

This tool is for **educational reference only**. All clinical decisions must be verified against institutional protocols, current literature, and individual patient factors. Doses may vary by age, weight, organ function, and local guidelines. **This tool does not replace clinical judgment.**
