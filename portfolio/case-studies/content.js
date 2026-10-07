export const studies = {
  zyephr: {
    name: "ZyephrOS",
    subtitle: "Clinical AI / Enterprise software",
    title: "A hospital OS.\nA system to keep building it.",
    intro:
      "I’m the sole product designer on an operating system for hospitals and clinics, starting with nephrology. The work spans eight modules—and the shared rules that hold them together.",
    role: "Sole product designer",
    scope: "8 modules, design system, variant playground",
    stage: "Interactive frontend prototype",
    period: "Approximately four months of design work",
    takeaway:
      "My work is in the connections: between generated content and a reviewed decision, between one person’s task and the next person’s responsibility, and between a new module and the system behind it.",
    problem: "A hospital doesn’t work as eight separate apps.",
    context:
      "A consultation moves through intake, clinical review and follow-up. Dialysis involves assessment, authorisation and treatment. Operational teams need different views of the same organisation. Designing the individual screens is only part of the job; the state between them needs to be understandable too.",
    constraint:
      "I also needed a way to keep building as one designer. Shared visual foundations could reduce repeated decisions, but a nurse, a receptionist and a CFO could not be given the same workspace.",
    chapters: [
      {
        id: "review",
        title: "Keep generated content open to scrutiny.",
        lead: "AI can prepare a note. The interface still needs to make review explicit.",
        body: "In the consultation prototype, recording, generated documentation, prescription review and visit completion are separate steps. An individual SOAP field can expose the transcript evidence behind it. Proposed medicines remain distinguishable from the items the doctor has reviewed.",
        consequence:
          "The important boundary is between “generated” and “accepted.” In the reviewed example, visit completion remained unavailable until the proposed medicines were resolved.",
        tradeoff:
          "Evidence and review controls add interaction cost. Field-level disclosure keeps the note readable while letting a doctor inspect a specific statement when needed.",
        demo: "review",
        caption:
          "Abstracted interaction, rebuilt for this portfolio with synthetic text. It illustrates evidence disclosure, not a clinical recommendation.",
      },
      {
        id: "handoff",
        title: "Make the next owner of a decision visible.",
        lead: "Recording an assessment and authorising treatment are different responsibilities.",
        body: "In the flagged dialysis flow, the nurse’s action changes from starting treatment to requesting doctor review. The doctor can review the assessment and choose how to proceed. An explicit authorisation step comes before the live treatment state.",
        consequence:
          "A waiting state needs to say more than “pending.” It needs to explain what is waiting and which role can move it forward.",
        tradeoff:
          "A review gate adds a pause. Its usefulness depends on making the queue, responsible role and next action visible. Clinical rules require domain review; the interaction itself does not establish clinical safety.",
        demo: "handoff",
        caption:
          "A simplified role-and-state diagram based on the reviewed prototype. This interaction steps through states; it does not approve an actual treatment.",
      },
      {
        id: "system",
        title: "Put the design system into the way I build.",
        lead: "Consistency needs to survive the next prompt, not just the next screen.",
        body: "I built a design system and used it with Codex. The inspected repository separates primitive tokens, semantic roles and shared components. Its instructions direct the coding workflow toward established variables, components and explicit variants rather than screen-specific styling.",
        consequence:
          "The same foundation supports different information priorities. The reviewed product has phone-style clinical workspaces and desktop operational workbenches; consistency does not require identical layouts.",
        tradeoff:
          "Reusable components reduce repeated choices, but a shared pattern can become too restrictive. Exceptions need deliberate review, and the existence of tokens alone does not prove every screen follows them.",
        demo: "system",
        caption:
          "Conceptual implementation chain. This shows the system’s layers, not private source code or an audit of every component.",
      },
      {
        id: "playground",
        title: "Make variants something I can actually try.",
        lead: "I design directly in code. The playground gives exploration a place to happen.",
        body: "The playground includes variant selection, an adjustable preview width and comments scoped to variants. It gives me a way to compare working interfaces alongside the design system instead of stopping at a still image.",
        consequence:
          "Codex helps turn an idea into an interactive interface. My responsibility is the choice: what to keep, what to change, and whether the result behaves coherently across states and sizes.",
        tradeoff:
          "A convincing generated screen can still hide a weak workflow. A useful comparison needs a real task and a stated criterion, not just several visual options.",
        caption:
          "A real variant comparison and its selection rationale still need to be recovered before they can be presented as evidence.",
      },
    ],
    outcome:
      "The current work includes eight role-based modules, a documented design system, shared components and a variant playground. The reviewed frontend demonstrates consultation review, flagged dialysis authorisation and selected local operational handoffs.",
    limit:
      "This phase covers interface design and interactive frontend flows. Live data integration, cross-device handoffs and clinical validation remain outside the evidence presented here. User and business outcomes have not yet been measured.",
    measures: [
      [
        "AI review",
        "Can a doctor locate evidence and correct an intentionally seeded error before completing the task?",
      ],
      [
        "Handoff clarity",
        "Can each role identify the current state, responsible person and next action without explanation?",
      ],
      [
        "System reuse",
        "Can a new screen reuse existing patterns, and what exceptions or rework does review uncover?",
      ],
    ],
    reflection:
      "The next improvement to my process is recording decisions as I make them. The code preserves behaviour; it does not always preserve why one option won. I want each exploration to leave a short record of the constraint, alternatives, choice and what changed after review.",
    source:
      "Representative frontend walkthrough and targeted source review, 5 October 2026; project scope and working method supplied by me.",
  },
  sap: {
    name: "Aceteroid",
    subtitle: "SAP migration / Enterprise AI",
    title: "Make a complex migration\na readable decision.",
    intro:
      "Product design for a platform supporting SAP ECC to S/4HANA migration. The challenge: connect a leadership view of risk and effort to the technical work behind it.",
    role: "Product designer",
    scope: "Decision architecture, dashboards, product communication",
    stage: "Selected design work; release status to confirm",
    period: "Earlier enterprise project",
    takeaway:
      "Enterprise clarity comes from deciding what each person needs to understand—not from compressing every technical detail into one dashboard.",
    problem: "Different people need different depths of the same answer.",
    context:
      "A migration involves technical dependencies, architectural risk, planning and execution. Leadership needs a decision-level overview. Architects and delivery teams need enough detail to understand dependencies and plan work. The information architecture has to connect those levels.",
    constraint:
      "The story uses an existing public portfolio image. Private product flows and internal implementation details are not included.",
    image: "/work/aceteroid.png",
    alt: "Archived Aceteroid executive dashboard showing migration planning summaries and navigation.",
    chapters: [
      {
        id: "layers",
        title: "Organise around decisions, then depth.",
        lead: "The overview should be a starting point for investigation.",
        body: "The archived design describes five connected areas: Executive Overview, Risk & Strategy, Dependency Intelligence, Wave Planning and Migration BOM. These give different stakeholders an appropriate level of detail within the same migration model.",
        consequence:
          "The question changes with each layer: what is the exposure, where does it come from, and how should work be planned?",
        tradeoff:
          "Layered views require navigation and careful continuity. A single dense screen gives immediate breadth, but asks every stakeholder to interpret information intended for other roles.",
        demo: "layers",
        caption:
          "An abstracted reading map of the documented information architecture. It is not an interactive replica of the original product.",
      },
      {
        id: "planning",
        title: "Keep planning distinct from certainty.",
        lead: "A planning view should help make assumptions discussable.",
        body: "The earlier case material describes effort-baseline planning and simulation to support budget and capacity conversations. The design question is how to make an estimate useful while preserving its relationship to the technical evidence.",
        consequence:
          "Risk, dependency and planning views belong in the same decision chain. A summary becomes useful when the person reading it can understand what supports it.",
        tradeoff:
          "An estimate is easier to scan as one number, but that can hide uncertainty. The current case material does not establish forecast accuracy or measured planning improvements.",
      },
      {
        id: "communication",
        title: "Carry the product’s logic into its explanation.",
        lead: "The external story needs to make the platform intelligible too.",
        body: "Alongside the product interface, the earlier work includes identity and a landing page. The public product narrative introduces the migration process in phases and uses product imagery to ground a technically complex proposition.",
        consequence:
          "The communication work belongs after the core product story: show the decision model before describing the visual identity.",
        tradeoff:
          "Simplifying the story can hide necessary detail. The public-facing work needs enough specificity to explain the platform without exposing restricted internal flows.",
      },
    ],
    outcome:
      "The available material shows a decision-layered dashboard architecture and a visual language carried into product communication. It establishes designed scope, not a measured reduction in migration effort or risk.",
    limit:
      "This story is reconstructed from the archived portfolio. Detailed personal rationale, collaborators, rejected explorations and release status need confirmation. Demo dashboard figures are illustrative, not results from my design work.",
    measures: [
      [
        "Decision clarity",
        "Can each stakeholder explain the migration concern and identify where to investigate it?",
      ],
      [
        "Planning comprehension",
        "Can someone distinguish an assumption or estimate from a confirmed finding?",
      ],
      [
        "Navigation",
        "Can an executive summary be traced to the relevant risk, dependency and planning detail?",
      ],
    ],
    reflection:
      "The next evidence to recover is one consequential dashboard exploration: what I considered, what I chose, and the feedback that changed it. That would make this story about my judgement as well as the final structure.",
    source:
      "Archived public Aceteroid portfolio material. Unverified impact language and titles from the old portfolio have not been carried over.",
  },
  learning: {
    name: "Airtribe",
    subtitle: "Program Page Studio / Internal tools",
    title: "Give editors freedom.\nGive pages a structure.",
    intro:
      "A structured editor for program pages. Marketing and program teams can change the content while templates preserve the layout and visual system.",
    role: "Product designer",
    scope: "Page architecture, editor, review flow, design system",
    stage: "Design case; deployment and results to confirm",
    period: "Earlier learning-product project",
    takeaway:
      "The design starts with the page the editor needs to produce. Its repeatable sections become the structure of the tool.",
    problem: "A simple content edit should not become a layout decision.",
    context:
      "Program pages contain curriculum, mentor details, pricing, FAQs and cohort information. These are recurring content changes. The documented brief asks how non-designers can make those changes while preserving a consistent page structure.",
    constraint:
      "The earlier case describes internal editors and a separate reviewer. Authentication is outside the designed scope. Its turnaround figures are expected outcomes, not verified measurements in this version.",
    image: "/work/airtribe.png",
    alt: "Archived Airtribe Program Page Studio interface with content sections alongside a program-page preview.",
    chapters: [
      {
        id: "structure",
        title: "Start with the output, then invert it.",
        lead: "The page itself tells the editor what needs to exist.",
        body: "The earlier process material describes deconstructing an existing program page into fixed structure and variable content. Hero messaging, overview, curriculum, mentors and the remaining sections then map to structured editing modules.",
        consequence:
          "Each field has a purpose in the final page. A new page can begin from a template instead of an empty canvas.",
        tradeoff:
          "This approach fits recurring program pages well. A genuinely different page type still needs a new template rather than another arbitrary field.",
        demo: "structure",
        caption:
          "Illustrative mapping from page sections to editor inputs, reconstructed from the existing process document.",
      },
      {
        id: "guardrails",
        title: "Let people edit content, not the design system.",
        lead: "The alternative was a freeform canvas. I chose constrained sections.",
        body: "Editors work with typed fields and defined content structures. Layout, typography and spacing stay at the template level. Character limits and predefined variants create boundaries around what an editor can change.",
        consequence:
          "Visual consistency becomes part of the tool’s structure rather than something every editor has to remember.",
        tradeoff:
          "Flexibility is deliberately limited. An unusual content requirement can still need design involvement; the goal is to support recurring work, not every possible page.",
      },
      {
        id: "preview",
        title: "Keep the result beside the edit.",
        lead: "A persistent preview reduces the need to imagine the finished page.",
        body: "The designed editor places section controls beside a live preview. An editor can inspect how content fits while changing it. Responsive preview modes let the same output be considered at different widths.",
        consequence:
          "The input and its consequence remain visible together. On narrower devices, the layout needs an explicit way to switch between editing and preview.",
        tradeoff:
          "The split view takes space. A tablet toggle is preferable to shrinking both panels until neither remains useful.",
        demo: "editor",
        caption:
          "Portfolio reconstruction with synthetic content. The narrow-preview control demonstrates the layout principle, not an original shipped component.",
      },
      {
        id: "review",
        title: "Separate “ready for review” from “live.”",
        lead: "The primary action is Submit for Review, not direct Publish.",
        body: "Draft, In Review and Live are the shared states across the dashboard and editor. In the documented flow, submission locks editing until a reviewer approves the page or requests changes.",
        consequence:
          "The interface communicates both page state and publication authority. The reviewer can approve content without becoming an editor.",
        tradeoff:
          "Review introduces another dependency: reviewer availability. Status alone also cannot explain what changed; a version comparison is an identified next improvement.",
      },
    ],
    outcome:
      "The design defines a template-based editor, persistent preview and a reviewer-led publication flow. It gives routine content operations a coherent structure without turning editors into layout designers.",
    limit:
      "The archived document labels the tool shipped, but also presents timing figures as expected impact. Deployment, adoption and turnaround improvements have not been independently confirmed here, so this version makes no numeric impact claims.",
    measures: [
      [
        "Self-service",
        "Can an editor change a cohort date and submit the page without design or engineering help?",
      ],
      [
        "Content quality",
        "How often do editors encounter overflow, invalid inputs or template exceptions?",
      ],
      [
        "Review",
        "Where do pages wait, and can reviewers identify what changed before approving?",
      ],
    ],
    reflection:
      "The strongest next step is a clear version comparison for reviewers. A preview shows what a page looks like; a diff would explain what someone is being asked to approve.",
    source:
      "Existing Airtribe Program Page Studio process document and public portfolio imagery. Publication and impact claims remain to confirm.",
  },
};
