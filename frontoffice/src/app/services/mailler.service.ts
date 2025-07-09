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
   * Send a contact response email
   * @param to Recipient's email address
   * @param message The response message to be sent
   * @param originalMessage The original message from the user (optional)
   * @returns Promise with the result of the email sending
   */
  async sendContactResponseEmail(to: string, message: string, originalMessage?: string): Promise<nodemailer.SentMessageInfo> {
    const subject = 'Réponse à votre message';
    const html = `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333; line-height: 1.5;">
        <!-- En-tête avec logo stylisé -->
        <div style="text-align: center; padding: 20px 0; background-color: #ffffff; border-bottom: 3px solid #e8a499;">
          <h1 style="color: #e8a499; font-size: 28px; margin: 0; font-weight: 600;">AUDELWEISS</h1>
        </div>
        
        <!-- Corps du mail -->
        <div style="background-color: #ffffff; padding: 30px 20px; border-radius: 5px; margin-top: 20px;">
          <h2 style="color: #333333; font-size: 22px; margin: 0 0 20px 0;">Réponse à votre message</h2>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #e8a499; margin-bottom: 20px;">
            <h4 style="color: #666; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase;">Votre message original :</h4>
            <p style="margin: 0; color: #666; font-style: italic;">${originalMessage || 'Message non disponible'}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h4 style="color: #333; margin: 0 0 10px 0;">Notre réponse :</h4>
            <div style="color: #333; white-space: pre-line;">${message}</div>
          </div>
          
          <p style="margin-top: 30px;">Cordialement,<br><strong>L'équipe Audelweiss</strong></p>
        </div>
        
        <!-- Pied de page -->
        <div style="text-align: center; padding: 20px; color: #777777; font-size: 14px; margin-top: 20px; border-top: 1px solid #eeeeee;">
          <p>Pour toute question supplémentaire, n'hésitez pas à nous recontacter.</p>
          <p><strong>L'équipe Audelweiss</strong></p>
        </div>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send an order confirmation email
   * @param to Recipient's email address
   * @param orderDetails Details of the order to be included in the email
   * @returns Promise with the result of the email sending
   */
  async sendOrderConfirmationEmail(to: string, orderDetails: string): Promise<nodemailer.SentMessageInfo> {
    console.log('Envoi de l\'email de confirmation à:', to);
    
    const subject = 'Confirmation de votre commande - Audelweiss';
    const html = `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333; line-height: 1.5;">
        <div style="text-align: center; padding: 20px 0; background-color: #ffffff; border-bottom: 3px solid #e8a499;">
          <h1 style="color: #e8a499; font-size: 28px; margin: 0; font-weight: 600;">AUDELWEISS</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px 20px; border-radius: 5px; margin-top: 20px;">
          <h2 style="color: #333333; font-size: 22px; margin: 0 0 20px 0;">Merci pour votre commande !</h2>
          
          <p>Bonjour,</p>
          
          <p>Votre commande a été confirmée avec succès. Voici les détails :</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #e8a499; margin-bottom: 20px;">
            <pre style="margin: 0; white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 14px;">${orderDetails}</pre>
          </div>
          <p>Nous vous remercions pour votre confiance et restons à votre disposition pour toute question.</p>
          
          <p>Cordialement,<br><strong>L'équipe Audelweiss</strong></p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #777777; font-size: 14px; margin-top: 20px; border-top: 1px solid #eeeeee;">
          <p>Pour toute question supplémentaire, n'hésitez pas à nous recontacter.</p>
          <p><strong>L'équipe Audelweiss</strong></p>
        </div>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }
}

export const mailerService = new MailerService();