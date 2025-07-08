import { Client, OrderedProduct } from '@/models';
import { Order } from '../../models/order';
export class OrderService {
  static confirmOrder(orderData: Order) {
    sessionStorage.setItem("orderConfirmed", "true");
    this.sendOrderToBack(orderData)
  }

  static redirectToCheckout() {
    window.location.href = "/checkout";
  }

  static async sendOrderToBack(order: Order) {
    const response = await fetch("http://localhost:1338/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    })
    .then((response) => response.json())
    .then((data) => {
      console.log("Order sent to back:", data);
    })
    .catch((error) => {
      console.error("Error sending order to back:", error);
    });
    return response;
  }

  static redirectToConfirmation() {
    window.location.href = "/order-confirmation";
  }
}