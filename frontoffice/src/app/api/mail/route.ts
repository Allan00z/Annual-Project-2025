import { NextRequest, NextResponse } from 'next/server';
import { mailerService } from '@/app/services/mailler.service';
import { checkOrigin, checkAuth } from '@/app/api/middleware/auth.middleware';

export async function POST(request: NextRequest) {
  if (!checkOrigin(request)) {
    return NextResponse.json(
      { error: 'Origine non autorisée' },
      { status: 403 }
    );
  }

  // Vérifier l'authentification
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
      case 'welcome':
        const { email, username } = data;
        result = await mailerService.sendWelcomeEmail(email, username);
        break;
      case 'custom':
        const { to, subject, html, attachments } = data;
        result = await mailerService.sendEmail({ to, subject, html, attachments });
        break;
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
