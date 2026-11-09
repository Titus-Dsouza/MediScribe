// public/js/report.js
// ---------------------------------------------------------------
// Review screen – displays all answers, lets the user edit a single answer
// and returns directly to the review screen after saving.
// ---------------------------------------------------------------

import { getAnswers, resetQuestionnaire, editAnswer, QUESTIONS } from "./questionnaire.js";

// Mapping of internal IDs to displayed labels (mirrors questionnaire.js)
const LABEL_MAP = {
  name: "Patient Name",
  age: "Age",
  gender: "Gender",
  contact: "Contact Info",
  chief: "Chief Complaint",
  symptoms: "Symptoms",
  onset: "Symptom Onset",
  duration: "Symptom Duration",
  severity: "Severity",
  frequency: "Frequency",
  modifiers: "Improving / Worsening Factors",
  conditions: "Medical Conditions",
  surgeries: "Surgeries / History",
  medications: "Current Medications",
  allergies: "Allergies",
  notes: "Additional Notes",
};

export function renderReview() {
  const app = document.getElementById("app");
  const answers = getAnswers();

  // Clear any existing UI
  app.innerHTML = "";
  const card = document.createElement("div");
  card.className = "glass-card";

  const heading = document.createElement("h2");
  heading.textContent = "Review Your Answers";
  card.appendChild(heading);

  // Section order – matches DESIGN & questionnaire sections
  const SECTION_ORDER = [
    "Patient Information",
    "Chief Complaint",
    "Symptoms",
    "Medical Background",
  ];

  // Prepare a structure: section -> array of {id, value, required}
  const sections = {};
  SECTION_ORDER.forEach((sec) => (sections[sec] = []));
  QUESTIONS.forEach((q) => {
    const val = answers[q.id] ?? "";
    sections[q.section].push({ id: q.id, value: val, required: q.required });
  });

  // Render each section
  SECTION_ORDER.forEach((sec) => {
    const items = sections[sec];
    if (!items || items.length === 0) return;
    const secHeader = document.createElement("h3");
    secHeader.textContent = sec;
    card.appendChild(secHeader);

    const ul = document.createElement("ul");
    ul.style.listStyle = "none";
    ul.style.padding = "0";

    items.forEach(({ id, value }) => {
      const li = document.createElement("li");
      li.style.marginBottom = "0.75rem";

      const label = document.createElement("strong");
      label.textContent = LABEL_MAP[id] || id;
      li.appendChild(label);
      li.appendChild(document.createTextNode(": "));

      const valSpan = document.createElement("span");
      if (value === "") {
        // safe placeholder for missing optional answer
        valSpan.innerHTML = "<em>(not provided)</em>";
      } else {
        valSpan.textContent = value;
      }
      li.appendChild(valSpan);

      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "Edit";
      editBtn.className = "btn-secondary";
      editBtn.style.marginLeft = "0.5rem";
      editBtn.dataset.id = id;
      li.appendChild(editBtn);

      ul.appendChild(li);
    });
    card.appendChild(ul);
  });

  // Bottom action buttons (Start Over, Generate Report placeholder)
  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.justifyContent = "space-between";
  actions.style.marginTop = "1.5rem";

  const btnStartOver = document.createElement("button");
  btnStartOver.id = "btn-start-over";
  btnStartOver.className = "btn-secondary";
  btnStartOver.textContent = "Start Over";
  actions.appendChild(btnStartOver);

  const btnGenerate = document.createElement("button");
  btnGenerate.id = "btn-generate";
  btnGenerate.className = "btn-primary";
  btnGenerate.textContent = "Generate Report";
  actions.appendChild(btnGenerate);

  card.appendChild(actions);
  app.appendChild(card);

  // Event delegation for Edit buttons
  card.addEventListener("click", (e) => {
    const target = e.target;
    if (target.matches("button.btn-secondary[data-id]")) {
      const qId = target.dataset.id;
      // Edit the selected answer; after saving, we want to return to this review screen
      editAnswer(qId, renderReview);
    }
  });

  // Start Over – clear all data and return to landing page
  btnStartOver.addEventListener("click", () => {
    resetQuestionnaire();
    location.reload(); // landing page is re‑rendered on load
  });

  // Placeholder for future report generation
  btnGenerate.addEventListener("click", () => {
    alert("Report generation is not implemented yet. Stay tuned for Phase 3!");
  });
}
