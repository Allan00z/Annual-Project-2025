"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthService from "../services/auth.service";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (AuthService.isLoggedIn()) {
      router.push("/");
    }
  }, [router]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await AuthService.login(identifier, password);
      router.push("/");
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la connexion"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mx-auto py-16 px-6">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Connexion</h1>
          <p className="text-gray-600">
            Connectez-vous pour accéder à votre compte
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
              Email ou nom d'utilisateur
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7c0a6]"
              placeholder="Entrez votre email ou nom d'utilisateur"
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
          </div>

          <div className="flex items-center justify-between">
            <Link href="/forgot-password" className="text-sm text-[#f7c0a6] hover:underline">
              Mot de passe oublié?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-[#f7c0a6] hover:text-black transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#f7c0a6] focus:ring-opacity-50"
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-600">Vous n&apos;avez pas de compte? </span>
            <Link href="/register" className="text-[#f7c0a6] hover:underline">
              S&apos;inscrire
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
