# Sellout Order Generator

Web app that converts a SELLOUT Excel workbook (SUPPORT SHEET) into an
Oracle Reports–style order document (.doc), one page per Date + Customer.

- 100% client-side — the Excel file never leaves the user's browser
- No build step, no server, no database — just static files
- Supports multiple Excel files at once
- Editable report header values (Address, Currency, Terms, Reference, Remarks)

## Files

| File | Purpose |
|---|---|
| `index.html` | The app (upload UI, validation, preview, download) |
| `generator.js` | The .doc (RTF) generation engine |
| `vercel.json` | Optional Vercel config (static site) |

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Deploy to Vercel (via GitHub)

1. Create a new repository on GitHub (e.g. `sellout-order-generator`).
2. Push these files:

   ```bash
   git init
   git add index.html generator.js vercel.json README.md
   git commit -m "Sellout order generator"
   git branch -M main
   git remote add origin https://github.com/<your-username>/sellout-order-generator.git
   git push -u origin main
   ```

3. Go to https://vercel.com → **Add New → Project** → import the GitHub repo.
4. Framework preset: **Other** (it is a plain static site). No build command,
   no output directory needed. Click **Deploy**.
5. Your app is live at `https://sellout-order-generator.vercel.app`
   (you can rename the project in Vercel → Settings → Domains).

Any future `git push` to `main` redeploys automatically.

## Expected Excel format

Sheet name `SUPPORT SHEET` (falls back to the first sheet) with columns:

```
DATE | INV NO | CUST CODE | Dealer Name | PRODUCT CODE | MODEL | QTY | ...
```

## Output logic

- One report page per (DATE, CUST CODE) group
- Items aggregated by PRODUCT CODE (duplicate lines summed), sorted by code
- Item names truncated to the same width as the original Oracle Reports output
- Total quantity in the document always reconciles to the Excel QTY total
