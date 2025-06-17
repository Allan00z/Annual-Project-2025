/**
 * comment service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::comment.comment', ({ strapi }) => ({
  // Fonction utilitaire pour récupérer le client d'un utilisateur
  async getClientFromUser(userId) {
    if (!userId) return null;
    
    const client = await strapi.db.query('api::client.client').findOne({
      where: { users_permissions_user: userId }
    });
    
    return client;
  }
}));
