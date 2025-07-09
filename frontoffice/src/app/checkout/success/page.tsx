"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StripeService } from "@/app/services/stripe.service";
import { OrderService } from "@/app/services/order.service";

export default function CheckoutSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    
    if (!sessionId) {
      setError("Session ID manquant");
      setLoading(false);
      return;
    }

    // Verify the payment status using the session ID
    const verifyPayment = async () => {
      try {
        // Verify the payment status with Stripe
        const verificationResult = await StripeService.verifyPayment(sessionId);
        
        // If the payment is successful, retrieve the session details
        if (verificationResult.status === "paid") {
          const details = await StripeService.getSessionDetails(sessionId);
          setSessionDetails(details.session);
          
          // Get the cart data from localStorage
          const cartData = JSON.parse(localStorage.getItem("cart") ?? "[]");
          
          // Clear the cart from localStorage
          localStorage.removeItem("cart");
          
          // Upadate the cart state in the application
          window.dispatchEvent(new CustomEvent('cartUpdated'));
          
          // Save the order data if session metadata exists in the database
          if (details.session.metadata && cartData.length > 0) {
            try {
              const orderData = {
                id: 0,
                documentId: "",
                createdAt: "",
                updatedAt: "",
                client: undefined,
                ordered_products: cartData
              };
              
              // Utiliser l'email de la session ou des métadonnées
              const customerEmail = details.session.customer_email || details.session.metadata.clientEmail;
              
              await OrderService.saveOrderAfterPayment(orderData, customerEmail);
              console.log('Commande sauvegardée avec succès');
            } catch (error) {
              console.error('Erreur lors de la sauvegarde de la commande:', error);
            }
          }
          
        } else {
          setError("Le paiement n'a pas été confirmé");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du paiement:", error);
        setError("Erreur lors de la vérification du paiement");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/checkout")}
            className="w-full bg-[#303028] text-white py-2 px-4 rounded-md hover:bg-[#404038] transition-colors"
          >
            Retour au checkout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement confirmé !</h1>
        <p className="text-gray-600 mb-6">
          Merci pour votre commande. Votre paiement a été traité avec succès. Vous allez recevoir un email de confirmation avec les détails de votre commande.
        </p>
        
        {sessionDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Détails de la commande</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Montant total:</span> {(sessionDetails.amount_total / 100).toFixed(2)}€</p>
              <p><span className="font-medium">Date:</span> {new Date(sessionDetails.created * 1000).toLocaleDateString()}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={() => router.push("/account")}
            className="w-full bg-[#303028] text-white py-2 px-4 rounded-md hover:bg-[#404038] transition-colors"
          >
            Voir mes commandes
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
