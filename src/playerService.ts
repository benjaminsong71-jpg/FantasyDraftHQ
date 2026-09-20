export type FantasyPlayer = {
  id: string;
  name: string;
  position: "QB" | "RB" | "WR" | "TE" | "K";
  team: string;
  rank: number;
  tier: number;
  bye?: number;
  projectedPoints?: number;
};

const PLAYER_DATA_URL =
  "https://raw.githubusercontent.com/dynastyprocess/data/master/files/db_fpecr_latest.csv";

function getTier(rank: number): number {
  if (rank <= 12) return 1;
  if (rank <= 36) return 2;
  if (rank <= 72) return 3;
  if (rank <= 120) return 4;
  return 5;
}

function normalizePosition(
  position: string
): FantasyPlayer["position"] | null {
  const value = position.trim().toUpperCase();

  if (value === "QB") return "QB";
  if (value === "RB") return "RB";
  if (value === "WR") return "WR";
  if (value === "TE") return "TE";
  if (value === "K") return "K";

  return null;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const character = text[i];
    const nextCharacter = text[i + 1];

    if (
      character === '"' &&
      insideQuotes &&
      nextCharacter === '"'
    ) {
      currentValue += '"';
      i++;
      continue;
    }

    if (character === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === "," && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if (
      (character === "\n" || character === "\r") &&
      !insideQuotes
    ) {
      if (
        character === "\r" &&
        nextCharacter === "\n"
      ) {
        i++;
      }

      currentRow.push(currentValue);
      currentValue = "";

      if (
        currentRow.some(
          (value) => value.trim() !== ""
        )
      ) {
        rows.push(currentRow);
      }

      currentRow = [];
      continue;
    }

    currentValue += character;
  }

  if (
    currentValue.length > 0 ||
    currentRow.length > 0
  ) {
    currentRow.push(currentValue);

    if (
      currentRow.some(
        (value) => value.trim() !== ""
      )
    ) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export async function fetchFantasyPlayers(): Promise<
  FantasyPlayer[]
> {
  const response = await fetch(PLAYER_DATA_URL);

  if (!response.ok) {
    throw new Error(
      `Player data request failed: ${response.status}`
    );
  }

  const csvText = await response.text();
  const rows = parseCSV(csvText);

  if (rows.length < 2) {
    throw new Error(
      "The player database returned no players."
    );
  }

  const headers = rows[0].map((header) =>
    header.trim().toLowerCase()
  );

  function findColumn(
    possibleNames: string[]
  ): number {
    for (const name of possibleNames) {
      const index = headers.indexOf(name);

      if (index !== -1) {
        return index;
      }
    }

    return -1;
  }

  const playerIndex = findColumn([
    "player",
    "player_name",
    "name",
  ]);

  const positionIndex = findColumn([
    "pos",
    "position",
  ]);

  const teamIndex = findColumn([
    "team",
    "tm",
  ]);

  const rankIndex = findColumn([
    "ecr",
    "ecr_avg",
    "rank",
  ]);

  const byeIndex = findColumn([
    "bye",
  ]);

  if (
    playerIndex === -1 ||
    positionIndex === -1 ||
    teamIndex === -1 ||
    rankIndex === -1
  ) {
    throw new Error(
      "The player data format has changed."
    );
  }

  const players: FantasyPlayer[] = [];

  for (
    let rowIndex = 1;
    rowIndex < rows.length;
    rowIndex++
  ) {
    const row = rows[rowIndex];

    const name =
      row[playerIndex]?.trim();

    const position =
      normalizePosition(
        row[positionIndex] || ""
      );

    const team =
      row[teamIndex]?.trim() || "";

    const rank =
      Number(
        row[rankIndex]?.trim()
      );

    if (
      !name ||
      !position ||
      !Number.isFinite(rank)
    ) {
      continue;
    }

    const roundedRank =
      Math.round(rank);

    if (roundedRank <= 0) {
      continue;
    }

    players.push({
      id:
        `${name}-${team}-${position}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),

      name,

      position,

      team,

      rank: roundedRank,

      tier: getTier(roundedRank),

      bye:
        byeIndex >= 0
          ? Number(row[byeIndex]) || undefined
          : undefined,
    });
  }

  const uniquePlayers =
    Array.from(
      new Map(
        players.map((player) => [
          player.id,
          player,
        ])
      ).values()
    );

uniquePlayers.sort(
  (a, b) => a.rank - b.rank
);

// Give every player a continuous Fantasy Draft HQ rank.
const rankedPlayers = uniquePlayers.map((player, index) => ({
  ...player,
  rank: index + 1,
  tier: getTier(index + 1),
}));

return rankedPlayers;
}
