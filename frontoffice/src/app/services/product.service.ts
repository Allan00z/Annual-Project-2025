import type { Product } from '@/models/product';

interface ApiResponse {
  data: Product[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Service that interacts with the Strapi API to manage products.
 */
export class ProductService {
  private static readonly STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1338';

  /**
   * Gets a product by its ID.
   * @param id The ID of the product to retrieve.
   * @returns Promise<Product | null> The product if found, otherwise null.
   */
  static async getAllProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${this.STRAPI_URL}/api/products?populate=*`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des produits: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      throw error;
    }
  }

  /**
   * Gets a paginated list of products.
   * @param page The page number to retrieve.
   * @param pageSize The number of products per page.
   * @returns Promise<ApiResponse> The paginated products data.
   * @throws Error If the request fails.
   * */
  static async getProducts(page: number = 1, pageSize: number = 25): Promise<ApiResponse> {
    try {
      const response = await fetch(
        `${this.STRAPI_URL}/api/products?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
        {
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des produits: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      throw error;
    }
  }

  /**
   * Gets a product by its document ID.
   * @param documentId The document ID of the product to retrieve.
   * @returns Promise<Product | null> The product if found, otherwise null.
   */
  static async getProductByDocumentId(documentId: string): Promise<Product | null> {
    try {
      const response = await fetch(`${this.STRAPI_URL}/api/products/${documentId}?populate=*`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Erreur lors de la récupération du produit: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      throw error;
    }
  }

  /**
   * Gets multiple products by their document IDs.
   * @param documentIds Array of document IDs of the products to retrieve.
   * @returns Promise<Product[]> Array of products found.
   */
  static async getProductsByDocumentIds(documentIds: string[]): Promise<Product[]> {
    try {
      const products: Product[] = [];
      
      // Get each product by its document ID
      for (const documentId of documentIds) {
        const product = await this.getProductByDocumentId(documentId);
        if (product) {
          products.push(product);
        }
      }
      
      return products;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      throw error;
    }
  }
}
