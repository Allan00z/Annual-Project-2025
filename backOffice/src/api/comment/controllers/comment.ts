/**
 * comment controller
 * 
 */

import { factories } from '@strapi/strapi';
import { Context } from 'koa';

export default factories.createCoreController('api::comment.comment', ({ strapi }) => ({
  async create(ctx: Context) {
    // Récupérer l'utilisateur connecté depuis le contexte
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('Vous devez être connecté pour poster un commentaire');
    }

    try {
      // Chercher le client associé à l'utilisateur
      const clientData = await strapi.db.query('api::client.client').findOne({
        where: { users_permissions_user: user.id },
      });
      
      if (!clientData) {
        return ctx.badRequest('Aucun profil client associé à cet utilisateur');
      }

      // S'assurer que nous avons une structure de données correcte
      const requestData = ctx.request.body.data || {};
      
      // Vérifier si nous avons un article
      if (!requestData.article) {
        return ctx.badRequest('Un article doit être spécifié');
      }
      
      try {
        const articleId = requestData.article;
        
        // Créer les données dans le format attendu par Strapi
        const sanitizedData = {
          content: requestData.content,
          client: clientData.id,
          article: articleId
        };
        
        // Créer le commentaire
        const entity = await strapi.service('api::comment.comment').create({ 
          data: sanitizedData,
          populate: ['client', 'article']
        });
                
        // Retourner une réponse formatée
        const sanitizedEntity = await strapi.entityService.findOne(
          'api::comment.comment', 
          entity.id, 
          { populate: ['client', 'article'] }
        );
        
        // Envoyer la réponse au client
        return ctx.send({
          data: sanitizedEntity
        });
      } catch (createError) {
        console.error('Erreur lors de la création du commentaire:', createError);
        return ctx.badRequest(`Erreur lors de la création du commentaire: ${createError.message}`);
      }
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
      return ctx.badRequest(`Une erreur s'est produite: ${error.message}`);
    }
  }
}));
