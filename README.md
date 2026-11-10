# MediScribe

MediScribe is a clinical documentation assistant. A patient completes an in-memory questionnaire, reviews their answers, and generates a professionally formatted clinical report that can be downloaded as a PDF and presented to a doctor.

The report is generated deterministically using JavaScript — no AI, no external API calls, and no backend required for report generation.

## Features

- Step-by-step patient questionnaire (11 questions) with answer review and editing.
- Deterministic report generation from questionnaire answers.
- Professional clinical report preview with all sections.
- PDF download using jsPDF (A4 portrait, multi-page support).
- Past and Current Medications as separate questions.
- Conditional fields for "Other" responses.
- Missing information clearly identified.
- No database, login, patient account, local storage, or session storage.
- All data stays in browser memory for the current page session.
- Works offline after initial load (no internet required for report generation).

## Technology

- Frontend: HTML, CSS, vanilla JavaScript ES modules.
- PDF Generation: jsPDF.
- Storage: none.
- Backend: Optional Vercel Serverless Function for validation (no AI).

## Local setup

Requirements: Node.js 20 or newer and npm.

1. Install dependencies:

   ```sh
   npm install
   ```

2. Start the development server:

   ```sh
   npm run dev
   ```

   The command uses `npx vercel dev` for local development. The frontend is served from `public/`.

3. Run the API validation tests:

   ```sh
   npm test
   ```

   Tests use synthetic questionnaire data; they do not call any external API.

## Vercel configuration

Deploy this repository as a Vercel project with the project root at the repository root. The `public/` directory serves the frontend and `api/generate-report.js` is an optional serverless endpoint for server-side validation. No database, build step, or API keys are required.

## API (Optional)

`POST /api/generate-report`

Request JSON:

```json
{
  "answers": {
    "name": "Synthetic Patient",
    "age": 42,
    "gender": "Female",
    "chief": "Headache",
    "symptoms": ["Headache"],
    "onset_severity": {
      "onset": "Yesterday",
      "severity": 4
    }
  }
}
```

The endpoint validates known fields, option values, text lengths, severity, and a 16 KB request limit. Success returns `{ "report": { ... } }` with a deterministic report structure; client errors return 4xx responses, and server errors return a generic error.

Note: The frontend generates reports client-side without calling this API. The API exists for server-side validation if needed.

## Privacy and clinical limitations

The application does not write patient data to a database or browser storage. No patient data is sent to any external service or AI. The report is generated entirely in the browser. Do not use real patient information until applicable consent, privacy, and data-processing requirements have been addressed. The application does not diagnose or prescribe, and every report requires review by a qualified healthcare professional.

## Report Structure

The generated clinical report includes:

1. **Patient Information** — Name, Age, Gender
2. **Chief Complaint** — Primary reason for visit
3. **Reported Symptoms** — All selected symptoms as tags
4. **History of Present Illness (HPI)** — Onset, Severity (1-10), Improving/Worsening factors
5. **Medication History** — Past Medications and Current Medications (separate sections)
6. **Allergies** — Allergy status and details
7. **Additional Notes** — Patient-provided notes
8. **Information Not Provided** — Clearly identified missing information
9. **Clinician Review** — Blank fields for doctor's observations, notes, signature, and date
10. **Footer** — MediScribe branding and medical disclaimer

The PDF is formatted as a professional medical document (A4 portrait, proper margins, page numbering).

## File Structure

```
├── api/
│   └── generate-report.js      # Optional server-side validation endpoint
├── public/
│   ├── css/
│   │   └── styles.css          # Glassmorphism theme + report styles
│   ├── js/
│   │   ├── app.js              # Entry point
│   │   ├── questionnaire.js    # 11-question questionnaire
│   │   ├── report.js           # Review, preview, PDF generation
│   │   └── report-generator.js # Deterministic report builder
│   └── index.html
├── test/
│   └── generate-report.test.js # API validation tests
├── package.json
├── Phase.md
└── memory.md
```