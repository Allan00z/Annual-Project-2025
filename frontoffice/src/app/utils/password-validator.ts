export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordStrength {
  score: number; // 0-5
  label: string;
  color: string;
}

/**
 * Valide un mot de passe selon les critères de sécurité
 * @param password - Le mot de passe à valider
 * @returns Résultat de la validation avec les erreurs
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Minimum 14 caractères
  if (password.length < 14) {
    errors.push("Le mot de passe doit contenir au moins 14 caractères");
  }

  // Au moins une majuscule
  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une majuscule");
  }

  // Au moins une minuscule
  if (!/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une minuscule");
  }

  // Au moins un chiffre
  if (!/[0-9]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  }

  // Au moins un caractère spécial
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()_+-=[]{}|;:,.<>?)");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calcule la force d'un mot de passe
 * @param password - Le mot de passe à analyser
 * @returns Score et informations sur la force du mot de passe
 */
export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  
  // Longueur
  if (password.length >= 14) score++;
  if (password.length >= 20) score++;
  
  // Majuscules
  if (/[A-Z]/.test(password)) score++;
  
  // Minuscules
  if (/[a-z]/.test(password)) score++;
  
  // Chiffres
  if (/[0-9]/.test(password)) score++;
  
  // Caractères spéciaux
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  // Diversité des caractères spéciaux
  const specialChars = password.match(/[^A-Za-z0-9]/g);
  if (specialChars && new Set(specialChars).size >= 2) score++;
  
  // Réduire le score si le mot de passe est trop court
  if (password.length < 14) score = Math.min(score, 2);
  
  // Limiter le score à 5
  score = Math.min(score, 5);
  
  const strengthLabels = [
    { label: "Très faible", color: "text-red-600" },
    { label: "Faible", color: "text-red-500" },
    { label: "Moyen", color: "text-orange-500" },
    { label: "Bon", color: "text-yellow-500" },
    { label: "Fort", color: "text-green-500" },
    { label: "Très fort", color: "text-green-600" }
  ];
  
  return {
    score,
    label: strengthLabels[score].label,
    color: strengthLabels[score].color
  };
}

/**
 * Génère des suggestions pour améliorer un mot de passe
 * @param password - Le mot de passe à analyser
 * @returns Liste de suggestions
 */
export function getPasswordSuggestions(password: string): string[] {
  const validation = validatePassword(password);
  const suggestions: string[] = [];
  
  if (!validation.isValid) {
    suggestions.push(...validation.errors);
  }
  
  if (password.length >= 14 && password.length < 20) {
    suggestions.push("Considérez utiliser plus de 20 caractères pour une sécurité maximale");
  }
  
  const specialChars = password.match(/[^A-Za-z0-9]/g);
  if (specialChars && new Set(specialChars).size === 1) {
    suggestions.push("Utilisez différents types de caractères spéciaux pour plus de sécurité");
  }
  
  return suggestions;
}
