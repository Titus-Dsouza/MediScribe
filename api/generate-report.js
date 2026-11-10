const MAX_BODY_BYTES = 16 * 1024;
const MAX_TEXT_LENGTH = 2000;
const REPORT_NOTICE =
  "This report organizes patient-reported information. It is not a diagnosis or treatment recommendation and must be reviewed by a qualified healthcare professional.";

const CHIEF_COMPLAINTS = [
  "Fever",
  "Headache",
  "Cough or cold",
  "Stomach pain",
  "Chest discomfort",
  "Breathing difficulty",
  "Body pain",
  "Fatigue or weakness",
  "Skin problems",
  "Other"
];
const SYMPTOMS = [
  "Fever",
  "Headache",
  "Cough",
  "Sore throat",
  "Runny or blocked nose",
  "Nausea",
  "Vomiting",
  "Diarrhoea",
  "Constipation",
  "Abdominal pain",
  "Chest pain",
  "Shortness of breath",
  "Dizziness",
  "Body aches",
  "Fatigue",
  "Skin rash",
  "Loss of appetite",
  "Other"
];
const ONSET_OPTIONS = [
  "Today",
  "Yesterday",
  "2–3 days ago",
  "4–7 days ago",
  "1–2 weeks ago",
  "More than 2 weeks ago",
  "Not sure"
];
const BETTER_FACTORS = [
  "Rest",
  "Medication",
  "Drinking water or fluids",
  "Eating",
  "Changing position",
  "Nothing helps",
  "Not sure",
  "Other"
];
const WORSE_FACTORS = [
  "Physical activity",
  "Eating",
  "Walking or movement",
  "Lying down",
  "Certain foods",
  "Certain times of the day",
  "Nothing makes it worse",
  "Not sure",
  "Other"
];
const ALLERGY_OPTIONS = [
  "No known allergies",
  "Yes, I have allergies",
  "Not sure"
];

const PAST_MEDICATION_OPTIONS = ["Yes", "No"];
const CURRENT_MEDICATION_OPTIONS = ["Yes", "No"];

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertOnlyKeys(value, allowed, label) {
  const unexpected = Object.keys(value).find(key => !allowed.includes(key));
  if (unexpected) {
    throw new RequestError(400, `Unexpected ${label} field.`);
  }
}

function readText(value, label, { required = false, maxLength = MAX_TEXT_LENGTH } = {}) {
  if (value === undefined && !required) {
    return "";
  }
  if (typeof value !== "string") {
    throw new RequestError(400, `Invalid ${label}.`);
  }

  const trimmed = value.trim();
  if ((required && !trimmed) || trimmed.length > maxLength) {
    throw new RequestError(400, `Invalid ${label}.`);
  }
  return trimmed;
}

function readChoice(value, choices, label, required = false) {
  if (value === undefined && !required) {
    return "";
  }
  if (typeof value !== "string" || (value !== "" && !choices.includes(value))) {
    throw new RequestError(400, `Invalid ${label}.`);
  }
  if (required && !value) {
    throw new RequestError(400, `Missing ${label}.`);
  }
  return value;
}

function readChoiceList(value, choices, label) {
  if (value === undefined) {
    return [];
  }
  if (
    !Array.isArray(value) ||
    value.length > choices.length ||
    value.some(item => typeof item !== "string" || !choices.includes(item)) ||
    new Set(value).size !== value.length
  ) {
    throw new RequestError(400, `Invalid ${label}.`);
  }
  return value;
}

