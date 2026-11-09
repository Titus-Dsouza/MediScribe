// public/js/app.js
// Entry point – renders landing page and starts the questionnaire

import { startQuestionnaire } from "./questionnaire.js";
import { renderReview } from "./report.js";

function renderLanding() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="glass-card">
      <h1>MediScribe</h1>
      <h2>Simplifying Clinical Documentation</h2>
      <p>Share your symptoms. Create a structured clinical report.</p>
      <button id="btn-start" class="btn-primary">Get Started</button>
      <p class="disclaimer" style="font-size:15px;margin-top:1rem;color:#64748B;">
        MediScribe is a documentation‑support tool, not a diagnostic service.
        All reports must be reviewed by a qualified healthcare professional before clinical use.
      </p>
    </div>
  `;

  document.getElementById("btn-start").addEventListener("click", () => {
    startQuestionnaire(renderReview);
  });
}

document.addEventListener("DOMContentLoaded", renderLanding);

