import { useState, FormEvent } from 'react';
import { ContactMsg } from '@/models/contact-msg';
import { AuthService } from '@/app/services/auth.service';

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: ContactMsg;
  onReplySuccess: (messageId: string | number) => void;
}

export default function ReplyModal({ isOpen, onClose, message, onReplySuccess }: ReplyModalProps) {
  const [replyContent, setReplyContent] = useState<string>('');
  const [subject, setSubject] = useState<string>(`Réponse à votre message`);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!replyContent.trim()) {
      setError('Veuillez saisir un message de réponse');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = AuthService.getToken();
      if (!token) {
        setError('Vous devez être connecté pour envoyer une réponse');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'contact',
          data: {
            to: message.email,
            message: replyContent,
            originalMessage: message.content
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi de la réponse');
      }

      onReplySuccess(message.documentId || message.id);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de la réponse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReplyContent('');
    setSubject(`Réponse à votre message - ${message.firstname} ${message.lastname}`);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Répondre à {message.firstname} {message.lastname}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-[#f7c0a6]">
            <h3 className="font-medium text-gray-800 mb-2">Message original :</h3>
            <p className="text-gray-600 text-sm mb-2">
              De : {message.firstname} {message.lastname} ({message.email})
            </p>
            <p className="text-gray-700 whitespace-pre-line break-words">{message.content}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Objet de la réponse
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7c0a6] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="replyContent" className="block text-sm font-medium text-gray-700 mb-2">
                Votre réponse *
              </label>
              <textarea
                id="replyContent"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7c0a6] focus:border-transparent resize-vertical"
                placeholder="Tapez votre réponse ici..."
                required
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#f7c0a6] text-white rounded-md hover:bg-[#e8a499] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  </span>
                ) : (
                  'Envoyer la réponse'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
