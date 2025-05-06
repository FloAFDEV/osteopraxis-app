
import { User, AuthState } from '@/types';

// Fonction pour connecter un utilisateur
export const login = async (email: string, password: string) => {
  // Simulation d'une connexion réussie
  return {
    user: {
      id: '1',
      email,
      role: 'OSTEOPATH',
      firstName: 'John', // Corrigé de first_name à firstName
      lastName: 'Doe',   // Corrigé de last_name à lastName
      osteopathId: 1,
    } as User,
    token: 'fake-jwt-token',
  };
};

// Fonction pour s'inscrire
export const register = async (email: string, password: string) => {
  // Simulation d'une inscription réussie
  return {
    user: {
      id: '2',
      email,
      role: 'OSTEOPATH',
      firstName: 'Jane',
      lastName: 'Smith',
      osteopathId: 2,
    } as User,
    token: 'another-fake-jwt-token',
  };
};

// Fonction pour se déconnecter
export const logout = async () => {
  // Simulation d'une déconnexion réussie
  return true;
};

// Fonction pour récupérer l'utilisateur connecté
export const checkAuth = async () => {
  // Simulation de la récupération de l'utilisateur connecté
  return {
    id: '1',
    email: 'user@example.com',
    role: 'OSTEOPATH',
    firstName: 'John',
    lastName: 'Doe',
    osteopathId: 1,
  } as User;
};

// Login with magic link
export const loginWithMagicLink = async (email: string) => {
  // Simulation
  console.log(`Magic link would be sent to ${email}`);
  return true;
};

// Promote to admin
export const promoteToAdmin = async (userId: string) => {
  // Simulation
  console.log(`User ${userId} would be promoted to admin`);
  return true;
};

// Fonction pour mettre à jour un utilisateur
export const updateUser = async (id: string, data: Partial<User>) => {
  // Simulation d'une mise à jour réussie
  return {
    id,
    email: 'user@example.com',
    role: 'OSTEOPATH',
    firstName: data.firstName || 'John', // Corrigé de first_name à firstName
    lastName: data.lastName || 'Doe',     // Corrigé de last_name à lastName
    osteopathId: 1,
  } as User;
};

// Fonction pour supprimer un utilisateur
export const deleteUser = async (id: string) => {
  // Simulation de la suppression d'un utilisateur réussie
  return true;
};
