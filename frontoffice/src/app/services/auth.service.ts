"use client";

import { validatePassword } from "../utils/password-validator";

export interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

// Authentification Service
export const AuthService = {
  /**
   * Log the user in
   * @param identifier - Mail or username
   * @param password - Password
   * @returns Promise with the authentication response
   */
  login: async (identifier: string, password: string): Promise<AuthResponse> => {
    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
    const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Erreur lors de la connexion");
    }

    // Store the JWT and user data in localStorage
    localStorage.setItem("jwt", data.jwt);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Store the JWT in a cookie for server-side access
    document.cookie = `jwt=${data.jwt}; path=/; max-age=3600 sec; SameSite=Lax Secure`;

    // Dispatch a storage event to notify other components
    window.dispatchEvent(new Event("storage"));

    return data;
  },

  /**
   * Register a new user
   * @param username
   * @param email
   * @param password
   * @returns Promise with the authentication response
   */
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(`Mot de passe invalide: ${passwordValidation.errors.join(', ')}`);
    }
    
    const response = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Erreur lors de l'inscription");
    }

    try {
      const confirmationResponse = await fetch(`${STRAPI_URL}/auth/send-email-confirmation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (!confirmationResponse.ok) {
        console.error("Erreur lors de l'envoi de l'email de confirmation");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de confirmation:", error);
    }

    return data;
  },

  /**
   * Log the current user out
   */
  logout: (): void => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");

    // Remove the JWT cookie
    document.cookie = "jwt=; path=/; max-age=0; SameSite=Lax Secure";

    // Dispatch a storage event to notify other components
    window.dispatchEvent(new Event("storage"));
  },

  /**
   * Request a password reset for the provided email
   * @param email - The email address of the user
   * @returns Promise with the response
   */
  forgotPassword: async (email: string): Promise<any> => {
    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
    const response = await fetch(`${STRAPI_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Erreur lors de la demande de réinitialisation");
    }

    return data;
  },

  /**
   * Reset the password using the provided code and new password
   * @param code - The code received in the email
   * @param password - The new password
   * @param passwordConfirmation - Password confirmation
   * @returns Promise with the response
   */
  resetPassword: async (code: string, password: string, passwordConfirmation: string): Promise<any> => {
    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(`Mot de passe invalide: ${passwordValidation.errors.join(', ')}`);
    }
    
    const response = await fetch(`${STRAPI_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        password,
        passwordConfirmation,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Erreur lors de la réinitialisation du mot de passe");
    }

    // Store the JWT and user data in localStorage if returned
    if (data.jwt) {
      localStorage.setItem("jwt", data.jwt);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("storage"));
    }

    return data;
  },
  
  /**
   * Check if a user is logged in
   * @returns boolean indicating if the user is logged in
   */
  isLoggedIn: (): boolean => {
    if (typeof window === "undefined") {
      return false;
    }
    return !!localStorage.getItem("jwt");
  },

  /**
   * Get the current JWT token
   * @returns The JWT token or null if it doesn't exist
   */
  getToken: (): string | null => {
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem("jwt");
  },

  /**
   * Get the currently logged-in user
   * @returns The logged-in user or null if there is none
   */
  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") {
      return null;
    }
    
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Erreur lors de l'analyse des données utilisateur:", e);
      return null;
    }
  },

  /**
   * Check if the current user has a specific role
   * @param roleType - The type of role to check (owner, etc.)
   * @returns Promise that resolves to true if the user has the role, false otherwise
   */
  checkUserRole: async (roleType: string | null = null): Promise<boolean> => {
    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
    const token = AuthService.getToken();
    
    if (!token) {
      return false; // User is not logged in
    }

    try {
      const response = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des informations utilisateur: ${response.status}`);
      }

      const userData = await response.json();
      return userData.role?.type === roleType;
    } catch (error) {
      console.error("Erreur lors de la vérification du rôle utilisateur:", error);
      return false;
    }
  },

  /**
   * Change the password for the current user
   * @param currentPassword - The current password
   * @param password - The new password
   * @param passwordConfirmation - Password confirmation
   * @returns Promise with the response
   */
  changePassword: async (currentPassword: string, password: string, passwordConfirmation: string): Promise<any> => {
    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
    const token = AuthService.getToken();
    
    if (!token) {
      throw new Error("Vous devez être connecté pour changer votre mot de passe");
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(`Nouveau mot de passe invalide: ${passwordValidation.errors.join(', ')}`);
    }

    const response = await fetch(`${STRAPI_URL}/api/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        password,
        passwordConfirmation,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Erreur lors du changement du mot de passe");
    }

    if (data.jwt) {
      localStorage.setItem("jwt", data.jwt);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      document.cookie = `jwt=${data.jwt}; path=/; max-age=3600 sec; SameSite=Lax Secure`;
      
      window.dispatchEvent(new Event("storage"));
    }

    return data;
  },

  /**
   * Get the current user's client information
   * @returns Promise with the client data
   */
  getCurrentUserClient: async (): Promise<any> => {
    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
    const token = AuthService.getToken();
    
    if (!token) {
      throw new Error("Utilisateur non authentifié");
    }

    const response = await fetch(`${STRAPI_URL}/api/users/me?populate=*`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des informations du client: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }
};

export default AuthService;
