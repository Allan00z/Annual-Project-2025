'use client';

import { useState, useEffect } from 'react';
import { Comment } from '../models/comment';
import AuthService from '../app/services/auth.service';
import CommentService from '../app/services/comment.service';
import DeleteCommentModal from './delete-comment-modal.component';

interface CommentSectionProps {
  articleId: string;
  initialComments: Comment[];
}

export default function CommentSection({ articleId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      const loggedIn = AuthService.isLoggedIn();
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        try {
          const ownerRole = await AuthService.checkUserRole('owner');
          setIsOwner(ownerRole);
        } catch (error) {
          console.error('Erreur lors de la vérification du rôle:', error);
          setIsOwner(false);
        }
      } else {
        setIsOwner(false);
      }
    };
    
    checkAuthAndRole();
    
    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuthAndRole();
    };
    
    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
  }, []);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      setError('Veuillez saisir un commentaire');
      return;
    }

    if (!isLoggedIn) {
      setError('Vous devez être connecté pour poster un commentaire');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const currentUser = AuthService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('Utilisateur non authentifié');
      }

      // Récupérer les informations du client associé à l'utilisateur
      const userWithClient = await AuthService.getCurrentUserClient();

      if (!userWithClient?.client) {
        throw new Error('Aucun profil client associé à votre compte');
      }

      // Soumettre le commentaire
      await CommentService.createComment({
        content: newComment.trim(),
        article: articleId,
        client: userWithClient.client.documentId,
      });
      
      // Recharger les commentaires pour récupérer les données complètes depuis l'API
      const updatedComments = await CommentService.getArticleComments(articleId);
      setComments(updatedComments);
      setNewComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentDocumentId: string) => {
    if (!isOwner) {
      setError('Vous n\'avez pas les permissions nécessaires pour supprimer ce commentaire');
      return;
    }

    const comment = comments.find(c => c.documentId === commentDocumentId);
    if (!comment) return;

    setCommentToDelete(comment);
    setShowDeleteModal(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    setDeletingCommentId(commentToDelete.documentId);
    setError(null);

    try {
      await CommentService.deleteComment(commentToDelete.documentId);
      
      // Retirer le commentaire de la liste
      setComments(prevComments => prevComments.filter(comment => comment.documentId !== commentToDelete.documentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la suppression');
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCommentToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-12 border-t pt-8">
      <h3 className="text-2xl font-bold mb-6">
        Commentaires ({comments.length})
      </h3>

      {/* Formulaire de commentaire */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Ajouter un commentaire
            </label>
            <textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Partagez votre avis sur cet article..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-vertical"
              disabled={isSubmitting}
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-md transition-colors"
          >
            {isSubmitting ? 'Publication...' : 'Publier le commentaire'}
          </button>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-100 rounded-lg">
          <p className="text-gray-600">
            <a href="/login" className="text-pink-500 hover:text-pink-600">Connectez-vous</a> pour laisser un commentaire.
          </p>
        </div>
      )}

      {/* Liste des commentaires */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 italic">Aucun commentaire pour le moment. Soyez le premier à commenter !</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                    <div className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                    {comment.client?.firstname ? comment.client.firstname.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      {comment.client ? `${comment.client.firstname} ${comment.client.lastname.charAt(0).toUpperCase()}.` : 'Utilisateur'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
                {/* Bouton de suppression de commentaire */}
                {isOwner && (
                  <button
                    onClick={() => handleDeleteComment(comment.documentId)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={deletingCommentId === comment.documentId}
                    title="Supprimer le commentaire"
                  >
                    {deletingCommentId === comment.documentId ? 'Suppression...' : 'Supprimer'}
                  </button>
                )}
              </div>
              <p className="text-gray-700 leading-relaxed ml-11">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      <DeleteCommentModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDeleteComment}
        commentAuthor={
          commentToDelete?.client 
            ? `${commentToDelete.client.firstname} ${commentToDelete.client.lastname.charAt(0).toUpperCase()}.`
            : 'Utilisateur'
        }
        isDeleting={deletingCommentId === commentToDelete?.documentId}
      />
    </div>
  );
}
