export type UserRole = 'admin' | 'coach' | 'player' | 'staff' | 'coach_player';

export interface UserProfile {
  idUser: number;
  username: string;
  role: UserRole;
}