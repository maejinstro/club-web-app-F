export interface LastMatch {
  id: number;
  date: string;
  opponent: string;
  location: string | null;
  teamScore: number;
  opponentScore: number;
  result: string;
}

export interface TeamDashboard {
  seasonId: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  lastMatches: LastMatch[];
}

export interface MatchHistoryItem {
  idMatch: number;
  date: string;
  opponent: string;
  result: string;
  playtime: number;
  goals: number;
  assists: number;
  note: number | null;
}

export interface PlayerDashboard {
  seasonId: number;
  matchesPlayed: number;
  minutes: number;
  goals: number;
  assists: number;
  averageNote: number | null;
  matchHistory: MatchHistoryItem[];
}