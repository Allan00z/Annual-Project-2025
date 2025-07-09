import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Stripe configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-06-30.basil',
});

// Route to verify payment status
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID requis' }, { status: 400 });
    }

    // Get the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 });
    }

    // Check if the session is completed
    let paymentIntent = null;
    if (session.payment_intent) {
      paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
    }

    // Return the payment status and session details
    return NextResponse.json({
      status: session.payment_status,
      paymentIntent: paymentIntent,
      session: {
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_email,
        metadata: session.metadata,
      },
    });

  } catch (error) {
    console.error('Erreur lors de la vérification du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du paiement' },
      { status: 500 }
    );
  }
}
