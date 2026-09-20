import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight, Bot, BookOpen, Check, ChevronDown, CircleHelp, Filter,
  Home, Menu, Search, Shield, Sparkles, Trophy, Users, X, Zap
} from "lucide-react";
import "./styles.css";

type Position = "QB" | "RB" | "WR" | "TE" | "K" | "DEF";

type Player = {
  id: number;
  name: string;
  position: Position;
  team: string;
  bye: number;
  projected: number;
  tier: string;
};

type Roster = Record<string, Player | null>;

const players: Player[] = [
  {id:1,name:"Jordan Reed",position:"QB",team:"Lions",bye:8,projected:328,tier:"1"},
  {id:2,name:"Marcus Allen",position:"QB",team:"Sharks",bye:11,projected:309,tier:"1"},
  {id:3,name:"Tyler Brooks",position:"QB",team:"Wolves",bye:7,projected:296,tier:"2"},
  {id:4,name:"Ethan Cole",position:"QB",team:"Hawks",bye:10,projected:282,tier:"2"},
  {id:5,name:"Derrick Stone",position:"RB",team:"Tigers",bye:6,projected:286,tier:"1"},
  {id:6,name:"Cam Walker",position:"RB",team:"Knights",bye:9,projected:274,tier:"1"},
  {id:7,name:"Jalen Brooks",position:"RB",team:"Bulls",bye:12,projected:258,tier:"2"},
  {id:8,name:"Noah Grant",position:"RB",team:"Falcons",bye:5,projected:247,tier:"2"},
  {id:9,name:"Chris Morgan",position:"RB",team:"Rockets",bye:8,projected:236,tier:"3"},
  {id:10,name:"Andre Lewis",position:"RB",team:"Wolves",bye:10,projected:225,tier:"3"},
  {id:11,name:"Jay Carter",position:"WR",team:"Lions",bye:8,projected:301,tier:"1"},
  {id:12,name:"Malik Johnson",position:"WR",team:"Tigers",bye:6,projected:289,tier:"1"},
  {id:13,name:"Ryan Cooper",position:"WR",team:"Hawks",bye:10,projected:272,tier:"2"},
  {id:14,name:"Darius King",position:"WR",team:"Knights",bye:9,projected:260,tier:"2"},
  {id:15,name:"Owen Price",position:"WR",team:"Bulls",bye:12,projected:248,tier:"3"},
  {id:16,name:"Miles Turner",position:"WR",team:"Falcons",bye:5,projected:238,tier:"3"},
  {id:17,name:"Carter Bell",position:"TE",team:"Rockets",bye:8,projected:221,tier:"1"},
  {id:18,name:"Logan Davis",position:"TE",team:"Sharks",bye:11,projected:204,tier:"2"},
  {id:19,name:"Eli Parker",position:"TE",team:"Wolves",bye:7,projected:190,tier:"2"},
  {id:20,name:"Mason Hill",position:"TE",team:"Hawks",bye:10,projected:176,tier:"3"},
  {id:21,name:"Alex Young",position:"K",team:"Lions",bye:8,projected:142,tier:"1"},
  {id:22,name:"Ryan Fox",position:"K",team:"Tigers",bye:6,projected:136,tier:"2"},
  {id:23,name:"Denver Defense",position:"DEF",team:"Knights",bye:9,projected:131,tier:"1"},
  {id:24,name:"Metro Defense",position:"DEF",team:"Bulls",bye:12,projected:125,tier:"2"}
];

const emptyRoster = (): Roster => ({
  QB:null,RB1:null,RB2:null,WR1:null,WR2:null,TE:null,FLEX:null,K:null,DEF:null,Bench1:null,Bench2:null
});

const positionLabel = (slot:string) => slot.startsWith("RB") ? "RB" : slot.startsWith("WR") ? "WR" : slot.startsWith("Bench") ? "BENCH" : slot;

