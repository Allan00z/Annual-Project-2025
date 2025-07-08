"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthService from "../services/auth.service";
import PasswordStrengthIndicator from "../../component/passwordStrengthIndicator";
import { validatePassword } from "../utils/password-validator";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (AuthService.isLoggedIn()) {
      router.push("/");
    }
  }, [router]);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(`Mot de passe invalide: ${passwordValidation.errors.join(", ")}`);
      return;
    }

    setLoading(true);

    try {
      const authResponse = await AuthService.register(username, email, password);
      setSuccess("Inscription réussie ! Un email de confirmation a été envoyé à votre adresse. Veuillez vérifier votre boîte de réception.");
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'inscription"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mx-auto py-16 px-6">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Créer un compte</h1>
          <p className="text-gray-600">
            Inscrivez-vous pour accéder à toutes les fonctionnalités
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
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7c0a6]"
              placeholder="Entrez votre nom d'utilisateur"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7c0a6]"
              placeholder="Entrez votre email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7c0a6]"
              placeholder="Entrez votre mot de passe"
            />
            <PasswordStrengthIndicator password={password} />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7c0a6]"
              placeholder="Confirmez votre mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-[#f7c0a6] hover:text-black transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#f7c0a6] focus:ring-opacity-50"
          >
            {loading ? "Inscription en cours..." : "S'inscrire"}
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-600">Vous avez déjà un compte? </span>
            <Link href="/login" className="text-[#f7c0a6] hover:underline">
              Se connecter
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
