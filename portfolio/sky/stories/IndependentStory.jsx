import CaseIndex from "../CaseIndex";
import SkyButton from "../SkyButton";
import React, { useEffect } from "react";
import { ArrowRight, ArrowUpRight } from "../SkyIcons";
import { stories, storyOrder } from "./content";
import { asset, EvidenceSequence, InkStudy, RoomStudy, SpatialStudy, StoryVideo } from "./StoryElements";
import "./stories.css";

function Intro({ title, children }) {
  return <div className="story-section-intro"><h2>{title}</h2><div>{children}</div></div>;
}

function DiaryDetails() {
  return <>
    <section id="interaction" className="story-section">
      <Intro title={<>The magic was disappearing.<br />So was the answer.</>}><p>Early feedback said replies vanished too quickly to read. Adding another second would still decide the reading pace for everyone. I asked for an option that lets the visitor choose when the ink disappears.</p></Intro>
      <InkStudy />
      <div className="story-paired-notes"><div><h3>Keep the ritual.</h3><p>Auto fade preserves the disappearing-ink exchange. The response becomes part of a fleeting moment.</p></div><div><h3>Give the reader time.</h3><p>With Auto fade off, the answer remains until the visitor touches the page. I chose plain control labels and placed the option beside Sound.</p></div></div>
    </section>
    <section id="craft" className="story-section">
      <Intro title={<>A believable scene is made<br />of small agreements.</>}><p>The candle, feather, ink, and paper need to behave as if they occupy the same place. I used screenshots to direct corrections when those relationships felt wrong.</p></Intro>
      <figure className="story-wide-figure"><img src={asset('diary-shadow')} alt="Original annotated diary screenshot: yellow lines indicate light from the candle, with a blue arrow requesting gradual shadow blur." loading="lazy" /><figcaption>My annotated direction, 9 October: candle position, projected quill shadow, and gradual blur.</figcaption></figure>
      <div className="story-craft-notes"><div><h3>Light has a source.</h3><p>The annotation makes the intended candle-to-quill relationship explicit. It turns “this feels flat” into a direction that can be evaluated in the next prototype.</p></div><div><h3>Ink must remain readable.</h3><p>On mobile, returned writing looked weaker than input. I asked to investigate rendering, retain a thinner outline, and remove a visible box around held replies.</p></div><div><h3>Controls need a place.</h3><p>Auto fade sits beside Sound. Shorter labels and an icon-only close control on mobile leave more space for the scene.</p></div></div>
    </section>
  </>;
}

function CourageDetails() {
  return <>
    <section id="interaction" className="story-section">
      <Intro title={<>A room that answers<br />before the computer does.</>}><p>A lamp changes the light. A power switch changes the screen. The room gives small actions a response, building a sense that this is somewhere you can spend a little time.</p></Intro>
      <RoomStudy />
    </section>
    <section id="craft" className="story-section">
      <Intro title={<>The words were only<br />part of the voice.</>}><p>On some phones, speech finished before the letters. On others, the next sentence started too early. I kept testing and calling out the mismatch: the character had to feel like one speaker.</p></Intro>
      <div className="story-timing"><div><span>Voice</span><div className="story-timing-track"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></div><div><span>Letters</span><p>O H , &nbsp; G O O D . &nbsp; Y O U &nbsp; A G A I N .</p></div><p className="story-caption">Retrospective explanation: speech, letters, and the next sentence need a shared rhythm.</p></div>
      <div className="story-paired-notes"><div><h3>Refine the cadence.</h3><p>I pushed for letter-level reveal when word-by-word output felt abrupt. The implementation gained a separate mobile timing path and sentence queue.</p></div><div><h3>Leave room for the answer.</h3><p>I reduced the background music and kept a separate toggle. Device-specific speech timing remains something to test more widely, not a solved claim for every phone.</p></div></div>
    </section>
  </>;
}

function TesseractDetails() {
  return <section id="craft" className="story-section">
    <Intro title={<>A different view.<br />The same object.</>}><p>In a later local Axis Lab experiment, the first implementation introduced a separate interface and loading path. I asked to keep the original UI and reuse the video already in the scene.</p></Intro>
    <EvidenceSequence label="Compare Axis Lab workspaces" items={[
      { image: 'axis-rejected', label: 'Separate workspace', title: 'The switch interrupted continuity.', body: 'The first Axis Lab had its own layout and rendering path. I rejected the change in UI and the need to load the same video again.' },
      { image: 'axis-shared', label: 'Shared workspace', title: 'Change the tools, keep the video.', body: 'The corrected local experiment shares a canvas, video, and volume. Time, X, Y, and free slicing build on the object already loaded.' },
    ]} />
    <p className="story-caption">New captures of preserved source versions. Axis Lab is a local experiment, separate from the deployed Explore experience.</p>
    <div className="story-paired-notes"><div><h3>The first encounter mattered, too.</h3><p>A shared Reddit comment reported a very long demo load. The fixed demo now uses prepared frames and smaller playback media. There is no measured before/after speed claim.</p></div><div><h3>Cancel should really mean cancel.</h3><p>I flagged a disabled close control during loading, then a volume left behind after cancellation. The correction stops preparation and clears the scene back to its starting state.</p></div></div>
  </section>;
}

