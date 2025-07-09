import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Order } from '@/models';

// Configuration Stripe
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Service that handles Stripe payment operations
// This service provides methods to create checkout sessions, redirect to Stripe Checkout, verify payments, and
export class StripeService {
  private static baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  /**
   * Create a Stripe Checkout session
   * @param order - The order to be processed
   * @return {Promise<{ sessionId: string; url: string }>} - The session ID and URL for redirection
   */
  static async createCheckoutSession(order: Order): Promise<{ sessionId: string; url: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur API:', errorData);
        throw new Error(`Erreur API: ${response.status} - ${errorData.error || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de la session Stripe:', error);
      throw error;
    }
  }

  /**
   * Redirect to Stripe Checkout
   * @param sessionId - The ID of the Stripe Checkout session
   * @return {Promise<void>} - Redirects the user to the Stripe Checkout page
   * @throws {Error} - Throws an error if Stripe is not initialized or if there is an issue with the session
   */
  static async redirectToCheckout(sessionId: string): Promise<void> {
    try {      
      const stripe = await getStripe();
      
      if (!stripe) {
        console.error('Stripe non initialisé - tentative de redirection alternative');
        
        // Try to get the session details and redirect directly if possible
        try {
          const sessionDetails = await this.getSessionDetails(sessionId);
          if (sessionDetails.session && sessionDetails.session.url) {
            window.location.href = sessionDetails.session.url;
            return;
          }
        } catch (urlError) {
          console.error('Erreur lors de la récupération de l\'URL de session:', urlError);
        }
        
        throw new Error('Stripe non initialisé - vérifiez votre clé publique');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        console.error('Erreur Stripe redirectToCheckout:', error);
        throw new Error(`Erreur Stripe: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de la redirection vers Stripe:', error);
      throw error;
    }
  }

  /**
   * Redirect to Stripe Checkout using a session ID or a direct URL
   * @param sessionData - An object containing the session ID and optionally a direct URL
   * @return {Promise<void>} - Redirects the user to the Stripe Checkout page or the direct URL
   * @throws {Error} - Throws an error if there is an issue with the session
   */
  static async redirectToCheckoutUrl(sessionData: { sessionId: string; url: string }): Promise<void> {
    try {
      if (sessionData.url) {
        console.log('Redirection directe vers l\'URL Stripe:', sessionData.url);
        window.location.href = sessionData.url;
        return;
      }

      await this.redirectToCheckout(sessionData.sessionId);
    } catch (error) {
      console.error('Erreur lors de la redirection vers Stripe:', error);
      throw error;
    }
  }

  /**
   * Check if a payment was successful
   * @param sessionId - The ID of the Stripe Checkout session
   * @return {Promise<{ status: string; paymentIntent?: any }>} - The status of the payment and optionally the payment intent
   * @throws {Error} - Throws an error if there is an issue with the payment verification
   */
  static async verifyPayment(sessionId: string): Promise<{ status: string; paymentIntent?: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la vérification du paiement');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      throw error;
    }
  }

  /**
   * Get details of a Stripe Checkout session
   * @param sessionId - The ID of the Stripe Checkout session
   * @return {Promise<any>} - The details of the session
   * @throws {Error} - Throws an error if there is an issue with fetching the session details
   */
  static async getSessionDetails(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stripe/session-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des détails de la session');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la session:', error);
      throw error;
    }
  }

  /**
   * Calculate the total amount of an order
   * @param order - The order to calculate the total for
   * @return {number} - The total amount of the order
   */
  static calculateTotal(order: Order): number {
    return order.ordered_products?.reduce((total, item) => {
      return total + ((item.product?.price ?? 0) * item.quantity);
    }, 0) ?? 0;
  }

  /**
   * Format the amount for Stripe (to cents)
   * @param amount - The amount to format
   * @return {number} - The formatted amount in cents
   */
  static formatAmountForStripe(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Format the amount from Stripe (from cents to dollars)
   * @param amount - The amount in cents from Stripe
   * @return {number} - The formatted amount in dollars
   */
  static formatAmountFromStripe(amount: number): number {
    return amount / 100;
  }
}

export default StripeService;
