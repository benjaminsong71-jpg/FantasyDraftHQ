import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Bot,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Filter,
  Home,
  Menu,
  Search,
  Shield,
  Sparkles,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import "./styles.css";

type Position = "QB" | "RB" | "WR" | "TE";

type Player = {
  id: number;
  rank: number;
  name: string;
  position: Position;
  team: string;
  bye: number;
  tier: number;
};

type Roster = {
  QB: Player | null;
  RB1: Player | null;
  RB2: Player | null;
  WR1: Player | null;
  WR2: Player | null;
  TE: Player | null;
  FLEX: Player | null;
};

type Message = {
  role: "user" | "assistant";
  text: string;
};

/*
  2026 PPR player pool.
  The first 24 overall ranks are based on the current FantasyPros
  2026 PPR consensus page checked September 2026.
*/
const players: Player[] = [
  { id: 1, rank: 1, name: "Ja'Marr Chase", position: "WR", team: "Bengals", bye: 6, tier: 1 },
  { id: 2, rank: 2, name: "Jahmyr Gibbs", position: "RB", team: "Lions", bye: 6, tier: 1 },
  { id: 3, rank: 3, name: "Puka Nacua", position: "WR", team: "Rams", bye: 11, tier: 1 },
  { id: 4, rank: 4, name: "Bijan Robinson", position: "RB", team: "Falcons", bye: 11, tier: 1 },
  { id: 5, rank: 5, name: "Amon-Ra St. Brown", position: "WR", team: "Lions", bye: 6, tier: 1 },
  { id: 6, rank: 6, name: "Jaxon Smith-Njigba", position: "WR", team: "Seahawks", bye: 11, tier: 1 },
  { id: 7, rank: 7, name: "Christian McCaffrey", position: "RB", team: "49ers", bye: 8, tier: 1 },
  { id: 8, rank: 8, name: "Justin Jefferson", position: "WR", team: "Vikings", bye: 6, tier: 1 },
  { id: 9, rank: 9, name: "CeeDee Lamb", position: "WR", team: "Cowboys", bye: 14, tier: 1 },
  { id: 10, rank: 10, name: "Jonathan Taylor", position: "RB", team: "Colts", bye: 13, tier: 1 },
  { id: 11, rank: 11, name: "A.J. Brown", position: "WR", team: "Patriots", bye: 11, tier: 2 },
  { id: 12, rank: 12, name: "Drake London", position: "WR", team: "Falcons", bye: 11, tier: 2 },
  { id: 13, rank: 13, name: "Nico Collins", position: "WR", team: "Texans", bye: 8, tier: 2 },
  { id: 14, rank: 14, name: "Chase Brown", position: "RB", team: "Bengals", bye: 6, tier: 2 },
  { id: 15, rank: 15, name: "James Cook", position: "RB", team: "Bills", bye: 7, tier: 2 },
  { id: 16, rank: 16, name: "Chris Olave", position: "WR", team: "Saints", bye: 7, tier: 2 },
  { id: 17, rank: 17, name: "Trey McBride", position: "TE", team: "Cardinals", bye: 8, tier: 2 },
  { id: 18, rank: 18, name: "George Pickens", position: "WR", team: "Cowboys", bye: 14, tier: 2 },
  { id: 19, rank: 19, name: "De'Von Achane", position: "RB", team: "Dolphins", bye: 6, tier: 2 },
  { id: 20, rank: 20, name: "Saquon Barkley", position: "RB", team: "Eagles", bye: 9, tier: 2 },
  { id: 21, rank: 21, name: "DeVonta Smith", position: "WR", team: "Eagles", bye: 9, tier: 2 },
  { id: 22, rank: 22, name: "Malik Nabers", position: "WR", team: "Giants", bye: 8, tier: 2 },
  { id: 23, rank: 23, name: "Kenneth Walker III", position: "RB", team: "Chiefs", bye: 5, tier: 2 },
  { id: 24, rank: 24, name: "Josh Allen", position: "QB", team: "Bills", bye: 7, tier: 2 },

  { id: 25, rank: 25, name: "Lamar Jackson", position: "QB", team: "Ravens", bye: 7, tier: 2 },
  { id: 26, rank: 26, name: "Drake Maye", position: "QB", team: "Patriots", bye: 11, tier: 2 },
  { id: 27, rank: 27, name: "Joe Burrow", position: "QB", team: "Bengals", bye: 6, tier: 2 },
  { id: 28, rank: 28, name: "Jalen Hurts", position: "QB", team: "Eagles", bye: 9, tier: 2 },
  { id: 29, rank: 29, name: "Jayden Daniels", position: "QB", team: "Commanders", bye: 12, tier: 2 },
  { id: 30, rank: 30, name: "Brock Bowers", position: "TE", team: "Raiders", bye: 13, tier: 2 },
  { id: 31, rank: 31, name: "Colston Loveland", position: "TE", team: "Bears", bye: 5, tier: 3 },
  { id: 32, rank: 32, name: "Tyler Warren", position: "TE", team: "Colts", bye: 13, tier: 3 },
  { id: 33, rank: 33, name: "Sam LaPorta", position: "TE", team: "Lions", bye: 6, tier: 3 },
  { id: 34, rank: 34, name: "George Kittle", position: "TE", team: "49ers", bye: 8, tier: 3 },
  { id: 35, rank: 35, name: "Travis Kelce", position: "TE", team: "Chiefs", bye: 5, tier: 3 },
  { id: 36, rank: 36, name: "Caleb Williams", position: "QB", team: "Bears", bye: 5, tier: 3 },
  { id: 37, rank: 37, name: "Justin Herbert", position: "QB", team: "Chargers", bye: 12, tier: 3 },
  { id: 38, rank: 38, name: "Trevor Lawrence", position: "QB", team: "Jaguars", bye: 8, tier: 3 },
  { id: 39, rank: 39, name: "Dak Prescott", position: "QB", team: "Cowboys", bye: 14, tier: 3 },
  { id: 40, rank: 40, name: "Brock Purdy", position: "QB", team: "49ers", bye: 8, tier: 3 },
];

