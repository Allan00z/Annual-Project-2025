import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Stripe configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51RaunhRoYDtl03njTkNmeyOLa08DYTGLkhRUz8w4sa4o2x0Ulyl3eodM69Kv2r75Pecc7Op0vacF92r74JkWsW8p00TRNHpmBW', {
  apiVersion: '2025-06-30.basil',
});

// Route to retrieve Stripe checkout session details
// This route handles the retrieval of details for a specific Stripe checkout session
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID requis' }, { status: 400 });
    }

    // Get the Stripe session details using the session ID
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 });
    }

    // Return the session details in the response
    return NextResponse.json({
      session: {
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_email,
        payment_status: session.payment_status,
        metadata: session.metadata,
        created: session.created,
      },
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des détails de la session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des détails de la session' },
      { status: 500 }
    );
  }
}
