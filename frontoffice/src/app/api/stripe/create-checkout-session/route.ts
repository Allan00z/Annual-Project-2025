import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { parseAddress, toStripeAddressFormat } from '@/app/utils/address.utils';

// Stripe configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil',
});

// Route to create a Stripe checkout session
// This route handles the creation of a Stripe checkout session for processing payments
export async function POST(request: NextRequest) {
  try {    
    const { order, successUrl, cancelUrl } = await request.json();
    
    // Check if the order is valid
    if (!order || !order.ordered_products || order.ordered_products.length === 0) {
      console.error('Commande invalide:', order);
      return NextResponse.json({ error: 'Commande invalide' }, { status: 400 });
    }

    // Check if the Stripe secret key is set
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY non définie');
      return NextResponse.json({ error: 'Configuration Stripe manquante' }, { status: 500 });
    }

    // Calcul total amount of the order
    const total = order.ordered_products.reduce((sum: number, item: any) => {
      return sum + ((item.product?.price ?? 0) * item.quantity);
    }, 0);

    if (total <= 0) {
      console.error('Montant total invalide:', total);
      return NextResponse.json({ error: 'Montant total invalide' }, { status: 400 });
    }

    // Create line items for Stripe
    const lineItems = order.ordered_products.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.product?.name || 'Produit',
          description: item.product?.description || '',
          images: item.product?.image ? [`${process.env.NEXT_PUBLIC_STRAPI_URL}/uploads/${item.product.image}`] : [],
        },
        unit_amount: Math.round((item.product?.price ?? 0) * 100), // Price in cents
      },
      quantity: item.quantity,
    }));

    // Prepare information for shipping and billing addresses
    const deliveryAddress = order.client?.deliveryAddress;
    const billingAddress = order.client?.billingAddress;
    let shippingAddressDefaults = {};
    let billingAddressDefaults = {};
    
    // Parse and format the delivery and billing addresses
    if (deliveryAddress?.address) {
      const parsedDeliveryAddress = parseAddress(deliveryAddress.address);
      if (parsedDeliveryAddress) {
        shippingAddressDefaults = toStripeAddressFormat(parsedDeliveryAddress);
      }
    }
    
    // Parse and format the billing address
    if (billingAddress?.address) {
      const parsedBillingAddress = parseAddress(billingAddress.address);
      if (parsedBillingAddress) {
        billingAddressDefaults = toStripeAddressFormat(parsedBillingAddress);
      }
    }

    // Prepare customer information and parse it
    const customerName = `${order.client?.firstname || ''} ${order.client?.lastname || ''}`.trim();
    let customerId;
    if (order.client?.email && customerName) {
      try {
        const existingCustomers = await stripe.customers.list({
          email: order.client.email,
          limit: 1,
        });

        if (existingCustomers.data.length > 0) {
          customerId = existingCustomers.data[0].id;
          await stripe.customers.update(customerId, {
            name: customerName,
            ...(Object.keys(shippingAddressDefaults).length > 0 && {
              shipping: {
                name: customerName,
                address: shippingAddressDefaults,
              },
            }),
            ...(Object.keys(billingAddressDefaults).length > 0 && {
              address: billingAddressDefaults,
            }),
          });
        } else {
          const customer = await stripe.customers.create({
            email: order.client.email,
            name: customerName,
            metadata: {
              clientId: order.client.id?.toString() || '',
              firstname: order.client.firstname || '',
              lastname: order.client.lastname || '',
            },
            ...(Object.keys(shippingAddressDefaults).length > 0 && {
              shipping: {
                name: customerName,
                address: shippingAddressDefaults,
              },
            }),
            ...(Object.keys(billingAddressDefaults).length > 0 && {
              address: billingAddressDefaults,
            }),
          });
          customerId = customer.id;
        }
      } catch (customerError) {
        console.error('Erreur lors de la création/mise à jour du client Stripe:', customerError);
      }
    }

    // Prepare session parameters without customer information first
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl,
      metadata: {
        orderId: order.id?.toString() || '',
        clientId: order.client?.id?.toString() || '',
        clientEmail: order.client?.email || '',
        total: total.toString(),
        clientFirstname: order.client?.firstname || '',
        clientLastname: order.client?.lastname || '',
      },
      shipping_address_collection: {
        allowed_countries: ['FR'],
      },
      billing_address_collection: 'required',
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'eur',
            },
            display_name: 'Livraison standard',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 2,
              },
              maximum: {
                unit: 'business_day',
                value: 5,
              },
            },
          },
        },
      ],
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Commande #${order.id || 'N/A'}`,
          metadata: {
            orderId: order.id?.toString() || '',
          },
        },
      },
    };

    // Add customer information - NEVER add both customer and customer_email
    if (customerId) {
      console.log('Utilisation du customer existant:', customerId);
      sessionParams.customer = customerId;
    } else if (order.client?.email) {
      console.log('Utilisation de customer_email:', order.client.email);
      sessionParams.customer_email = order.client.email;
    }

    // Create the Stripe checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error: any) {
    console.error('Erreur lors de la création de la session Stripe:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création de la session de paiement',
        details: error.message,
        type: error.type,
        code: error.code
      },
      { status: 500 }
    );
  }
}