function Signals({ id }) {
  return <section id="signals" className="story-section story-signals">
    <Intro title={id === 'courage' ? <>People recognised<br />someone they remembered.</> : id === 'diary' ? <>People did more<br />than open the book.</> : <>People brought<br />their own moments.</>}>
      <p>{id === 'courage' ? 'The most specific reactions described the computer’s behaviour: its sigh, its attitude, and the memories it brought back. Those comments helped me see what some visitors were connecting with.' : id === 'diary' ? 'The early snapshot shows visitors writing into the experience. It also brought feedback about reading pace—a useful reminder that atmosphere and control have to work together.' : 'Completed local-video loads show that visitors used the core interaction beyond the supplied demo. The counts include repeat loads and testing; they are not distinct people or files.'}</p>
    </Intro>
    {id === 'courage' && <blockquote className="story-quote"><p>“Finally an AI that sighs before answering. Peak nostalgia.”</p><cite>Unsolicited Reddit response · supplied screenshot</cite></blockquote>}
    <dl className="story-metrics">
      {(id === 'diary' ? [['3,831', 'Words written'], ['401', 'Recorded visits'], ['326', 'Recorded sessions']] : id === 'courage' ? [['439', 'Questions'], ['225', 'Recorded visits'], ['200', 'Loaded sessions']] : [['105', 'Local-video loads'], ['81', 'Demo loads'], ['390', 'Recorded visits']]).map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
    <details className="story-evidence-note"><summary>What these numbers tell us <span aria-hidden="true">+</span></summary><p>{id === 'diary' ? 'Dashboard snapshot supplied on 12 October 2026, rolling 90-day window. Words written counts visitor writing; sessions and visits have different definitions. Creator/testing activity is included. These totals do not establish retention or satisfaction.' : id === 'courage' ? 'User-supplied 12 October 2026 dashboard screenshot: 248 sessions recorded, 200 loaded. Displayed totals reflect the loaded view, not necessarily all recorded activity. Questions are interactions, not distinct people. Creator/testing activity may be included. Reactions are self-selected comments, not a formal usability study.' : 'Cumulative snapshot retrieved 12 October 2026; recorded daily activity spans 20–25 September UTC. Local-video loads are completed loads of files selected in the browser, not files uploaded to a server. Repeat loads and creator/test activity are included. Visible time and traffic do not establish usefulness or satisfaction.'}</p></details>
  </section>;
}

export default function IndependentStory({ id }) {
  const story = stories[id];
  const nextId = storyOrder[(storyOrder.indexOf(id) + 1) % storyOrder.length];
  const next = stories[nextId];
  useEffect(() => { const old = document.title; document.title = `${story.name} — Thoufik Abdullah`; return () => { document.title = old; }; }, [story]);
  return <main id="sky-content" className={`sky-case independent-story story-${id}`}>
    <CaseIndex sections={story.index} />
    <article className="story-body">
    <section className="story-hero" aria-labelledby="story-title">
      <h1 id="story-title">{story.title}</h1><p>{story.premise}</p>
      <div className="story-hero-meta"><span>{story.name}</span><span>{story.period}</span></div>
    </section>
    <div className="story-world">
      <div className="story-container">
        <StoryVideo id={id} name={story.name} />
        <div className="story-facts"><div><span>My role</span><p>{story.role}</p></div><div><span>How I worked</span><p>{story.process}</p></div><div><span>Project</span><p>{id === 'tesseract' ? 'Independent browser experiment' : 'Independent, unofficial fan project'}</p></div></div>
        <section id="premise" className="story-section story-premise"><p className="story-opening">{story.opening}</p><Intro title={story.thesis}><p>{story.thesisBody}</p></Intro></section>
        {id === 'tesseract' && <section id="interaction" className="story-section"><Intro title={<>Pull time apart.<br />Keep a moment in focus.</>}><p>A small model of the central idea. Separate the frames, choose a moment, and change the angle. The selected image stays clear while the rest gives it temporal context.</p></Intro><SpatialStudy /></section>}
        <section id="evolution" className="story-section"><Intro title={story.evolutionTitle}><p>{story.evolutionBody}</p></Intro><EvidenceSequence items={story.versions} label={`${story.name} documented versions`} /></section>
        {id === 'diary' ? <DiaryDetails /> : id === 'courage' ? <CourageDetails /> : <TesseractDetails />}
        <Signals id={id} />
        <section className="story-section story-reflection"><h2>{story.reflection}</h2><p>{story.reflectionBody}</p><SkyButton className="story-action" href={story.live} target="_blank" rel="noreferrer">Try {story.name}<ArrowUpRight size={18} /></SkyButton><p className="story-caption">Designed and refined through working prototypes. Codex supported implementation; I directed the experience and evaluated the results.</p></section>
      </div>
    </div>
    <nav className="story-next" aria-label="Next independent project"><p>One more world to explore</p><a href={`/sky/?project=${nextId}`}><span>{next.name}<small>{next.premise}</small></span><ArrowRight size={28} /></a><a className="story-all-work" href="/sky/#independent-projects">Back to all work</a></nav>
    </article>
  </main>;
}