function App() {
  const [page,setPage] = useState("home");
  const [mobile,setMobile] = useState(false);
  const [teams,setTeams] = useState(10);
  const [draftPos,setDraftPos] = useState(7);
  const [scoring,setScoring] = useState<"PPR"|"Standard">("PPR");
  const [draftStarted,setDraftStarted] = useState(false);
  const [drafted,setDrafted] = useState<number[]>([]);
  const [roster,setRoster] = useState<Roster>(emptyRoster());
  const [pick,setPick] = useState(1);
  const [query,setQuery] = useState("");
  const [filter,setFilter] = useState<"ALL"|Position>("ALL");
  const [assistantOpen,setAssistantOpen] = useState(true);
  const [why,setWhy] = useState<number|null>(null);

  const available = useMemo(() => players.filter(p =>
    !drafted.includes(p.id) &&
    (filter==="ALL" || p.position===filter) &&
    p.name.toLowerCase().includes(query.toLowerCase())
  ), [drafted,filter,query]);

  const rosterPlayers = Object.values(roster).filter(Boolean) as Player[];
  const counts = (pos:Position) => rosterPlayers.filter(p=>p.position===pos).length;
  const needSlots = ["QB","RB","WR","TE","K","DEF"].filter(p => counts(p as Position)===0);

  function startDraft() {
    setDrafted([]); setRoster(emptyRoster()); setPick(1); setDraftStarted(true); setPage("draft"); setQuery(""); setFilter("ALL");
  }

  function draftPlayer(player:Player) {
    if (drafted.includes(player.id)) return;
    const next = {...roster};
    const order = player.position==="RB" ? ["RB1","RB2","FLEX","Bench1","Bench2"]
      : player.position==="WR" ? ["WR1","WR2","FLEX","Bench1","Bench2"]
      : player.position==="QB" ? ["QB","Bench1","Bench2"]
      : player.position==="TE" ? ["TE","FLEX","Bench1","Bench2"]
      : player.position==="K" ? ["K","Bench1","Bench2"]
      : ["DEF","Bench1","Bench2"];
    const slot = order.find(s => !next[s]);
    if (!slot) return;
    next[slot] = player;
    setRoster(next);
    setDrafted([...drafted, player.id]);
    setPick(pick+1);
  }

  const recommendation = useMemo(() => {
    const pool = players.filter(p=>!drafted.includes(p.id));
    const needs = needSlots;
    const candidates = pool.filter(p => needs.includes(p.position) || p.position==="RB" || p.position==="WR");
    return (candidates.length ? candidates : pool).sort((a,b)=>b.projected-a.projected).slice(0,3);
  }, [drafted,roster]);

  const assistantText = needSlots.length
    ? `You still have ${needSlots.join(", ")} open. Consider how the available players fit your roster before making your pick.`
    : "Your starting lineup is taking shape. At this point, consider depth and FLEX flexibility.";

  return (
    <div className="app">
      <header className="nav">
        <button className="brand" onClick={()=>setPage("home")}><span className="logo">🏈</span><span>Fantasy Draft <b>HQ</b></span></button>
        <button className="mobile-menu" onClick={()=>setMobile(!mobile)}>{mobile?<X/>:<Menu/>}</button>
        <nav className={mobile?"navlinks open":"navlinks"}>
          {[["home","Home",Home],["guide","Draft Guide",BookOpen],["rankings","Player Rankings",Trophy],["draft","Mock Draft",Zap],["assistant","AI Assistant",Bot]].map(([id,label,Icon]) =>
            <button key={id as string} className={page===id?"active":""} onClick={()=>{setPage(id as string);setMobile(false)}}><Icon size={16}/>{label as string}</button>
          )}
          <button className="start-small" onClick={startDraft}>Start Mock Draft <ArrowRight size={16}/></button>
        </nav>
      </header>

      {page==="home" && <HomePage startDraft={startDraft} setPage={setPage}/>}
      {page==="guide" && <GuidePage/>}
      {page==="rankings" && <RankingsPage/>}
      {page==="assistant" && <AssistantPage/>}
      {page==="draft" && (
        <DraftPage
          draftStarted={draftStarted} startDraft={startDraft} teams={teams} setTeams={setTeams}
          draftPos={draftPos} setDraftPos={setDraftPos} scoring={scoring} setScoring={setScoring}
          available={available} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter}
          draftPlayer={draftPlayer} roster={roster} pick={pick} assistantOpen={assistantOpen}
          setAssistantOpen={setAssistantOpen} recommendations={recommendation} assistantText={assistantText}
          why={why} setWhy={setWhy} reset={()=>{setDraftStarted(false);setDrafted([]);setRoster(emptyRoster());setPick(1)}}
        />
      )}

      <footer><span>Fantasy Draft HQ</span><span>Educational student project • Demo player data</span></footer>
    </div>
  );
}

