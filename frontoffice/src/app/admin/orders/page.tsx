'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OrderService } from '../../services/order.service';
import AuthService from '../../services/auth.service';
import { Order } from '../../../models/order';
import ContactClientModal from '../../../component/ContactClientModal';

interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export default function AdminOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statistics, setStatistics] = useState<OrderStatistics>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending');
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'total'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  
  // Contact modal state
  const [contactModal, setContactModal] = useState({
    isOpen: false,
    clientEmail: '',
    clientName: '',
    orderId: ''
  });

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    orderId: '',
    currentStatus: false,
    orderClient: ''
  });

  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      if (!AuthService.isLoggedIn()) {
        router.push('/login');
        return;
      }

      try {
        if (!AuthService.checkUserRole('owner')) {
            setError('Vous n\'avez pas les droits nécessaires pour accéder à cette page');
            return;
        }
        
        await Promise.all([
          fetchOrders(),
          fetchStatistics()
        ]);
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [router]);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, activeTab, sortBy, sortOrder]);

  const fetchOrders = async () => {
    try {
      const response = await OrderService.getAllOrders({
        sortBy,
        sortOrder
      });

      setOrders(response.data);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des commandes:', err);
      setError('Impossible de charger les commandes');
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await OrderService.getOrderStatistics();
      setStatistics(stats);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des statistiques:', err);
    }
  };

  // Filter and sort orders based on active tab and sorting criteria
  const filterAndSortOrders = () => {
    let filtered = [...orders];

    // Filter by tab
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(order => !order.done);
        break;
      case 'completed':
        filtered = filtered.filter(order => order.done);
        break;
      case 'all':
      default:
        // No filter needed
        break;
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        case 'client':
          const nameA = `${a.client?.firstname || ''} ${a.client?.lastname || ''}`.trim().toLowerCase() || 'zzz';
          const nameB = `${b.client?.firstname || ''} ${b.client?.lastname || ''}`.trim().toLowerCase() || 'zzz';
          return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        case 'total':
          const totalA = calculateOrderTotal(a);
          const totalB = calculateOrderTotal(b);
          return sortOrder === 'asc' ? totalA - totalB : totalB - totalA;
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const calculateOrderTotal = (order: Order): number => {
    return order.ordered_products?.reduce((total: number, orderedProduct: any) => {
      const price = orderedProduct.product?.price || 0;
      const quantity = orderedProduct.quantity || 0;
      return total + (price * quantity);
    }, 0) || 0;
  };

  const handleStatusToggle = (orderId: string, currentStatus: boolean) => {
    const order = orders.find(o => o.documentId === orderId);
    const clientName = order?.client ? `${order.client.firstname || ''} ${order.client.lastname || ''}`.trim() : 'Client inconnu';
  
    setConfirmationModal({
      isOpen: true,
      orderId,
      currentStatus,
      orderClient: clientName
    });
  };

  const confirmStatusUpdate = async (orderId: string, currentStatus: boolean) => {
    try {
      await OrderService.updateOrderStatus(orderId, !currentStatus);
      
      // Update local state
      setOrders(orders.map(order => 
        order.documentId === orderId 
          ? { ...order, done: !currentStatus }
          : order
      ));
      
      // Refresh statistics
      await fetchStatistics();
      
      // Close confirmation modal
      setConfirmationModal({ ...confirmationModal, isOpen: false });
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      setError('Impossible de mettre à jour le statut de la commande');
    }
  };

  const handleContactClient = (order: Order) => {
    const clientEmail = order.client?.users_permissions_user?.email || '';
    const clientName = `${order.client?.firstname || ''} ${order.client?.lastname || ''}`.trim();
    
    if (!clientEmail) {
      setError('Email du client non trouvé pour cette commande');
      return;
    }

    if (!clientName) {
      setError('Nom du client non trouvé pour cette commande');
      return;
    }

    setContactModal({
      isOpen: true,
      clientEmail,
      clientName,
      orderId: order.documentId
    });
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Commandes</h1>
              <p className="mt-1 text-gray-600">
                Gérez les commandes, contactez les clients et suivez les performances
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Commandes</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.completedOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chiffre d'Affaires</p>
                <p className="text-2xl font-semibold text-gray-900">{statistics.totalRevenue.toFixed(2)} €</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Tabs */}
                <div className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'pending'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    En attente ({statistics.pendingOrders})
                  </button>
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'completed'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Terminées ({statistics.completedOrders})
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'all'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Toutes ({statistics.totalOrders})
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Trier par:</span>
                  <button
                    onClick={() => handleSort('date')}
                    className={`px-3 py-1 rounded text-sm ${
                      sortBy === 'date'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button
                    onClick={() => handleSort('client')}
                    className={`px-3 py-1 rounded text-sm ${
                      sortBy === 'client'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Client {sortBy === 'client' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button
                    onClick={() => handleSort('total')}
                    className={`px-3 py-1 rounded text-sm ${
                      sortBy === 'total'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Total {sortBy === 'total' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {currentOrders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'pending' ? 'Aucune commande en attente' 
                   : activeTab === 'completed' ? 'Aucune commande terminée'
                   : 'Aucune commande trouvée'}
                </p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.documentId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.ordered_products?.length || 0} article(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.client?.firstname && order.client?.lastname 
                            ? `${order.client.firstname} ${order.client.lastname}`
                            : 'Client non renseigné'
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.client?.users_permissions_user?.email || 'Email non disponible'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {calculateOrderTotal(order).toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleStatusToggle(order.documentId, order.done || false)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                            order.done
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }`}
                        >
                          {order.done ? 'Terminée' : 'En attente'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/orders/${order.documentId}`)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Voir les détails"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleContactClient(order)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Contacter le client"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de {indexOfFirstOrder + 1} à {Math.min(indexOfLastOrder, filteredOrders.length)} sur {filteredOrders.length} commandes
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Précédent
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-1 border border-gray-300 rounded text-sm transition-colors ${
                        pageNumber === currentPage
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ContactClientModal
        isOpen={contactModal.isOpen}
        onClose={() => setContactModal({ ...contactModal, isOpen: false })}
        clientEmail={contactModal.clientEmail}
        clientName={contactModal.clientName}
        orderId={contactModal.orderId}
      />

      {confirmationModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${confirmationModal.currentStatus ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                <svg className={`h-6 w-6 ${confirmationModal.currentStatus ? 'text-blue-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {confirmationModal.currentStatus ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  )}
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                {confirmationModal.currentStatus 
                  ? "Confirmer la réouverture de la commande"
                  : "Confirmer la clôture de la commande"
                }
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Êtes-vous sûr de vouloir marquer la commande <strong>#{confirmationModal.orderId}</strong> de <strong>{confirmationModal.orderClient}</strong> comme {confirmationModal.currentStatus ? "en cours" : "terminée"} ?
                </p>
                <br />
                <p className="text-sm text-gray-500">
                  {confirmationModal.currentStatus 
                    ? "Cette commande sera remise en statut 'en cours' et nécessitera un nouveau suivi."
                    : "Pensez à contacter le client pour l'informer de la clôture de sa commande."
                  }
                </p>
                <br />
                <p className="text-xs text-gray-400 mt-2">
                  Cette action peut être annulée en cliquant à nouveau sur le statut.
                </p>
              </div>
              <div className="flex gap-4 px-4 py-3">
                <button
                  onClick={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
                  className="flex-1 px-4 py-2 bg-white text-gray-800 text-base font-medium rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={() => confirmStatusUpdate(confirmationModal.orderId, confirmationModal.currentStatus)}
                  className={`flex-1 px-4 py-2 text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                    confirmationModal.currentStatus 
                      ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                      : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  }`}
                >
                  {confirmationModal.currentStatus ? "Remettre en cours" : "Confirmer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
