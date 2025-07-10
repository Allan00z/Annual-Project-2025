'use client'

import products from "@/app/data/carousel/carousel";
import { InputNumber } from "@/component/inputNumber.component";
import { useEffect, useState } from "react";
import { OrderService } from "@/app/services/order.service";
import AuthService from "@/app/services/auth.service";
import { OrderedProduct } from "@/models";

export default function Cart() {
  const [cart, setCart] = useState<OrderedProduct[]>([]);
  const [price, setPrice] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const updateCart = (updatedCart: OrderedProduct[]) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    // Trigger a custom event to notify other components that the cart has been updated    
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const clearCart = () => {
    updateCart([]);
  };

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") ?? "[]");
    setCart(storedCart);
    setIsLoggedIn(AuthService.isLoggedIn());
  }, []);

  useEffect(() => {
    const total = cart.reduce((sum, item) => {
      const basePrice = item.product?.price ?? 0;
      const optionPrice = item.option?.priceModifier ?? 0;
      const finalPrice = basePrice + optionPrice;
      return sum + (finalPrice * item.quantity);
    }, 0);
    setPrice(total);
  }, [cart])

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    try {
      const response = await fetch(`http://localhost:1338/api/discounts?populate=*&filters[code][$eq]=${promoCode}`);
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const promo = data.data[0];
        const now = new Date();
        const start = new Date(promo.startDate);
        const end = new Date(promo.endDate);
        
        if (now >= start && now <= end) {
          // Check if the product associated with the promo is in the cart
          if (promo.product) {
            const productInCart = cart.some(item => item.product?.id === promo.product.id);
            console.log(productInCart);
            if (!productInCart) {
              setPromoError('Ce code promo ne s\'applique pas aux produits de votre panier');
              return;
            }
          }
          
          setAppliedPromo(promo);
          const discountAmount = promo.type === 'prix' ? promo.value : (price * promo.value / 100);
          setDiscount(Math.min(discountAmount, price));
          setPromoError('');
        } else {
          setPromoError('Code promo expiré');
        }
      } else {
        setPromoError('Code promo invalide');
      }
    } catch (error) {
      setPromoError('Erreur lors de la vérification du code');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setDiscount(0);
    setPromoCode('');
    setPromoError('');
  };

  return (
    <div className="py-6 px-24">
      <div className="flex justify-between items-center mb-3">
        <h1 className="font-bold text-3xl">Panier</h1>
        {cart.length > 0 && <button onClick={clearCart} className="btn btn-outline btn-error">Vider le panier</button>}
      </div>
      {cart.length == 0 ? (
        <EmptyCart/>
      ) : (
        <div>
          <div className="flex flex-row">
            <table className="table h-fit rounded-box border border-base-content/5 bg-base-100">
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">PRODUIT</th>
                <th scope="col">PRIX</th>
                <th scope="col">QUANTITÉS</th>
                <th scope="col">TOTAL PRODUITS</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, key) => <ProductLine item={item} key={key} updateCart={updateCart} cart={cart} />)}
            </tbody>
          </table>
          <div className="ml-6 w-80">
            <div className="card bg-base-100 border border-base-content/5 shadow-sm">
              <div className="card-body p-6">
                <h3 className="card-title text-lg font-bold mb-4">RÉCAPITULATIF</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/70">Sous-total</span>
                    <span className="font-semibold">{price.toFixed(2)}€</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Réduction ({appliedPromo.code})</span>
                      <span>-{discount.toFixed(2)}€</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/70">Livraison</span>
                    <span className="font-semibold">Gratuite</span>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>{(price - discount).toFixed(2)}€</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Code promo</h4>
                  {!appliedPromo ? (
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        placeholder="Entrez votre code promo" 
                        className="input input-bordered w-full"
                        value={promoCode}
                        onKeyDown={(e) => e.key === 'Enter' && applyPromoCode()}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                      <button 
                        onClick={applyPromoCode}
                        className="btn btn-outline btn-sm w-full"
                      >
                        Appliquer
                      </button>
                      {promoError && <p className="text-error text-sm">{promoError}</p>}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                      <span className="text-green-700 text-sm">Code {appliedPromo.code} appliqué</span>
                      <button 
                        onClick={removePromoCode}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                {isLoggedIn ? (
                  <button
                    onClick={() => OrderService.redirectToCheckout()}
                    className="btn bg-[#303028] text-white hover:bg-[#404038] border-none w-full mt-4 px-6 py-3 whitespace-nowrap">
                    Procéder à la commande
                  </button>
                ) : (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">Vous devez être connecté pour passer commande</p>
                    <a href="/login" className="btn btn-outline btn-error w-full">
                      Se connecter
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ProductLine = ({item, updateCart, cart} : {item: OrderedProduct, updateCart: (cart: OrderedProduct[]) => void, cart: OrderedProduct[]}) => {
  const changeQuantity = (quantity: string) => {
    const newQuantity = Number(quantity);
    const updatedCart = cart.map(cartItem => 
      cartItem.product?.name === item.product?.name && cartItem.option?.documentId === item.option?.documentId 
        ? {...cartItem, quantity: newQuantity} 
        : cartItem
    );
    updateCart(updatedCart);
  }

  const deleteItem = () => {
    const updatedCart = cart.filter(cartItem => 
      !(cartItem.product?.name === item.product?.name && cartItem.option?.documentId === item.option?.documentId)
    );
    updateCart(updatedCart);
  }
  
  if (!item.product) {
    return;
  }

  const basePrice = item.product.price;
  const optionPrice = item.option?.priceModifier ?? 0;
  const finalPrice = basePrice + optionPrice;

  return (
    <tr>
      <td>
        <button onClick={deleteItem} className="btn btn-sm btn-error text-white text-lg">×</button>
      </td>
      <td>
        <div>
          <div className="font-medium">{item.product.name}</div>
          {item.option && (
            <div className="text-sm text-gray-600">
              Option: {item.option.name} ({item.option.priceModifier >= 0 ? '+' : ''}{item.option.priceModifier}€)
            </div>
          )}
        </div>
      </td>
      <td>{finalPrice.toFixed(2)}€</td>
      <td>
        <input type="number" className="input validator" required placeholder="Quantity" 
          min="1" value={item.quantity} onChange={(input) => changeQuantity(input.target.value)} />
      </td>
      <td>{(item.quantity * finalPrice).toFixed(2)}€</td>
    </tr>
  )
}

const EmptyCart = () => {
  return (
    <div className="text-center py-12">
      <p className="text-xl mb-4">Votre panier est vide !</p>
      <a href="/shop" className="btn bg-[#303028] text-white hover:bg-[#404038] border-none">Retourner à la boutique</a>
    </div>
  )
}