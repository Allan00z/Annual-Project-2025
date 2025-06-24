// import type { Core } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';

// Fonction pour obtenir un élément aléatoire d'un tableau
const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    // Load default data for Article Categories and Articles
    const createDefaultData = async () => {
      // Check if Article Categories exist, if not, load from JSON
      const existingArticleCategory = await strapi.db.query('api::article-category.article-category').findMany();
      if (existingArticleCategory.length === 0) {
        console.log('Loading default Article Categories data from JSON...');
        const articleCategoriesPath = path.join(__dirname, 'data', 'article-categories.json');
        try {
          const articleCategoriesData = JSON.parse(fs.readFileSync(articleCategoriesPath, 'utf8'));
          for (const category of articleCategoriesData) {
        await strapi.entityService.create('api::article-category.article-category', {
          data: {
            ...category,
            publishedAt: new Date()
          }
        });
          }
          console.log(`${articleCategoriesData.length} default Article Categories created successfully`);
        } catch (error) {
          console.error('Error loading default Article Categories from JSON:', error);
        }
      }     
      
      // Check if Articles exist, if not, load from JSON and associate with random Article Categories
      const existingArticle = await strapi.db.query('api::article.article').findMany();
      if (existingArticle.length === 0) {
        console.log('Loading default Articles data from JSON...');
        const articlesPath = path.join(__dirname, 'data', 'articles.json');
        const articleCategories = await strapi.db.query('api::article-category.article-category').findMany();  
        try {
          const articlesData = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
            for (const article of articlesData) {
              const randomCategory = getRandomElement(articleCategories);
              await strapi.entityService.create('api::article.article', {
                data: {
                  ...article,
                  publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
                  article_category: randomCategory.id, // Association avec la catégorie aléatoire
                },
              });
          }
          console.log(`${articlesData.length} default Articles created successfully with random categories`);
        } catch (error) {
          console.error('Error loading default Articles from JSON:', error);
        }
      }
    };

    createDefaultData();
  }
}