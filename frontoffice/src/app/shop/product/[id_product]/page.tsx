'use client';

import AuthService from "@/app/services/auth.service";
import { OrderedProduct } from "@/models";
import { Product } from "@/models/product";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductPage() {
  const params = useParams();
  const id_product = params?.id_product as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:1338/api/products/${id_product}?populate=*`, {
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

    fetchProduct();
  }, [id_product]);

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

  const addToCart = () => {
    if (!product) return;
    
    const existingCart: OrderedProduct[] = JSON.parse(localStorage.getItem("cart") ?? "[]");
    const existingItemIndex = existingCart.findIndex(item => item.product?.id === product.id);
    
    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push({id: 0, createdAt: "", updatedAt: "", quantity: quantity, product: product, documentId: ""});
    }
    
    localStorage.setItem("cart", JSON.stringify(existingCart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div className="flex justify-center p-8">Chargement...</div>;
  if (!product) return <div className="flex justify-center p-8">Produit non trouvé</div>;

  const discountedPrice = calculateDiscountedPrice(product.price, product.discounts);
  const hasDiscount = discountedPrice !== product.price;

  const calculateAverageRating = () => {
    if (!product.feedbacks || product.feedbacks.length === 0) return 0;
    const sum = product.feedbacks.reduce((acc, feedback) => acc + feedback.grade, 0);
    return sum / product.feedbacks.length;
  };

  const averageRating = calculateAverageRating();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
          <span className="text-muted-foreground">Image du produit</span>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {product.product_categories?.map(category => (
                <span key={category.id} className="bg-accent text-accent-foreground px-2 py-1 rounded text-sm">
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
                {product.price.toFixed(2)}€
              </span>
            </div>
            {product.option && (
              <p className="text-sm text-muted-foreground">
                Option: {product.option.name} (+{product.option.priceModifier}€)
              </p>
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
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 font-medium"
            >
              {added ? "✓ Ajouté !" : `Ajouter au panier - ${(product.price * quantity).toFixed(2)}€`}
            </button>
          </div>
        </div>
      </div>

      {product.feedbacks && product.feedbacks.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Avis clients</h2>
          <div className="space-y-4">
            {product.feedbacks.map(feedback => (
              <div key={feedback.id} className="border border-border rounded-lg p-4 bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-card-foreground">
                    {feedback.client?.firstname} {feedback.client?.lastname}
                  </span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < feedback.grade ? "text-chart-4" : "text-muted-foreground"}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground">{feedback.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}