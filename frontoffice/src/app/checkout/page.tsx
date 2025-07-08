"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Order, OrderedProduct } from "@/models";
import { OrderService } from "@/app/services/order.service";
import AuthService from "@/app/services/auth.service";

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
    
    const cartTotal = cartItems.reduce((sum: number, item: OrderedProduct) => sum + ((item.product?.price ?? 0) * item.quantity), 0);
    setTotal(cartTotal);
    
    const currentUser = AuthService.getCurrentUser();
    if (currentUser?.email) {
      setUserEmail(currentUser.email);
    }
  }, [router]);

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
    
    try {
      console.log("Submitting order:", formData);
      await OrderService.confirmOrder(formData);
      localStorage.removeItem("cart");
      OrderService.redirectToConfirmation();
    } catch (error) {
      console.error("Error confirming order:", error);
      setErrorMessage("Erreur lors de la confirmation de la commande.");
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
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstname"
                  placeholder="Prénom"
                  value={formData.client?.firstname}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
                <input
                  type="text"
                  name="lastname"
                  placeholder="Nom"
                  value={formData.client?.lastname}
                  onChange={handleChange}
                  className="input input-bordered w-full"
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
                  required
                />
                <input
                  type="text"
                  name="city"
                  placeholder="Ville"
                  value={addressFields.city}
                  onChange={handleChangeAddress}
                  className="input input-bordered w-full"
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
              <button
                type="submit"
                className="btn bg-[#303028] text-white hover:bg-[#404038] border-none w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!isFormValid()}
              >
                Confirmer la commande
              </button>
            </form>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Récapitulatif</h2>
            
            <div className="space-y-4">
              {formData.ordered_products?.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-gray-600">Quantité: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{((item.product?.price ?? 0) * item.quantity).toFixed(2)}€</p>
                </div>
              ))}
              
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