function validateAnswers(input) {
  if (!isRecord(input)) {
    throw new RequestError(400, "Questionnaire answers are required.");
  }
  assertOnlyKeys(
    input,
    [
      "name",
      "age",
      "gender",
      "chief",
      "chief_other",
      "symptoms",
      "symptoms_other",
      "onset_severity",
      "better",
      "better_other",
      "worse",
      "worse_other",
      "past_medications",
      "past_medications_details",
      "current_medications",
      "current_medications_details",
      "allergies",
      "allergies_other",
      "notes"
    ],
    "answer"
  );

  const name = readText(input.name, "patient name", { required: true, maxLength: 100 });
  if (
    typeof input.age !== "number" ||
    !Number.isInteger(input.age) ||
    input.age < 1 ||
    input.age > 130
  ) {
    throw new RequestError(400, "Age must be a whole number from 1 to 130.");
  }

  const gender = readChoice(input.gender, ["Male", "Female"], "gender", true);
  const chief = readChoice(input.chief, CHIEF_COMPLAINTS, "chief complaint", true);
  const chiefOther = readText(input.chief_other, "other chief complaint", { maxLength: 500 });
  const symptoms = readChoiceList(input.symptoms, SYMPTOMS, "symptoms");
  const symptomsOther = readText(input.symptoms_other, "other symptoms", { maxLength: 500 });

  if (!isRecord(input.onset_severity)) {
    throw new RequestError(400, "Onset and severity information is required.");
  }
  assertOnlyKeys(input.onset_severity, ["onset", "severity"], "onset and severity");
  const onset = readChoice(
    input.onset_severity.onset,
    ONSET_OPTIONS,
    "symptom onset",
    true
  );
  const severity = input.onset_severity.severity;
  if (
    severity !== null &&
    (typeof severity !== "number" || !Number.isInteger(severity) || severity < 1 || severity > 10)
  ) {
    throw new RequestError(400, "Severity must be a score from 1 to 10 or null.");
  }

  const better = readChoiceList(input.better, BETTER_FACTORS, "improving factors");
  const betterOther = readText(input.better_other, "other improving factors", { maxLength: 500 });
  const worse = readChoiceList(input.worse, WORSE_FACTORS, "worsening factors");
  const worseOther = readText(input.worse_other, "other worsening factors", { maxLength: 500 });
  const pastMedications = readChoice(
    input.past_medications,
    PAST_MEDICATION_OPTIONS,
    "past medication response"
  );
  const pastMedicationsDetails = readText(input.past_medications_details, "past medication details", {
    maxLength: 1000
  });
  const currentMedications = readChoice(
    input.current_medications,
    CURRENT_MEDICATION_OPTIONS,
    "current medication response"
  );
  const currentMedicationsDetails = readText(input.current_medications_details, "current medication details", {
    maxLength: 1000
  });
  const allergies = readChoice(input.allergies, ALLERGY_OPTIONS, "allergy response");
  const allergiesOther = readText(input.allergies_other, "allergy details", { maxLength: 1000 });
  const notes = readText(input.notes, "additional notes");

  return {
    name,
    age: input.age,
    gender,
    chief,
    chiefOther: chief === "Other" ? chiefOther : "",
    symptoms,
    symptomsOther: symptoms.includes("Other") ? symptomsOther : "",
    onset,
    severity,
    better,
    betterOther: better.includes("Other") ? betterOther : "",
    worse,
    worseOther: worse.includes("Other") ? worseOther : "",
    past_medications: pastMedications,
    past_medications_details: pastMedications === "Yes" ? pastMedicationsDetails : "",
    current_medications: currentMedications,
    current_medications_details: currentMedications === "Yes" ? currentMedicationsDetails : "",
    allergies,
    allergiesOther: allergies === "Yes, I have allergies" ? allergiesOther : "",
    notes
  };
}

function addOther(selected, details) {
  return selected.includes("Other") && details
    ? [...selected.filter(item => item !== "Other"), `Other: ${details}`]
    : selected;
}

