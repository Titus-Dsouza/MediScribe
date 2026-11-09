# MediScribe — Workflow

## 1. User Journey

### Step 1: Landing Page
- [ ] Display the MediScribe name and a short introduction.
- [ ] Show the heading: **Simplifying Clinical Documentation**.
- [ ] Display a **Get Started** button.
- [ ] Show a short medical disclaimer.

### Step 2: Patient Information
- [ ] Ask for the patient's name.
- [ ] Ask for age.
- [ ] Ask for gender (optional).
- [ ] Ask for contact information (optional).

### Step 3: Chief Complaint
- [ ] Ask the patient what brings them in today.
- [ ] Allow a short description in their own words.
- [ ] Provide examples to help patients answer.

### Step 4: Symptoms
- [ ] Ask about the symptoms experienced.
- [ ] Ask when the symptoms started.
- [ ] Ask about symptom duration.
- [ ] Ask about severity.
- [ ] Ask how frequently symptoms occur.
- [ ] Ask whether anything improves or worsens them.

### Step 5: Medical Background
- [ ] Ask about existing medical conditions.
- [ ] Ask about previous surgeries or relevant medical history.
- [ ] Ask about current medications.
- [ ] Ask about known allergies.
- [ ] Allow additional notes.

### Step 6: Review Answers
- [ ] Display all collected information.
- [ ] Allow patients to edit their answers.
- [ ] Highlight unanswered optional questions.
- [ ] Provide a **Generate Report** button.

### Step 7: Report Generation
- [ ] Send the collected answers securely to the backend.
- [ ] Validate the submitted information.
- [ ] Generate a structured clinical report.
- [ ] Handle errors and failed requests.
- [ ] Display a loading screen while processing.

### Step 8: Clinical Report
- [ ] Display the generated report.
- [ ] Include patient information.
- [ ] Include chief complaint and symptoms.
- [ ] Include relevant medical history.
- [ ] Include medications and allergies.
- [ ] Include a clinical summary.
- [ ] Clearly identify missing or unreported information.
- [ ] Allow the report to be reviewed and edited.

### Step 9: Download Report
- [ ] Provide a **Download PDF** button.
- [ ] Generate a clean, readable PDF.
- [ ] Include the MediScribe name and report date.
- [ ] Include a medical disclaimer.
- [ ] Allow the user to start a new session.

---

## 2. Data Flow

1. Patient enters information through the questionnaire.
2. Answers are temporarily maintained in browser memory.
3. Patient reviews and confirms the information.
4. Frontend sends the answers to the backend.
5. Backend validates the information.
6. Backend requests a structured report from the AI service.
7. Generated report is returned to the frontend.
8. Patient reviews and edits the report.
9. PDF is generated and downloaded.

---

## 3. Report Structure

The final clinical report should contain:

- Patient Information
- Chief Complaint
- History of Present Illness
- Symptoms and Timeline
- Relevant Medical History
- Current Medications
- Known Allergies
- Clinical Summary
- Missing Information
- Professional Review Notes

---

## 4. Data Handling

- [ ] No database.
- [ ] No patient account or login system.
- [ ] No permanent patient information storage.
- [ ] Keep questionnaire answers in temporary browser memory.
- [ ] Do not store patient information in local storage or session storage.
- [ ] Avoid logging patient information.
- [ ] Clear temporary answers when the session ends.
- [ ] Keep API credentials on the backend.
- [ ] Use synthetic patient information during development and testing.

---

## 5. Important Rules

- The application must not independently diagnose medical conditions.
- Never invent symptoms, medical history, medications, or clinical findings.
- Clearly distinguish patient-provided information from generated summaries.
- Mark missing information instead of assuming answers.
- Reports must be reviewed by a qualified healthcare professional.
- Display a disclaimer that MediScribe is a documentation-support tool, not a replacement for professional medical judgment.

---

## 6. Final Workflow

**Landing Page → Patient Information → Chief Complaint → Symptoms → Medical Background → Review Answers → Generate Report → Review & Edit Report → Download PDF**