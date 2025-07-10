'use client';

import AuthService from "@/app/services/auth.service";
import { OrderedProduct } from "@/models";
import { Product, Order, Feedback } from "@/models";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductPage() {
  const params = useParams();
  const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
  const id_product = params?.id_product as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [hasOrderedProduct, setHasOrderedProduct] = useState(false);
  const [userFeedback, setUserFeedback] = useState<Feedback | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ grade: 5, content: '' });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(false);
  const [editFeedback, setEditFeedback] = useState({ grade: 5, content: '' });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [filterByRating, setFilterByRating] = useState<number | null>(null);
  const feedbacksPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, filterByRating]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${STRAPI_URL}/api/products/${id_product}?populate=*`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setProduct(data.data);
      } catch (error) {
        console.error('Erreur lors du fetch du produit:', error);
      } finally {
        setLoading(false);
      }
    };

    // Check if the user has ordered this product
    const checkUserOrder = async () => {
      try {
        // Get the current user
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) return;

        // Get the token for authenticated requests
        const token = AuthService.getToken();
        if (!token) return;

        // Get the client data for the current user
        const userClientData = await AuthService.getCurrentUserClient();
        
        if (!userClientData.client) {
          return;
        }

        // Fetch orders for the current user
        const ordersUrl = `${STRAPI_URL}/api/orders?populate[0]=client&populate[1]=ordered_products&populate[2]=ordered_products.product&filters[client][documentId][$eq]=${userClientData.client.documentId}`;
        const response = await fetch(ordersUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const ordersData = await response.json();
          const orders: Order[] = ordersData.data;
          
          // Check if the user has ordered the product
          const hasOrdered = orders.some(order => {
            return order.ordered_products?.some(orderedProduct => {
              const match = orderedProduct.product?.documentId === id_product;
              return match;
            });
          });
          
          setHasOrderedProduct(hasOrdered);

          // If the user has ordered the product, fetch their feedback
          if (hasOrdered) {
            const feedbackUrl = `${STRAPI_URL}/api/feedbacks?populate[0]=client&populate[1]=product&filters[client][documentId][$eq]=${userClientData.client.documentId}&filters[product][documentId][$eq]=${id_product}`;
            
            const feedbackResponse = await fetch(feedbackUrl, {
              headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              },
            });

            if (feedbackResponse.ok) {
              const feedbackData = await feedbackResponse.json();
              if (feedbackData.data && feedbackData.data.length > 0) {
                setUserFeedback(feedbackData.data[0]);
              }
            } else {
              const errorText = await feedbackResponse.text();
              console.error('Feedback error response:', errorText);
            }
          }
        } else {
          console.error('Orders request failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des commandes:', error);
      }
    };

    fetchProduct();
    checkUserOrder();
  }, [id_product]);

  // Function to calculate the discounted price based on active discounts
  const calculateDiscountedPrice = (price: number, discounts?: any[]) => {
    const activeDiscount = discounts?.find(discount => {
      const now = new Date();
      const start = new Date(discount.startDate);
      const end = new Date(discount.endDate);
      return now >= start && now <= end;
    });

    if (activeDiscount) {
      return activeDiscount.type === 'prix' 
        ? price - activeDiscount.value 
        : price * (1 - activeDiscount.value / 100);
    }
    return price;
  };

  // Function to calculate the final price with selected option
  const calculateFinalPrice = () => {
    if (!product) return 0;
    
    let basePrice = calculateDiscountedPrice(product.price, product.discounts);
    
    if (selectedOption && product.options) {
      const option = product.options.find(opt => opt.documentId === selectedOption);
      if (option) {
        basePrice += option.priceModifier;
      }
    }
    
    return basePrice;
  };

  // Function to add the product to the cart
  const addToCart = () => {
    if (!product) return;
    
    const selectedOptionObj = selectedOption && product.options ? 
      product.options.find(opt => opt.documentId === selectedOption) : undefined;
    
    const existingCart: OrderedProduct[] = JSON.parse(localStorage.getItem("cart") ?? "[]");
    const existingItemIndex = existingCart.findIndex(item => 
      item.product?.documentId === product.documentId && 
      item.option?.documentId === selectedOption
    );
    
    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push({
        id: 0, 
        createdAt: "", 
        updatedAt: "", 
        quantity: quantity, 
        product: product, 
        option: selectedOptionObj,
        documentId: ""
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(existingCart));
    
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Function to submit new feedback
  const submitFeedback = async () => {
    if (!product || !newFeedback.content.trim()) return;

    setFeedbackLoading(true);
    try {
      const currentUser = AuthService.getCurrentUser();
      const token = AuthService.getToken();
      
      if (!currentUser || !token) {
        throw new Error("Utilisateur non authentifié");
      }

      const userClientData = await AuthService.getCurrentUserClient();
      
      const response = await fetch(`${STRAPI_URL}/api/feedbacks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            grade: newFeedback.grade,
            content: newFeedback.content,
            client: userClientData.client?.id,
            product: product.documentId
          }
        }),
      });

      if (response.ok) {
        const feedbackData = await response.json();
        setUserFeedback(feedbackData.data);
        setShowFeedbackForm(false);
        setNewFeedback({ grade: 5, content: '' });
        
        const productResponse = await fetch(`${STRAPI_URL}/api/products/${id_product}?populate=*`);
        const productData = await productResponse.json();
        setProduct(productData.data);
      } else {
        throw new Error('Erreur lors de l\'envoi du feedback');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du feedback:', error);
      alert('Erreur lors de l\'envoi du feedback. Veuillez réessayer.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const updateFeedback = async () => {
    if (!product || !userFeedback || !editFeedback.content.trim()) return;

    setFeedbackLoading(true);
    try {
      const currentUser = AuthService.getCurrentUser();
      const token = AuthService.getToken();
      
      if (!currentUser || !token) {
        throw new Error("Utilisateur non authentifié");
      }

      const response = await fetch(`${STRAPI_URL}/api/feedbacks/${userFeedback.documentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            grade: editFeedback.grade,
            content: editFeedback.content,
          }
        }),
      });

      if (response.ok) {
        const feedbackData = await response.json();
        setUserFeedback(feedbackData.data);
        setEditingFeedback(false);
        setEditFeedback({ grade: 5, content: '' });
        
        const productResponse = await fetch(`${STRAPI_URL}/api/products/${id_product}?populate=*`);
        const productData = await productResponse.json();
        setProduct(productData.data);
      } else {
        throw new Error('Erreur lors de la modification du feedback');
      }
    } catch (error) {
      console.error('Erreur lors de la modification du feedback:', error);
      alert('Erreur lors de la modification du feedback. Veuillez réessayer.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const startEditingFeedback = () => {
    if (userFeedback) {
      setEditFeedback({
        grade: userFeedback.grade,
        content: userFeedback.content
      });
      setEditingFeedback(true);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Chargement...</div>;
  if (!product) return <div className="flex justify-center p-8">Produit non trouvé</div>;

  const discountedPrice = calculateDiscountedPrice(product.price, product.discounts);
  const hasDiscount = discountedPrice !== product.price;
  const finalPrice = calculateFinalPrice();

  const calculateAverageRating = () => {
    if (!product.feedbacks || product.feedbacks.length === 0) return 0;
    const sum = product.feedbacks.reduce((acc, feedback) => acc + feedback.grade, 0);
    return sum / product.feedbacks.length;
  };

  const getFilteredAndSortedFeedbacks = () => {
    if (!product?.feedbacks) return [];
    
    let filteredFeedbacks = [...product.feedbacks];
    
    if (filterByRating !== null) {
      filteredFeedbacks = filteredFeedbacks.filter(feedback => feedback.grade === filterByRating);
    }
    
    filteredFeedbacks.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.updatedAt || '').getTime() - new Date(a.createdAt || a.updatedAt || '').getTime();
        case 'oldest':
          return new Date(a.createdAt || a.updatedAt || '').getTime() - new Date(b.createdAt || b.updatedAt || '').getTime();
        case 'highest':
          return b.grade - a.grade;
        case 'lowest':
          return a.grade - b.grade;
        default:
          return 0;
      }
    });
    
    return filteredFeedbacks;
  };

  const getPaginatedFeedbacks = () => {
    const filteredFeedbacks = getFilteredAndSortedFeedbacks();
    const startIndex = (currentPage - 1) * feedbacksPerPage;
    const endIndex = startIndex + feedbacksPerPage;
    return filteredFeedbacks.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filteredFeedbacks = getFilteredAndSortedFeedbacks();
    return Math.ceil(filteredFeedbacks.length / feedbacksPerPage);
  };

  const averageRating = calculateAverageRating();

  return (
    <div className="max-w-6xl mx-auto p-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-muted rounded-lg min-h-96 flex items-center justify-center overflow-x-auto">
          {product.images && product.images.length > 0 ? (
            <img
              src={`http://localhost:1338${product.images[0].url}`}
              alt="Image produit"
              className="h-72 w-auto rounded-lg object-contain border border-border bg-background shadow"
              loading="lazy"
            />
          ) : (
            <span className="text-muted-foreground">Image du produit</span>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {product.product_categories?.map(category => (
                <span key={category.documentId} className="bg-accent text-accent-foreground px-2 py-1 rounded text-sm">
                  {category.name}
                </span>
              ))}
            </div>
            {product.feedbacks && product.feedbacks.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.round(averageRating) ? "text-chart-4" : "text-muted-foreground"}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {averageRating.toFixed(1)}/5 ({product.feedbacks.length} avis)
                </span>
              </div>
            )}
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">
                {finalPrice.toFixed(2)}€
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  {product.price.toFixed(2)}€
                </span>
              )}
            </div>
            {product.options && product.options.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Options disponibles:
                </label>
                <select
                  value={selectedOption || ''}
                  onChange={(e) => setSelectedOption(e.target.value || null)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Aucune option (+0€)</option>
                  {product.options.map(option => (
                    <option key={option.documentId} value={option.documentId}>
                      {option.name} ({option.priceModifier >= 0 ? '+' : ''}{option.priceModifier}€)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="font-medium text-foreground">Quantité:</label>
              <div className="flex items-center border border-border rounded">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 hover:bg-accent text-foreground"
                >
                  -
                </button>
                <span className="px-4 py-1 border-x border-border text-foreground">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 hover:bg-accent text-foreground"
                >
                  +
                </button>
              </div>
            </div>
            
            <button 
              onClick={addToCart}
              className="w-full hover:text-orange-400 bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 font-medium"
            >
              {added ? "✓ Ajouté !" : `Ajouter au panier - ${(finalPrice * quantity).toFixed(2)}€`}
            </button>
          </div>
        </div>
      </div>

      {product.feedbacks && product.feedbacks.length > 0 && (
        <div className="mt-12">
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 mb-8">
            <h2 className="text-3xl font-bold mb-6 text-foreground text-center">
              ⭐ Avis de nos clients
            </h2>
            
            {/* Statistiques globales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center bg-background/50 rounded-lg p-4 border border-border/50">
                <div className="text-3xl font-bold text-primary">{averageRating.toFixed(1)}</div>
                <div className="flex justify-center mt-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.round(averageRating) ? "text-chart-4 text-lg" : "text-muted-foreground text-lg"}>
                      ★
                    </span>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">Note moyenne</div>
              </div>
              
              <div className="text-center bg-background/50 rounded-lg p-4 border border-border/50">
                <div className="text-3xl font-bold text-primary">{product.feedbacks.length}</div>
                <div className="text-sm text-muted-foreground mt-2">
                  {product.feedbacks.length === 1 ? 'Avis client' : 'Avis clients'}
                </div>
              </div>
              
              <div className="text-center bg-background/50 rounded-lg p-4 border border-border/50">
                <div className="text-3xl font-bold text-primary">
                  {Math.round((product.feedbacks.filter(f => f.grade >= 4).length / product.feedbacks.length) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground mt-2">Clients satisfaits</div>
              </div>
            </div>
          </div>

          {/* Distribution des notes */}
          <div className="mb-8 bg-card rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4 text-card-foreground">Répartition des notes</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = product.feedbacks?.filter(f => f.grade === rating).length || 0;
                const percentage = product.feedbacks?.length ? (count / product.feedbacks.length) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-8">{rating}★</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-chart-4 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Liste des avis */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Tous les avis ({getFilteredAndSortedFeedbacks().length})
              </h3>
              
              {/* Contrôles de tri et filtrage */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Filtre par note */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground">Filtrer:</label>
                  <select
                    value={filterByRating || 'all'}
                    onChange={(e) => setFilterByRating(e.target.value === 'all' ? null : parseInt(e.target.value))}
                    className="px-3 py-1 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">Toutes les notes</option>
                    <option value="5">5 étoiles</option>
                    <option value="4">4 étoiles</option>
                    <option value="3">3 étoiles</option>
                    <option value="2">2 étoiles</option>
                    <option value="1">1 étoile</option>
                  </select>
                </div>
                
                {/* Tri */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground">Trier par:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'highest' | 'lowest')}
                    className="px-3 py-1 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="newest">Plus récents</option>
                    <option value="oldest">Plus anciens</option>
                    <option value="highest">Note décroissante</option>
                    <option value="lowest">Note croissante</option>
                  </select>
                </div>
              </div>
            </div>

            {getFilteredAndSortedFeedbacks().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {filterByRating !== null 
                  ? `Aucun avis avec ${filterByRating} étoile${filterByRating > 1 ? 's' : ''} trouvé.`
                  : "Aucun avis disponible."
                }
              </div>
            ) : (
              <>
                {getPaginatedFeedbacks().map((feedback, index) => (
                  <div key={feedback.documentId} className="group border border-border rounded-xl p-6 bg-card hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-primary">
                            {feedback.client?.firstname ? feedback.client.firstname.charAt(0).toUpperCase() : 'C'}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-card-foreground">
                            {feedback.client?.firstname && feedback.client?.lastname
                              ? `${feedback.client.firstname} ${feedback.client.lastname.charAt(0)}.`
                              : 'Client anonyme'
                            }
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < feedback.grade ? "text-chart-4 text-lg" : "text-muted-foreground text-lg"}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {feedback.grade}/5
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Badge de qualité d'avis */}
                      {feedback.grade >= 4 && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          ✓ Recommandé
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-background/50 rounded-lg p-4 border-l-4 border-l-primary/30">
                      <p className="text-card-foreground leading-relaxed italic">
                        "{feedback.content}"
                      </p>
                    </div>
                    
                    {/* Indicateur de position */}
                    <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
                      <span>
                        Avis #{((currentPage - 1) * feedbacksPerPage) + index + 1}
                      </span>
                      <span>Achat vérifié ✓</span>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {getTotalPages() > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                    >
                      ← Précédent
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(pageNum => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            pageNum === currentPage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background border border-border text-foreground hover:bg-accent'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                      disabled={currentPage === getTotalPages()}
                      className="px-4 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
                    >
                      Suivant →
                    </button>
                  </div>
                )}

                {/* Informations de pagination */}
                <div className="text-center text-sm text-muted-foreground mt-4">
                  Affichage de {Math.min(feedbacksPerPage, getFilteredAndSortedFeedbacks().length - ((currentPage - 1) * feedbacksPerPage))} avis 
                  sur {getFilteredAndSortedFeedbacks().length} 
                  {filterByRating !== null && ` (filtrés par ${filterByRating} étoile${filterByRating > 1 ? 's' : ''})`}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Section feedback utilisateur */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Mon avis</h2>
        
        {!AuthService.getCurrentUser() ? (
          <div className="border border-border rounded-lg p-6 bg-card text-center">
            <div className="mb-4">
              <span className="text-4xl">🔒</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Connexion requise
            </h3>
            <p className="text-muted-foreground mb-4">
              Vous devez être connecté pour laisser un avis sur ce produit.
            </p>
            <a href="/login" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Se connecter
            </a>
          </div>
        ) : !hasOrderedProduct ? (
          <div className="border border-border rounded-lg p-6 bg-card text-center">
            <div className="mb-4">
              <span className="text-4xl">🛒</span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Achat requis
            </h3>
            <p className="text-muted-foreground">
              Vous devez avoir acheté ce produit pour pouvoir laisser un avis.
            </p>
          </div>
        ) : userFeedback ? (
            <div className="border border-border rounded-lg p-4 bg-card">
              {!editingFeedback ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-card-foreground">Votre avis</span>
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < userFeedback.grade ? "text-chart-4" : "text-muted-foreground"}>
                            ★
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={startEditingFeedback}
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded text-sm hover:bg-secondary/90 transition-colors"
                      >
                        ✏️ Modifier
                      </button>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{userFeedback.content}</p>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-card-foreground">Modifier votre avis</span>
                    <button
                      onClick={() => {
                        setEditingFeedback(false);
                        setEditFeedback({ grade: 5, content: '' });
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Note (sur 5)
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setEditFeedback({...editFeedback, grade: star})}
                          className={`text-2xl ${star <= editFeedback.grade ? 'text-chart-4' : 'text-muted-foreground'} hover:scale-110 transition-transform`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Votre commentaire
                    </label>
                    <textarea
                      value={editFeedback.content}
                      onChange={(e) => setEditFeedback({...editFeedback, content: e.target.value})}
                      placeholder="Modifiez votre expérience avec ce produit..."
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={updateFeedback}
                      disabled={feedbackLoading || !editFeedback.content.trim()}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {feedbackLoading ? 'Mise à jour...' : 'Sauvegarder'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingFeedback(false);
                        setEditFeedback({ grade: 5, content: '' });
                      }}
                      className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {!showFeedbackForm ? (
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
                >
                  Laisser un avis
                </button>
              ) : (
                <div className="border border-border rounded-lg p-4 bg-card space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Note (sur 5)
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewFeedback({...newFeedback, grade: star})}
                          className={`text-2xl ${star <= newFeedback.grade ? 'text-chart-4' : 'text-muted-foreground'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Votre commentaire
                    </label>
                    <textarea
                      value={newFeedback.content}
                      onChange={(e) => setNewFeedback({...newFeedback, content: e.target.value})}
                      placeholder="Partagez votre expérience avec ce produit..."
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground resize-none"
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={submitFeedback}
                      disabled={feedbackLoading || !newFeedback.content.trim()}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {feedbackLoading ? 'Envoi...' : 'Publier l\'avis'}
                    </button>
                    <button
                      onClick={() => {
                        setShowFeedbackForm(false);
                        setNewFeedback({ grade: 5, content: '' });
                      }}
                      className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
}