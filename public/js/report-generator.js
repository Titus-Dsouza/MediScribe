/**
 * Report Generator - Deterministic clinical report generation
 * Works in browser and for PDF generation
 */

import { QUESTIONS } from "./questionnaire.js";

const SECTION_ORDER = [
  "Patient Information",
  "Chief Complaint",
  "Symptoms",
  "Medical Background",
  "Additional"
];

export const LABEL_MAP = {
  name: "Patient Name",
  age: "Age",
  gender: "Gender",
  chief: "Chief Complaint",
  symptoms: "Symptoms",
  onset_severity: "Onset & Severity",
  modifiers: "Improving / Worsening Factors",
  past_medications: "Past Medications",
  current_medications: "Current Medications",
  allergies: "Allergies",
  notes: "Additional Notes"
};

/**
 * Check if a value is empty
 */
export function isEmpty(value) {
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

/**
 * Format options with "Other" text
 */
function formatOptions(value, otherText) {
  const options = Array.isArray(value) ? value : value ? [value] : [];
  const result = options.filter(option => option !== "Other");
  if (options.includes("Other")) {
    result.push(otherText ? `Other: ${otherText}` : "Other");
  }
  return result.join(", ");
}

/**
 * Safely convert any value to a string for display.
 * Handles objects by returning a meaningful representation instead of "[object Object]".
 */
export function toDisplayString(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if (Array.isArray(value)) return value.map(toDisplayString).join(", ");
    return "";
  }
  return String(value);
}

/**
 * Format a single answer for display
 */
export function formatAnswer(id, answers) {
  switch (id) {
    case "chief":
      return formatOptions(answers.chief, answers.chief_other);
    case "symptoms":
      return formatOptions(answers.symptoms, answers.symptoms_other);
    case "onset_severity": {
      const value = answers.onset_severity;
      if (!value || typeof value !== "object") {
        return "";
      }
      const parts = [];
      if (value.onset) {
        parts.push(`Onset: ${value.onset}`);
      }
      if (value.severity !== undefined && value.severity !== null && value.severity !== "") {
        parts.push(`Severity: ${value.severity}/10`);
      }
      return parts.join(" · ");
    }
    case "modifiers": {
      const better = formatOptions(answers.better, answers.better_other);
      const worse = formatOptions(answers.worse, answers.worse_other);
      return [
        better ? `Better: ${better}` : "",
        worse ? `Worse: ${worse}` : ""
      ].filter(Boolean).join("\n");
    }
    case "past_medications": {
      const selected = answers.past_medications || "";
      if (selected === "Yes" && answers.past_medications_details) {
        return `${selected}: ${answers.past_medications_details}`;
      }
      return selected;
    }
    case "current_medications": {
      const selected = answers.current_medications || "";
      if (selected === "Yes" && answers.current_medications_details) {
        return `${selected}: ${answers.current_medications_details}`;
      }
      return selected;
    }
    case "allergies": {
      const allergy = answers.allergies || "";
      if (allergy === "Yes, I have allergies" && answers.allergies_other) {
        return `${allergy}: ${answers.allergies_other}`;
      }
      return allergy;
    }
    default: {
      const value = answers[id];
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      if (value !== null && typeof value === "object") {
        return "";
      }
      return value === undefined || value === null ? "" : String(value);
    }
  }
}

/**
 * Build structured report data from questionnaire answers
 */
