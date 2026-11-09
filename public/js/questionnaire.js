// public/js/questionnaire.js
// ---------------------------------------------------------------
// Redesigned MCQ‑based questionnaire (10 questions).
// All data stays in a single in‑memory object (no persistence).
// ---------------------------------------------------------------

/** QUESTION DEFINITIONS */
export const QUESTIONS = [
  // 1. Name – text input (required)
  { id: "name", label: "Name", placeholder: "John Doe", required: true, type: "text", section: "Patient Information" },

  // 2. Age – numeric input (required, positive)
  { id: "age", label: "Age", placeholder: "45", required: true, type: "number", section: "Patient Information" },

  // 3. Gender – radio (two options, required)
  {
    id: "gender",
    label: "Gender",
    required: true,
    type: "radio",
    options: [
      { value: "Male", label: "Male" },
      { value: "Female", label: "Female" },
    ],
    section: "Patient Information",
  },

  // 4. Chief complaint – radio with "Other" => extra text
  {
    id: "chief",
    label: "What brings you in here?",
    required: true,
    type: "radio",
    options: [
      { value: "Fever", label: "Fever" },
      { value: "Headache", label: "Headache" },
      { value: "Cough or cold", label: "Cough or cold" },
      { value: "Stomach pain", label: "Stomach pain" },
      { value: "Chest discomfort", label: "Chest discomfort" },
      { value: "Breathing difficulty", label: "Breathing difficulty" },
      { value: "Body pain", label: "Body pain" },
      { value: "Fatigue or weakness", label: "Fatigue or weakness" },
      { value: "Skin problems", label: "Skin problems" },
      { value: "Other", label: "Other" },
    ],
    otherField: { id: "chief_other", placeholder: "Please describe" },
    section: "Chief Complaint",
  },

  // 5. Symptoms – multiple checkboxes, last option "Other"
  {
    id: "symptoms",
    label: "What symptoms are you experiencing?",
    required: false,
    type: "checkbox",
    options: [
      { value: "Fever", label: "Fever" },
      { value: "Headache", label: "Headache" },
      { value: "Cough", label: "Cough" },
      { value: "Sore throat", label: "Sore throat" },
      { value: "Runny or blocked nose", label: "Runny or blocked nose" },
      { value: "Nausea", label: "Nausea" },
      { value: "Vomiting", label: "Vomiting" },
      { value: "Diarrhoea", label: "Diarrhoea" },
      { value: "Constipation", label: "Constipation" },
      { value: "Abdominal pain", label: "Abdominal pain" },
      { value: "Chest pain", label: "Chest pain" },
      { value: "Shortness of breath", label: "Shortness of breath" },
      { value: "Dizziness", label: "Dizziness" },
      { value: "Body aches", label: "Body aches" },
      { value: "Fatigue", label: "Fatigue" },
      { value: "Skin rash", label: "Skin rash" },
      { value: "Loss of appetite", label: "Loss of appetite" },
      { value: "Other", label: "Other" },
    ],
    otherField: { id: "symptoms_other", placeholder: "Please describe" },
    section: "Symptoms",
  },

  // 6. Onset + Severity (combined)
  {
    id: "onset_severity",
    label: "When did it start, and how severe is it?",
    required: true,
    type: "mixed",
    onsetOptions: [
      { value: "Today", label: "Today" },
      { value: "Yesterday", label: "Yesterday" },
      { value: "2–3 days ago", label: "2–3 days ago" },
      { value: "4–7 days ago", label: "4–7 days ago" },
      { value: "1–2 weeks ago", label: "1–2 weeks ago" },
      { value: "More than 2 weeks ago", label: "More than 2 weeks ago" },
      { value: "Not sure", label: "Not sure" },
    ],
    severity: { min: 1, max: 10, step: 1 },
    section: "Symptoms",
  },

  // 7. What makes it better / worse? (dual checkbox groups)
  {
    id: "modifiers",
    label: "What makes you feel better or worse?",
    required: false,
    type: "dual",
    better: {
      label: "What makes it better?",
      options: [
        { value: "Rest", label: "Rest" },
        { value: "Medication", label: "Medication" },
        { value: "Drinking water or fluids", label: "Drinking water or fluids" },
        { value: "Eating", label: "Eating" },
        { value: "Changing position", label: "Changing position" },
        { value: "Nothing helps", label: "Nothing helps" },
        { value: "Not sure", label: "Not sure" },
        { value: "Other", label: "Other" },
      ],
      otherField: { id: "better_other", placeholder: "Please specify" },
    },
    worse: {
      label: "What makes it worse?",
      options: [
        { value: "Physical activity", label: "Physical activity" },
        { value: "Eating", label: "Eating" },
        { value: "Walking or movement", label: "Walking or movement" },
        { value: "Lying down", label: "Lying down" },
        { value: "Certain foods", label: "Certain foods" },
        { value: "Certain times of the day", label: "Certain times of the day" },
        { value: "Nothing makes it worse", label: "Nothing makes it worse" },
        { value: "Not sure", label: "Not sure" },
        { value: "Other", label: "Other" },
      ],
      otherField: { id: "worse_other", placeholder: "Please specify" },
    },
    section: "Symptoms",
  },

  // 8. Medications – past and current (two sub‑questions)
  {
    id: "medications",
    label: "Past and current medications",
    required: false,
    type: "dual",
    past: {
      label: "Past medications",
      options: [
        { value: "No previous medications", label: "No previous medications" },
        { value: "Yes, I have taken medications before", label: "Yes, I have taken medications before" },
        { value: "Not sure", label: "Not sure" },
      ],
      otherField: { id: "past_medications_other", placeholder: "List past medications" },
    },
    current: {
      label: "Current medications",
      options: [
        { value: "Not taking any medication", label: "Not taking any medication" },
        { value: "Yes, currently taking medication", label: "Yes, currently taking medication" },
        { value: "Not sure", label: "Not sure" },
      ],
      otherField: { id: "current_medications_other", placeholder: "List current medications" },
    },
    section: "Medical Background",
  },

  // 9. Allergies
  {
    id: "allergies",
    label: "Do you have any allergies?",
    required: false,
    type: "radio",
    options: [
      { value: "No known allergies", label: "No known allergies" },
      { value: "Yes, I have allergies", label: "Yes, I have allergies" },
      { value: "Not sure", label: "Not sure" },
    ],
    otherField: { id: "allergies_other", placeholder: "Specify allergies" },
    section: "Medical Background",
  },

  // 10. Additional notes (optional textarea)
  {
    id: "notes",
    label: "Additional notes",
    required: false,
    type: "textarea",
    placeholder: "Anything else you would like the healthcare professional to know?",
    section: "Additional",
  },
];

