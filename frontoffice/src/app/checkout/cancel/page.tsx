"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutCancel() {
  const router = useRouter();

  useEffect(() => {
    console.log("Paiement annulé par l'utilisateur");
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement annulé</h1>
        <p className="text-gray-600 mb-6">
          Votre paiement a été annulé. Aucun montant n'a été débité.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => router.push("/checkout")}
            className="w-full bg-[#303028] text-white py-2 px-4 rounded-md hover:bg-[#404038] transition-colors"
          >
            Retour au checkout
          </button>
          
          <button
            onClick={() => router.push("/shop")}
            className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
          >
            Continuer mes achats
          </button>
          
          <button
            onClick={() => router.push("/")}
            className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
