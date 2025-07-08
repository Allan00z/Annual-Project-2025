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
 * Valid a password based on specific criteria
 * @param password - The password to validate
 * @returns An object indicating if the password is valid and any errors found
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // At least 14 characters
  if (password.length < 14) {
    errors.push("Le mot de passe doit contenir au moins 14 caractères");
  }

  // At least 1 uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une majuscule");
  }

  // At least 1 lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins une minuscule");
  }

  // At least 1 digit
  if (!/[0-9]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  }

  // At least 1 special character
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()_+-=[]{}|;:,.<>?)");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculates the strength of a password
 * @param password - The password to evaluate
 * @returns An object containing the strength score, label, and color
 */
export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  
  if (password.length >= 14) score++;
  if (password.length >= 20) score++;  
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;  
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  const specialChars = password.match(/[^A-Za-z0-9]/g);
  if (specialChars && new Set(specialChars).size >= 2) score++;
  
  if (password.length < 14) score = Math.min(score, 2);
  
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
 * Generates password suggestions based on the current password
 * @param password - The current password to analyze
 * @returns An array of suggestions to improve the password
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
