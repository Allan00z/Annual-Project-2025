"use client";

import { useEffect, useState } from "react";
import { validatePassword, getPasswordStrength, getPasswordSuggestions } from "../app/utils/password-validator";

interface PasswordStrengthIndicatorProps {
  password: string;
  showValidation?: boolean;
  className?: string;
}

export default function PasswordStrengthIndicator({ 
  password, 
  showValidation = true, 
  className = "" 
}: PasswordStrengthIndicatorProps) {
  const [validation, setValidation] = useState(validatePassword(""));
  const [strength, setStrength] = useState(getPasswordStrength(""));
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const newValidation = validatePassword(password);
    const newStrength = getPasswordStrength(password);
    const newSuggestions = getPasswordSuggestions(password);

    setValidation(newValidation);
    setStrength(newStrength);
    setSuggestions(newSuggestions);
  }, [password]);

  if (!password) {
    return null;
  }

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              strength.score <= 1 ? 'bg-red-500' :
              strength.score <= 2 ? 'bg-orange-500' :
              strength.score <= 3 ? 'bg-yellow-500' :
              strength.score <= 4 ? 'bg-green-500' :
              'bg-green-600'
            }`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${strength.color}`}>
          {strength.label}
        </span>
      </div>

      {showValidation && (
        <div className="space-y-1">
          <div className="grid grid-cols-1 gap-1 text-xs">
            <div className={`flex items-center ${password.length >= 14 ? 'text-green-600' : 'text-red-500'}`}>
              <span className="mr-1">
                {password.length >= 14 ? '✓' : '✗'}
              </span>
              Au moins 14 caractères ({password.length})
            </div>
            <div className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-red-500'}`}>
              <span className="mr-1">
                {/[A-Z]/.test(password) ? '✓' : '✗'}
              </span>
              Au moins une majuscule
            </div>
            <div className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600' : 'text-red-500'}`}>
              <span className="mr-1">
                {/[a-z]/.test(password) ? '✓' : '✗'}
              </span>
              Au moins une minuscule
            </div>
            <div className={`flex items-center ${/[0-9]/.test(password) ? 'text-green-600' : 'text-red-500'}`}>
              <span className="mr-1">
                {/[0-9]/.test(password) ? '✓' : '✗'}
              </span>
              Au moins un chiffre
            </div>
            <div className={`flex items-center ${/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-red-500'}`}>
              <span className="mr-1">
                {/[^A-Za-z0-9]/.test(password) ? '✓' : '✗'}
              </span>
              Au moins un caractère spécial
            </div>
          </div>
          
          {suggestions.length > 0 && !validation.isValid && (
            <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
              <p className="text-xs text-amber-800 font-medium mb-1">Suggestions :</p>
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <p key={index} className="text-xs text-amber-700">
                  • {suggestion}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
