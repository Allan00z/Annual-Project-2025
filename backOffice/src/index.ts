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

      // Check if Reseller data exists, if not, create default data
      const existingReseller = await strapi.db.query('api::reseller.reseller').
      findMany();
      if (existingReseller.length === 0) {
        console.log('Loading default Reseller data from JSON...');
        const resellersPath = path.join(__dirname, 'data', 'resellers.json');
        try {
          const resellersData = JSON.parse(fs.readFileSync(resellersPath, 'utf8'));
          for (const reseller of resellersData) {
            await strapi.entityService.create('api::reseller.reseller', {
              data: {
                ...reseller,
                publishedAt: new Date()
              }
            });
          }
          console.log(`${resellersData.length} default Resellers created successfully`);
        } catch (error) {
          console.error('Error loading default Resellers from JSON:', error);
        }
      }

      // Check if CGV data exists, if not, create default data
      const existingCgv = await strapi.db.query('api::cgv.cgv').findMany();
      if (existingCgv.length === 0) {
        console.log('Loading default CGV data from JSON...');
        const cgvPath = path.join(__dirname, 'data', 'cgv.json');
        try {
          const cgvData = JSON.parse(fs.readFileSync(cgvPath, 'utf8'));
          
          // Create sections first
          const createdSections = [];
          for (const section of cgvData.sections) {
            const createdSection = await strapi.entityService.create('api::section.section', {
              data: {
                ...section,
                publishedAt: new Date()
              }
            });
            createdSections.push(createdSection.id);
          }
          
          // Create CGV with sections
          await strapi.entityService.create('api::cgv.cgv', {
            data: {
              sections: createdSections,
              publishedAt: new Date()
            }
          });
          
          console.log('Default CGV data created successfully with sections');
        } catch (error) {
          console.error('Error loading default CGV from JSON:', error);
        }
      }

      // Check if Delivery data exists, if not, create default data
      const existingDelivery = await strapi.db.query('api::delivery.delivery').findMany();
      if (existingDelivery.length === 0) {
        console.log('Loading default Delivery data from JSON...');
        const deliveryPath = path.join(__dirname, 'data', 'delivery.json');
        try {
          const deliveryData = JSON.parse(fs.readFileSync(deliveryPath, 'utf8'));
          
          // Create sections first
          const createdSections = [];
          for (const section of deliveryData.sections) {
            const createdSection = await strapi.entityService.create('api::section.section', {
              data: {
                ...section,
                publishedAt: new Date()
              }
            });
            createdSections.push(createdSection.id);
          }
          
          // Create Delivery with sections
          await strapi.entityService.create('api::delivery.delivery', {
            data: {
              sections: createdSections,
              publishedAt: new Date()
            }
          });
          
          console.log('Default Delivery data created successfully with sections');
        } catch (error) {
          console.error('Error loading default Delivery from JSON:', error);
        }
      }

      // Check if Privacy Policy data exists, if not, create default data
      const existingPrivacyPolicy = await strapi.db.query('api::privacy-policy.privacy-policy').findMany();
      if (existingPrivacyPolicy.length === 0) {
        console.log('Loading default Privacy Policy data from JSON...');
        const privacyPolicyPath = path.join(__dirname, 'data', 'privacy-policy.json');
        try {
          const privacyPolicyData = JSON.parse(fs.readFileSync(privacyPolicyPath, 'utf8'));
          
          // Create sections first
          const createdSections = [];
          for (const section of privacyPolicyData.sections) {
            const createdSection = await strapi.entityService.create('api::section.section', {
              data: {
                ...section,
                publishedAt: new Date()
              }
            });
            createdSections.push(createdSection.id);
          }
          
          // Create Privacy Policy with sections
          await strapi.entityService.create('api::privacy-policy.privacy-policy', {
            data: {
              sections: createdSections,
              publishedAt: new Date()
            }
          });
          
          console.log('Default Privacy Policy data created successfully with sections');
        } catch (error) {
          console.error('Error loading default Privacy Policy from JSON:', error);
        }
      }

      // Check if Terms and Condition data exists, if not, create default data
      const existingTermsAndCondition = await strapi.db.query('api::terms-and-condition.terms-and-condition').findMany();
      if (existingTermsAndCondition.length === 0) {
        console.log('Loading default Terms and Condition data from JSON...');
        const termsAndConditionPath = path.join(__dirname, 'data', 'terms-and-condition.json');
        try {
          const termsAndConditionData = JSON.parse(fs.readFileSync(termsAndConditionPath, 'utf8'));
          
          // Create sections first
          const createdSections = [];
          for (const section of termsAndConditionData.sections) {
            const createdSection = await strapi.entityService.create('api::section.section', {
              data: {
                ...section,
                publishedAt: new Date()
              }
            });
            createdSections.push(createdSection.id);
          }
          
          // Create Terms and Condition with sections
          await strapi.entityService.create('api::terms-and-condition.terms-and-condition', {
            data: {
              sections: createdSections,
              publishedAt: new Date()
            }
          });
          
          console.log('Default Terms and Condition data created successfully with sections');
        } catch (error) {
          console.error('Error loading default Terms and Condition from JSON:', error);
        }
      }
    };

    createDefaultData();
  }
}