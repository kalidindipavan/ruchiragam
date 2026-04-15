import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Star, Clock, Info, ShieldCheck, Truck, ChevronLeft, Minus, Plus, X } from 'lucide-react';

import apiClient from '../lib/apiClient';
import { useCartStore } from '../store/cartStore';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { data: productData, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/products/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--saffron-500)] border-t-transparent"></div>
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[var(--bg-primary)] text-center px-4">
        <h2 className="text-3xl font-display font-bold text-[var(--saffron-400)]">Product Not Found</h2>
        <p className="mt-2 text-[var(--text-secondary)]">The item you are looking for does not exist or has been removed.</p>
        <Button className="mt-6" onClick={() => navigate('/products')}>Back to Menu</Button>
      </div>
    );
  }

  const handleAddToCart = async () => {
    try {
      if (productData.variants?.length > 0 && !selectedVariant) {
        toast.error('Please select a size/variant');
        return;
      }
      await addToCart(productData.id, selectedVariant, quantity);
      toast.success('Added to cart');
    } catch (error) {
       toast.error('Please log in to add items to cart');
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      await apiClient.post('/reviews', {
        product_id: productData.id,
        rating: reviewRating,
        comment: reviewComment
      });
      toast.success('Your review has been successfully posted!');
      setIsReviewModalOpen(false);
      setReviewComment('');
      setReviewRating(5);
      // Wait for the backend recalculation if any, or just refetch immediately
      // The API often updates product.rating_avg on trigger or post
      window.location.reload(); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'You must be logged in to leave a review, or you already reviewed this item!');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getPrice = () => {
    if (selectedVariant && productData.variants) {
      const variant = productData.variants.find((v: any) => v.id === selectedVariant);
      return variant ? variant.price : productData.price;
    }
    return productData.price;
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Back */}
        <div className="mb-8 flex items-center justify-between text-sm text-[var(--text-muted)]">
          <Link to="/products" className="flex items-center hover:text-[var(--saffron-400)] transition">
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Menu
          </Link>
          <div className="flex items-center hidden sm:flex">
             <Link to="/" className="hover:text-[var(--text-primary)]">Home</Link>
             <span className="mx-2">/</span>
             <Link to={`/products?category=${productData.categories?.slug}`} className="hover:text-[var(--text-primary)]">{productData.categories?.name}</Link>
             <span className="mx-2">/</span>
             <span className="text-[var(--text-secondary)] truncate">{productData.name}</span>
          </div>
        </div>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
           
           {/* Image Gallery */}
           <div className="space-y-4">
             <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-saffron-lg relative">
                <img 
                  src={productData.image_url || 'https://via.placeholder.com/800x600'} 
                  alt={productData.name} 
                  className="h-full w-full object-cover" 
                />
                <div className="absolute top-4 left-4 flex gap-2">
                   {productData.is_vegetarian ? <Badge variant="veg" className="text-sm px-3 py-1">Vegetarian</Badge> : <Badge variant="destructive" className="bg-red-900 border-red-800 text-red-100 text-sm px-3 py-1">Non-Vegetarian</Badge>}
                   {productData.is_vegan && <Badge variant="vegan" className="text-sm px-3 py-1">Vegan</Badge>}
                   {productData.is_spicy && <Badge variant="spicy" className="text-sm px-3 py-1">Spicy Level {productData.spice_level}</Badge>}
                </div>
             </div>
             
             {/* Thumbnail row if multiple images exist */}
             {productData.images?.length > 0 && (
               <div className="flex gap-4 overflow-x-auto pb-2">
                 {[productData.image_url, ...productData.images].map((img, i) => (
                   <button key={i} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[var(--border-subtle)] hover:border-[var(--saffron-500)] transition">
                     <img src={img} alt="" className="h-full w-full object-cover" />
                   </button>
                 ))}
               </div>
             )}
           </div>

           {/* Product Info */}
           <div className="flex flex-col">
              <div className="border-b border-[var(--border-subtle)] pb-6 mb-6">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-sm font-bold uppercase tracking-widest text-[var(--saffron-500)]">{productData.categories?.name}</span>
                   <div className="flex items-center gap-1 bg-[var(--bg-elevated)] px-3 py-1 rounded-full border border-[var(--border-subtle)]">
                     <Star className="h-4 w-4 fill-[var(--saffron-400)] text-[var(--saffron-400)]" />
                     <span className="font-bold text-[var(--text-primary)]">{productData.rating_avg}</span>
                     <span className="text-sm text-[var(--text-muted)]">({productData.rating_count} reviews)</span>
                   </div>
                 </div>
                 
                 <h1 className="text-4xl sm:text-5xl font-display font-bold text-[var(--text-primary)] leading-tight mb-4">
                   {productData.name}
                 </h1>
                 
                 <div className="text-3xl font-bold text-[var(--saffron-400)] mb-4">
                   ₹{getPrice()}
                 </div>
                 
                 <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                   {productData.description}
                 </p>
              </div>

              {/* Variants Selector */}
              {productData.variants?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-3">Select Size / Variant</h3>
                  <div className="flex flex-wrap gap-3">
                    {[...new Map(productData.variants.map((v: any) => [v.name, v])).values()].map((v: any) => (
                      <button
                        key={v.id}
                        disabled={!v.is_available}
                        onClick={() => setSelectedVariant(v.id)}
                        className={`px-5 py-3 rounded-xl border font-medium text-sm transition-all ${
                          selectedVariant === v.id 
                            ? 'border-[var(--saffron-500)] bg-[var(--saffron-500)]/10 text-[var(--saffron-400)] shadow-[0_0_15px_rgba(245,137,10,0.2)]' 
                            : 'border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--saffron-400)] disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {v.name} - ₹{v.price}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions & Highlights */}
              <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 mb-8">
                 <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                   
                   <div className="flex items-center h-14 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card)]">
                     <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 text-[var(--text-secondary)] hover:text-[var(--saffron-400)] h-full flex items-center">
                       <Minus className="h-4 w-4" />
                     </button>
                     <span className="w-8 text-center font-bold text-[var(--text-primary)]">{quantity}</span>
                     <button onClick={() => setQuantity(quantity + 1)} className="px-4 text-[var(--text-secondary)] hover:text-[var(--saffron-400)] h-full flex items-center">
                       <Plus className="h-4 w-4" />
                     </button>
                   </div>
                   
                   <Button onClick={handleAddToCart} size="lg" className="w-full sm:flex-1 h-14 text-lg font-bold shadow-[0_4px_20px_rgba(245,137,10,0.3)]">
                     Add to Cart • ₹{getPrice() * quantity}
                   </Button>
                 </div>

                 <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-subtle)] pt-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[var(--bg-card)] rounded-lg text-[var(--saffron-400)]">
                         <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--text-primary)]">{productData.preparation_time_minutes} Mins</h4>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">Fresh preparation time</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[var(--bg-card)] rounded-lg text-[var(--saffron-400)]">
                         <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--text-primary)]">Homemade</h4>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">No artificial preservatives</p>
                      </div>
                    </div>
                 </div>
              </div>

              {/* Tags & Meta */}
              {productData.tags?.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-[var(--text-muted)] flex items-center gap-1"><Info className="h-4 w-4" /> Tags:</span>
                  {productData.tags.map((tag: string) => (
                    <span key={tag} className="text-xs font-semibold px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
           </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-24 border-t border-[var(--border-subtle)] pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             <div className="lg:col-span-1">
                <h2 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-4">Customer Reviews</h2>
                <div className="flex items-center gap-4 mb-6">
                   <span className="text-5xl font-display font-bold text-[var(--saffron-400)]">{productData.rating_avg}</span>
                   <div>
                     <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} className={`h-5 w-5 ${i <= productData.rating_avg ? 'fill-[var(--saffron-400)] text-[var(--saffron-400)]' : 'fill-[var(--bg-elevated)] text-[var(--border-subtle)]'}`} />
                        ))}
                     </div>
                     <p className="text-sm text-[var(--text-secondary)]">Based on {productData.rating_count} reviews</p>
                   </div>
                </div>
                {/* Write Review Button */}
                <Button variant="outline" className="w-full h-12 border-[var(--saffron-500)] text-[var(--saffron-500)] hover:bg-[var(--saffron-500)] hover:text-black transition-colors" onClick={() => setIsReviewModalOpen(true)}>Write a Review</Button>
             </div>
             
             <div className="lg:col-span-2 space-y-6">
                {productData.reviews?.length > 0 ? (
                  productData.reviews.map((review: any) => (
                    <Card key={review.id} className="bg-[var(--bg-elevated)] border-[var(--border-subtle)] p-6">
                       <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#f5890a] to-[#ffaa14] flex items-center justify-center font-bold text-[#1a1814]">
                              {review.users?.full_name?.charAt(0)}
                            </div>
                            <div>
                               <p className="font-semibold text-[var(--text-primary)]">{review.users?.full_name}</p>
                               <p className="text-xs text-[var(--text-muted)]">{new Date(review.created_at).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className="flex gap-0.5">
                           {[1, 2, 3, 4, 5].map(i => (
                             <Star key={i} className={`h-4 w-4 ${i <= review.rating ? 'fill-[var(--saffron-400)] text-[var(--saffron-400)]' : 'fill-transparent text-[var(--border-strong)]'}`} />
                           ))}
                         </div>
                       </div>
                       <p className="text-[var(--text-secondary)] leading-relaxed">{review.comment}</p>
                    </Card>
                  ))
                ) : (
                  <p className="text-[var(--text-muted)] italic">No reviews yet. Be the first to review!</p>
                )}
             </div>
          </div>
        </div>

      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <Card className="w-full max-w-lg bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-xl relative mt-20 sm:my-8 border-t-4 border-t-[var(--saffron-500)]">
            <button 
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 bg-[var(--bg-card)] rounded-full hover:bg-[var(--border-subtle)]"
            >
              <X className="h-5 w-5" />
            </button>
            <form onSubmit={submitReview} className="p-6 sm:p-8">
               <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-2">Write a Review</h2>
               <p className="text-sm text-[var(--text-secondary)] mb-6">How was your experience with the {productData.name}?</p>
               
               <div className="mb-6">
                 <label className="block text-sm font-bold text-[var(--text-primary)] mb-3">Overall Rating</label>
                 <div className="flex gap-2">
                   {[1, 2, 3, 4, 5].map(star => (
                     <button
                       key={star}
                       type="button"
                       onClick={() => setReviewRating(star)}
                       className="p-1 hover:scale-110 transition-transform focus:outline-none"
                     >
                       <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-[var(--saffron-400)] text-[var(--saffron-400)]' : 'fill-[var(--bg-card)] text-[var(--border-strong)]'}`} />
                     </button>
                   ))}
                 </div>
               </div>
               
               <div className="mb-6">
                 <label className="block text-sm font-bold text-[var(--text-primary)] mb-3">Your Comment</label>
                 <textarea 
                   rows={4} 
                   value={reviewComment}
                   onChange={e => setReviewComment(e.target.value)}
                   placeholder="Tell us what you loved about this authentic recipe!"
                   className="w-full rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--saffron-500)] focus:ring-1 focus:ring-[var(--saffron-500)] resize-none"
                   required
                 />
               </div>
               
               <Button type="submit" disabled={isSubmittingReview} className="w-full h-12 bg-[var(--saffron-500)] text-black hover:bg-[var(--saffron-600)] font-bold text-lg">
                 {isSubmittingReview ? 'Posting...' : 'Submit Review'}
               </Button>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