// Export for testing
export function buildReportFacts(answers) {
  const symptoms = addOther(answers.symptoms, answers.symptomsOther);
  const factorsThatImprove = addOther(answers.better, answers.betterOther);
  const factorsThatWorsen = addOther(answers.worse, answers.worseOther);
  const missingInformation = [];

  if (symptoms.length === 0) {
    missingInformation.push("Specific symptoms were not provided.");
  } else if (answers.symptoms.includes("Other") && !answers.symptomsOther) {
    missingInformation.push("The additional symptom description was not provided.");
  }
  if (answers.chief === "Other" && !answers.chiefOther) {
    missingInformation.push("The additional chief complaint description was not provided.");
  }
  if (answers.severity === null) {
    missingInformation.push("A severity score was not provided.");
  }
  if (answers.onset === "Not sure") {
    missingInformation.push("The patient was unsure when the symptoms started.");
  }
  if (factorsThatImprove.length === 0) {
    missingInformation.push("Factors that improve symptoms were not provided.");
  } else if (answers.better.includes("Other") && !answers.betterOther) {
    missingInformation.push("The additional improving factor was not described.");
  }
  if (factorsThatWorsen.length === 0) {
    missingInformation.push("Factors that worsen symptoms were not provided.");
  } else if (answers.worse.includes("Other") && !answers.worseOther) {
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
  } else if (answers.allergies === "Yes, I have allergies" && !answers.allergiesOther) {
    missingInformation.push("The reported allergies were not specified.");
  } else if (answers.allergies === "Not sure") {
    missingInformation.push("The patient was unsure of their allergy status.");
  }
  if (!answers.notes) {
    missingInformation.push("No additional notes were provided.");
  }

  const chiefComplaint =
    answers.chief === "Other" && answers.chiefOther
      ? `Other: ${answers.chiefOther}`
      : answers.chief;
  const pastMedicationSummary = answers.past_medications
    ? answers.past_medications === "Yes" && answers.past_medications_details
      ? `${answers.past_medications}: ${answers.past_medications_details}`
      : answers.past_medications
    : "";
  const currentMedicationSummary = answers.current_medications
    ? answers.current_medications === "Yes" && answers.current_medications_details
      ? `${answers.current_medications}: ${answers.current_medications_details}`
      : answers.current_medications
    : "";
  const allergySummary =
    answers.allergies === "Yes, I have allergies" && answers.allergiesOther
      ? `${answers.allergies}: ${answers.allergiesOther}`
      : answers.allergies;

  return {
    patientInformation: {
      name: answers.name,
      age: answers.age,
      gender: answers.gender
    },
    chiefComplaint,
    symptoms,
    historyOfPresentIllness: {
      onset: answers.onset,
      severity: answers.severity,
      factorsThatImprove,
      factorsThatWorsen
    },
    medicalBackground: {
      pastMedications: pastMedicationSummary,
      currentMedications: currentMedicationSummary,
      allergies: allergySummary
    },
    additionalNotes: answers.notes,
    missingInformation
  };
}

function parseRequestBody(req) {
  const rawLength = req.headers?.["content-length"];
  if (rawLength !== undefined && Number(rawLength) > MAX_BODY_BYTES) {
    throw new RequestError(413, "The questionnaire is too large.");
  }

  let body = req.body;
  if (typeof body === "string") {
    if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
      throw new RequestError(413, "The questionnaire is too large.");
    }
    try {
      body = JSON.parse(body);
    } catch {
      throw new RequestError(400, "Request body must be valid JSON.");
    }
  } else if (body !== undefined) {
    let serialized;
    try {
      serialized = JSON.stringify(body);
    } catch {
      throw new RequestError(400, "Request body must be valid JSON.");
    }
    if (Buffer.byteLength(serialized, "utf8") > MAX_BODY_BYTES) {
      throw new RequestError(413, "The questionnaire is too large.");
    }
  }

  if (!isRecord(body)) {
    throw new RequestError(400, "Request body must be a JSON object.");
  }
  assertOnlyKeys(body, ["answers"], "request");
  return body;
}

export function createGenerateReportHandler() {
  return async function generateReport(req, res) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Only POST requests are supported." });
    }

    try {
      const body = parseRequestBody(req);
      const answers = validateAnswers(body.answers);
      const reportFacts = buildReportFacts(answers);

      // Generate a unique report reference
      const reportRef = "MS-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();

      return res.status(200).json({
        report: {
          ...reportFacts,
          reportReference: reportRef,
          generatedAt: new Date().toISOString(),
          notice: REPORT_NOTICE
        }
      });
    } catch (error) {
      if (error instanceof RequestError) {
        return res.status(error.status).json({ error: error.message });
      }
      return res.status(500).json({
        error: "The report could not be generated. Please try again."
      });
    }
  };
}

export default createGenerateReportHandler();