"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderConfirmation() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderConfirmed = sessionStorage.getItem("orderConfirmed");
    const orderDetails = sessionStorage.getItem("orderDetails");

    if (!orderConfirmed || orderConfirmed !== "true") {
      router.replace("/shop");
      return;
    }

    if (orderDetails) {
      setOrderData(JSON.parse(orderDetails));
    }

    sessionStorage.removeItem("orderConfirmed");
    sessionStorage.removeItem("orderDetails");
    
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Commande confirmée !
            </h1>
            <p className="text-gray-600">
              Merci pour votre achat. Votre commande a été traitée avec succès.
            </p>
          </div>

          {orderData && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-lg font-semibold mb-4">Détails de la commande</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Numéro de commande :</span> {orderData.orderNumber}</p>
                <p><span className="font-medium">Total :</span> {orderData.total}€</p>
                <p><span className="font-medium">Date :</span> {new Date(orderData.date).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Un email de confirmation vous a été envoyé avec tous les détails de votre commande.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/shop")}
                className="btn btn-primary"
              >
                Continuer mes achats
              </button>
              <button
                onClick={() => router.push("/account")}
                className="btn btn-outline"
              >
                Voir mes commandes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}