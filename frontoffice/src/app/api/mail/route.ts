import { NextRequest, NextResponse } from 'next/server';
import { mailerService } from '@/app/services/mailler.service';
import { checkOrigin, checkAuth } from '@/app/api/middleware/auth.middleware';

/**
 * Route to handle email sending requests.
 * This route checks the origin and authentication before processing the request.
 *
 * @param {NextRequest} request - The incoming request object.
 * @returns {NextResponse} - The response object containing the result of the email sending operation.
 */
export async function POST(request: NextRequest) {
  // Check if the request origin is allowed
  if (!checkOrigin(request)) {
    return NextResponse.json(
      { error: 'Origine non autorisée' },
      { status: 403 }
    );
  }

  // Check if the user is authenticated
  const isAuthenticated = await checkAuth(request);
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    let result;
    switch (type) {
      case 'contact': {
        const { to: contactTo, message, originalMessage } = data;
        result = await mailerService.sendContactResponseEmail(contactTo, message, originalMessage);
        break;
      }
      case 'custom': {
        const { to: customTo, subject, html, attachments } = data;
        result = await mailerService.sendEmail({ to: customTo, subject, html, attachments });
        break;
      }
      default:
        return NextResponse.json(
          { error: 'Type d\'email non reconnu' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
}