export function buildReportData(answers) {
  const symptoms = formatOptions(answers.symptoms, answers.symptoms_other).split(", ").filter(Boolean);
  const factorsThatImprove = formatOptions(answers.better, answers.better_other).split(", ").filter(Boolean);
  const factorsThatWorsen = formatOptions(answers.worse, answers.worse_other).split(", ").filter(Boolean);
  const missingInformation = [];

  // Build missing information list
  if (symptoms.length === 0) {
    missingInformation.push("Specific symptoms were not provided.");
  } else if (answers.symptoms?.includes("Other") && !answers.symptoms_other) {
    missingInformation.push("The additional symptom description was not provided.");
  }
  if (answers.chief === "Other" && !answers.chief_other) {
    missingInformation.push("The additional chief complaint description was not provided.");
  }
  if (answers.onset_severity?.severity === null || answers.onset_severity?.severity === undefined) {
    missingInformation.push("A severity score was not provided.");
  }
  if (answers.onset_severity?.onset === "Not sure") {
    missingInformation.push("The patient was unsure when the symptoms started.");
  }
  if (factorsThatImprove.length === 0) {
    missingInformation.push("Factors that improve symptoms were not provided.");
  } else if (answers.better?.includes("Other") && !answers.better_other) {
    missingInformation.push("The additional improving factor was not described.");
  }
  if (factorsThatWorsen.length === 0) {
    missingInformation.push("Factors that worsen symptoms were not provided.");
  } else if (answers.worse?.includes("Other") && !answers.worse_other) {
    missingInformation.push("The additional worsening factor was not described.");
  }
  if (!answers.past_medications) {
    missingInformation.push("Past medication history was not provided.");
  } else if (answers.past_medications === "Yes" && !answers.past_medications_details) {
    missingInformation.push("Past medication names or details were not provided.");
  }
  if (!answers.current_medications) {
    missingInformation.push("Current medication status was not provided.");
  } else if (answers.current_medications === "Yes" && !answers.current_medications_details) {
    missingInformation.push("Current medication names or details were not provided.");
  }
  if (!answers.allergies) {
    missingInformation.push("Allergy information was not provided.");
  } else if (answers.allergies === "Yes, I have allergies" && !answers.allergies_other) {
    missingInformation.push("The reported allergies were not specified.");
  } else if (answers.allergies === "Not sure") {
    missingInformation.push("The patient was unsure of their allergy status.");
  }
  if (!answers.notes) {
    missingInformation.push("No additional notes were provided.");
  }

  const chiefComplaint =
    answers.chief === "Other" && answers.chief_other
      ? `Other: ${answers.chief_other}`
      : answers.chief;

  const pastMedicationSummary = answers.past_medications
    ? answers.past_medications === "Yes" && answers.past_medications_details
      ? `${answers.past_medications}: ${answers.past_medications_details}`
      : answers.past_medications
    : "Not provided";

  const currentMedicationSummary = answers.current_medications
    ? answers.current_medications === "Yes" && answers.current_medications_details
      ? `${answers.current_medications}: ${answers.current_medications_details}`
      : answers.current_medications
    : "Not provided";

  const allergySummary =
    answers.allergies === "Yes, I have allergies" && answers.allergies_other
      ? `${answers.allergies}: ${answers.allergies_other}`
      : answers.allergies || "Not provided";

  // Generate unique report reference
  const reportRef = "MS-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();

  return {
    reportReference: reportRef,
    generatedAt: new Date().toISOString(),
    patientInformation: {
      name: answers.name || "Not provided",
      age: answers.age || "Not provided",
      gender: answers.gender || "Not provided"
    },
    chiefComplaint: chiefComplaint || "Not provided",
    symptoms: symptoms.length > 0 ? symptoms : ["No symptoms reported"],
    historyOfPresentIllness: {
      onset: answers.onset_severity?.onset || "Not provided",
      severity: answers.onset_severity?.severity !== null && answers.onset_severity?.severity !== undefined
        ? `${answers.onset_severity.severity}/10`
        : "Not provided",
      factorsThatImprove: factorsThatImprove.length > 0 ? factorsThatImprove : ["Not provided"],
      factorsThatWorsen: factorsThatWorsen.length > 0 ? factorsThatWorsen : ["Not provided"]
    },
    medicalBackground: {
      pastMedications: pastMedicationSummary,
      currentMedications: currentMedicationSummary,
      allergies: allergySummary
    },
    additionalNotes: answers.notes || "No additional notes provided",
    missingInformation: missingInformation.length > 0 ? missingInformation : ["All requested information was provided."],
    notice: "This report organizes patient-reported information. It is not a diagnosis or treatment recommendation and must be reviewed by a qualified healthcare professional."
  };
}

/**
 * Generate a unique report reference
 */
export function generateReportReference() {
  return "MS-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
}

/**
 * Format date for display
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 50);
}
