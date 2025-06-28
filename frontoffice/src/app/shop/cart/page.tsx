'use client'

import products from "@/app/data/carousel/carousel";
import { InputNumber } from "@/component/inputNumber.component";
import { useEffect, useState } from "react";

export default function Cart() {
  const [cart, setCart] = useState<CartProduct[]>([]);
  const [price, setPrice] = useState(0);

  const updateCart = (updatedCart: CartProduct[]) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    updateCart([]);
  };

  useEffect(() => {
    const cartProducts: CartProduct[] = [
        { product: { name: "Bijoux", price: 12.23, image: "test", stock: 19 }, quantity: 1 },
        { product: { name: "Collier", price: 8.84, image: "internal test", stock: 16 }, quantity: 1 }
    ]
    localStorage.setItem("cart", JSON.stringify(cartProducts));

    const storedCart = JSON.parse(localStorage.getItem("cart") ?? "[]");
    setCart(storedCart);
  }, []);

  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    setPrice(total);
  }, [cart])

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
            <table className="table rounded-box border border-base-content/5 bg-base-100">
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
                  <div className="flex justify-between items-center">
                    <span className="text-base-content/70">Livraison</span>
                    <span className="font-semibold">Gratuite</span>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>{price.toFixed(2)}€</span>
                  </div>
                </div>
                <button className="btn bg-[#303028] text-white hover:bg-[#404038] border-none w-full mt-4 px-6 py-3 whitespace-nowrap">
                  Procéder à la commande
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ProductLine = ({item, updateCart, cart} : {item: CartProduct, updateCart: (cart: CartProduct[]) => void, cart: CartProduct[]}) => {
  const changeQuantity = (quantity: string) => {
    const newQuantity = Number(quantity);
    const updatedCart = cart.map(cartItem => 
      cartItem.product.name === item.product.name ? {...cartItem, quantity: newQuantity} : cartItem
    );
    updateCart(updatedCart);
  }

  const deleteItem = () => {
    const updatedCart = cart.filter(cartItem => cartItem.product.name !== item.product.name);
    updateCart(updatedCart);
  }

  return (
    <tr>
      <td>
        <button onClick={deleteItem} className="btn btn-sm btn-error">×</button>
      </td>
      <td>{item.product.name}</td>
      <td>{item.product.price}€</td>
      <td>
        <input type="number" className="input validator" required placeholder="Quantity" 
          min="1" max={item.product.stock} value={item.quantity} onChange={(input) => changeQuantity(input.target.value)} />
      </td>
      <td>{(item.quantity * item.product.price).toFixed(2)}€</td>
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