const emptyRoster: Roster = {
  QB: null,
  RB1: null,
  RB2: null,
  WR1: null,
  WR2: null,
  TE: null,
  FLEX: null,
};

function Page({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="page">
      <div className="page-heading">
        <span className="eyebrow">FANTASY DRAFT HQ</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
    </main>
  );
}

function getRosterPlayers(roster: Roster) {
  return Object.values(roster).filter(Boolean) as Player[];
}

function getRosterNeeds(roster: Roster) {
  const needs: Position[] = [];

  if (!roster.QB) needs.push("QB");
  if (!roster.RB1 || !roster.RB2) needs.push("RB");
  if (!roster.WR1 || !roster.WR2) needs.push("WR");
  if (!roster.TE) needs.push("TE");

  return needs;
}

function assistantReply(
  question: string,
  roster: Roster,
  available: Player[],
  scoring: string
) {
  const q = question.toLowerCase().trim();
  const rosterPlayers = getRosterPlayers(roster);
  const needs = getRosterNeeds(roster);

  const mentionedPlayer = players.find((p) =>
    q.includes(p.name.toLowerCase())
  );

  if (mentionedPlayer) {
    const availablePlayer = available.some((p) => p.id === mentionedPlayer.id);

    if (!availablePlayer) {
      return `${mentionedPlayer.name} is already off the board in this draft. Tell me another player you are considering and I'll compare the available options.`;
    }

    const samePosition = available.filter(
      (p) => p.position === mentionedPlayer.position
    );

    return `${mentionedPlayer.name} is currently ranked #${mentionedPlayer.rank} overall at ${mentionedPlayer.position}. In ${scoring} scoring, I'd consider them in the context of your roster first. Your current needs are ${
      needs.length ? needs.join(", ") : "mostly filled"
    }. Other available ${mentionedPlayer.position}s near that range include ${samePosition
      .filter((p) => p.id !== mentionedPlayer.id)
      .slice(0, 3)
      .map((p) => `${p.name} (#${p.rank})`)
      .join(", ") || "none"}.`;
  }

  if (
    q.includes("who should i pick") ||
    q.includes("who do i take") ||
    q.includes("best pick") ||
    q.includes("next pick") ||
    q.includes("what should i draft")
  ) {
    const candidates = [...available]
      .sort((a, b) => a.rank - b.rank)
      .filter((p) => {
        if (p.position === "QB" && roster.QB) return false;
        if (p.position === "TE" && roster.TE) return false;

        if (
          p.position === "RB" &&
          roster.RB1 &&
          roster.RB2 &&
          roster.FLEX
        )
          return false;

        if (
          p.position === "WR" &&
          roster.WR1 &&
          roster.WR2 &&
          roster.FLEX
        )
          return false;

        return true;
      })
      .slice(0, 5);

    if (!candidates.length) {
      return "Your roster is getting full. I would compare the remaining players by position and bye week before making the next selection.";
    }

    return `Based on your current roster, the top available candidates are: ${candidates
      .map((p) => `${p.name} (#${p.rank}, ${p.position})`)
      .join(", ")}. Your biggest roster needs are ${
      needs.length ? needs.join(", ") : "flexibility/depth"
    }. I would use those needs alongside overall value rather than blindly following the overall ranking.`;
  }

  if (q.includes("my team") || q.includes("roster") || q.includes("need")) {
    return `Your current roster has ${rosterPlayers.length} player${
      rosterPlayers.length === 1 ? "" : "s"
    }. ${
      rosterPlayers.length
        ? `You have ${rosterPlayers.map((p) => `${p.name} (${p.position})`).join(", ")}.`
        : "You have not selected anyone yet."
    } ${
      needs.length
        ? `The open positional needs are ${needs.join(", ")}.`
        : "Your main starting positions are filled."
    }`;
  }

  if (q.includes("compare")) {
    const availableTop = [...available].sort((a, b) => a.rank - b.rank).slice(0, 4);

    return `For a comparison, give me two player names. Right now, some of the highest-ranked available players are ${availableTop
      .map((p) => `${p.name} (#${p.rank})`)
      .join(", ")}.`;
  }

  if (q.includes("ppr") || q.includes("scoring")) {
    return `This draft is currently using ${scoring} scoring. Scoring format matters because receptions and other league rules can change the value of players. If you tell me your exact scoring rules, I can make the advice more specific.`;
  }

  return `I'm tracking your ${scoring} draft. I can help with questions like "Who should I pick?", "Do I need another RB?", "Compare Ja'Marr Chase and Puka Nacua", or "What does my roster need?" I currently see ${available.length} players available and ${rosterPlayers.length} players on your roster.`;
}

function AssistantChat({
  roster,
  available,
  scoring,
}: {
  roster: Roster;
  available: Player[];
  scoring: string;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hey! I'm DraftIQ. I can look at your current roster, available players, scoring format, and draft situation and give you specific draft advice.",
    },
  ]);
  const [input, setInput] = useState("");

  function sendMessage() {
    if (!input.trim()) return;

    const userText = input.trim();

    setMessages((old) => [
      ...old,
      { role: "user", text: userText },
      {
        role: "assistant",
        text: assistantReply(userText, roster, available, scoring),
      },
    ]);

    setInput("");
  }

  return (
    <div className="assistant-chat">
      <div className="chat-header">
        <div className="bot-avatar">
          <Bot size={24} />
        </div>
        <div>
          <strong>DraftIQ</strong>
          <small>Context-aware draft assistant</small>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${
              message.role === "user" ? "user-message" : "assistant-message"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="chat-suggestions">
        <button onClick={() => setInput("Who should I pick next?")}>
          Who should I pick?
        </button>
        <button onClick={() => setInput("What does my roster need?")}>
          What do I need?
        </button>
        <button onClick={() => setInput("Compare the top available players")}>
          Compare players
        </button>
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Ask DraftIQ anything..."
        />
        <button onClick={sendMessage}>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

function HomePage({
  navigate,
}: {
  navigate: (page: string) => void;
}) {
  return (
    <Page
      title="Draft smarter."
      subtitle="Fantasy Draft HQ helps you research players, practice drafts, build your roster, and get context-aware draft tips."
    >
      <section className="hero-grid">
        <div className="hero-card">
          <div className="hero-icon">
            <Trophy size={32} />
          </div>
          <h2>Your draft. Your decisions. Better information.</h2>
          <p>
            Search real NFL players, practice your draft strategy, and use
            DraftIQ to understand your roster needs as the draft changes.
          </p>
          <button className="primary-button" onClick={() => navigate("mock")}>
            Start Mock Draft <ArrowRight size={18} />
          </button>
        </div>

        <div className="feature-list">
          <button onClick={() => navigate("rankings")}>
            <Users />
            <span>
              <b>Player Rankings</b>
              <small>Search the real NFL player pool.</small>
            </span>
            <ArrowRight />
          </button>

          <button onClick={() => navigate("assistant")}>
            <Bot />
            <span>
              <b>DraftIQ Assistant</b>
              <small>Ask questions about your draft situation.</small>
            </span>
            <ArrowRight />
          </button>

          <button onClick={() => navigate("guide")}>
            <BookOpen />
            <span>
              <b>Draft Guide</b>
              <small>Learn the basics of building a roster.</small>
            </span>
            <ArrowRight />
          </button>
        </div>
      </section>
    </Page>
  );
}

function GuidePage() {
  const sections = [
    [
      "Understand your scoring",
      "PPR, half-PPR, and standard scoring can change how players should be valued. Know your league settings before the draft.",
    ],
    [
      "Build a balanced roster",
      "Do not focus on only one position. Track which starting spots you have filled and which positions still need depth.",
    ],
    [
      "Watch the player pool",
      "A player who is available now can be more useful to you than a player who was already selected several rounds ago.",
    ],
    [
      "Use rankings as a tool",
      "Overall rankings are useful, but your roster needs and league settings also matter when choosing between players.",
    ],
    [
      "Think about bye weeks",
      "Multiple players with the same bye week can create a temporary lineup problem. It is useful information to track.",
    ],
    [
      "Keep adapting",
      "A fantasy draft changes every time someone makes a pick. Your next decision should reflect what is available at that moment.",
    ],
  ];

  return (
    <Page
      title="Draft Guide"
      subtitle="A beginner-friendly crash course in fantasy football."
    >
      <div className="guide-grid">
        {sections.map(([title, text], index) => (
          <article className="guide-card" key={title}>
            <span>{index + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </Page>
  );
}

function RankingsPage() {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("ALL");

  const filtered = useMemo(() => {
    return players
      .filter((player) => {
        const matchesSearch =
          player.name.toLowerCase().includes(query.toLowerCase()) ||
          player.team.toLowerCase().includes(query.toLowerCase());

        const matchesPosition =
          position === "ALL" || player.position === position;

        return matchesSearch && matchesPosition;
      })
      .sort((a, b) => a.rank - b.rank);
  }, [query, position]);

  return (
    <Page
      title="Player Rankings"
      subtitle="Search and filter the real NFL player pool."
    >
      <div className="notice">
        <Shield size={18} />
        <span>
          Real NFL players. Rankings are seeded from current 2026 PPR fantasy
          rankings and should be refreshed as expert rankings change.
        </span>
      </div>

      <div className="toolbar">
        <div className="search">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players..."
          />
        </div>

        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        >
          <option value="ALL">All positions</option>
          <option value="QB">QB</option>
          <option value="RB">RB</option>
          <option value="WR">WR</option>
          <option value="TE">TE</option>
        </select>
      </div>

      <div className="table">
        <div className="thead">
          <span>PLAYER</span>
          <span>POS</span>
          <span>TEAM</span>
          <span>BYE</span>
          <span>RANK</span>
          <span>TIER</span>
        </div>

        {filtered.map((player) => (
          <div className="tr" key={player.id}>
            <span>
              <b className="rank-number">#{player.rank}</b>
              {player.name}
            </span>
            <span>{player.position}</span>
            <span>{player.team}</span>
            <span>{player.bye}</span>
            <span>#{player.rank}</span>
            <span>
              <b className="tier-badge">Tier {player.tier}</b>
            </span>
          </div>
        ))}

        {!filtered.length && (
          <div className="empty-state">No players matched your search.</div>
        )}
      </div>
    </Page>
  );
}

function DraftPage({
  roster,
  setRoster,
  available,
  setAvailable,
  scoring,
}: {
  roster: Roster;
  setRoster: React.Dispatch<React.SetStateAction<Roster>>;
  available: Player[];
  setAvailable: React.Dispatch<React.SetStateAction<Player[]>>;
  scoring: string;
}) {
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [filter, setFilter] = useState("ALL");

  function draftPlayer(player: Player) {
    let slot: keyof Roster | null = null;

    if (player.position === "QB" && !roster.QB) {
      slot = "QB";
    } else if (player.position === "RB") {
      if (!roster.RB1) slot = "RB1";
      else if (!roster.RB2) slot = "RB2";
      else if (!roster.FLEX) slot = "FLEX";
    } else if (player.position === "WR") {
      if (!roster.WR1) slot = "WR1";
      else if (!roster.WR2) slot = "WR2";
      else if (!roster.FLEX) slot = "FLEX";
    } else if (player.position === "TE" && !roster.TE) {
      slot = "TE";
    }

    if (!slot) {
      if (player.position === "QB") {
        alert("You already have a QB.");
      } else {
        alert(`You do not have an open starting ${player.position} slot right now.`);
      }
      return;
    }

    setRoster((old) => ({
      ...old,
      [slot as string]: player,
    }));

    setAvailable((old) => old.filter((p) => p.id !== player.id));
  }

  const shownPlayers = available
    .filter((p) => filter === "ALL" || p.position === filter)
    .sort((a, b) => a.rank - b.rank);

  const rosterEntries = Object.entries(roster) as [keyof Roster, Player | null][];

  return (
    <Page
      title="Mock Draft"
      subtitle="Practice a live draft while DraftIQ tracks your roster."
    >
      <div className="draft-layout">
        <section className="draft-main">
          <div className="draft-status">
            <span>
              <span className="live-dot" /> LIVE MOCK DRAFT
            </span>
            <span>{available.length} players available</span>
          </div>

          <div className="recent-bar">
            <b>Draft board</b>
            <span>{getRosterPlayers(roster).length} of 7 roster spots filled</span>
          </div>

          <div className="position-filter">
            {["ALL", "QB", "RB", "WR", "TE"].map((item) => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="player-grid">
            {shownPlayers.map((player) => (
              <div className="player-card" key={player.id}>
                <div className="player-head">
                  <span className="pos">{player.position}</span>
                  <span className="proj">Rank #{player.rank}</span>
                </div>

                <h3>{player.name}</h3>

                <p>
                  {player.team} · Bye {player.bye}
                </p>

                <button onClick={() => draftPlayer(player)}>
                  Draft Player <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <aside className={`draft-sidebar ${assistantOpen ? "" : "collapsed"}`}>
          <button
            className="assistant-title"
            onClick={() => setAssistantOpen(!assistantOpen)}
          >
            <span>
              <Bot size={20} />
              <b>DraftIQ</b>
              <small>Live Draft Assistant</small>
            </span>
            <ChevronDown
              className={assistantOpen ? "" : "rotate"}
              size={18}
            />
          </button>

          {assistantOpen && (
            <div className="assistant-body">
              <div className="analyzing">
                <Sparkles size={16} />
                Watching your draft situation
              </div>

              <div className="quick-tip">
                <strong>Current roster</strong>
                <p>
                  {getRosterPlayers(roster).length
                    ? getRosterPlayers(roster)
                        .map((p) => `${p.name} (${p.position})`)
                        .join(", ")
                    : "No players drafted yet."}
                </p>
              </div>

              <div className="quick-tip">
                <strong>Biggest need</strong>
                <p>
                  {getRosterNeeds(roster).length
                    ? getRosterNeeds(roster).join(", ")
                    : "Your main positions are filled."}
                </p>
              </div>

              <AssistantChat
                roster={roster}
                available={available}
                scoring={scoring}
              />
            </div>
          )}
        </aside>
      </div>

      <div className="roster-card">
        <div className="roster-header">
          <div>
            <span className="eyebrow">YOUR TEAM</span>
            <h2>Live Roster</h2>
          </div>
          <span>{scoring}</span>
        </div>

        <div className="roster-grid">
          {rosterEntries.map(([slot, player]) => (
            <div className="roster-slot" key={slot}>
              <span>{slot}</span>
              {player ? (
                <div>
                  <b>{player.name}</b>
                  <small>
                    {player.position} · {player.team}
                  </small>
                </div>
              ) : (
                <em>Empty</em>
              )}
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

function AssistantPage({
  roster,
  available,
  scoring,
}: {
  roster: Roster;
  available: Player[];
  scoring: string;
}) {
  return (
    <Page
      title="AI Assistant"
      subtitle="Chat with DraftIQ about your actual fantasy draft situation."
    >
      <div className="assistant-page-grid">
        <div className="assistant-explainer">
          <div className="bot-large">
            <Bot size={42} />
          </div>

          <h2>Your draft co-pilot</h2>

          <p>
            DraftIQ can use the players on your roster and the players still
            available to give more specific answers than a generic fantasy
            football chatbot.
          </p>

          <div className="assistant-features">
            <div>
              <Check size={18} />
              Current roster
            </div>
            <div>
              <Check size={18} />
              Available players
            </div>
            <div>
              <Check size={18} />
              Position needs
            </div>
            <div>
              <Check size={18} />
              Scoring format
            </div>
          </div>
        </div>

        <AssistantChat
          roster={roster}
          available={available}
          scoring={scoring}
        />
      </div>
    </Page>
  );
}

function App() {
  const [page, setPage] = useState("home");
  const [roster, setRoster] = useState<Roster>(emptyRoster);
  const [available, setAvailable] = useState<Player[]>(players);
  const [scoring] = useState("PPR");
  const [mobileMenu, setMobileMenu] = useState(false);

  function navigate(nextPage: string) {
    setPage(nextPage);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <header className="navbar">
        <button className="brand" onClick={() => navigate("home")}>
          <span className="brand-ball">🏈</span>
          <span>
            Fantasy Draft <b>HQ</b>
          </span>
        </button>

        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? <X /> : <Menu />}
        </button>

        <nav className={mobileMenu ? "open" : ""}>
          <button
            className={page === "home" ? "active" : ""}
            onClick={() => navigate("home")}
          >
            <Home size={16} /> Home
          </button>

          <button
            className={page === "guide" ? "active" : ""}
            onClick={() => navigate("guide")}
          >
            <BookOpen size={16} /> Draft Guide
          </button>

          <button
            className={page === "rankings" ? "active" : ""}
            onClick={() => navigate("rankings")}
          >
            <Trophy size={16} /> Player Rankings
          </button>

          <button
            className={page === "mock" ? "active" : ""}
            onClick={() => navigate("mock")}
          >
            <Zap size={16} /> Mock Draft
          </button>

          <button
            className={page === "assistant" ? "active" : ""}
            onClick={() => navigate("assistant")}
          >
            <Bot size={16} /> AI Assistant
          </button>
        </nav>

        <button
          className="start-draft"
          onClick={() => navigate("mock")}
        >
          Start Mock Draft <ArrowRight size={17} />
        </button>
      </header>

      {page === "home" && <HomePage navigate={navigate} />}

      {page === "guide" && <GuidePage />}

      {page === "rankings" && <RankingsPage />}

      {page === "assistant" && (
        <AssistantPage
          roster={roster}
          available={available}
          scoring={scoring}
        />
      )}

      {page === "mock" && (
        <DraftPage
          roster={roster}
          setRoster={setRoster}
          available={available}
          setAvailable={setAvailable}
          scoring={scoring}
        />
      )}

      <footer>
        <span>Fantasy Draft HQ</span>
        <span>Built for fantasy football research and draft practice.</span>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
