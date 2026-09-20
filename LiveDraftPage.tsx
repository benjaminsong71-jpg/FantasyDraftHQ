import React, { useMemo, useState } from "react";
import type { FantasyPlayer } from "./playerService";
import {
  ArrowLeft,
  Check,
  RotateCcw,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";

type Player = FantasyPlayer;

type Roster = {
  QB: Player | null;
  RB1: Player | null;
  RB2: Player | null;
  WR1: Player | null;
  WR2: Player | null;
  TE: Player | null;
  FLEX: Player | null;
  K: Player | null;
};

type DraftPick = {
  overallPick: number;
  round: number;
  teamSlot: number;
  player: Player;
  isMine: boolean;
};

type LiveDraftPageProps = {
  players: Player[];
  onBack?: () => void;
};

const emptyRoster: Roster = {
  QB: null,
  RB1: null,
  RB2: null,
  WR1: null,
  WR2: null,
  TE: null,
  FLEX: null,
  K: null,
};

function getRound(overallPick: number, leagueSize: number) {
  return Math.ceil(overallPick / leagueSize);
}

function getTeamSlot(overallPick: number, leagueSize: number) {
  const positionInRound = ((overallPick - 1) % leagueSize) + 1;
  const round = getRound(overallPick, leagueSize);

  if (round % 2 === 1) {
    return positionInRound;
  }

  return leagueSize - positionInRound + 1;
}

function getRosterNeeds(roster: Roster) {
  const needs: string[] = [];

  if (!roster.QB) needs.push("QB");
  if (!roster.RB1) needs.push("RB");
  if (!roster.RB2) needs.push("RB");
  if (!roster.WR1) needs.push("WR");
  if (!roster.WR2) needs.push("WR");
  if (!roster.TE) needs.push("TE");
  if (!roster.FLEX) needs.push("FLEX");
  if (!roster.K) needs.push("K");

  return needs;
}

function placeOnRoster(roster: Roster, player: Player): Roster {
  const next = { ...roster };

  if (player.position === "QB" && !next.QB) {
    next.QB = player;
    return next;
  }

  if (player.position === "RB") {
    if (!next.RB1) {
      next.RB1 = player;
      return next;
    }

    if (!next.RB2) {
      next.RB2 = player;
      return next;
    }

    if (!next.FLEX) {
      next.FLEX = player;
      return next;
    }
  }

  if (player.position === "WR") {
    if (!next.WR1) {
      next.WR1 = player;
      return next;
    }

    if (!next.WR2) {
      next.WR2 = player;
      return next;
    }

    if (!next.FLEX) {
      next.FLEX = player;
      return next;
    }
  }

  if (player.position === "TE") {
    if (!next.TE) {
      next.TE = player;
      return next;
    }

    if (!next.FLEX) {
      next.FLEX = player;
      return next;
    }
  }

  if (player.position === "K" && !next.K) {
    next.K = player;
    return next;
  }

  return next;
}

function getRecommendationScore(
  player: Player,
  roster: Roster,
  scoring: string
) {
  let score = player.rank;

  const needs = getRosterNeeds(roster);

  if (needs.includes(player.position)) {
    score -= 80;
  }

  if (needs.includes("FLEX") && ["RB", "WR", "TE"].includes(player.position)) {
    score -= 30;
  }

  if (scoring === "PPR" && player.position === "WR") {
    score -= 10;
  }

  if (scoring === "PPR" && player.position === "RB") {
    score -= 5;
  }

  if (scoring === "Standard" && player.position === "RB") {
    score -= 8;
  }

  return score;
}

export default function LiveDraftPage({
  players,
  onBack,
}: LiveDraftPageProps) {
  const [started, setStarted] = useState(false);

  const [leagueSize, setLeagueSize] = useState(10);
  const [draftPosition, setDraftPosition] = useState(1);
  const [scoring, setScoring] = useState("PPR");
  const [currentPick, setCurrentPick] = useState(1);

  const [roster, setRoster] = useState<Roster>(emptyRoster);
  const [myPlayers, setMyPlayers] = useState<Player[]>([]);
  const [draftPicks, setDraftPicks] = useState<DraftPick[]>([]);

  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("ALL");
  const [showHistory, setShowHistory] = useState(false);

  const isMyTurn =
    getTeamSlot(currentPick, leagueSize) === draftPosition;

  const currentRound = getRound(currentPick, leagueSize);
  const currentTeamSlot = getTeamSlot(currentPick, leagueSize);

  const draftedIds = useMemo(
    () => new Set(draftPicks.map((pick) => pick.player.id)),
    [draftPicks]
  );

  const availablePlayers = useMemo(() => {
    return players.filter((player) => !draftedIds.has(player.id));
  }, [players, draftedIds]);

  const filteredPlayers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return availablePlayers
      .filter((player) => {
        const matchesSearch =
          !query ||
          player.name.toLowerCase().includes(query) ||
          player.team.toLowerCase().includes(query);

        const matchesPosition =
          positionFilter === "ALL" ||
          player.position === positionFilter;

        return matchesSearch && matchesPosition;
      })
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 50);
  }, [availablePlayers, search, positionFilter]);

  const recommendations = useMemo(() => {
    return [...availablePlayers]
      .sort(
        (a, b) =>
          getRecommendationScore(a, roster, scoring) -
          getRecommendationScore(b, roster, scoring)
      )
      .slice(0, 5);
  }, [availablePlayers, roster, scoring]);

  const needs = getRosterNeeds(roster);

  function startDraft() {
    setStarted(true);
  }

  function recordPick(player: Player) {
    const teamSlot = getTeamSlot(currentPick, leagueSize);
    const round = getRound(currentPick, leagueSize);
    const mine = teamSlot === draftPosition;

    const pick: DraftPick = {
      overallPick: currentPick,
      round,
      teamSlot,
      player,
      isMine: mine,
    };

    setDraftPicks((previous) => [...previous, pick]);

    if (mine) {
      setMyPlayers((previous) => [...previous, player]);
      setRoster((previous) => placeOnRoster(previous, player));
    }

    setCurrentPick((previous) => previous + 1);
    setSearch("");
  }

  function undoLastPick() {
    if (draftPicks.length === 0) return;

    const lastPick = draftPicks[draftPicks.length - 1];

    setDraftPicks((previous) => previous.slice(0, -1));
    setCurrentPick(lastPick.overallPick);

    if (lastPick.isMine) {
      setMyPlayers((previous) =>
        previous.filter((player) => player.id !== lastPick.player.id)
      );

      const rebuiltRoster = draftPicks
        .slice(0, -1)
        .filter((pick) => pick.isMine)
        .reduce(
          (currentRoster, pick) =>
            placeOnRoster(currentRoster, pick.player),
          emptyRoster
        );

      setRoster(rebuiltRoster);
    }
  }

  function resetDraft() {
    setStarted(false);
    setCurrentPick(1);
    setRoster(emptyRoster);
    setMyPlayers([]);
    setDraftPicks([]);
    setSearch("");
  }

  if (!started) {
    return (
      <div className="page-shell">
        <div className="page-header">
          <div>
            <div className="eyebrow">LIVE DRAFT MODE</div>
            <h1>Track a real fantasy draft</h1>
            <p>
              Record picks from another fantasy platform and let DraftIQ
              track the available players and your roster.
            </p>
          </div>

          {onBack && (
            <button className="secondary-btn" onClick={onBack}>
              <ArrowLeft size={16} />
              Back
            </button>
          )}
        </div>

        <div className="card" style={{ maxWidth: 760 }}>
          <div className="card-title">
            <Users size={20} />
            Draft Setup
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 18,
              marginTop: 20,
            }}
          >
            <label>
              <div className="field-label">Scoring</div>
              <select
                className="input"
                value={scoring}
                onChange={(e) => setScoring(e.target.value)}
              >
                <option>PPR</option>
                <option>Half-PPR</option>
                <option>Standard</option>
              </select>
            </label>

            <label>
              <div className="field-label">League Size</div>
              <select
                className="input"
                value={leagueSize}
                onChange={(e) => setLeagueSize(Number(e.target.value))}
              >
                {[8, 10, 12, 14, 16].map((size) => (
                  <option key={size} value={size}>
                    {size} teams
                  </option>
                ))}
              </select>
            </label>

            <label>
              <div className="field-label">Your Draft Position</div>
              <select
                className="input"
                value={draftPosition}
                onChange={(e) => setDraftPosition(Number(e.target.value))}
              >
                {Array.from({ length: leagueSize }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    Pick {index + 1}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <div className="field-label">Current Overall Pick</div>
              <input
                className="input"
                type="number"
                min="1"
                value={currentPick}
                onChange={(e) =>
                  setCurrentPick(Math.max(1, Number(e.target.value)))
                }
              />
            </label>
          </div>

          <div
            className="info-box"
            style={{
              marginTop: 22,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <Sparkles size={18} />
            <div>
              <strong>How this works</strong>
              <p style={{ marginBottom: 0 }}>
                When you record each pick, DraftIQ removes that player from
                the available pool. It also calculates whether the pick
                belongs to you using your league size and draft position.
              </p>
            </div>
          </div>

          <button
            className="primary-btn"
            style={{ marginTop: 22 }}
            onClick={startDraft}
          >
            <Sparkles size={17} />
            Start Live Draft
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <div className="eyebrow">LIVE DRAFT MODE</div>
          <h1>DraftIQ Live</h1>
          <p>
            {leagueSize}-team {scoring} draft · You are drafting from spot{" "}
            {draftPosition}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="secondary-btn"
            onClick={undoLastPick}
            disabled={draftPicks.length === 0}
          >
            <RotateCcw size={16} />
            Undo
          </button>

          <button className="secondary-btn" onClick={resetDraft}>
            Reset
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 340px",
          gap: 20,
        }}
      >
        <div>
          <div
            className="card"
            style={{
              marginBottom: 20,
              border:
                isMyTurn
                  ? "2px solid var(--accent, #7c5cff)"
                  : undefined,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 15,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div>
                <div className="eyebrow">
                  ROUND {currentRound} · OVERALL PICK {currentPick}
                </div>

                <h2 style={{ margin: "6px 0" }}>
                  {isMyTurn ? "🎯 YOUR PICK" : `Team ${currentTeamSlot}'s pick`}
                </h2>

                <p style={{ margin: 0 }}>
                  {isMyTurn
                    ? "Choose a player from the list below."
                    : "Record the player that was just selected in the real draft."}
                </p>
              </div>

              <div className="stat-card">
                <span>Players Available</span>
                <strong>{availablePlayers.length}</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div className="card-title">
                <Search size={18} />
                Record a Pick
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {["ALL", "QB", "RB", "WR", "TE", "K"].map((position) => (
                  <button
                    key={position}
                    className={
                      positionFilter === position
                        ? "filter-btn active"
                        : "filter-btn"
                    }
                    onClick={() => setPositionFilter(position)}
                  >
                    {position}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ position: "relative", marginTop: 16 }}>
              <Search
                size={17}
                style={{
                  position: "absolute",
                  left: 13,
                  top: 13,
                  opacity: 0.55,
                }}
              />

              <input
                className="input"
                style={{ paddingLeft: 40 }}
                placeholder="Search player or team..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              {filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="player-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <strong>{player.name}</strong>
                    <div className="muted">
                      #{player.rank} · {player.position} · {player.team}
                    </div>
                  </div>

                  <button
                    className="primary-btn"
                    onClick={() => recordPick(player)}
                  >
                    <Check size={15} />
                    Record Pick
                  </button>
                </div>
              ))}

              {filteredPlayers.length === 0 && (
                <div className="empty-state">
                  No available players match your search.
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">
              <Sparkles size={19} />
              DraftIQ Recommendation
            </div>

            <p className="muted" style={{ marginTop: 10 }}>
              Based on your roster, scoring format, and the players still
              available.
            </p>

            {recommendations.slice(0, 3).map((player, index) => (
              <div
                key={player.id}
                style={{
                  padding: "13px 0",
                  borderBottom:
                    index < 2 ? "1px solid var(--border)" : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div>
                    <strong>{index + 1}. {player.name}</strong>
                    <div className="muted">
                      #{player.rank} · {player.position} · {player.team}
                    </div>
                  </div>

                  <button
                    className="secondary-btn"
                    onClick={() => recordPick(player)}
                  >
                    Pick
                  </button>
                </div>
              </div>
            ))}

            <div className="info-box" style={{ marginTop: 16 }}>
              <strong>Current need:</strong>{" "}
              {needs.length ? needs.join(", ") : "Starting lineup filled"}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">My Roster</div>

            <div style={{ marginTop: 14 }}>
              {(
                [
                  ["QB", roster.QB],
                  ["RB1", roster.RB1],
                  ["RB2", roster.RB2],
                  ["WR1", roster.WR1],
                  ["WR2", roster.WR2],
                  ["TE", roster.TE],
                  ["FLEX", roster.FLEX],
                  ["K", roster.K],
                ] as [string, Player | null][]
              ).map(([slot, player]) => (
                <div
                  key={slot}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "9px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span className="muted">{slot}</span>
                  <strong>{player?.name || "Empty"}</strong>
                </div>
              ))}
            </div>

            {myPlayers.length > 8 && (
              <div style={{ marginTop: 15 }}>
                <div className="eyebrow">BENCH</div>

                {myPlayers.slice(8).map((player) => (
                  <div
                    key={player.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "7px 0",
                    }}
                  >
                    <span>{player.name}</span>
                    <span className="muted">
                      {player.position} · {player.team}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <button
              className="secondary-btn"
              style={{ width: "100%" }}
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Hide Pick History" : "Show Pick History"}
            </button>

            {showHistory && (
              <div style={{ marginTop: 15 }}>
                {draftPicks
                  .slice()
                  .reverse()
                  .map((pick) => (
                    <div
                      key={pick.overallPick}
                      style={{
                        padding: "9px 0",
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <strong>#{pick.overallPick}</strong>{" "}
                      {pick.player.name}
                      <div className="muted">
                        Round {pick.round} · Team {pick.teamSlot}
                        {pick.isMine ? " · YOUR PICK" : ""}
                      </div>
                    </div>
                  ))}

                {draftPicks.length === 0 && (
                  <div className="empty-state">
                    No picks recorded yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{
          marginTop: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <X size={17} />
        <div>
          <strong>Important:</strong> This version tracks picks you manually
          record from your real draft. The next upgrade can connect DraftIQ
          to a real AI model and eventually add draft-board screenshot
          scanning.
        </div>
      </div>
    </div>
  );
}
