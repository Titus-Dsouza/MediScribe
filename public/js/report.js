import {
  getAnswers,
  resetQuestionnaire,
  editAnswer,
  QUESTIONS
} from "./questionnaire.js";
import {
  buildReportData,
  formatDate,
  sanitizeFilename,
  formatAnswer,
  isEmpty,
  LABEL_MAP
} from "./report-generator.js";
import { jsPDF } from "jspdf";

const SECTION_ORDER = [
  "Patient Information",
  "Chief Complaint",
  "Symptoms",
  "Medical Background",
  "Additional"
];

let generatedReport = null;
let reportIsStale = false;
let isGenerating = false;

function renderGeneratedReport() {
  const report = generatedReport;
  const app = document.getElementById("app");
  app.innerHTML = "";

  const card = document.createElement("article");
  card.className = "glass-card report-preview";
  card.style.maxWidth = "820px";

  // Report Header (navy background)
  const header = document.createElement("header");
  header.className = "report-header";

  const brand = document.createElement("div");
  brand.className = "report-header__brand";
  const icon = document.createElement("span");
  icon.className = "report-header__icon";
  icon.textContent = "⚕️";
  brand.appendChild(icon);
  const brandTitle = document.createElement("h2");
  brandTitle.className = "report-header__title";
  brandTitle.textContent = "MediScribe";
  brand.appendChild(brandTitle);
  header.appendChild(brand);

  const descriptor = document.createElement("p");
  descriptor.className = "report-header__descriptor";
  descriptor.textContent = "Clinical Information Report";
  header.appendChild(descriptor);

  const mainTitle = document.createElement("h1");
  mainTitle.className = "report-header__main-title";
  mainTitle.textContent = "Patient Clinical Information Report";
  header.appendChild(mainTitle);

  const subtitle = document.createElement("p");
  subtitle.className = "report-header__subtitle";
  subtitle.textContent = "Patient-provided information for clinician review";
  header.appendChild(subtitle);

  const meta = document.createElement("div");
  meta.className = "report-header__meta";

  const dateItem = document.createElement("div");
  dateItem.className = "report-header__meta-item";
  const dateLabel = document.createElement("span");
  dateLabel.className = "report-header__meta-label";
  dateLabel.textContent = "Generated";
  const dateValue = document.createElement("span");
  dateValue.className = "report-header__meta-value";
  dateValue.textContent = formatDate(report.generatedAt);
  dateItem.append(dateLabel, dateValue);
  meta.appendChild(dateItem);

  const refItem = document.createElement("div");
  refItem.className = "report-header__meta-item";
  const refLabel = document.createElement("span");
  refLabel.className = "report-header__meta-label";
  refLabel.textContent = "Report Reference";
  const refValue = document.createElement("span");
  refValue.className = "report-header__meta-value";
  refValue.textContent = report.reportReference;
  refItem.append(refLabel, refValue);
  meta.appendChild(refItem);

  header.appendChild(meta);
  card.appendChild(header);

  // Section 1: Patient Information
  const section1 = createSection(1, "Patient Information");
  const patientGrid = document.createElement("div");
  patientGrid.className = "report-patient-grid";
  patientGrid.innerHTML = `
    <div class="report-patient-field report-patient-field--name">
      <span class="report-patient-label">Full Name</span>
      <span class="report-patient-value">${escapeHtml(report.patientInformation.name)}</span>
    </div>
    <div class="report-patient-field">
      <span class="report-patient-label">Age</span>
      <span class="report-patient-value">${escapeHtml(report.patientInformation.age)}</span>
    </div>
    <div class="report-patient-field">
      <span class="report-patient-label">Gender</span>
      <span class="report-patient-value">${escapeHtml(report.patientInformation.gender)}</span>
    </div>
  `;
  section1.appendChild(patientGrid);
  card.appendChild(section1);

  // Section 2: Chief Complaint
  const section2 = createSection(2, "Chief Complaint");
  const chiefCard = document.createElement("div");
  chiefCard.className = "report-chief-complaint";
  chiefCard.innerHTML = `
    <span class="report-chief-complaint__label">Patient-Reported Chief Complaint</span>
    <span class="report-chief-complaint__value">${escapeHtml(report.chiefComplaint)}</span>
  `;
  section2.appendChild(chiefCard);
  card.appendChild(section2);

  // Section 3: Symptoms
  const section3 = createSection(3, "Reported Symptoms");
  const symptomsList = document.createElement("ul");
  symptomsList.className = "report-symptoms-list";
  if (report.symptoms.length > 0 && report.symptoms[0] !== "No symptoms reported") {
    report.symptoms.forEach(symptom => {
      const li = document.createElement("li");
      li.className = "report-symptom-tag";
      li.textContent = escapeHtml(symptom);
      symptomsList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.className = "report-symptoms-empty";
    li.textContent = "No specific symptoms were provided.";
    symptomsList.appendChild(li);
  }
  section3.appendChild(symptomsList);
  card.appendChild(section3);

  // Section 4: History of Present Illness (HPI)
  const section4 = createSection(4, "History of Present Illness (HPI)");
  const hpiGrid = document.createElement("div");
  hpiGrid.className = "report-hpi-grid";

  const onsetField = document.createElement("div");
  onsetField.className = "report-hpi-field";
  onsetField.innerHTML = `
    <span class="report-hpi-label">Onset / Duration</span>
    <span class="report-hpi-value">${escapeHtml(report.historyOfPresentIllness.onset)}</span>
  `;
  hpiGrid.appendChild(onsetField);

  const severityField = document.createElement("div");
  severityField.className = "report-hpi-field report-hpi-field--severity";
  severityField.innerHTML = `
    <span class="report-hpi-label">Reported Severity</span>
    <span class="report-hpi-value report-hpi-value--severity">${escapeHtml(report.historyOfPresentIllness.severity.replace('/10', ''))}</span>
    <span class="report-hpi-value report-hpi-value--severity-unit">/10</span>
  `;
  hpiGrid.appendChild(severityField);

  const improveField = document.createElement("div");
  improveField.className = "report-hpi-field";
  improveField.innerHTML = `
    <span class="report-hpi-label">Factors That Improve</span>
    <span class="report-hpi-value">${escapeHtml(report.historyOfPresentIllness.factorsThatImprove.join(", "))}</span>
  `;
  hpiGrid.appendChild(improveField);

  const worsenField = document.createElement("div");
  worsenField.className = "report-hpi-field";
  worsenField.innerHTML = `
    <span class="report-hpi-label">Factors That Worsen</span>
    <span class="report-hpi-value">${escapeHtml(report.historyOfPresentIllness.factorsThatWorsen.join(", "))}</span>
  `;
  hpiGrid.appendChild(worsenField);

  section4.appendChild(hpiGrid);
  card.appendChild(section4);

  // Section 5: Medication History (Past & Current as separate cards)
  const section5 = createSection(5, "Medication History");
  const medGrid = document.createElement("div");
  medGrid.className = "report-medication-grid";

  // Past Medications Card
  const pastCard = document.createElement("div");
  pastCard.className = "report-medication-card report-medication-card--past";
  pastCard.innerHTML = `
    <div class="report-medication-header">
      <span class="report-medication-icon">💊</span>
      <h4 class="report-medication-title">Past Medications</h4>
    </div>
    <span class="report-medication-status report-medication-status--${report.medicalBackground.pastMedications.startsWith('Yes') ? 'yes' : 'no'}">
      ${report.medicalBackground.pastMedications.startsWith('Yes') ? 'Reported' : 'None Reported'}
    </span>
    <div class="report-medication-details">${escapeHtml(report.medicalBackground.pastMedications)}</div>
  `;
  medGrid.appendChild(pastCard);

  // Current Medications Card
  const currentCard = document.createElement("div");
  currentCard.className = "report-medication-card report-medication-card--current";
  currentCard.innerHTML = `
    <div class="report-medication-header">
      <span class="report-medication-icon">💊</span>
      <h4 class="report-medication-title">Current Medications</h4>
    </div>
    <span class="report-medication-status report-medication-status--${report.medicalBackground.currentMedications.startsWith('Yes') ? 'yes' : 'no'}">
      ${report.medicalBackground.currentMedications.startsWith('Yes') ? 'Reported' : 'None Reported'}
    </span>
    <div class="report-medication-details">${escapeHtml(report.medicalBackground.currentMedications)}</div>
  `;
  medGrid.appendChild(currentCard);

  section5.appendChild(medGrid);
  card.appendChild(section5);

  // Section 6: Allergies
  const section6 = createSection(6, "Allergies");
  const allergyCard = document.createElement("div");
  allergyCard.className = "report-allergy-card";

  let allergyStatusClass = "report-allergy-status--empty";
  let allergyIcon = "❓";
  if (report.medicalBackground.allergies === "No known allergies") {
    allergyStatusClass = "report-allergy-status--none";
    allergyIcon = "✓";
  } else if (report.medicalBackground.allergies.startsWith("Yes")) {
    allergyStatusClass = "report-allergy-status--yes";
    allergyIcon = "⚠";
  } else if (report.medicalBackground.allergies === "Not sure") {
    allergyStatusClass = "report-allergy-status--unsure";
    allergyIcon = "?";
  }

  allergyCard.innerHTML = `
    <div class="report-allergy-status ${allergyStatusClass}">
      <span class="report-allergy-icon" aria-hidden="true">${allergyIcon}</span>
      <span class="report-allergy-label">Allergy Status</span>
    </div>
    <span class="report-allergy-value">${escapeHtml(report.medicalBackground.allergies)}</span>
    ${report.medicalBackground.allergies.startsWith("Yes") && report.medicalBackground.allergies.includes(":") ? `
      <div class="report-allergy-details">${escapeHtml(report.medicalBackground.allergies.split(": ")[1])}</div>
    ` : ''}
  `;
  section6.appendChild(allergyCard);
  card.appendChild(section6);

  // Section 7: Additional Notes
  const section7 = createSection(7, "Additional Notes");
  const notesCard = document.createElement("div");
  notesCard.className = "report-notes-card";
  const notesText = report.additionalNotes === "No additional notes provided"
    ? `<span class="report-notes-empty">No additional notes were provided.</span>`
    : `<p class="report-notes-text">${escapeHtml(report.additionalNotes)}</p>`;
  notesCard.innerHTML = notesText;
  section7.appendChild(notesCard);
  card.appendChild(section7);

  // Section 8: Missing Information
  const section8 = createSection(8, "Information Not Provided");
  const missingList = document.createElement("ul");
  missingList.className = "report-missing-list";
  if (report.missingInformation.length > 0 && report.missingInformation[0] !== "All requested information was provided.") {
    report.missingInformation.forEach(item => {
      const li = document.createElement("li");
      li.className = "report-missing-item";
      li.textContent = escapeHtml(item);
      missingList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.className = "report-missing-empty";
    li.textContent = "All requested information was provided.";
    missingList.appendChild(li);
  }
  section8.appendChild(missingList);
  card.appendChild(section8);

  // Section 9: Clinician Review
  const section9 = createSection(9, "Clinician Review");
  const clinicianGrid = document.createElement("div");
  clinicianGrid.className = "report-clinician-grid";

  const clinicianFields = [
    "Doctor's Observations",
    "Additional Clinical Notes",
    "Follow-up Recommendations",
    "Doctor's Name",
    "Doctor's Signature",
    "Date of Review"
  ];

  clinicianFields.forEach(label => {
    const field = document.createElement("div");
    field.className = "report-clinician-field";
    field.innerHTML = `
      <span class="report-clinician-label">${escapeHtml(label)}</span>
      <div class="report-clinician-lines">
        <div class="report-clinician-line"></div>
        <div class="report-clinician-line"></div>
        <div class="report-clinician-line"></div>
      </div>
    `;
    clinicianGrid.appendChild(field);
  });

  section9.appendChild(clinicianGrid);
  card.appendChild(section9);

  // Footer
  const footer = document.createElement("footer");
  footer.className = "report-footer";
  footer.innerHTML = `
    <div class="report-footer__brand">Generated using <strong>MediScribe</strong></div>
    <p class="report-footer__disclaimer">
      Patient-provided information only. This document is not a medical diagnosis or treatment recommendation.
      All information should be reviewed and verified by a qualified healthcare professional.
    </p>
  `;
  card.appendChild(footer);

  // Actions
  const actions = document.createElement("div");
  actions.className = "review-actions";
  actions.style.marginTop = "1.5rem";

  const downloadButton = document.createElement("button");
  downloadButton.type = "button";
  downloadButton.className = "btn-primary";
  downloadButton.textContent = "Download PDF";
  downloadButton.addEventListener("click", downloadPDF);
  actions.appendChild(downloadButton);

  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.className = "btn-secondary";
  backButton.textContent = "Back to Review";
  backButton.addEventListener("click", () => renderReview());
  actions.appendChild(backButton);

  const startOverButton = document.createElement("button");
  startOverButton.type = "button";
  startOverButton.className = "btn-secondary";
  startOverButton.textContent = "Start Over";
  startOverButton.style.marginLeft = "auto";
  startOverButton.addEventListener("click", startOver);
  actions.appendChild(startOverButton);

  card.appendChild(actions);
  app.appendChild(card);
}

function createSection(number, title) {
  const section = document.createElement("section");
  section.className = "report-section";

  const header = document.createElement("div");
  header.className = "report-section__header";

  const numberEl = document.createElement("span");
  numberEl.className = "report-section__number";
  numberEl.textContent = number;
  header.appendChild(numberEl);

  const titleEl = document.createElement("h3");
  titleEl.className = "report-section__title";
  titleEl.textContent = title;
  header.appendChild(titleEl);

  section.appendChild(header);
  return section;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function downloadPDF() {
  const report = generatedReport;
  if (!report) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  // Helper functions
  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const writeText = (text, options = {}) => {
    const { fontSize = 10, fontStyle = "normal", color = "#1E293B", maxWidth = contentWidth, lineHeight = 5 } = options;
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    const rgb = hexToRgb(color);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    const lines = doc.splitTextToSize(text, maxWidth);
    checkPageBreak(lines.length * lineHeight);
    doc.text(lines, margin, y);
    y += lines.length * lineHeight;
    return lines.length * lineHeight;
  };

  const writeHeading = (text, level = 1) => {
    const sizes = { 1: 16, 2: 13, 3: 11 };
    const colors = { 1: "#172554", 2: "#172554", 3: "#2563EB" };
    const fontStyles = { 1: "bold", 2: "bold", 3: "bold" };
    y += 3;
    writeText(text, { fontSize: sizes[level], fontStyle: fontStyles[level], color: colors[level], lineHeight: sizes[level] * 0.5 });
    if (level <= 2) {
      doc.setDrawColor(37, 37, 84);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;
    }
  };

  const writeKeyValue = (key, value) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    const keyText = `${key}: `;
    const keyWidth = doc.getTextWidth(keyText);
    doc.text(keyText, margin, y);

    doc.setFont("helvetica", "normal");
    const valText = value || "Not provided";
    const valLines = doc.splitTextToSize(valText, contentWidth - keyWidth - 2);
    let lineHeight = 5;
    checkPageBreak(valLines.length * lineHeight);
    doc.text(valLines, margin + keyWidth, y);
    y += valLines.length * lineHeight;
  };

  const writeList = (items) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    items.forEach(item => {
      const bulletText = `• ${item}`;
      const lines = doc.splitTextToSize(bulletText, contentWidth - 5);
      checkPageBreak(lines.length * 5);
      doc.text(lines, margin + 5, y);
      y += lines.length * 5;
    });
  };

  const writeSection = (title, entries) => {
    writeHeading(title, 2);
    entries.forEach(({ label, value }) => {
      writeKeyValue(label, value);
    });
    y += 2;
  };

  const writeListSection = (title, values, emptyMessage) => {
    writeHeading(title, 2);
    const items = values.length ? values : [emptyMessage];
    writeList(items);
    y += 2;
  };

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 30, g: 41, b: 59 };
  }

  // ===== PDF CONTENT =====

  // Header
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("⚕️", pageWidth / 2, y, { align: "center" });
  y += 5;

  writeHeading("PATIENT CLINICAL INFORMATION REPORT", 1);

  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 116, 139);
  doc.text("Patient-provided information for clinician review", pageWidth / 2, y, { align: "center" });
  y += 6;

  // Meta info
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  const generatedDate = formatDate(report.generatedAt);
  doc.text(`Generated: ${generatedDate}    |    Report Reference: ${report.reportReference}`, pageWidth / 2, y, { align: "center" });
  y += 8;

  // Draw header line
  doc.setDrawColor(37, 37, 84);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Section 1: Patient Information
  writeSection("1. Patient Information", [
    { label: "Full Name", value: report.patientInformation.name },
    { label: "Age", value: report.patientInformation.age },
    { label: "Gender", value: report.patientInformation.gender }
  ]);

  // Section 2: Chief Complaint
  writeSection("2. Chief Complaint", [
    { label: "Patient-reported", value: report.chiefComplaint }
  ]);

  // Section 3: Reported Symptoms
  writeListSection("3. Reported Symptoms", report.symptoms, "No specific symptoms were provided.");

  // Section 4: History of Present Illness (HPI)
  writeSection("4. History of Present Illness (HPI)", [
    { label: "Onset / Duration", value: report.historyOfPresentIllness.onset },
    { label: "Reported Severity", value: report.historyOfPresentIllness.severity },
    { label: "Factors that Improve Symptoms", value: report.historyOfPresentIllness.factorsThatImprove.join(", ") },
    { label: "Factors that Worsen Symptoms", value: report.historyOfPresentIllness.factorsThatWorsen.join(", ") }
  ]);

  // Section 5: Medication History
  writeSection("5. Medication History", [
    { label: "A. Past Medications", value: report.medicalBackground.pastMedications },
    { label: "B. Current Medications", value: report.medicalBackground.currentMedications }
  ]);

  // Section 6: Allergies
  writeSection("6. Allergies", [
    { label: "Allergy Status", value: report.medicalBackground.allergies }
  ]);

  // Section 7: Additional Notes
  writeSection("7. Additional Notes", [
    { label: "Patient-reported", value: report.additionalNotes }
  ]);

  // Section 8: Information Not Provided
  writeListSection("8. Information Not Provided", report.missingInformation, "All requested information was provided.");

  // Section 9: Clinician Review (blank fields with lines)
  writeHeading("9. Clinician Review", 2);
  const clinicianFields = [
    "Doctor's Observations:",
    "Additional Clinical Notes:",
    "Follow-up Recommendations:",
    "Doctor's Name:",
    "Doctor's Signature:",
    "Date of Review:"
  ];
  clinicianFields.forEach(field => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    checkPageBreak(15);
    doc.text(field, margin, y);
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
  });

  y += 5;

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  const footerLines = [
    "Generated using MediScribe",
    "Patient-provided information only. This document is not a medical diagnosis or treatment recommendation.",
    "All information should be reviewed and verified by a qualified healthcare professional."
  ];
  footerLines.forEach(line => {
    doc.text(line, pageWidth / 2, y, { align: "center" });
    y += 4;
  });

  // Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
  }

  // Save
  const filename = `MediScribe_Clinical_Report_${sanitizeFilename(report.patientInformation.name)}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

function isValidReport(report) {
  const isStringArray = value =>
    Array.isArray(value) && value.every(item => typeof item === "string");
  const history = report?.historyOfPresentIllness;
  const patient = report?.patientInformation;
  const medicalBackground = report?.medicalBackground;

  return typeof patient?.name === "string" &&
    (typeof patient.age === "string" || typeof patient.age === "number") &&
    typeof patient.gender === "string" &&
    typeof report.chiefComplaint === "string" &&
    isStringArray(report.symptoms) &&
    typeof history?.onset === "string" &&
    typeof history?.severity === "string" &&
    isStringArray(history.factorsThatImprove) &&
    isStringArray(history.factorsThatWorsen) &&
    typeof medicalBackground?.pastMedications === "string" &&
    typeof medicalBackground?.currentMedications === "string" &&
    typeof medicalBackground.allergies === "string" &&
    typeof report.additionalNotes === "string" &&
    isStringArray(report.missingInformation) &&
    typeof report.notice === "string";
}

function renderLoading() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="glass-card loading-card" role="status" aria-live="polite">
      <div class="loading-spinner" aria-hidden="true"></div>
      <h2>Preparing Your Report</h2>
      <p>Please wait while your information is organized.</p>
    </div>
  `;
}

