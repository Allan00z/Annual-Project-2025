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
    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
    const response = await fetch(`${STRAPI_URL}/api/orders`, {
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
      
      const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
      // Create ordered products first
      if (orderData.ordered_products && orderData.ordered_products.length > 0) {
        for (const orderedProduct of orderData.ordered_products) {
          const requestBody: any = {
            data: {
              quantity: orderedProduct.quantity,
              product: orderedProduct.product?.documentId || orderedProduct.product?.id,
            }
          };

          // Add option if it exists
          if (orderedProduct.option) {
            requestBody.data.option = orderedProduct.option.documentId || orderedProduct.option.id;
          }

          const orderedProductResponse = await fetch(`${STRAPI_URL}/api/ordered-products`, {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          if (!orderedProductResponse.ok) {
            throw new Error(`Erreur lors de la création du produit commandé: ${orderedProductResponse.status}`);
          }

          const orderedProductData = await orderedProductResponse.json();
          orderedProductsIds.push(orderedProductData.data.documentId);
        }
      }

      // Create the order with the ordered products
      const orderResponse = await fetch(`${STRAPI_URL}/api/orders`, {
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
        await fetch(`${STRAPI_URL}/api/ordered-products/${orderedProductId}`, {
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
        const basePrice = orderedProduct.product?.price || 0;
        const optionPrice = orderedProduct.option?.priceModifier || 0;
        const finalPrice = basePrice + optionPrice;
        const subtotal = finalPrice * quantity;
        total += subtotal;
        
        details += `• ${productName}\n`;
        if (orderedProduct.option) {
          details += `  Option: ${orderedProduct.option.name} (${optionPrice >= 0 ? '+' : ''}${optionPrice.toFixed(2)} €)\n`;
        }
        details += `  Quantité: ${quantity}\n`;
        details += `  Prix unitaire: ${finalPrice.toFixed(2)} €\n`;
        details += `  Sous-total: ${subtotal.toFixed(2)} €\n\n`;
      }
      
      details += "═".repeat(50) + "\n";
      details += `TOTAL: ${total.toFixed(2)} €\n`;
    }
    
    return details;
  }

  /**
   * Gets orders for a specific client
   * @param clientId - The client document ID
   * @returns {Promise<Order[]>} - Array of orders for the client
   */
  static async getClientOrders(clientId: string): Promise<Order[]> {
    const token = AuthService.getToken();
    if (!token) {
      throw new Error("Token d'authentification manquant");
    }

    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
    const response = await fetch(`${STRAPI_URL}/api/orders?populate[ordered_products][populate][0]=product&populate[ordered_products][populate][1]=option&populate=client&filters[client][documentId][$eq]=${clientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des commandes: ${response.status}`);
    }

    const data = await response.json();
    console.log('Orders API response:', data);
    return data.data || [];
  }

  /**
   * Gets orders for the current user's client
   * @returns {Promise<Order[]>} - Array of orders for the current user
   */
  static async getCurrentUserOrders(): Promise<Order[]> {
    const currentUserClient = await AuthService.getCurrentUserClient();
    console.log('Current user client data:', currentUserClient);
    
    if (!currentUserClient || !currentUserClient.client) {
      console.log('No client found for current user');
      return [];
    }

    console.log('Client documentId:', currentUserClient.client.documentId);
    return this.getClientOrders(currentUserClient.client.documentId);
  }

  /**
   * Gets a specific order by its document ID
   * @param documentId - The order document ID
   * @returns {Promise<Order>} - The order details
   */
  static async getOrderByDocumentId(documentId: string): Promise<Order> {
    const token = AuthService.getToken();
    if (!token) {
      throw new Error("Token d'authentification manquant");
    }

    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
    const response = await fetch(`${STRAPI_URL}/api/orders/${documentId}?populate[ordered_products][populate][0]=product&populate[ordered_products][populate][1]=option&populate=client`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de la commande: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Gets all orders for admin management
   * @param filters - Optional filters for the orders
   * @returns {Promise<{ data: Order[], meta: any }>} - Array of all orders with metadata
   */
  static async getAllOrders(filters?: {
    done?: boolean;
    sortBy?: 'date' | 'client' | 'total';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  }): Promise<{ data: Order[], meta: any }> {
    const token = AuthService.getToken();
    if (!token) {
      throw new Error("Token d'authentification manquant");
    }

    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
    
    // Populate client with its user relation and ordered_products with their products and options
    let queryParams = 'populate[0]=client.users_permissions_user&populate[1]=ordered_products.product&populate[2]=ordered_products.option';
    
    // Add filters
    if (filters?.done !== undefined) {
      queryParams += `&filters[done][$eq]=${filters.done}`;
    }
    
    // Add sorting
    if (filters?.sortBy) {
      const sortField = filters.sortBy === 'date' ? 'createdAt' 
                       : filters.sortBy === 'client' ? 'client.firstname' 
                       : 'createdAt';
      const sortDirection = filters.sortOrder || 'desc';
      queryParams += `&sort=${sortField}:${sortDirection}`;
    }
    
    // Add pagination
    if (filters?.page && filters?.pageSize) {
      queryParams += `&pagination[page]=${filters.page}&pagination[pageSize]=${filters.pageSize}`;
    }

    const response = await fetch(`${STRAPI_URL}/api/orders?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des commandes: ${response.status}`);
    }

    const data = await response.json();
    return { data: data.data || [], meta: data.meta || {} };
  }

  /**
   * Updates an order status (done/pending)
   * @param orderId - The order document ID
   * @param done - Whether the order is completed
   * @returns {Promise<Order>} - The updated order
   */
  static async updateOrderStatus(orderId: string, done: boolean): Promise<Order> {
    const token = AuthService.getToken();
    if (!token) {
      throw new Error("Token d'authentification manquant");
    }

    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
    const response = await fetch(`${STRAPI_URL}/api/orders/${orderId}?populate[0]=client.users_permissions_user&populate[1]=ordered_products.product&populate[2]=ordered_products.option`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          done: done
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la mise à jour de la commande: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Get order statistics for admin dashboard
   * @returns {Promise<object>} - Order statistics
   */
  static async getOrderStatistics(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
  }> {
    const token = AuthService.getToken();
    if (!token) {
      throw new Error("Token d'authentification manquant");
    }

    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
    
    try {
      // Get all orders with products and options for revenue calculation
      const response = await fetch(`${STRAPI_URL}/api/orders?populate[0]=ordered_products.product&populate[1]=ordered_products.option`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des statistiques: ${response.status}`);
      }

      const data = await response.json();
      const orders = data.data || [];

      const totalOrders = orders.length;
      const pendingOrders = orders.filter((order: Order) => !order.done).length;
      const completedOrders = orders.filter((order: Order) => order.done).length;
      
      // Calculate total revenue from completed orders
      const totalRevenue = orders
        .filter((order: Order) => order.done)
        .reduce((total: number, order: Order) => {
          const orderTotal = order.ordered_products?.reduce((orderSum, orderedProduct) => {
            const basePrice = orderedProduct.product?.price || 0;
            const optionPrice = orderedProduct.option?.priceModifier || 0;
            const finalPrice = basePrice + optionPrice;
            const quantity = orderedProduct.quantity || 0;
            return orderSum + (finalPrice * quantity);
          }, 0) || 0;
          return total + orderTotal;
        }, 0);

      return {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0
      };
    }
  }
}