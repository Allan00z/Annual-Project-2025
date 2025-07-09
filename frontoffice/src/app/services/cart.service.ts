import { OrderedProduct } from '../../models';

// Service to manage the shopping cart in local storage
export class CartService {
  private static readonly CART_KEY = 'cart';

  /**
   * Get the cart from local storage.
   * @returns {OrderedProduct[]} The list of products in the cart.
   */
  static getCart(): OrderedProduct[] {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(this.CART_KEY) ?? '[]');
  }

  /**
   * Set the cart in local storage.
   * @param {OrderedProduct[]} cart - The list of products to set in the cart.
   */
  static setCart(cart: OrderedProduct[]): void {
    if (typeof window === 'undefined') return;
    // Set the cart in local storage
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    // Dispatch a custom event to notify that the cart has been updated
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  /**
   * Add a product to the cart.
   * @param {any} product - The product to add to the cart.
   * @param {number} [quantity=1] - The quantity of the product to add. Defaults to 1.
   */
  static addToCart(product: any, quantity: number = 1): void {
    const existingCart = this.getCart();
    const existingItemIndex = existingCart.findIndex(item => item.product?.documentId === product.documentId);
    
    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push({
        id: 0,
        createdAt: "",
        updatedAt: "",
        quantity: quantity,
        product: product,
        documentId: ""
      });
    }
    
    this.setCart(existingCart);
  }

  /**
   * Remove a product from the cart.
   * @param {string} productId - The ID of the product to remove from the cart.
   */
  static removeFromCart(productId: string): void {
    const existingCart = this.getCart();
    const updatedCart = existingCart.filter(item => item.product?.documentId !== productId);
    this.setCart(updatedCart);
  }

  /**
   * Update the quantity of a product in the cart.
   * @param {string} productId - The ID of the product to update.
   * @param {number} quantity - The new quantity of the product.
   */
  static updateQuantity(productId: string, quantity: number): void {
    const existingCart = this.getCart();
    const updatedCart = existingCart.map(item => 
      item.product?.documentId === productId ? { ...item, quantity } : item
    );
    this.setCart(updatedCart);
  }

  /**
   * Clear the cart.
   */
  static clearCart(): void {
    this.setCart([]);
  }

  /**
   * Get the total number of items in the cart.
   * @returns {number} The total number of items in the cart.
   */
  static getCartCount(): number {
    return this.getCart().reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Get the total price of items in the cart.
   * @returns {number} The total price of items in the cart.
   */
  static getCartTotal(): number {
    return this.getCart().reduce((total, item) => total + ((item.product?.price ?? 0) * item.quantity), 0);
  }
}
