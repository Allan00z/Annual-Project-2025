import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

/**
 * Service to  handle email sending using Gmail SMTP
 */
class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER || '',
        pass: process.env.GMAIL_PASSWORD || '',
      },
    });
  }

  /**
   * Send an email using Gmail SMTP
   * @param options Options for the email to be sent (to, subject, html, attachments)
   * @returns Promise with the result of the email sending
   */
  async sendEmail(options: EmailOptions): Promise<nodemailer.SentMessageInfo> {
    try {
      const { to, subject, html, attachments } = options;

      const mailOptions = {
        from: process.env.GMAIL_USER || '',
        to,
        subject,
        html,
        attachments: attachments || [],
      };

      // Send the email
      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  }

  /**
   * Sends a welcome email to a new user
   * @param to Email address of the recipient
   * @param username Username of the new user
   * @returns Promise with the result of the email sending
   */
  async sendWelcomeEmail(to: string, username: string): Promise<nodemailer.SentMessageInfo> {
    const subject = 'Bienvenue sur Audelweiss';
    const html = `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333; line-height: 1.5;">
        <!-- En-tête avec logo stylisé -->
        <div style="text-align: center; padding: 20px 0; background-color: #ffffff; border-bottom: 3px solid #e8a499;">
          <h1 style="color: #e8a499; font-size: 28px; margin: 0; font-weight: 600;">AUDELWEISS</h1>
        </div>
        
        <!-- Corps du mail -->
        <div style="background-color: #ffffff; padding: 30px 20px; border-radius: 5px; margin-top: 20px;">
          <h2 style="color: #333333; font-size: 22px; margin: 0 0 20px 0;">Bienvenue, ${username}!</h2>
          <p>Merci de vous être inscrit sur Audelweiss.</p>
          <p>Vous pouvez maintenant profiter de tous nos services et découvrir notre sélection de produits.</p>
          
          <!-- Bouton de connexion stylisé aux couleurs du site -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
               style="background-color: #e8a499; 
                      color: white; 
                      padding: 12px 25px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-weight: 600;
                      display: inline-block;">CONNECTEZ-VOUS</a>
          </div>
          
          <p>À bientôt sur Audelweiss !</p>
        </div>
        
        <!-- Pied de page -->
        <div style="text-align: center; padding: 20px; color: #777777; font-size: 14px; margin-top: 20px; border-top: 1px solid #eeeeee;">
          <p><strong>L'équipe Audelweiss</strong></p>
          <p>Pour toute question, n'hésitez pas à nous contacter.</p>
        </div>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }
}

// Création d'une instance unique du service
export const mailerService = new MailerService();
