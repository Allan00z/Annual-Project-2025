"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Order, OrderedProduct } from "@/models";
import { OrderService } from "@/app/services/order.service";
import { StripeService } from "@/app/services/stripe.service";
import AuthService from "@/app/services/auth.service";
import PaymentMethods from "@/component/PaymentMethods";

export default function Checkout() {
  const router = useRouter();
  const [total, setTotal] = useState(0);
  const [addressFields, setAddressFields] = useState({
    street: "",
    postalCode: "",
    city: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isGeocoded, setIsGeocoded] = useState(false);
  const [isLoadingClientData, setIsLoadingClientData] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [formData, setFormData] = useState<Order>({
    id: 2,
    documentId: "",
    createdAt: "",
    updatedAt: "",
    ordered_products: [],
    client: {
      firstname: "",
      lastname: "",
      billingAddress: { lat: 0, lng: 0 },
      deliveryAddress: { lat: 0, lng: 0 },
      createdAt: "",
      updatedAt: "",
      id: 0,
      documentId: ""
    }
  });

  useEffect(() => {
    if (!AuthService.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    
    const cartItems = JSON.parse(localStorage.getItem("cart") ?? "[]") as OrderedProduct[];
    
    if (!cartItems || cartItems.length === 0) {
      router.replace("/shop");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      ordered_products: cartItems
    }));
    
    const cartTotal = cartItems.reduce((sum: number, item: OrderedProduct) => {
      const basePrice = item.product?.price ?? 0;
      const optionPrice = item.option?.priceModifier ?? 0;
      const finalPrice = basePrice + optionPrice;
      return sum + (finalPrice * item.quantity);
    }, 0);
    setTotal(cartTotal);
    
    const currentUser = AuthService.getCurrentUser();
    if (currentUser?.email) {
      setUserEmail(currentUser.email);
    }

    // Load client data if available
    const loadClientData = async () => {
      try {
        // Get current user client data
        const userData = await AuthService.getCurrentUserClient();
        if (userData.client) {
          const client = userData.client;          
          setFormData(prev => ({  
            ...prev,
            client: {
              ...prev.client,
              firstname: client.firstname || "",
              lastname: client.lastname || "",
              billingAddress: client.billingAddress || { lat: 0, lng: 0 },
              deliveryAddress: client.deliveryAddress || { lat: 0, lng: 0 },
              id: client.id || 0,
              documentId: client.documentId || "",
              createdAt: client.createdAt || "",
              updatedAt: client.updatedAt || ""
            }
          }));

          // If the delivery address exists, pre-fill the address fields
          if (client.deliveryAddress?.address) {
            // Split the address into parts
            const addressParts = client.deliveryAddress.address.split(', ');
            if (addressParts.length >= 2) {
              const street = addressParts[0];
              const cityPart = addressParts[1];
              const postalCodeMatch = cityPart.match(/(\d{5})/);
              const postalCode = postalCodeMatch ? postalCodeMatch[1] : "";
              const city = cityPart.replace(/^\d{5}\s*/, "");
              
              setAddressFields({
                street,
                postalCode,
                city
              });
              
              // If the lat/lng are not 0, set isGeocoded to true
              if (client.deliveryAddress.lat !== 0 && client.deliveryAddress.lng !== 0) {
                setIsGeocoded(true);
              }
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données du client:", error);
      } finally {
        setIsLoadingClientData(false);
      }
    };

    loadClientData();
  }, [router]);

  // Validate the form data before proceeding to payment
  const isFormValid = () => {
    return (
      formData.client?.firstname?.trim() &&
      formData.client?.lastname?.trim() &&
      userEmail.trim() &&
      addressFields.street.trim() &&
      addressFields.postalCode.trim() &&
      addressFields.city.trim() &&
      isGeocoded &&
      formData.client?.deliveryAddress?.lat !== 0 &&
      formData.client?.deliveryAddress?.lng !== 0
    );
  };

  const handleGeocoding = async () => {
    const { street, postalCode, city } = addressFields;
    if (!street || !postalCode || !city) {
      setErrorMessage("Veuillez remplir tous les champs d'adresse avant de géocoder.");
      return;
    }
    setErrorMessage("");

    const fullAddress = `${street}, ${postalCode} ${city}`;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`,
        {
          headers: {
            'User-Agent': 'ResellerApp/1.0'
          }
        }
      );

      const data = await response.json();
      if (data.length > 0) {
        setFormData({
          ...formData,
          client: {
            ...formData.client!,
            deliveryAddress: {
              address: fullAddress,
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            },
            billingAddress: {
              address: fullAddress,
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            }
          }
        });
        setIsGeocoded(true);
        setErrorMessage("Adresse géocodée avec succès !");
      } else {
        setErrorMessage("Adresse non trouvée. Veuillez vérifier votre adresse.");
      }
    } catch (error) {
      console.error('Erreur lors du géocodage:', error);
      setErrorMessage("Erreur lors du géocodage. Veuillez réessayer.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isGeocoded || formData.client?.deliveryAddress?.lat === 0 || formData.client?.deliveryAddress?.lng === 0) {
      setErrorMessage("Veuillez géocoder votre adresse avant de confirmer la commande.");
      return;
    }
    
    setIsProcessingPayment(true);
    setErrorMessage("");
    
    try {
      // Vérifier que l'email utilisateur est présent
      if (!userEmail || !userEmail.includes('@')) {
        setErrorMessage("Email utilisateur manquant ou invalide. Veuillez vous reconnecter.");
        return;
      }
      
      // Ajouter l'email du client au formData
      const orderData = {
        ...formData,
        client: {
          ...formData.client!,
          email: userEmail,
          // S'assurer que l'adresse est correctement formatée
          deliveryAddress: {
            address: `${addressFields.street}, ${addressFields.postalCode} ${addressFields.city}`,
            lat: formData.client!.deliveryAddress?.lat || 0,
            lng: formData.client!.deliveryAddress?.lng || 0
          },
          billingAddress: {
            address: `${addressFields.street}, ${addressFields.postalCode} ${addressFields.city}`,
            lat: formData.client!.billingAddress?.lat || 0,
            lng: formData.client!.billingAddress?.lng || 0
          }
        }
      };
      
      console.log("Création de la session Stripe pour la commande:", orderData);
      console.log("Email client:", orderData.client.email);
      
      // Créer une session de paiement Stripe
      const sessionData = await StripeService.createCheckoutSession(orderData);
      console.log("Session créée:", sessionData);
      
      // Essayer d'abord la redirection directe vers l'URL
      if (sessionData.url) {
        console.log("Redirection directe vers l'URL Stripe:", sessionData.url);
        window.location.href = sessionData.url;
      } else {
        // Sinon, utiliser la méthode traditionnelle
        await StripeService.redirectToCheckout(sessionData.sessionId);
      }
      
    } catch (error) {
      console.error("Erreur lors du traitement du paiement:", error);
      setErrorMessage("Erreur lors du traitement du paiement. Veuillez réessayer.");
    } finally {
      setIsProcessingPayment(false);
    }
  };


  const handleChangeAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressFields(prev => ({
      ...prev,
      [name]: value
    }));
    setIsGeocoded(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData.client) {
      return;
    }
    setFormData({
      ...formData,
      client: {
        ...formData.client,    
        [e.target.name]: e.target.value
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Finaliser la commande</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Informations de livraison</h2>
            
            {isLoadingClientData && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2 text-gray-600">Chargement des informations...</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstname"
                  placeholder="Prénom"
                  value={formData.client?.firstname}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  disabled={isLoadingClientData}
                  required
                />
                <input
                  type="text"
                  name="lastname"
                  placeholder="Nom"
                  value={formData.client?.lastname}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  disabled={isLoadingClientData}
                  required
                />
              </div>
              
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={userEmail}
                className="input input-bordered w-full bg-gray-100"
                disabled
                required
              />
              <input
                type="text"
                name="street"
                placeholder="Adresse"
                value={addressFields.street}
                onChange={handleChangeAddress}
                className="input input-bordered w-full"
                disabled={isLoadingClientData}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Code postal"
                  value={addressFields.postalCode}
                  onChange={handleChangeAddress}
                  className="input input-bordered w-full"
                  disabled={isLoadingClientData}
                  required
                />
                <input
                  type="text"
                  name="city"
                  placeholder="Ville"
                  value={addressFields.city}
                  onChange={handleChangeAddress}
                  className="input input-bordered w-full"
                  disabled={isLoadingClientData}
                  required
                />
              </div>
              {errorMessage && (
                <div className={`text-sm ${isGeocoded ? 'text-green-500' : 'text-red-500'}`}>{errorMessage}</div>
              )}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleGeocoding}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
                >
                  Géocoder
                </button>
              </div>
              
              {!isGeocoded && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="font-semibold text-orange-800">Géocodage requis</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    Veuillez géocoder votre adresse en cliquant sur le bouton "Géocoder" pour pouvoir procéder au paiement.
                  </p>
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-semibold text-blue-800">Paiement sécurisé</span>
                </div>
                <p className="text-sm text-blue-700">
                  Vos données de paiement sont protégées par le cryptage SSL et traitées de manière sécurisée par Stripe.
                </p>
              </div>

              <button
                type="submit"
                className="btn bg-[#303028] text-white hover:bg-[#404038] border-none w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!isFormValid() || isLoadingClientData || isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Traitement du paiement...
                  </>
                ) : (
                  "Procéder au paiement"
                )}
              </button>
              
              <PaymentMethods />
            </form>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Récapitulatif</h2>
            
            <div className="space-y-4">
              {formData.ordered_products?.map((item, index) => {
                const basePrice = item.product?.price ?? 0;
                const optionPrice = item.option?.priceModifier ?? 0;
                const finalPrice = basePrice + optionPrice;
                
                return (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.product?.name}</p>
                      {item.option && (
                        <p className="text-sm text-gray-500">
                          Option: {item.option.name} ({item.option.priceModifier >= 0 ? '+' : ''}{item.option.priceModifier}€)
                        </p>
                      )}
                      <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{(finalPrice * item.quantity).toFixed(2)}€</p>
                  </div>
                );
              })}
              
              <div className="divider"></div>
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>{total.toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}