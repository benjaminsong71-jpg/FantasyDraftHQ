export type FantasyPlayer = {
  id: string;
  name: string;
  position: "QB" | "RB" | "WR" | "TE" | "K";
  team: string;
  rank: number;
  tier: number;
  projectedPoints: number;
};

/*
  Fantasy Draft HQ player database

  The app can use this as its local player database.
  Keep the structure simple so DraftIQ, rankings, and
  the mock draft can all use the same player objects.
*/

export const players: FantasyPlayer[] = [
  {
    id: "lamar-jackson",
    name: "Lamar Jackson",
    position: "QB",
    team: "Ravens",
    rank: 1,
    tier: 1,
    projectedPoints: 340
  },
  {
    id: "josh-allen",
    name: "Josh Allen",
    position: "QB",
    team: "Bills",
    rank: 2,
    tier: 1,
    projectedPoints: 335
  },
  {
    id: "jalen-hurts",
    name: "Jalen Hurts",
    position: "QB",
    team: "Eagles",
    rank: 3,
    tier: 1,
    projectedPoints: 325
  },
  {
    id: "joe-burrow",
    name: "Joe Burrow",
    position: "QB",
    team: "Bengals",
    rank: 4,
    tier: 1,
    projectedPoints: 320
  },
  {
    id: "patrick-mahomes",
    name: "Patrick Mahomes",
    position: "QB",
    team: "Chiefs",
    rank: 5,
    tier: 1,
    projectedPoints: 315
  },

  {
    id: "jahmyr-gibbs",
    name: "Jahmyr Gibbs",
    position: "RB",
    team: "Lions",
    rank: 6,
    tier: 1,
    projectedPoints: 285
  },
  {
    id: "bijan-robinson",
    name: "Bijan Robinson",
    position: "RB",
    team: "Falcons",
    rank: 7,
    tier: 1,
    projectedPoints: 280
  },
  {
    id: "saquon-barkley",
    name: "Saquon Barkley",
    position: "RB",
    team: "Eagles",
    rank: 8,
    tier: 1,
    projectedPoints: 275
  },
  {
    id: "christian-mccaffrey",
    name: "Christian McCaffrey",
    position: "RB",
    team: "49ers",
    rank: 9,
    tier: 1,
    projectedPoints: 270
  },
  {
    id: "derrick-henry",
    name: "Derrick Henry",
    position: "RB",
    team: "Ravens",
    rank: 10,
    tier: 2,
    projectedPoints: 260
  },

  {
    id: "jamarr-chase",
    name: "Ja'Marr Chase",
    position: "WR",
    team: "Bengals",
    rank: 11,
    tier: 1,
    projectedPoints: 300
  },
  {
    id: "amon-ra-st-brown",
    name: "Amon-Ra St. Brown",
    position: "WR",
    team: "Lions",
    rank: 12,
    tier: 1,
    projectedPoints: 285
  },
  {
    id: "puka-nacua",
    name: "Puka Nacua",
    position: "WR",
    team: "Rams",
    rank: 13,
    tier: 1,
    projectedPoints: 280
  },
  {
    id: "justin-jefferson",
    name: "Justin Jefferson",
    position: "WR",
    team: "Vikings",
    rank: 14,
    tier: 1,
    projectedPoints: 278
  },
  {
    id: "ceedee-lamb",
    name: "CeeDee Lamb",
    position: "WR",
    team: "Cowboys",
    rank: 15,
    tier: 1,
    projectedPoints: 275
  },

  {
    id: "travis-kelce",
    name: "Travis Kelce",
    position: "TE",
    team: "Chiefs",
    rank: 16,
    tier: 2,
    projectedPoints: 225
  },
  {
    id: "george-kittle",
    name: "George Kittle",
    position: "TE",
    team: "49ers",
    rank: 17,
    tier: 2,
    projectedPoints: 220
  },
  {
    id: "sam-laporta",
    name: "Sam LaPorta",
    position: "TE",
    team: "Lions",
    rank: 18,
    tier: 2,
    projectedPoints: 215
  },
  {
    id: "trey-mcbride",
    name: "Trey McBride",
    position: "TE",
    team: "Cardinals",
    rank: 19,
    tier: 2,
    projectedPoints: 212
  },
  {
    id: "brock-bowers",
    name: "Brock Bowers",
    position: "TE",
    team: "Raiders",
    rank: 20,
    tier: 2,
    projectedPoints: 210
  }

  // More players can be added below.
];
