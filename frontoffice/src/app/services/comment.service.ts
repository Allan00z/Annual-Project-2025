import { Comment } from '../../models/comment';
import AuthService from './auth.service';

export interface CreateCommentData {
  content: string;
  article: string;
  client: string;
}

export const CommentService = {
  /**
   * Create a new comment
   * @param commentData - The data for the new comment
   * @returns Promise with the created comment
  */
  createComment: async (commentData: CreateCommentData): Promise<Comment> => {
    const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1338';
    const token = AuthService.getToken();
    
    if (!token) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await fetch(`${STRAPI_URL}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: commentData
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erreur lors de la création du commentaire');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Get comments for an article
   * @param articleId - The documentId of the article
   * @returns Promise with the list of comments
   */
  getArticleComments: async (articleId: string): Promise<Comment[]> => {
    const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1338';
    
    const response = await fetch(
      `${STRAPI_URL}/api/comments?filters[article][documentId][$eq]=${articleId}&populate=client&sort=createdAt:desc`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des commentaires');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Delete a comment
   * @param commentId - The documentId of the comment to delete
   * @returns Promise that resolves when the comment is deleted
   * @throws Error if the user is not authenticated or does not have permission
   * @throws Error if the deletion fails
   */
  deleteComment: async (commentId: string): Promise<void> => {
    const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1338';
    const token = AuthService.getToken();
    
    if (!token) {
      throw new Error('Utilisateur non authentifié');
    }

    const isOwner = await AuthService.checkUserRole('owner');
    if (!isOwner) {
      throw new Error('Vous n\'avez pas les permissions nécessaires pour supprimer ce commentaire');
    }

    const response = await fetch(`${STRAPI_URL}/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erreur lors de la suppression du commentaire');
    }
  },
};

export default CommentService;
