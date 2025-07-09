'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '../services/auth.service';
import { OrderService } from '../services/order.service';
import { ProductService } from '../services/product.service';
import { Order as OrderModel } from '../../models/order';
import { Product } from '../../models/product';

interface UserData {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  role?: {
    id: number;
    documentId: string;
    name: string;
    description: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
  client?: {
    id: number;
    documentId: string;
    firstname: string;
    lastname: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
    deliveryAddress?: {
      address: string;
      geohash: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    billingAddress?: {
      address: string;
      geohash: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
  };
}

interface OrderedProduct {
  id: number;
  documentId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  product?: Product;
}

interface ExtendedOrderedProduct {
  id: number;
  documentId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  product?: Product;
}

interface ExtendedOrder extends Omit<OrderModel, 'ordered_products'> {
  ordered_products?: ExtendedOrderedProduct[];
}

export default function Account() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ExtendedOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [ordersPerPage] = useState<number>(5);  
  const [sortBy, setSortBy] = useState<'date' | 'id' | 'products'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and fetch user data
    const checkAuthAndFetchUser = async () => {
      if (!AuthService.isLoggedIn()) {
        router.push('/login');
        return;
      }

      try {
        const data = await AuthService.getCurrentUserClient();
        setUserData(data);
        setIsLoading(false);
        
        if (data.client) {
          await fetchUserOrders();
        }
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue');
        setIsLoading(false);
      }
    };

    const fetchUserOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const ordersData = await OrderService.getCurrentUserOrders();        
        const extendedOrders: ExtendedOrder[] = ordersData.map(order => ({
          ...order,
          ordered_products: order.ordered_products?.map(op => ({
            id: op.id,
            documentId: op.documentId,
            quantity: op.quantity,
            createdAt: op.createdAt,
            updatedAt: op.updatedAt,
            publishedAt: op.publishedAt,
            product: op.product
          }))
        }));
        
        setOrders(extendedOrders);
        setFilteredOrders(extendedOrders);
      } catch (err) {
        console.error('Erreur lors du chargement des commandes:', err);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    checkAuthAndFetchUser();
  }, [router]);

  useEffect(() => {
    if (orders.length > 0) {
      const sorted = [...orders].sort((a, b) => {
        switch (sortBy) {
          case 'date':
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
          case 'id':
            return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
          case 'products':
            const countA = a.ordered_products?.length || 0;
            const countB = b.ordered_products?.length || 0;
            return sortOrder === 'asc' ? countA - countB : countB - countA;
          default:
            return 0;
        }
      });
      setFilteredOrders(sorted);
      setCurrentPage(1);
    }
  }, [orders, sortBy, sortOrder]);

