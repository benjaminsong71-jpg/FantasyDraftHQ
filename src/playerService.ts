export type FantasyPlayer = {
  id: string;
  name: string;
  position: string;
  team: string;
  rank: number;
  tier: number;
  bye: number | null;
  image?: string;
};

const RANKINGS_URL =
  "https://github.com/dynastyprocess/data/raw/master/files/db_fpecr_latest.csv";

function getTier(rank: number) {
  if (rank <= 12) return 1;
  if (rank <= 36) return 2;
  if (rank <= 72) return 3;
  if (rank <= 120) return 4;
  return 5;
}

function normalizePosition(position: string) {
  const pos = position.toUpperCase();

  if (pos.includes("QB")) return "QB";
  if (pos.includes("RB")) return "RB";
  if (pos.includes("WR")) return "WR";
  if (pos.includes("TE")) return "TE";
  if (pos === "K") return "K";

  return pos;
}

function parseCSV(text: string) {
  const rows: string[][] = [];

  let row: string[] = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      value += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") i++;

      row.push(value);
      value = "";

      if (row.some(cell => cell.trim() !== "")) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    value += char;
  }

  if (value || row.length) {
    row.push(value);

    if (row.some(cell => cell.trim() !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

export async function fetchFantasyPlayers(): Promise<FantasyPlayer[]> {
  const response = await fetch(RANKINGS_URL);

  if (!response.ok) {
    throw new Error(
      `Player data request failed: ${response.status}`
    );
  }

  const csv = await response.text();

  const rows = parseCSV(csv);

  if (rows.length < 2) {
    throw new Error("The player dataset was empty.");
  }

  const headers = rows[0].map(h =>
    h.trim().toLowerCase()
  );

  const index = (names: string[]) => {
    for (const name of names) {
      const found = headers.indexOf(name);

      if (found !== -1) return found;
    }

    return -1;
  };

  const playerIndex = index([
    "player",
    "player_name",
    "name"
  ]);

  const positionIndex = index([
    "pos",
    "position"
  ]);

  const teamIndex = index([
    "team",
    "tm"
  ]);

  const rankIndex = index([
    "ecr",
    "ecr_avg",
    "rank"
  ]);

  const byeIndex = index([
    "bye"
  ]);

  if (
    playerIndex === -1 ||
    positionIndex === -1 ||
    teamIndex === -1 ||
    rankIndex === -1
  ) {
    throw new Error(
      "The fantasy ranking file changed its column names."
    );
  }

  const players: FantasyPlayer[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    const name = row[playerIndex]?.trim();
    const position = normalizePosition(
      row[positionIndex]?.trim() || ""
    );
    const team = row[teamIndex]?.trim() || "";

    const rawRank = Number(
      row[rankIndex]?.trim()
    );

    if (!name || !position || !Number.isFinite(rawRank)) {
      continue;
    }

    // Only use fantasy-relevant offensive positions.
    if (!["QB", "RB", "WR", "TE", "K"].includes(position)) {
      continue;
    }

    const rank = Math.round(rawRank);

    if (rank <= 0) continue;

    players.push({
      id:
        `${name}-${team}-${position}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),

      name,

      position,

      team,

      rank,

      tier: getTier(rank),

      bye:
        byeIndex === -1
          ? null
          : Number(row[byeIndex]) || null
    });
  }

  // Remove duplicate players.
  const unique = Array.from(
    new Map(
      players.map(player => [
        player.id,
        player
      ])
    ).values()
  );

  // Sort by overall fantasy rank.
  unique.sort(
    (a, b) => a.rank - b.rank
  );

  return unique;
}