function startOver() {
  generatedReport = null;
  reportIsStale = false;
  resetQuestionnaire();
  location.reload();
}

async function generateReport() {
  if (isGenerating) {
    console.debug("[generateReport] Already generating, ignoring duplicate click");
    return;
  }
  isGenerating = true;
  renderLoading();

  try {
    const answers = getAnswers();
    console.debug("[generateReport] Generating report from answers:", answers);

    // Deterministic report generation (no API call)
    const report = buildReportData(answers);

    if (!isValidReport(report)) {
      console.error("[generateReport] Invalid report structure:", report);
      throw new Error("The generated report is incomplete.");
    }

    generatedReport = report;
    reportIsStale = false;
    isGenerating = false;
    console.debug("[generateReport] Report generated successfully");
    renderGeneratedReport();
  } catch (error) {
    isGenerating = false;
    const errorMessage = error instanceof Error ? error.message : "The report could not be generated. Please try again.";
    console.error("[generateReport] Error:", errorMessage, error);
    renderReview(errorMessage);
  }
}

// Export for testing
export { formatAnswer, isEmpty, LABEL_MAP, isValidReport, buildReportData };

export function renderReview(errorMessage = "") {
  const app = document.getElementById("app");
  const answers = getAnswers();
  app.innerHTML = "";

  const card = document.createElement("div");
  card.className = "glass-card review-card";

  const heading = document.createElement("h2");
  heading.textContent = "Review Your Answers";
  card.appendChild(heading);

  if (errorMessage) {
    const error = document.createElement("p");
    error.className = "report-error";
    error.setAttribute("role", "alert");
    error.textContent = errorMessage;
    card.appendChild(error);
  }
  if (reportIsStale) {
    const staleNotice = document.createElement("p");
    staleNotice.className = "report-warning";
    staleNotice.setAttribute("role", "status");
    staleNotice.textContent =
      "Your answers have changed since the saved report was generated.";
    card.appendChild(staleNotice);
  }

  const sections = Object.fromEntries(SECTION_ORDER.map(section => [section, []]));
  QUESTIONS.forEach(question => {
    if (!sections[question.section]) {
      sections[question.section] = [];
    }
    sections[question.section].push(question);
  });

  SECTION_ORDER.forEach(section => {
    const questions = sections[section];
    if (!questions?.length) {
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
      label.textContent = LABEL_MAP[question.id] || question.label;

      const value = document.createElement("span");
      value.className = "review-value";
      const formattedValue = formatAnswer(question.id, answers);
      const displayValue = isEmpty(formattedValue) ? "(not provided)" : formattedValue;
      value.textContent = displayValue;
      if (isEmpty(formattedValue)) {
        value.classList.add("review-empty");
      }

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Edit";
      editButton.className = "btn-secondary review-edit";
      editButton.dataset.id = question.id;

      item.append(label, value, editButton);
      list.appendChild(item);
    });
    card.appendChild(list);
  });

  const actions = document.createElement("div");
  actions.className = "review-actions";

  const startOverButton = document.createElement("button");
  startOverButton.id = "btn-start-over";
  startOverButton.className = "btn-secondary";
  startOverButton.textContent = "Start Over";
  actions.appendChild(startOverButton);

  if (generatedReport) {
    const viewReportButton = document.createElement("button");
    viewReportButton.type = "button";
    viewReportButton.className = "btn-secondary";
    viewReportButton.textContent = "View Generated Report";
    viewReportButton.addEventListener("click", renderGeneratedReport);
    actions.appendChild(viewReportButton);
  }

  const generateButton = document.createElement("button");
  generateButton.id = "btn-generate";
  generateButton.className = "btn-primary";
  generateButton.textContent = "Generate Report";
  actions.appendChild(generateButton);

  card.appendChild(actions);
  app.appendChild(card);

  card.addEventListener("click", event => {
    const editButton = event.target.closest("button.review-edit[data-id]");
    if (!editButton) {
      return;
    }
    reportIsStale = Boolean(generatedReport);
    editAnswer(editButton.dataset.id, renderReview);
  });

  startOverButton.addEventListener("click", startOver);
  generateButton.addEventListener("click", generateReport);
}