  const handleSort = (newSortBy: 'date' | 'id' | 'products') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleLogout = () => {
    AuthService.logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre compte...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Erreur</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mon Compte</h1>
                <p className="text-gray-600 mt-1">Gérez vos informations personnelles</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>

          {/* If user data is available, display it */}
          {userData && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Informations personnelles
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom d'utilisateur
                    </label>
                    <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-md">
                      {userData.username}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-md">
                      {userData.email}
                    </p>
                  </div>
                  
                  {userData.client ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom
                        </label>
                        <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-md">
                          {userData.client.firstname}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-md">
                          {userData.client.lastname}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="md:col-span-2">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                              Informations client manquantes
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>
                                Vos informations personnelles (prénom, nom, adresses) ne sont pas encore renseignées. 
                                Cliquez sur "Modifier le profil" pour compléter votre profil.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut du compte
                    </label>
                    <div className="flex items-center bg-gray-50 p-3 rounded-md">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        userData.confirmed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {userData.confirmed ? 'Confirmé' : 'Non confirmé'}
                      </span>
                      {userData.blocked && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Bloqué
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {userData.client?.deliveryAddress && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse de livraison
                      </label>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-lg text-gray-900 mb-2">
                          {userData.client.deliveryAddress.address}
                        </p>
                        <div className="text-sm text-gray-600">
                          <p>
                            Coordonnées: {userData.client.deliveryAddress.coordinates.lat.toFixed(6)}, {userData.client.deliveryAddress.coordinates.lng.toFixed(6)}
                          </p>
                          <p>
                            Geohash: {userData.client.deliveryAddress.geohash}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {userData.client?.billingAddress && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse de facturation
                      </label>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-lg text-gray-900 mb-2">
                          {userData.client.billingAddress.address}
                        </p>
                        <div className="text-sm text-gray-600">
                          <p>
                            Coordonnées: {userData.client.billingAddress.coordinates.lat.toFixed(6)}, {userData.client.billingAddress.coordinates.lng.toFixed(6)}
                          </p>
                          <p>
                            Geohash: {userData.client.billingAddress.geohash}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    <span className="inline-block w-6 h-6 bg-green-500 rounded-full mr-2"></span>
                    Historique des commandes
                  </h2>
                  {filteredOrders.length > 0 && (
                    <div className="text-sm text-gray-600">
                      {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} au total
                    </div>
                  )}
                </div>
                
                {isLoadingOrders ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Chargement des commandes...</span>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
                      <p className="mt-1 text-sm text-gray-500">Vous n'avez pas encore passé de commande.</p>
                      <div className="mt-6">
                        <button
                          onClick={() => router.push('/products')}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                          Commencer à acheter
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">Trier par :</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSort('date')}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                              sortBy === 'date'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            Date
                            {sortBy === 'date' && (
                              <span className="ml-1">
                                {sortOrder === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => handleSort('id')}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                              sortBy === 'id'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            N° Commande
                            {sortBy === 'id' && (
                              <span className="ml-1">
                                {sortOrder === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => handleSort('products')}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                              sortBy === 'products'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            Nb. Articles
                            {sortBy === 'products' && (
                              <span className="ml-1">
                                {sortOrder === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {currentOrders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                Commande #{order.id}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Confirmée
                            </span>
                          </div>
                          
                          <div className="border-t border-gray-200 pt-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                              Produits commandés ({order.ordered_products?.length || 0} article{(order.ordered_products?.length || 0) > 1 ? 's' : ''})
                            </h4>
                            <div className="space-y-2">
                              {order.ordered_products?.map((orderedProduct) => (
                                <div key={orderedProduct.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                  <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                      <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-900 block">
                                          {orderedProduct.product?.name || `Produit #${orderedProduct.id}`}
                                        </span>
                                        {orderedProduct.product?.description && (
                                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                            {orderedProduct.product.description}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2">
                                          {orderedProduct.product?.price && (
                                            <span className="text-xs text-gray-600">
                                              Prix unitaire: <span className="font-medium">{orderedProduct.product.price.toFixed(2)} €</span>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="mt-2 sm:mt-0 sm:ml-4 text-right">
                                        <div className="text-sm text-gray-600">
                                          Quantité: <span className="font-medium">{orderedProduct.quantity}</span>
                                        </div>
                                        {orderedProduct.product?.price && (
                                          <div className="text-sm font-semibold text-gray-900 mt-1">
                                            Sous-total: {(orderedProduct.product.price * orderedProduct.quantity).toFixed(2)} €
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {order.ordered_products && order.ordered_products.some(op => op.product?.price) && (
                              <div className="border-t border-gray-200 mt-3 pt-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">Total de la commande</span>
                                  <span className="text-lg font-bold text-gray-900">
                                    {order.ordered_products
                                      .reduce((total, op) => total + (op.product?.price || 0) * op.quantity, 0)
                                      .toFixed(2)} €
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {order.client?.deliveryAddress && (
                            <div className="border-t border-gray-200 pt-3 mt-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">
                                Adresse de livraison
                              </h4>
                              <p className="text-sm text-gray-600">
                                {order.client.deliveryAddress.address}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex justify-end mt-4">
                            <button
                              onClick={() => router.push(`/orders/${order.documentId}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                              Voir les détails →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                        <div className="flex flex-1 justify-between sm:hidden">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                              currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            Précédent
                          </button>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                              currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            Suivant
                          </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              Affichage de{' '}
                              <span className="font-medium">{indexOfFirstOrder + 1}</span> à{' '}
                              <span className="font-medium">
                                {Math.min(indexOfLastOrder, filteredOrders.length)}
                              </span>{' '}
                              sur <span className="font-medium">{filteredOrders.length}</span> commandes
                            </p>
                          </div>
                          <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                              <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                                  currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'
                                }`}
                              >
                                <span className="sr-only">Page précédente</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                </svg>
                              </button>
                              
                              {Array.from({ length: totalPages }, (_, index) => {
                                const pageNumber = index + 1;
                                const isCurrentPage = pageNumber === currentPage;
                                
                                if (
                                  pageNumber === 1 ||
                                  pageNumber === totalPages ||
                                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                ) {
                                  return (
                                    <button
                                      key={pageNumber}
                                      onClick={() => handlePageChange(pageNumber)}
                                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                        isCurrentPage
                                          ? 'z-10 bg-blue-600 text-white focus:z-20 focus:outline-offset-2 focus:outline-blue-600'
                                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                      }`}
                                    >
                                      {pageNumber}
                                    </button>
                                  );
                                } else if (
                                  pageNumber === currentPage - 2 ||
                                  pageNumber === currentPage + 2
                                ) {
                                  return (
                                    <span key={pageNumber} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                                      ...
                                    </span>
                                  );
                                }
                                return null;
                              })}
                              
                              <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                                  currentPage === totalPages ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50'
                                }`}
                              >
                                <span className="sr-only">Page suivante</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </nav>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* If user has a role, display role and permissions */}
              {userData && userData.role && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    <span className="inline-block w-6 h-6 bg-purple-500 rounded-full mr-2"></span>
                    Rôle et permissions
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom du rôle
                      </label>
                      <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-md">
                        {userData.role.name}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type de rôle
                      </label>
                      <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-md capitalize">
                        {userData.role.type}
                      </p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <p className="text-lg text-gray-900 bg-gray-50 p-3 rounded-md">
                        {userData.role.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Actions
                </h2>
                
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => router.push('/profile/edit')}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Modifier le profil
                  </button>
                  
                  <button
                    onClick={() => router.push('/change-password')}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Changer le mot de passe
                  </button>
                  
                  <button
                    onClick={() => router.push('/')}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Retour à l'accueil
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
