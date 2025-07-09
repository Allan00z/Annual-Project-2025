'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import AuthService from '../../services/auth.service';
import { Order } from '../../../models/order';
import { Product } from '../../../models/product';

export default function OrderDetail() {
  const [order, setOrder] = useState<Order | null>(null);
  const [productDetails, setProductDetails] = useState<{ [key: string]: Product }>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const documentId = params.documentId as string;

  useEffect(() => {
    const fetchOrder = async () => {
      // Check if user is authenticated
      if (!AuthService.isLoggedIn()) {
        router.push('/login');
        return;
      }

      try {
        setIsLoading(true);
        const orderData = await OrderService.getOrderByDocumentId(documentId);
        setOrder(orderData);

        // Fetch product details for each ordered product
        if (orderData?.ordered_products) {
          const productDetailsMap: { [key: string]: Product } = {};
          
          await Promise.all(
            orderData.ordered_products.map(async (orderedProduct) => {
              if (orderedProduct.product?.documentId) {
                try {
                  const productDetail = await ProductService.getProductByDocumentId(orderedProduct.product.documentId);
                  if (productDetail) {
                    productDetailsMap[orderedProduct.product.documentId] = productDetail;
                  }
                } catch (productError) {
                  console.error(`Erreur lors du chargement du produit ${orderedProduct.product.documentId}:`, productError);
                }
              }
            })
          );
          
          setProductDetails(productDetailsMap);
        }
      } catch (err) {
        console.error('Erreur lors du chargement de la commande:', err);
        setError('Impossible de charger les détails de la commande');
      } finally {
        setIsLoading(false);
      }
    };

    if (documentId) {
      fetchOrder();
    }
  }, [documentId, router]);

  const calculateTotal = () => {
    if (!order?.ordered_products) return 0;
    return order.ordered_products.reduce((total, orderedProduct) => {
      const productDetail = orderedProduct.product?.documentId 
        ? productDetails[orderedProduct.product.documentId] 
        : null;
      const price = productDetail?.price || orderedProduct.product?.price || 0;
      const quantity = orderedProduct.quantity || 0;
      return total + (price * quantity);
    }, 0);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button 
            onClick={() => router.back()}
            className="btn btn-primary"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">Commande non trouvée</div>
          <button 
            onClick={() => router.back()}
            className="btn btn-primary"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button 
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm mb-4"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Retour
          </button>
          <h1 className="text-3xl font-bold">Détails de la commande</h1>
          <p className="text-base-content/70">Commande #{order.documentId}</p>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4">Informations de la commande</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-base-content/70">Numéro de commande</p>
              <p className="font-semibold">#{order.documentId}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Date de commande</p>
              <p className="font-semibold">{formatDate(order.createdAt!)}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Statut</p>
              <div className="badge badge-success">Confirmée</div>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Total</p>
              <p className="font-bold text-xl text-primary">{calculateTotal().toFixed(2)} €</p>
            </div>
          </div>
        </div>
      </div>

      {order.client && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Informations client</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-base-content/70">Nom complet</p>
                <p className="font-semibold">
                  {order.client.firstname} {order.client.lastname}
                </p>
              </div>
              {order.client.deliveryAddress && (
                <div>
                  <p className="text-sm text-base-content/70">Adresse de livraison</p>
                  <p className="font-semibold">{order.client.deliveryAddress.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4">Produits commandés</h2>
          {order.ordered_products && order.ordered_products.length > 0 ? (
            <div className="space-y-4">
              {order.ordered_products.map((orderedProduct, index) => {
                const productDetail = orderedProduct.product?.documentId 
                  ? productDetails[orderedProduct.product.documentId] 
                  : null;
                const finalProduct = productDetail || orderedProduct.product;
                const price = productDetail?.price || orderedProduct.product?.price || 0;
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 border border-base-300 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-base-200 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-base-content/50">package_2</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {finalProduct?.name || 'Produit inconnu'}
                        </h3>
                        {finalProduct?.description && (
                          <p className="text-sm text-base-content/60 mb-1">
                            {finalProduct.description}
                          </p>
                        )}
                        <p className="text-base-content/70">
                          Quantité: {orderedProduct.quantity}
                        </p>
                        <p className="text-sm text-base-content/60">
                          Prix unitaire: {price.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {(price * orderedProduct.quantity).toFixed(2)} €
                      </p>
                    </div>
                  </div>
                );
              })}
              
              <div className="border-t border-base-300 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold">Total de la commande:</span>
                  <span className="text-2xl font-bold text-primary">
                    {calculateTotal().toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-base-content/70">Aucun produit trouvé pour cette commande</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-8 space-x-4">
        <button 
          onClick={() => router.push('/account')}
          className="btn btn-outline"
        >
          Retour au compte
        </button>
        <button 
          onClick={() => window.print()}
          className="btn btn-primary"
        >
          <span className="material-symbols-outlined">print</span>
          Imprimer
        </button>
      </div>
    </div>
  );
}