function HomePage({startDraft,setPage}:{startDraft:()=>void,setPage:(p:string)=>void}) {
  return <main>
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><Sparkles size={15}/> POWERED BY DRAFTIQ</div>
        <h1>Your smarter way to<br/><span>prepare for fantasy football.</span></h1>
        <p>Learn the game, explore player data, and practice a complete draft with a real-time AI assistant that understands your roster.</p>
        <div className="hero-actions"><button className="primary" onClick={startDraft}>Start Mock Draft <ArrowRight/></button><button className="secondary" onClick={()=>setPage("guide")}>Learn Fantasy Football</button></div>
        <div className="trust"><Check size={15}/> No account required <Check size={15}/> Demo data <Check size={15}/> Built for learning</div>
      </div>
      <div className="hero-card">
        <div className="field-lines"></div>
        <div className="draft-card">
          <div className="draft-top"><span>LIVE DRAFT</span><span className="live-dot">●</span></div>
          <div className="pick-number">07</div>
          <div className="pick-label">YOUR NEXT PICK</div>
          <div className="ai-mini"><Bot size={18}/><div><b>DraftIQ</b><small>Analyzing your roster…</small></div></div>
          <div className="mini-options"><div>WR <b>Jay Carter</b></div><div>TE <b>Carter Bell</b></div><div>RB <b>Chris Morgan</b></div></div>
        </div>
      </div>
    </section>
    <section className="section">
      <div className="section-heading"><div><span className="eyebrow">THE TOOLKIT</span><h2>Everything you need before draft day.</h2></div></div>
      <div className="feature-grid">
        <Feature icon={<BookOpen/>} title="Draft Guide" text="Learn scoring, positions, roster construction, and the basics." onClick={()=>setPage("guide")}/>
        <Feature icon={<Trophy/>} title="Player Rankings" text="Explore searchable demo rankings and projected points." onClick={()=>setPage("rankings")}/>
        <Feature icon={<Zap/>} title="Mock Draft" text="Practice a snake draft against simulated teams." onClick={startDraft}/>
        <Feature icon={<Bot/>} title="DraftIQ" text="Get live, situation-aware draft explanations." onClick={()=>setPage("assistant")}/>
      </div>
    </section>
  </main>
}

function Feature({icon,title,text,onClick}:{icon:React.ReactNode,title:string,text:string,onClick:()=>void}) {
  return <button className="feature" onClick={onClick}><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p><ArrowRight/></button>
}

