import { Client, OrderedProduct } from '@/models';
import { Order } from '../../models/order';
import AuthService from './auth.service';
export class OrderService {
  static async confirmOrder(orderData: Order) {
    sessionStorage.setItem("orderConfirmed", "true");
    await this.sendOrderToBack(orderData)
  }

  static redirectToCheckout() {
    window.location.href = "/checkout";
  }

  static async sendOrderToBack(order: Order) {
    const token = AuthService.getToken();
    console.log(token, JSON.stringify(order))
    setTimeout(() => {
      console.log("Order sent to back:", order);
    }, 10000);
    const response = await fetch("http://localhost:1338/api/orders", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
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