/* --------------------------------------------------------------------------
   INTERNAL STATE – a single object for the whole session
   -------------------------------------------------------------------------- */
let answers = {};                 // patient answers
let currentIndex = 0;            // which question is displayed
let editMode = false;            // true when we are editing from review
let onFinishedCallback = null;   // set by startQuestionnaire / editAnswer

/** Helper: safe number conversion */
function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Render a single question based on its type */
function renderQuestion(idx) {
  const q = QUESTIONS[idx];
  const total = QUESTIONS.length;
  const app = document.getElementById("app");
  app.innerHTML = ""; // clear container

  const card = document.createElement("div");
  card.className = "glass-card";

  // Progress bar
  const progContainer = document.createElement("div");
  progContainer.className = "progress-container";
  const progBar = document.createElement("div");
  progBar.className = "progress-bar";
  progBar.style.width = `${Math.round((idx / total) * 100)}%`;
  progContainer.appendChild(progBar);
  card.appendChild(progContainer);

  // Heading (question label)
  const heading = document.createElement("h2");
  heading.textContent = `${idx + 1}. ${q.label}`;
  card.appendChild(heading);

  // Container for the interactive part
  const content = document.createElement("div");

  // Utility to create an error message area (ARIA live)
  const err = document.createElement("div");
  err.id = "err";
  err.className = "error-msg";
  err.setAttribute("role", "alert");

  // ------- Rendering per type -------------------------------------------
  if (q.type === "text" || q.type === "number") {
    const label = document.createElement("label");
    label.htmlFor = `inp-${q.id}`;
    label.style.display = "none";
    label.textContent = q.label;
    card.appendChild(label);

    const input = document.createElement("input");
    input.id = `inp-${q.id}`;
    input.className = "input-field";
    input.type = q.type;
    input.placeholder = q.placeholder;
    input.value = answers[q.id] ?? "";
    if (q.required) input.required = true;
    content.appendChild(input);
    content.appendChild(err);
    // Continue handler will read `input.value`
    const getValue = () => input.value.trim();
    var focusEl = input;
  } else if (q.type === "textarea") {
    const label = document.createElement("label");
    label.htmlFor = `inp-${q.id}`;
    label.style.display = "none";
    label.textContent = q.label;
    card.appendChild(label);

    const textarea = document.createElement("textarea");
    textarea.id = `inp-${q.id}`;
    textarea.className = "input-field";
    textarea.placeholder = q.placeholder;
    textarea.rows = 4;
    textarea.value = answers[q.id] ?? "";
    content.appendChild(textarea);
    content.appendChild(err);
    var getValue = () => textarea.value.trim();
    var focusEl = textarea;
  } else if (q.type === "radio") {
    // Render each option as a selectable card (radio hidden)
    const group = document.createElement("div");
    group.className = "option-group";
    const name = `radio-${q.id}`;
    q.options.forEach((opt) => {
      const optId = `opt-${q.id}-${opt.value.replace(/\s+/g, "_")}`;
      const wrapper = document.createElement("label");
      wrapper.className = "option-card";
      wrapper.htmlFor = optId;

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = name;
      radio.id = optId;
      radio.value = opt.value;
      if (answers[q.id] === opt.value) radio.checked = true;
      wrapper.appendChild(radio);

      const span = document.createElement("span");
      span.textContent = opt.label;
      wrapper.appendChild(span);

      group.appendChild(wrapper);
    });
    content.appendChild(group);
    content.appendChild(err);
    // Helper to retrieve selected value
    var getValue = () => {
      const checked = card.querySelector(`input[name='${name}']:checked`);
      return checked ? checked.value : "";
    };
    var focusEl = group;
    // Conditional "Other" field
    if (q.otherField) {
      const otherDiv = document.createElement("div");
      otherDiv.style.marginTop = "0.75rem";
      otherDiv.style.display = "none";
      const otherInput = document.createElement("input");
      otherInput.type = "text";
      otherInput.className = "input-field";
      otherInput.placeholder = q.otherField.placeholder;
      otherInput.id = q.otherField.id;
      otherDiv.appendChild(otherInput);
      content.appendChild(otherDiv);
      // Show/hide based on selection
      group.addEventListener("change", () => {
        if (getValue() === "Other") {
          otherDiv.style.display = "block";
        } else {
          otherDiv.style.display = "none";
        }
      });
      // Pre‑fill if answer already stored
      if (answers[q.otherField.id]) otherInput.value = answers[q.otherField.id];
    }
  } else if (q.type === "checkbox") {
    const group = document.createElement("div");
    group.className = "option-group";
    q.options.forEach((opt) => {
      const optId = `opt-${q.id}-${opt.value.replace(/\s+/g, "_")}`;
      const wrapper = document.createElement("label");
      wrapper.className = "option-card";
      wrapper.htmlFor = optId;
      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.id = optId;
      chk.value = opt.value;
      if (answers[q.id] && answers[q.id].includes(opt.value)) chk.checked = true;
      wrapper.appendChild(chk);
      const span = document.createElement("span");
      span.textContent = opt.label;
      wrapper.appendChild(span);
      group.appendChild(wrapper);
    });
    content.appendChild(group);
    content.appendChild(err);
    var getValue = () => {
      const checked = [...card.querySelectorAll(`input[id^='opt-${q.id}']:checked`)].map((c) => c.value);
      return checked;
    };
    var focusEl = group;
    // Conditional Other field
    if (q.otherField) {
      const otherDiv = document.createElement("div");
      otherDiv.style.marginTop = "0.75rem";
      otherDiv.style.display = "none";
      const otherInput = document.createElement("input");
      otherInput.type = "text";
      otherInput.className = "input-field";
      otherInput.placeholder = q.otherField.placeholder;
      otherInput.id = q.otherField.id;
      otherDiv.appendChild(otherInput);
      content.appendChild(otherDiv);
      // Show/hide when "Other" is (un)checked
      const otherCheckbox = card.querySelector(`input[id='opt-${q.id}-Other']`);
      if (otherCheckbox) {
        otherCheckbox.addEventListener("change", () => {
          otherDiv.style.display = otherCheckbox.checked ? "block" : "none";
        });
        // Pre‑fill if stored
        if (answers[q.otherField.id]) otherInput.value = answers[q.otherField.id];
        // Ensure visibility matches stored answer
        if (otherCheckbox.checked) otherDiv.style.display = "block";
      }
    }
  } else if (q.type === "mixed") {
    // Onset radio options + severity slider
    const onsetLabel = document.createElement("p");
    onsetLabel.textContent = "When did it start?";
    content.appendChild(onsetLabel);
    const onsetGroup = document.createElement("div");
    onsetGroup.className = "option-group";
    const name = `radio-${q.id}-onset`;
    q.onsetOptions.forEach((opt) => {
      const optId = `opt-${q.id}-${opt.value.replace(/\s+/g, "_")}`;
      const wrapper = document.createElement("label");
      wrapper.className = "option-card";
      wrapper.htmlFor = optId;
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = name;
      radio.id = optId;
      radio.value = opt.value;
      if (answers["onset"] === opt.value) radio.checked = true;
      wrapper.appendChild(radio);
      const span = document.createElement("span");
      span.textContent = opt.label;
      wrapper.appendChild(span);
      onsetGroup.appendChild(wrapper);
    });
    content.appendChild(onsetGroup);
    content.appendChild(err);
    // Severity slider
    const sevLabel = document.createElement("p");
    sevLabel.textContent = "How severe is it? (1 = Very mild, 10 = Extremely severe)";
    content.appendChild(sevLabel);
    const sliderContainer = document.createElement("div");
    sliderContainer.style.display = "flex";
    sliderContainer.style.alignItems = "center";
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = q.severity.min;
    slider.max = q.severity.max;
    slider.step = q.severity.step;
    slider.value = answers["severity"] ?? 5;
    slider.id = `slider-${q.id}`;
    const sevValue = document.createElement("span");
    sevValue.style.marginLeft = "0.5rem";
    sevValue.textContent = slider.value;
    slider.addEventListener("input", () => {
      sevValue.textContent = slider.value;
    });
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(sevValue);
    content.appendChild(sliderContainer);
    var getValue = () => ({ onset: getOnset(), severity: Number(slider.value) });
    function getOnset() {
      const checked = card.querySelector(`input[name='${name}']:checked`);
      return checked ? checked.value : "";
    }
    var focusEl = slider;
  } else if (q.type === "dual") {
    // Two sub‑sections, each with its own options (checkboxes)
    const subIds = [];
    const subValues = {};
    Object.entries(q).forEach(([key, sub]) => {
      if (key === "id" || key === "label" || key === "type" || key === "required" || key === "section") return;
      // sub is an object with label, options, otherField
      const subDiv = document.createElement("div");
      const subHeader = document.createElement("h3");
      subHeader.textContent = sub.label;
      subDiv.appendChild(subHeader);
      const group = document.createElement("div");
      group.className = "option-group";
      const name = `checkbox-${q.id}-${key}`;
      sub.options.forEach((opt) => {
        const optId = `opt-${q.id}-${key}-${opt.value.replace(/\s+/g, "_")}`;
        const wrapper = document.createElement("label");
        wrapper.className = "option-card";
        wrapper.htmlFor = optId;
        const chk = document.createElement("input");
        chk.type = "checkbox";
        chk.id = optId;
        chk.name = name;
        chk.value = opt.value;
        if (answers[key] && answers[key].includes(opt.value)) chk.checked = true;
        wrapper.appendChild(chk);
        const span = document.createElement("span");
        span.textContent = opt.label;
        wrapper.appendChild(span);
        group.appendChild(wrapper);
      });
      subDiv.appendChild(group);
      // Conditional Other field
      if (sub.otherField) {
        const otherDiv = document.createElement("div");
        otherDiv.style.marginTop = "0.75rem";
        otherDiv.style.display = "none";
        const otherInput = document.createElement("input");
        otherInput.type = "text";
        otherInput.className = "input-field";
        otherInput.placeholder = sub.otherField.placeholder;
        otherInput.id = sub.otherField.id;
        otherDiv.appendChild(otherInput);
        subDiv.appendChild(otherDiv);
        const otherChk = subDiv.querySelector(`input[id='opt-${q.id}-${key}-Other']`);
        if (otherChk) {
          otherChk.addEventListener("change", () => {
            otherDiv.style.display = otherChk.checked ? "block" : "none";
          });
          if (answers[sub.otherField.id]) otherInput.value = answers[sub.otherField.id];
          if (otherChk.checked) otherDiv.style.display = "block";
        }
      }
      content.appendChild(subDiv);
      subIds.push(key);
    });
    // Helper to collect values for each sub‑section
    var getValue = () => {
      const result = {};
      subIds.forEach((subKey) => {
        const checked = [...card.querySelectorAll(`input[name='checkbox-${q.id}-${subKey}']:checked`)].map((c) => c.value);
        result[subKey] = checked;
        // capture possible other text
        const otherId = q[subKey].otherField?.id;
        if (otherId) {
          const otherInput = document.getElementById(otherId);
          if (otherInput) result[otherId] = otherInput.value.trim();
        }
      });
      return result;
    };
    var focusEl = content;
  } else {
    console.error("Unsupported question type", q.type);
    return;
  }

  // Append interactive content
  card.appendChild(content);

  // Navigation buttons
  const nav = document.createElement("div");
  nav.style.display = "flex";
  nav.style.justifyContent = "space-between";
  nav.style.marginTop = "1rem";

  const btnPrev = document.createElement("button");
  btnPrev.id = "btn-prev";
  btnPrev.className = "btn-secondary";
  btnPrev.textContent = "Previous";
  if (idx === 0) btnPrev.disabled = true;
  nav.appendChild(btnPrev);

  const btnNext = document.createElement("button");
  btnNext.id = "btn-next";
  btnNext.className = "btn-primary";
  btnNext.textContent = "Continue";
  nav.appendChild(btnNext);

  card.appendChild(nav);
  app.appendChild(card);

  // Focus first interactive element for accessibility
  focusEl && focusEl.focus && focusEl.focus();

  // ----- Event handlers -----
  btnPrev.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex--;
      renderQuestion(currentIndex);
    }
  });

  btnNext.addEventListener("click", () => {
    // Gather answer based on type
    let val = getValue();
    // ----- Validation -----
    if (q.required) {
      if (q.type === "text" || q.type === "number" || q.type === "textarea") {
        if (!val) { err.textContent = "This field is required."; return; }
      } else if (q.type === "radio") {
        if (!val) { err.textContent = "Please select an option."; return; }
      } else if (q.type === "checkbox") {
        // optional, no validation needed
      } else if (q.type === "mixed") {
        if (!val.onset) { err.textContent = "Please select when it started."; return; }
        if (val.severity < q.severity.min || val.severity > q.severity.max) { err.textContent = "Severity out of range."; return; }
      } else if (q.type === "dual") {
        // No required validation for dual sections (all optional)
      }
    }

    // ----- Specific field validation -----
    if (q.id === "age") {
      const n = toNumber(val);
      if (n === null || n <= 0) { err.textContent = "Please enter a valid positive age."; return; }
      val = n; // store as number
    }
    if (q.id === "onset_severity") {
      // val already an object {onset, severity}
    }

    // ----- Store answer -----
    if (q.type === "mixed") {
      answers["onset"] = val.onset;
      answers["severity"] = val.severity;
    } else if (q.type === "dual") {
      // Store each sub‑section array and possible other texts
      Object.entries(val).forEach(([k, v]) => {
        answers[k] = v; // k may be "better", "worse", etc.
      });
    } else {
      answers[q.id] = val;
    }
    // Store "Other" text fields if present
    if (q.otherField) {
      const otherVal = document.getElementById(q.otherField.id)?.value.trim();
      if (otherVal) answers[q.otherField.id] = otherVal;
    }
    if (q.type === "checkbox" && q.otherField) {
      const otherVal = document.getElementById(q.otherField.id)?.value.trim();
      if (otherVal) answers[q.otherField.id] = otherVal;
    }

    err.textContent = ""; // clear any previous error

    if (currentIndex < QUESTIONS.length - 1) {
      currentIndex++;
      renderQuestion(currentIndex);
    } else {
      // Finished – call the supplied callback (review screen)
      onFinishedCallback && onFinishedCallback({ ...answers });
    }
  });
}

/* --------------------------------------------------------------------------
   PUBLIC API
   -------------------------------------------------------------------------- */
export function startQuestionnaire(onFinished) {
  if (!editMode) {
    answers = {};
    currentIndex = 0;
  }
  editMode = false;
  onFinishedCallback = (result) => {
    onFinished && onFinished(result);
  };
  renderQuestion(currentIndex);
}

export function getAnswers() {
  return { ...answers };
}

export function resetQuestionnaire() {
  answers = {};
  currentIndex = 0;
  editMode = false;
}

/** Jump to a specific question for editing (used by review screen) */
export function editAnswer(questionId, returnToReview) {
  const idx = QUESTIONS.findIndex((q) => q.id === questionId);
  if (idx < 0) return;
  currentIndex = idx;
  editMode = true;
  onFinishedCallback = () => {
    editMode = false;
    returnToReview && returnToReview();
  };
  renderQuestion(currentIndex);
}