function GuidePage() {
  const sections = [
    ["What is fantasy football?","You build a roster from real players and score fantasy points based on their real-game statistics. You compete against other fantasy managers using the league's scoring rules."],
    ["How drafts work","Managers take turns selecting players. A snake draft reverses the pick order each round, so the last manager in one round picks first in the next."],
    ["Standard vs PPR","In Standard scoring, receptions do not add the same reception-based point used by PPR. In PPR (points per reception), each reception adds a point under the common format. League rules can vary."],
    ["Position basics","QB: quarterback. RB: running back. WR: wide receiver. TE: tight end. FLEX: a lineup slot that can accept eligible skill positions. K: kicker. DEF: team defense."],
    ["Roster construction","Think about both starters and depth. Keep track of which positions you still need and which positions have enough options available."],
    ["Common beginner mistakes","Ignoring roster needs, forgetting your scoring format, drafting only one position for too long, and assuming projections are guarantees are common pitfalls."]
  ];
  return <Page title="Draft Guide" subtitle="A beginner-friendly crash course in fantasy football.">
    <div className="guide-grid">{sections.map(([t,d],i)=><article className="guide-card" key={t}><span>0{i+1}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
  </Page>
}

function RankingsPage() {
  const [q,setQ]=useState(""); const [f,setF]=useState("ALL");
  const list=players.filter(p=>(f==="ALL"||p.position===f)&&p.name.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>b.projected-a.projected);
  return <Page title="Player Rankings" subtitle="Search and filter the demo player pool.">
    <div className="notice">Demo Data — rankings and projections are examples for this student project.</div>
    <div className="toolbar"><div className="search"><Search size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search players..."/></div><select value={f} onChange={e=>setF(e.target.value)}><option value="ALL">All positions</option>{["QB","RB","WR","TE","K","DEF"].map(x=><option key={x}>{x}</option>)}</select></div>
    <div className="table"><div className="thead"><span>PLAYER</span><span>POS</span><span>TEAM</span><span>BYE</span><span>PROJ.</span><span>TIER</span></div>{list.map((p,i)=><div className="tr" key={p.id}><span><b>#{i+1}</b> {p.name}</span><span>{p.position}</span><span>{p.team}</span><span>{p.bye}</span><span>{p.projected}</span><span><em>Tier {p.tier}</em></span></div>)}</div>
  </Page>
}

function AssistantPage() {
  return <Page title="DraftIQ" subtitle="A real-time draft assistant built around your current roster.">
    <div className="assistant-landing"><div className="bot-large"><Bot size={54}/></div><h2>Meet your live draft coach.</h2><p>During a mock draft, DraftIQ reads your roster, scoring format, current pick, recent selections, and remaining player pool to explain the options you could consider.</p><div className="example-chat"><div className="chat-user">“I have two RBs and two WRs. What should I consider?”</div><div className="chat-ai"><Bot size={18}/><span>You could look at your open positions, compare the available players, and consider how much depth you want. DraftIQ will show several options rather than making the pick for you.</span></div></div></div>
  </Page>
}

function DraftPage(props:any) {
  if(!props.draftStarted) return <Page title="Mock Draft" subtitle="Set up a practice draft, then let DraftIQ analyze the live situation."><div className="setup"><div className="setup-card"><div className="setup-icon"><Zap/></div><h2>Build your draft room.</h2><p>Choose your settings, then practice against simulated teams.</p><label>Number of teams<select value={props.teams} onChange={e=>props.setTeams(+e.target.value)}><option>8</option><option>10</option><option>12</option></select></label><label>Your draft position<select value={props.draftPos} onChange={e=>props.setDraftPos(+e.target.value)}>{Array.from({length:props.teams},(_,i)=><option key={i+1}>{i+1}</option>)}</select></label><label>Scoring<select value={props.scoring} onChange={e=>props.setScoring(e.target.value)}><option>PPR</option><option>Standard</option></select></label><button className="primary wide" onClick={props.startDraft}>Start Draft <ArrowRight/></button></div></div></Page>

  const rosterSlots = Object.entries(props.roster) as [string,Player|null][];
  return <Page title={`Round ${Math.ceil(props.pick/props.teams)} • Pick ${((props.pick-1)%props.teams)+1}`} subtitle={`Overall pick ${props.pick} • ${props.scoring} • ${props.teams} teams`}>
    <div className="draft-layout">
      <section className="draft-main">
        <div className="draft-status"><div><span className="live-dot">●</span> LIVE MOCK DRAFT</div><span>Demo player data</span></div>
        <div className="recent"><b>Draft board</b><span>Pick {props.pick}</span></div>
        <div className="player-grid">{props.available.map((p:Player)=><div className="player-card" key={p.id}><div className="player-head"><span className={"pos "+p.position}>{p.position}</span><span className="proj">{p.projected} proj.</span></div><h3>{p.name}</h3><p>{p.team} • Bye {p.bye} • Tier {p.tier}</p><div className="player-actions"><button className="secondary tiny" onClick={()=>props.setWhy(p.id)}><CircleHelp size={14}/> Why?</button><button className="primary tiny" onClick={()=>props.draftPlayer(p)}>Draft</button></div>{props.why===p.id&&<div className="why">This is a demo explanation based on position, projected points, and your current roster needs.<button onClick={()=>props.setWhy(null)}>×</button></div>}</div>)}</div>
      </section>
      <aside className={props.assistantOpen?"draft-sidebar":"draft-sidebar collapsed"}>
        <button className="assistant-title" onClick={()=>props.setAssistantOpen(!props.assistantOpen)}><Bot/><div><b>DraftIQ</b><small>Live Draft Assistant</small></div><ChevronDown className={props.assistantOpen?"":"rotate"}/></button>
        {props.assistantOpen&&<div className="assistant-body"><div className="analyzing"><span></span>Analyzing your draft situation</div><p>{props.assistantText}</p><h4>OPTIONS TO CONSIDER</h4>{props.recommendations.map((p:Player)=><div className="rec" key={p.id}><div><b>{p.name}</b><small>{p.position} • {p.team} • {p.projected} demo pts</small></div><button onClick={()=>props.draftPlayer(p)}>Draft</button></div>)}<div className="roster-box"><h4>YOUR ROSTER</h4>{rosterSlots.map(([slot,p])=><div className="roster-row" key={slot}><span>{positionLabel(slot)}</span><b>{p?.name||"Open"}</b></div>)}</div><div className="control-note">DraftIQ explains options; you always make the final pick.</div></div>}
      </aside>
    </div>
  </Page>
}

function Page({title,subtitle,children}:{title:string,subtitle:string,children:React.ReactNode}) {
  return <main className="page"><div className="page-heading"><span className="eyebrow">FANTASY DRAFT HQ</span><h1>{title}</h1><p>{subtitle}</p></div>{children}</main>
}

createRoot(document.getElementById("root")!).render(<App/>);
