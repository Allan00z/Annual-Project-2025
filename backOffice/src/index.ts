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

      // Check if About data exists, if not, create default data
      const existingAbout = await strapi.db.query('api::about.about').findMany();
      if (existingAbout.length === 0) {
        console.log('Loading default About data from JSON...');
        const aboutPath = path.join(__dirname, 'data', 'about.json');
        try {
          const aboutData = JSON.parse(fs.readFileSync(aboutPath, 'utf8'));
          await strapi.entityService.create('api::about.about', {
            data: {
              ...aboutData,
              publishedAt: new Date()
            }
          });
          console.log('Default About data created successfully');
        } catch (error) {
          console.error('Error loading default About from JSON:', error);
        }
      }

      // Check if Question data exists, if not, create default data
      const existingQuestion = await strapi.db.query('api::question.question').findMany();
      if (existingQuestion.length === 0) {
        console.log('Loading default Question data from JSON...');
        const questionsPath = path.join(__dirname, 'data', 'questions.json');
        try {
          const questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
          for (const question of questionsData) {
            await strapi.entityService.create('api::question.question', {
              data: {
                ...question,
                publishedAt: new Date()
              }
            });
          }
          console.log(`${questionsData.length} default Questions created successfully`);
        } catch (error) {
          console.error('Error loading default Questions from JSON:', error);
        }
      }
    };

    createDefaultData();
  }
}