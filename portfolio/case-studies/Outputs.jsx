import React, { useState } from "react";
export function HandoffOutput() {
  return (
    <figure className="output-figure">
      <div className="handoff-output">
        <div className="phone-output">
          <div className="phone-top">
            <span>9:41</span>
            <span aria-hidden="true">•••</span>
          </div>
          <div className="phone-heading">
            <span>Nursing / Dialysis</span>
            <h3>Before treatment</h3>
          </div>
          <div className="person-strip">
            <span className="person-initial">A</span>
            <div>
              <strong>Patient A</strong>
              <small>Scheduled session</small>
            </div>
          </div>
          <div className="assessment-row">
            <span>Assessment</span>
            <strong>Recorded</strong>
          </div>
          <div className="assessment-row">
            <span>Access check</span>
            <strong>Complete</strong>
          </div>
          <div className="attention-note">
            <span>Doctor review required</span>
            <p>The assessment needs authorisation before the next step.</p>
          </div>
          <div className="phone-bottom">
            <span>Submit for doctor review</span>
            <small>Assessment passes to the doctor.</small>
          </div>
        </div>
        <div className="handoff-output-arrow" aria-hidden="true">
          →
        </div>
        <div className="phone-output">
          <div className="phone-top">
            <span>9:41</span>
            <span aria-hidden="true">•••</span>
          </div>
          <div className="phone-heading">
            <span>Doctor / Dialysis</span>
            <h3>Review assessment</h3>
          </div>
          <div className="person-strip">
            <span className="person-initial">A</span>
            <div>
              <strong>Patient A</strong>
              <small>Awaiting your review</small>
            </div>
          </div>
          <div className="review-section">
            <span>Nurse assessment</span>
            <p>Review the recorded observations and treatment readiness.</p>
          </div>
          <div className="review-choices">
            <span>Proceed</span>
            <span>Adjust</span>
            <span>Hold</span>
            <span>Cancel</span>
          </div>
          <div className="phone-bottom">
            <span>Record authorisation</span>
            <small>Decision belongs to the doctor.</small>
          </div>
        </div>
      </div>
      <figcaption>
        <strong>The same assessment, two responsibilities.</strong> The nurse
        requests review; the doctor owns the authorisation. Confidential
        interfaces reconstructed with illustrative content.
      </figcaption>
    </figure>
  );
}
export function ReviewOutput() {
  return (
    <figure className="output-figure">
      <div className="review-output">
        <div className="output-window">
          <div className="output-window-bar">
            <span>Documentation</span>
            <span>For review</span>
          </div>
          <div className="output-window-body">
            <div className="output-tabs">
              <strong>SOAP</strong>
              <span>Codes</span>
              <span>Transcript</span>
            </div>
            <div className="soap-block">
              <span>Subjective</span>
              <p>Discomfort has returned since the previous visit.</p>
              <span className="source-chip">Transcript source available</span>
            </div>
            <div className="soap-block">
              <span>Objective</span>
              <div className="redacted-line long" />
              <div className="redacted-line" />
            </div>
            <div className="soap-block">
              <span>Assessment & plan</span>
              <div className="redacted-line long" />
              <div className="redacted-line short" />
            </div>
          </div>
        </div>
        <div className="review-output-notes">
          <div>
            <span className="output-dot" />
            <strong>Evidence at the field</strong>
            <p>
              A statement can be traced without leaving the whole note behind.
            </p>
          </div>
          <div>
            <span className="output-dot" />
            <strong>A draft stays a draft</strong>
            <p>Generated documentation and reviewed actions remain distinct.</p>
          </div>
          <div>
            <span className="output-dot" />
            <strong>A deliberate commitment</strong>
            <p>Proposed medicines are resolved before visit completion.</p>
          </div>
        </div>
      </div>
      <figcaption>
        <strong>Review is part of the workflow.</strong> Evidence disclosure
        belongs beside the generated statement. Confidential interface
        reconstructed; the text is illustrative.
      </figcaption>
    </figure>
  );
}
export function SharedPatterns() {
  const [density, setDensity] = useState("Comfortable");
  return (
    <figure className="output-figure">
      <div className="patterns-output">
        <div className="patterns-toolbar">
          <span>Shared pattern / worklist</span>
          <div role="group" aria-label="Worklist density">
            {["Comfortable", "Compact"].map((d) => (
              <button
                key={d}
                aria-pressed={density === d}
                onClick={() => setDensity(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div
          className={`patterns-pair ${density === "Compact" ? "is-compact" : ""}`}
        >
          <div className="pattern-worklist">
            <h3>Laboratory</h3>
            <p>Work grouped by what happens next.</p>
            {[
              ["Sample A", "Awaiting collection"],
              ["Sample B", "In testing"],
              ["Sample C", "Released"],
            ].map(([name, status]) => (
              <div className="pattern-row" key={name}>
                <strong>{name}</strong>
                <span>{status}</span>
              </div>
            ))}
          </div>
          <div className="pattern-worklist">
            <h3>Reception</h3>
            <p>Different task. Familiar reading order.</p>
            {[
              ["Visit A", "Scheduled"],
              ["Visit B", "Checked in"],
              ["Visit C", "Completed"],
            ].map(([name, status]) => (
              <div className="pattern-row" key={name}>
                <strong>{name}</strong>
                <span>{status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="pattern-contract">
          <span>Shared</span>
          <p>
            Surface · Type hierarchy · Row spacing · Text status · Focus
            behaviour
          </p>
          <span>Role-specific</span>
          <p>Vocabulary · Actions · Information priority</p>
        </div>
      </div>
      <figcaption>
        <strong>A system is more than matching colours.</strong> Change the
        density to see one rule applied to both worklists. This portfolio-built
        pattern study illustrates reuse; it is not a recovered historical
        variant comparison.
      </figcaption>
    </figure>
  );
}
export function Deliverables({ project }) {
  const outputs =
    project === "zyephr"
      ? [
          [
            "Role-based workflows",
            "Eight modules spanning clinical work and hospital operations.",
          ],
          [
            "Implementation foundations",
            "Semantic tokens, shared components and Codex instructions.",
          ],
          [
            "Exploration environment",
            "Variant selection, preview width and scoped comments.",
          ],
        ]
      : project === "sap"
        ? [
            [
              "Decision architecture",
              "Executive, risk, dependency, planning and migration views.",
            ],
            [
              "Product interface",
              "Dashboard and workbench design for enterprise migration.",
            ],
            [
              "Product communication",
              "Identity and a public-facing product narrative.",
            ],
          ]
        : [
            [
              "Page editor",
              "Structured sections, typed fields and fixed visual foundations.",
            ],
            [
              "Preview experience",
              "Content editing alongside a responsive page preview.",
            ],
            [
              "Review workflow",
              "Draft, In Review and Live, with separate publication authority.",
            ],
          ];
  return (
    <div className="delivered-output">
      <h3>Design outputs</h3>
      <dl>
        {outputs.map(([name, detail]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{detail}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
