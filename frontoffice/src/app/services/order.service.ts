import { Client, OrderedProduct } from '@/models';
import { Order } from '../../models/order';
import AuthService from './auth.service';

/**
 * Service that handles order-related operations
 * @module OrderService
 */
export class OrderService {
  /**
   * Confirms the order by saving it in session storage and sending it to the backend
   * @param orderData - The order data to confirm
   */
  static async confirmOrder(orderData: Order) {
    sessionStorage.setItem("orderConfirmed", "true");
    await this.sendOrderToBack(orderData)
  }

  /**
   * Checks if an order is confirmed by looking for a specific key in session storage
   * @returns {boolean} - True if the order is confirmed, false otherwise
   */
  static redirectToCheckout() {
    window.location.href = "/checkout";
  }

  /**
   * Sends the order to the backend API
   * @param order - The order to send
   * @returns {Promise<Response>} - The response from the backend API
   */
  static async sendOrderToBack(order: Order) {
    // Get the authentication token from AuthService
    const token = AuthService.getToken();

    // Check if the token exists
    if (!token) {
      console.error('Token d\'authentification manquant - commande non envoyée');
      return null;
    }

    // Send the order to the backend API 
    const response = await fetch("http://localhost:1338/api/orders", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    })
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error sending order to back:", error);
    });
    return response;
  }

  /**
   * Redirects the user to the order confirmation page
   */
  static redirectToConfirmation() {
    window.location.href = "/order-confirmation";
  }

  /**
   * Saves the order after payment by creating ordered products first, then the order itself
   * @param orderData - The order data to save
   * @param customerEmail - The email of the customer
   * @returns {Promise<any>} - The saved order data or null if the token is missing
   * @throws {Error} - If there is an error during the saving process
   */
  static async saveOrderAfterPayment(orderData: Order, customerEmail: string): Promise<any> {
    const token = AuthService.getToken();
    
    if (!token) {
      console.error('Token d\'authentification manquant - commande non sauvegardée en base');
      return null;
    }

    try {
      // Get the current user client
      const currentUserClient = await AuthService.getCurrentUserClient();
      
      if (!currentUserClient || !currentUserClient.client) {
        console.error('Client non trouvé - commande non sauvegardée en base');
        return null;
      }

      const orderedProductsIds: string[] = [];
      
      // Create ordered products first
      if (orderData.ordered_products && orderData.ordered_products.length > 0) {
        for (const orderedProduct of orderData.ordered_products) {
          const orderedProductResponse = await fetch("http://localhost:1338/api/ordered-products", {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                quantity: orderedProduct.quantity,
                product: orderedProduct.product?.documentId || orderedProduct.product?.id,
              }
            }),
          });

          if (!orderedProductResponse.ok) {
            throw new Error(`Erreur lors de la création du produit commandé: ${orderedProductResponse.status}`);
          }

          const orderedProductData = await orderedProductResponse.json();
          orderedProductsIds.push(orderedProductData.data.documentId);
        }
      }

      // Create the order with the ordered products
      const orderResponse = await fetch("http://localhost:1338/api/orders", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            client: currentUserClient.client.documentId,
            ordered_products: orderedProductsIds,
          }
        }),
      });

      if (!orderResponse.ok) {
        throw new Error(`Erreur lors de la création de la commande: ${orderResponse.status}`);
      }

      const orderResult = await orderResponse.json();

      // Update each ordered product with the order ID
      for (const orderedProductId of orderedProductsIds) {
        await fetch(`http://localhost:1338/api/ordered-products/${orderedProductId}`, {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              order: orderResult.data.documentId,
            }
          }),
        });
      }

      // Send order confirmation email
      try {
        const orderDetails = this.formatOrderDetails(orderData, orderResult.data.documentId);
        
        // S'assurer qu'on a un email valide
        if (!customerEmail || !customerEmail.includes('@')) {
          console.error('Email client manquant ou invalide pour l\'envoi de confirmation:', customerEmail);
          return orderResult;
        }
        
        const emailResponse = await fetch('/api/mail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: 'order',
            data: {
              to: customerEmail,
              orderDetails: orderDetails
            }
          }),
        });

        if (emailResponse.ok) {
          console.log('Email de confirmation envoyé avec succès à:', customerEmail);
        } else {
          const errorText = await emailResponse.text();
          console.error('Erreur lors de l\'envoi de l\'email de confirmation:', errorText);
        }
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
      }

      return orderResult;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la commande:", error);
      throw error;
    }
  }

  /**
   * Formats order details for email display
   * @param orderData - The order data
   * @param orderId - The order ID
   * @returns {string} - Formatted order details
   */
  private static formatOrderDetails(orderData: Order, orderId: string): string {
    let details = `Numéro de commande: ${orderId}\n`;
    details += `Date: ${new Date().toLocaleString('fr-FR')}\n\n`;
    
    if (orderData.ordered_products && orderData.ordered_products.length > 0) {
      details += "Produits commandés:\n";
      details += "═".repeat(50) + "\n";
      
      let total = 0;
      for (const orderedProduct of orderData.ordered_products) {
        const productName = orderedProduct.product?.name || 'Produit inconnu';
        const quantity = orderedProduct.quantity || 1;
        const price = orderedProduct.product?.price || 0;
        const subtotal = price * quantity;
        total += subtotal;
        
        details += `• ${productName}\n`;
        details += `  Quantité: ${quantity}\n`;
        details += `  Prix unitaire: ${price.toFixed(2)} €\n`;
        details += `  Sous-total: ${subtotal.toFixed(2)} €\n\n`;
      }
      
      details += "═".repeat(50) + "\n";
      details += `TOTAL: ${total.toFixed(2)} €\n`;
    }
    
    return details;
  }
}