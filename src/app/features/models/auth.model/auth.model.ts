export type UserRole = 'admin' | 'coach' | 'player' | 'staff' | 'coach_player';

/**
 * Représente l'utilisateur connecté dans l'application.
 */
export interface AuthUser {
  idUser: number; 
  username: string;
  role: UserRole;  // Rendu obligatoire pour correspondre au backend unifié
}

/**
 * Profil complet (optionnel pour l'affichage étendu)
 */
export interface UserProfile {
  idUser: number;
  username: string;
  role: UserRole;
  email?: string;
}

/**
 * Requête envoyée lors de la tentative de connexion.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Structure de la réponse renvoyée par le backend après une authentification réussie.
 */
export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}