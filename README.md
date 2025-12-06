### Five Osteopathic Models Guide

A bilingual (RU/EN) static learning app. It teaches the five osteopathic models step by step and reinforces knowledge with quizzes. No backend required — ready to publish on GitHub Pages.

#### Features
- 5 models: Biomechanical, Respiratory–Circulatory, Neurological, Metabolic/Energetic, Biopsychosocial
- For each model: essence, goal, key structures, example, mnemonic, mini‑icon
- Quizzing: 10 questions per model (multiple choice, true/false, matching, ordering, case), instant feedback and explanations
- Mastery threshold: ≥80% to unlock the next model
- Review mode: mini‑quiz from your missed questions until all errors are cleared
- Final quiz (~10 questions across all models)
- Localization RU/EN, language switcher and font size switcher (regular/large)
- Local progress saving (LocalStorage) + JSON export/import
- Accessibility: keyboard navigation, visible focus, contrast, skip‑link

#### Screenshots
- Home: assets/screenshots/home.svg
- Models: assets/screenshots/models.svg
- Quiz: assets/screenshots/quiz.svg

#### Local run
Option 1 (just open):
1. Open `index.html` in a modern browser (Chrome/Edge/Firefox/Safari).

Option 2 (dev server):
1. Install Node.js LTS.
2. Install dependencies: `npm i`
3. Start: `npm start`
4. The browser will open automatically.

Build (optional):
```
npm run build
```
Built files will appear in the `dist` folder (for this project, publishing to GitHub Pages also works without building).

#### Publish to GitHub Pages
1. Create a repository on GitHub and push the project contents to it.
2. In the repository: Settings → Pages → Build and deployment → Source: Deploy from a branch.
3. Branch: choose your default branch (e.g., `main`), Folder: `/ (root)`.
4. Save. In 1–2 minutes your site will be available at `https://<your_account>.github.io/<repo_name>/`.

Notes:
- The app uses hash‑routing (`#/...`), so it works on GitHub Pages without extra redirect settings.
- Use the header buttons to change language and toggle large font. Your choice is saved locally.
- Export/import progress via the Export/Import buttons in the header. Import expects a JSON previously exported from the app.

#### Structure
- `index.html` — app shell and controls
- `css/style.css` — themes, components, accessibility
- `js/app.js` — SPA logic, localization, model data, quiz engine, progress saving
- `assets/screenshots/*.svg` — illustrative screenshots

#### License
MIT — see `LICENSE.txt`.

#### Disclaimer
Educational material only; not a substitute for medical advice.
