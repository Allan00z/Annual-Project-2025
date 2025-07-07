"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthService from "../services/auth.service";
import PasswordStrengthIndicator from "../component/PasswordStrengthIndicator";
import { validatePassword } from "../utils/password-validator";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!AuthService.isLoggedIn()) {
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== passwordConfirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(`Nouveau mot de passe invalide: ${passwordValidation.errors.join(", ")}`);
      return;
    }

    setLoading(true);

    try {
      await AuthService.changePassword(currentPassword, password, passwordConfirmation);
      setSuccess("Votre mot de passe a été changé avec succès.");
      
      setTimeout(() => {
        router.push("/account");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors du changement du mot de passe:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors du changement du mot de passe"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mx-auto py-16 px-6">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Changer le mot de passe</h1>
          <p className="text-gray-600">
            Modifiez votre mot de passe actuel
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{success}</span>
            <p className="mt-2">Vous allez être redirigé vers votre compte dans quelques instants.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe actuel
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7c0a6]"
              placeholder="Entrez votre mot de passe actuel"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7c0a6]"
              placeholder="Entrez votre nouveau mot de passe"
            />
            <PasswordStrengthIndicator password={password} />
          </div>

          <div>
            <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <input
              id="passwordConfirmation"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7c0a6]"
              placeholder="Confirmez votre nouveau mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-[#f7c0a6] hover:text-black transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#f7c0a6] focus:ring-opacity-50"
          >
            {loading ? "Changement en cours..." : "Changer le mot de passe"}
          </button>

          <div className="text-center mt-4">
            <Link href="/account" className="text-[#f7c0a6] hover:underline">
              Retour à mon compte
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
