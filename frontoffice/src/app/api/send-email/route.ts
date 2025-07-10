import { NextRequest, NextResponse } from 'next/server';
import { mailerService } from '../../services/mailler.service';

// Route to handle email sending requests
// This route is used to send emails, including custom emails to clients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Type et données requis' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'custom':
        if (!data.to || !data.subject || !data.message) {
          return NextResponse.json(
            { error: 'Destinataire, sujet et message requis pour l\'email personnalisé' },
            { status: 400 }
          );
        }

        const result = await mailerService.sendCustomEmailToClient(
          data.to,
          data.subject,
          data.message,
          data.orderId
        );

        return NextResponse.json({ 
          success: true, 
          messageId: result.messageId 
        });

      default:
        return NextResponse.json(
          { error: 'Type d\'email non supporté' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
}
