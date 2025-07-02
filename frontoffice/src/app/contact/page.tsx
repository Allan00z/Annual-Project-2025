"use client";

import { useState, FormEvent, useEffect } from "react";
import AuthService from "../services/auth.service";
import { User } from "../services/auth.service";
import { ContactMsg } from "@/models/contact-msg";
import contactBg from "../../medias/images/crochet-bg_files/4b016c7372b5440180c5e265eed458d1-scaled.webp";
import ReplyModal from "../../component/reply-modal.component";

interface ContactMsgResponse {
  data: ContactMsg[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export default function Contact() {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [roleChecked, setRoleChecked] = useState<boolean>(false);
  
  const [contactMessages, setContactMessages] = useState<ContactMsg[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  
  const [isReplyModalOpen, setIsReplyModalOpen] = useState<boolean>(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMsg | null>(null);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);
  
  const [firstname, setFirstname] = useState<string>("");
  const [lastname, setLastname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const initializePage = async () => {
      const user: User | null = AuthService.getCurrentUser();
      
      if (user) {
        const hasOwnerRole = await AuthService.checkUserRole("owner");
        setIsOwner(hasOwnerRole);
        
        if (hasOwnerRole) {
          await fetchContactMessages();
        } else {
          await fetchClientData(user);
        }
      }
      
      setRoleChecked(true);
    };

    initializePage();
  }, []);

  const fetchContactMessages = async () => {
    setLoadingMessages(true);
    try {
      const token = AuthService.getToken();
      if (!token) return;

      const response = await fetch("http://localhost:1338/api/contact-msgs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: ContactMsgResponse = await response.json();
        setContactMessages(data.data);
      } else {
        console.error("Erreur lors de la récupération des messages de contact");
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des messages de contact:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchClientData = async (user: User) => {
    try {
      const token = AuthService.getToken();
      if (!token) return;

      const response = await fetch(`http://localhost:1338/api/clients?populate=*&filters[users_permissions_user][id]=${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const clientData = data.data[0].attributes;
          setFirstname(clientData.firstname || "");
          setLastname(clientData.lastname || "");
          setEmail(user.email);
        }
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des données client:", err);
    }
    
    setEmail(user.email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (!firstname || !lastname || !email || !content) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    try {
      const token = AuthService.getToken();
      
      const contactData: Partial<ContactMsg> = {
        firstname,
        lastname,
        email,
        content
      };

      const response = await fetch("http://localhost:1338/api/contact-msgs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ data: contactData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Une erreur s'est produite lors de l'envoi du message");
      }

      setSuccess(true);
      setFirstname("");
      setLastname("");
      setEmail("");
      setContent("");
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteMessage = async (messageId: string | number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
      return;
    }

    try {
      const token = AuthService.getToken();
      if (!token) return;

      const response = await fetch(`http://localhost:1338/api/contact-msgs/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchContactMessages();
      } else {
        setError("Erreur lors de la suppression du message");
      }
    } catch (err) {
      setError("Erreur lors de la suppression du message");
    }
  };

  const handleReplyClick = (message: ContactMsg) => {
    setSelectedMessage(message);
    setIsReplyModalOpen(true);
  };

  const handleReplySuccess = async (messageId: string | number) => {
    setReplySuccess("Réponse envoyée avec succès !");
    
    try {
      const token = AuthService.getToken();
      if (!token) return;

      const response = await fetch(`http://localhost:1338/api/contact-msgs/${messageId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Actualiser la liste des messages
        await fetchContactMessages();
        setReplySuccess("Réponse envoyée avec succès ! Le message a été retirer.");
      } else {
        setReplySuccess("Réponse envoyée avec succès, mais erreur lors du retrait message.");
      }
    } catch (err) {
      setReplySuccess("Réponse envoyée avec succès, mais erreur lors du retrait du message.");
    }
    
    setTimeout(() => setReplySuccess(null), 5000);
  };

  if (!roleChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#f7c0a6] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (isOwner) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-[#f7c0a6] text-white py-12">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl font-bold text-center">Messages de Contact</h1>
            <p className="text-center mt-4 text-lg">Gérez les messages reçus via le formulaire de contact</p>
          </div>
        </section>

        <div className="container mx-auto py-12 px-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p>{error}</p>
            </div>
          )}

          {replySuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <p>{replySuccess}</p>
            </div>
          )}

          {loadingMessages ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#f7c0a6] mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des messages...</p>
            </div>
          ) : contactMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">Aucun message de contact pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Messages reçus ({contactMessages.length})
                </h2>
                <button
                  onClick={fetchContactMessages}
                  className="px-4 py-2 bg-[#f7c0a6] text-white rounded-md hover:bg-[#e8a499] transition-colors"
                >
                  Actualiser
                </button>
              </div>

              {contactMessages.map((message) => (
                <div key={message.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#f7c0a6]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {message.firstname} {message.lastname}
                      </h3>
                      <p className="text-gray-600">{message.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Reçu le {formatDate(message.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteMessage(message.documentId)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Supprimer le message"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-800 mb-2">Message :</h4>
                    <p className="text-gray-700 break-words whitespace-pre-line">{message.content}</p>
                  </div>

                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => handleReplyClick(message)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Répondre
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedMessage && (
          <ReplyModal
            isOpen={isReplyModalOpen}
            onClose={() => setIsReplyModalOpen(false)}
            message={selectedMessage}
            onReplySuccess={handleReplySuccess}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section 
        className="relative bg-cover bg-center h-96 flex items-center justify-center"
        style={{ backgroundImage: `url(${contactBg.src})` }}
      >
        <div className="relative z-10 text-center text-white bg-black/50 p-6 rounded-lg">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Contactez-nous</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto px-4">
            Nous sommes là pour répondre à toutes vos questions et vous accompagner dans vos projets au crochet
          </p>
        </div>
      </section>

      <div className="container mx-auto py-12 px-6">
        <div className="max-w-2xl mx-auto">
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <p>Votre message a bien été envoyé ! Nous vous répondrons, par e-mail, dans les plus brefs délais.</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <p>{error}</p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Envoyez-nous un message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstname" className="block text-sm font-medium mb-2">
                Prénom *
              </label>
              <input
                type="text"
                id="firstname"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7c0a6]"
                required
              />
            </div>

            <div>
              <label htmlFor="lastname" className="block text-sm font-medium mb-2">
                Nom *
              </label>
              <input
                type="text"
                id="lastname"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7c0a6]"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7c0a6]"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Message *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f7c0a6]"
              required
            ></textarea>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#f7c0a6] text-white rounded-md hover:bg-[#e8a499] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f7c0a6] focus:ring-offset-2"
            >
              {loading ? "Envoi en cours..." : "Envoyer le message"}
            </button>
          </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  );
}
