# MediScribe Project Memory

## Current Status

- Phase 3 backend and report UI code are implemented with deterministic report generation (no AI).
- Phase 1 setup gate remains incomplete.
- `npm test` exercises the API handler with synthetic questionnaire data. It does not call any external API.
- The project has no API key configured; report generation works entirely client-side.
- Phase 2 was already present but had not been browser-tested. Its conditional allergy details and implicit severity default were corrected because they affected report accuracy; the questionnaire is still not browser-verified.
- Vercel local runtime, deployed behavior, and full browser-to-Gemini end-to-end testing are no longer applicable (Gemini removed).
- No PDF export, database, authentication, accounts, or patient-data persistence was added.

## Project Structure

- `public/index.html`: App shell and stylesheet/module entry.
- `public/css/styles.css`: Existing glassmorphism theme plus report, loading, warning, and error styles.
- `public/js/app.js`: Landing page and questionnaire startup.
- `public/js/questionnaire.js`: Question definitions, rendering, in-memory answers, validation, navigation, conditional fields, and answer editing (11 questions).
- `public/js/report.js`: Review screen, deterministic report generation, preview rendering, PDF download with jsPDF, and in-session report navigation.
- `public/js/report-generator.js`: Deterministic report data builder (shared logic for preview and PDF).
- `public/js/report.backup.js`: Older duplicate review UI; not imported by the application.
- `api/generate-report.js`: Optional Vercel `POST /api/generate-report` function for server-side validation, deterministic report assembly, and error responses (no AI).
- `test/generate-report.test.js`: Node built-in tests for request validation, report field mapping, missing information.
- `package.json` / `package-lock.json`: ES-module project, `jspdf`, Vercel dev scripts, and Node test script.
- `.env.example`: Documents the `GEMINI_API_KEY` variable (legacy). `.env` and `.env.*` are ignored, except the example file.
- `Phase.md`: Phase checklist and verification status.
- `README.md`: Stack, local setup, API, Vercel env configuration, privacy, and remaining verification.

## Architecture and Decisions

- Frontend: vanilla HTML/CSS/JavaScript ES modules.
- Backend: Optional Node.js ES-module Vercel Serverless Function at `api/generate-report.js` (validation only).
- Report Generation: Deterministic JavaScript in the browser using `report-generator.js`; no AI, no external API calls.
- PDF: jsPDF for client-side PDF generation (A4 portrait, multi-page, professional medical document format).
- The API validates only questionnaire fields, recognized options, field limits, severity, and a 16 KB request maximum.
- Exact patient facts are assembled deterministically in both frontend and backend; no AI summary is generated.
- The response contains patient information, chief complaint, symptoms, onset/severity/modifiers, medication/allergy information, notes, missing-information entries, professional-review notice, report reference, and generation timestamp.
- Responses set `Cache-Control: no-store`; no patient responses are logged or written to application storage.
- API uses generic upstream errors.
- Answers and generated report remain in module memory for the current page session; starting over clears them.
- No browser storage, database, PDF, or authentication was introduced.

## Phase 2 Notes

- The questionnaire includes 11 questions (split Past and Current Medications into two separate questions), in-memory response state, answer review/editing, navigation, progress, conditional fields, and basic validation.
- The allergies question now reveals and stores details when "Yes, I have allergies" is selected.
- Severity no longer silently treats the slider's initial midpoint as a patient-provided score. A score must be selected before continuing.
- **Past Medications** and **Current Medications** are now independent questions (Yes/No each with conditional text fields), replacing the former combined question.
- Questionnaire interactions still require browser verification.

## Phase 3 Notes (Completed)

- Deterministic report generation implemented in `report-generator.js` and `report.js`.
- Professional clinical report preview with 9 sections + footer.
- PDF download via jsPDF with A4 formatting, page numbering, and proper margins.
- Report preview and PDF contain identical information.
- All conditional "Other" fields handled.
- Missing information clearly labeled.
- Clinician review section with blank fields.
- No AI/Gemini dependency.

## Verification and Known Limitations

- `npm test` passed for API handler tests (no external API calls).
- Syntax checks passed for all JavaScript files.
- No live API request was performed because no external API is required.
- The browser workflow and Vercel CLI runtime have not been tested; `npm run dev` invokes `npx vercel dev`.
- The existing gender choices are limited to Male/Female; this is pre-existing questionnaire scope.
- An unauthenticated public endpoint can incur provider usage; deployers should configure provider/Vercel usage safeguards. No rate-limit store was added because the requirements prohibit a database and serverless in-memory limits would not be reliable.
- Real patient data must not be used until consent, privacy, and third-party processing requirements are addressed.
- PDF creation/download belongs to Phase 4 and is now implemented.
- **jsPDF browser loading**: Fixed via import map in `index.html` pointing to `https://esm.sh/jspdf@2.5.2` for browser-compatible ESM module resolution without a bundler.