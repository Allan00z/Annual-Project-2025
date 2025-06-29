"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthService from "../services/auth.service";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await AuthService.forgotPassword(email);
      setSuccess("Un email avec votre code de réinitialisation a été envoyé.");
    } catch (error) {
      console.error("Erreur lors de la demande de réinitialisation:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la demande de réinitialisation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mx-auto py-16 px-6">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Mot de passe oublié</h1>
          <p className="text-gray-600">
            Entrez votre adresse email pour recevoir un lien de réinitialisation
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
            <p className="mt-2">
              Rendez-vous <Link href="/reset-password" className="text-[#f7c0a6] font-semibold hover:underline">ici</Link> pour saisir votre code de réinitialisation.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7c0a6]"
              placeholder="Entrez votre adresse email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-[#f7c0a6] hover:text-black transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#f7c0a6] focus:ring-opacity-50"
          >
            {loading ? "Envoi en cours..." : "Réinitialiser le mot de passe"}
          </button>

          <div className="text-center mt-4">
            <Link href="/login" className="text-[#f7c0a6] hover:underline">
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
