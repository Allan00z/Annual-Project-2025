"use client";

import Link from "next/link";

export default function ConfirmEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Compte confirmé avec succès !
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            Votre compte a été confirmé avec succès. Merci de vous connecter pour accéder à votre espace personnel.
          </p>

          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#f7c0a6] hover:bg-[#e6a688] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f7c0a6] transition-colors duration-200"
            >
              Se connecter maintenant
            </Link>
            
            <Link
              href="/"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f7c0a6] transition-colors duration-200"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
