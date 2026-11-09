// public/js/report.js

import {
  getAnswers,
  resetQuestionnaire,
  editAnswer,
  QUESTIONS
} from "./questionnaire.js";

const SECTION_ORDER = [
  "Patient Information",
  "Chief Complaint",
  "Symptoms",
  "Medical Background",
  "Additional"
];

const LABEL_MAP = {
  name: "Patient Name",
  age: "Age",
  gender: "Gender",
  chief: "Chief Complaint",
  symptoms: "Symptoms",
  onset_severity: "Onset & Severity",
  modifiers: "Improving / Worsening Factors",
  medications: "Past and Current Medications",
  allergies: "Allergies",
  notes: "Additional Notes"
};

// Safely checks whether an answer is empty.
function isEmpty(value) {
  if (value === null || value === undefined || value === "") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;
}

// Formats selected options and their optional custom descriptions.
function formatOptions(value, otherText) {
  const options = Array.isArray(value)
    ? value
    : value
      ? [value]
      : [];

  const result = options.filter(option => option !== "Other");

  if (options.includes("Other")) {
    result.push(
      otherText
        ? `Other: ${otherText}`
        : "Other"
    );
  }

  return result.join(", ");
}

// Converts each question's stored answer into readable text.
function formatAnswer(id, answers) {
  switch (id) {
    case "chief":
      return formatOptions(
        answers.chief,
        answers.chief_other
      );

    case "symptoms":
      return formatOptions(
        answers.symptoms,
        answers.symptoms_other
      );

    case "onset_severity": {
      const value = answers.onset_severity;

      if (!value || typeof value !== "object") {
        return "";
      }

      const onset = value.onset || "";
      const severity = value.severity;

      const parts = [];

      if (onset) {
        parts.push(`Onset: ${onset}`);
      }

      if (
        severity !== undefined &&
        severity !== null &&
        severity !== ""
      ) {
        parts.push(`Severity: ${severity}/10`);
      }

      return parts.join(" · ");
    }

    case "modifiers": {
      const better = formatOptions(
        answers.better,
        answers.better_other
      );

      const worse = formatOptions(
        answers.worse,
        answers.worse_other
      );

      const parts = [];

      if (better) {
        parts.push(`Better: ${better}`);
      }

      if (worse) {
        parts.push(`Worse: ${worse}`);
      }

      return parts.join("\n");
    }

    case "medications": {
      const past = formatOptions(
        answers.past,
        answers.past_medications_other
      );

      const current = formatOptions(
        answers.current,
        answers.current_medications_other
      );

      const parts = [];

      if (past) {
        parts.push(`Past medications: ${past}`);
      }

      if (current) {
        parts.push(`Current medications: ${current}`);
      }

      return parts.join("\n");
    }

    case "allergies": {
      const allergy = answers.allergies || "";
      const details = answers.allergies_other || "";

      if (details) {
        return `${allergy}: ${details}`;
      }

      return allergy;
    }

    default: {
      const value = answers[id];

      if (Array.isArray(value)) {
        return value.join(", ");
      }

      if (
        value !== null &&
        typeof value === "object"
      ) {
        return "";
      }

      return value === undefined || value === null
        ? ""
        : String(value);
    }
  }
}

export function renderReview() {
  const app = document.getElementById("app");
  const answers = getAnswers();

  app.innerHTML = "";

  const card = document.createElement("div");
  card.className = "glass-card review-card";

  const heading = document.createElement("h2");
  heading.textContent = "Review Your Answers";
  card.appendChild(heading);

  const sections = {};

  SECTION_ORDER.forEach(section => {
    sections[section] = [];
  });

  QUESTIONS.forEach(question => {
    if (!sections[question.section]) {
      sections[question.section] = [];
    }

    sections[question.section].push(question);
  });

  SECTION_ORDER.forEach(section => {
    const questions = sections[section];

    if (!questions || questions.length === 0) {
      return;
    }

    const sectionHeader = document.createElement("h3");
    sectionHeader.className = "review-section-heading";
    sectionHeader.textContent = section;
    card.appendChild(sectionHeader);

    const list = document.createElement("ul");
    list.className = "review-list";

    questions.forEach(question => {
      const item = document.createElement("li");
      item.className = "review-item";

      const label = document.createElement("strong");
      label.className = "review-label";
      label.textContent =
        LABEL_MAP[question.id] || question.label;

      const value = document.createElement("span");
      value.className = "review-value";

      const formattedValue = formatAnswer(
        question.id,
        answers
      );

      if (isEmpty(formattedValue)) {
        value.textContent = "(not provided)";
        value.classList.add("review-empty");
      } else {
        value.textContent = formattedValue;
      }

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Edit";
      editButton.className = "btn-secondary review-edit";
      editButton.dataset.id = question.id;

      item.appendChild(label);
      item.appendChild(value);
      item.appendChild(editButton);

      list.appendChild(item);
    });

    card.appendChild(list);
  });

  // Bottom action buttons
  const actions = document.createElement("div");
  actions.className = "review-actions";

  const startOverButton = document.createElement("button");
  startOverButton.id = "btn-start-over";
  startOverButton.className = "btn-secondary";
  startOverButton.textContent = "Start Over";

  const generateButton = document.createElement("button");
  generateButton.id = "btn-generate";
  generateButton.className = "btn-primary";
  generateButton.textContent = "Generate Report";

  actions.appendChild(startOverButton);
  actions.appendChild(generateButton);

  card.appendChild(actions);
  app.appendChild(card);

  // Edit individual answers.
  card.addEventListener("click", event => {
    const editButton = event.target.closest(
      "button.review-edit[data-id]"
    );

    if (!editButton) {
      return;
    }

    editAnswer(editButton.dataset.id, renderReview);
  });

  // Start over.
  startOverButton.addEventListener("click", () => {
    resetQuestionnaire();
    location.reload();
  });

  // Report generation placeholder.
  generateButton.addEventListener("click", () => {
    alert(
      "Report generation is not implemented yet. Stay tuned for Phase 3!"
    );
  });
}