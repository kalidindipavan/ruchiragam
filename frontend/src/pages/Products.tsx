import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, Search, Sparkles, Star, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

import apiClient from '../lib/apiClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useCartStore } from '../store/cartStore';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [aiQuery, setAiQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const { addToCart } = useCartStore();

  // Parse filters from URL
  const currentCategory = searchParams.get('category') || '';
  const isVeg = searchParams.get('is_vegetarian') === 'true';
  const isSpicy = searchParams.get('is_spicy') === 'true';
  const maxPrice = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : 2000;
  const sortBy = searchParams.get('sort') || 'newest';

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/categories');
      return data.data;
    },
  });

  // Fetch Products based on filters
  const { data: productsData, isLoading: productsLoading, refetch } = useQuery({
    queryKey: ['products', currentCategory, isVeg, isSpicy, maxPrice, sortBy],
    queryFn: async () => {
      let sortParam = 'created_at';
      let orderParam = 'desc';
      if (sortBy === 'price_asc') { sortParam = 'price'; orderParam = 'asc'; }
      if (sortBy === 'price_desc') { sortParam = 'price'; orderParam = 'desc'; }

      const { data } = await apiClient.get('/products', {
        params: {
          category_id: categoriesData?.find((c: any) => c.slug === currentCategory)?.id || undefined,
          is_vegetarian: isVeg ? true : undefined,
          is_spicy: isSpicy ? true : undefined,
          max_price: maxPrice < 2000 ? maxPrice : undefined,
          sort: sortParam,
          order: orderParam,
          limit: 100, // For demo purposes, we fetch max
        },
      });
      return data;
    },
    enabled: !!categoriesData, // Wait for categories to load
  });

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setIsAiSearching(true);
    try {
      const { data } = await apiClient.post('/ai/search', { query: aiQuery });
      
      // Update local URL params based on AI result
      const newParams = new URLSearchParams();
      if (data.data.filters_applied.category) {
         newParams.set('category', data.data.filters_applied.category.toLowerCase().replace(/ /g, '-'));
      }
      if (data.data.filters_applied.is_vegetarian) {
         newParams.set('is_vegetarian', 'true');
      }
      if (data.data.filters_applied.is_spicy) {
         newParams.set('is_spicy', 'true');
      }
      if (data.data.filters_applied.max_price) {
         newParams.set('max_price', data.data.filters_applied.max_price.toString());
      }
      setSearchParams(newParams);
      toast.success('AI Filters Applied ✨');
    } catch (error) {
      toast.error('AI Search failed. Try normal filters.');
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, null, 1);
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Login required to add to cart');
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen pt-8 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header & AI Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-display font-bold text-[var(--text-primary)] mb-2">
              Our Menu
            </h1>
            <p className="text-[var(--text-secondary)]">Authentic homemade food delivered to you</p>
          </div>

          {/* AI Search Bar */}
          <form onSubmit={handleAiSearch} className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Sparkles className="h-5 w-5 text-[var(--saffron-400)]" />
            </div>
            <Input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="e.g. Spicy veg curries under ₹200..."
              className="pl-10 pr-24 h-12 rounded-full border-[var(--border-strong)] bg-[var(--bg-elevated)] focus:border-[var(--saffron-500)] shadow-[0_0_15px_rgba(245,137,10,0.1)] transition-all"
            />
            <Button 
              type="submit" 
              disabled={isAiSearching}
              className="absolute right-1 top-1 bottom-1 h-10 w-20 rounded-full bg-[var(--saffron-500)] hover:bg-[var(--saffron-600)] text-white"
            >
              {isAiSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-8 bg-[var(--bg-elevated)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
              <div>
                <h3 className="flex items-center gap-2 font-display font-bold text-lg text-[var(--text-primary)] mb-4">
                  <Filter className="h-4 w-4" /> Categories
                </h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => setSearchParams(new URLSearchParams())} 
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!currentCategory ? 'bg-[var(--saffron-500)]/10 text-[var(--saffron-400)] font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
                  >
                    All Items
                  </button>
                  {categoriesData?.map((cat: any) => (
                    <button 
                      key={cat.id} 
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('category', cat.slug);
                        setSearchParams(params);
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentCategory === cat.slug ? 'bg-[var(--saffron-500)]/10 text-[var(--saffron-400)] font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[var(--border-subtle)]" />

              <div>
                <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-4">Dietary</h3>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border ${isVeg ? 'bg-[var(--leaf-500)] border-[var(--leaf-500)]' : 'border-[var(--border-strong)] bg-transparent'} flex items-center justify-center transition-colors`}>
                       {isVeg && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={isVeg}
                      onChange={(e) => {
                        const params = new URLSearchParams(searchParams);
                        if (e.target.checked) params.set('is_vegetarian', 'true');
                        else params.delete('is_vegetarian');
                        setSearchParams(params);
                      }}
                    />
                    <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition">Vegetarian Only</span>
                  </label>

                  {/* Spicy Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer group mt-3">
                    <div className={`w-5 h-5 rounded border ${isSpicy ? 'bg-[var(--chili-500)] border-[var(--chili-500)]' : 'border-[var(--border-strong)] bg-transparent'} flex items-center justify-center transition-colors`}>
                       {isSpicy && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={isSpicy}
                      onChange={(e) => {
                        const params = new URLSearchParams(searchParams);
                        if (e.target.checked) params.set('is_spicy', 'true');
                        else params.delete('is_spicy');
                        setSearchParams(params);
                      }}
                    />
                    <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition">Spicy Items Only</span>
                  </label>

                  {/* Price Slider */}
                  <div className="pt-4 mt-4 border-t border-[var(--border-subtle)]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-[var(--text-secondary)]">Max Price</span>
                      <span className="text-sm font-semibold text-[var(--saffron-400)]">
                        {maxPrice === 2000 ? 'Any' : `₹${maxPrice}`}
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="100" 
                      max="2000" 
                      step="50"
                      value={maxPrice}
                      onChange={(e) => {
                        const params = new URLSearchParams(searchParams);
                        params.set('max_price', e.target.value);
                        setSearchParams(params);
                      }}
                      className="w-full h-2 bg-[var(--border-subtle)] rounded-lg appearance-none cursor-pointer accent-[var(--saffron-500)] outline-none focus:outline-none"
                      style={{ background: `linear-gradient(to right, var(--saffron-500) ${((maxPrice - 100) / 1900) * 100}%, var(--border-strong) ${((maxPrice - 100) / 1900) * 100}%)` }}
                    />
                  </div>
                </div>
              </div>
          </div>

          {/* Product Grid Header */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-[var(--border-subtle)] pb-4">
              <h2 className="text-xl font-display font-medium text-[var(--text-primary)]">
                {productsData?.pagination?.total_items || productsData?.data?.length || 0} Products
              </h2>
              
              <div className="flex items-center gap-3">
                 <span className="text-sm font-medium text-[var(--text-secondary)]">Sort By:</span>
                 <select 
                   value={sortBy}
                   onChange={(e) => {
                     const params = new URLSearchParams(searchParams);
                     params.set('sort', e.target.value);
                     setSearchParams(params);
                   }}
                   className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--saffron-500)] transition-colors cursor-pointer appearance-none shadow-sm h-9"
                 >
                   <option value="newest">Newest Arrivals</option>
                   <option value="price_asc">Price: Low to High</option>
                   <option value="price_desc">Price: High to Low</option>
                 </select>
              </div>
            </div>

            {productsLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--saffron-500)]" />
              </div>
            ) : productsData?.data?.length === 0 ? (
              <div className="text-center py-20 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)]">
                <div className="bg-[var(--bg-card)] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border-strong)]">
                  <Search className="h-8 w-8 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">No products found</h3>
                <p className="text-[var(--text-muted)] mt-2">Try adjusting your filters or search query.</p>
                <Button 
                  onClick={() => setSearchParams(new URLSearchParams())} 
                  variant="outline" 
                  className="mt-6"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                 {productsData?.data?.map((product: any) => (
                   <Card key={product.id} className="group flex flex-col overflow-hidden bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--saffron-500)] transition-all duration-300 hover:shadow-saffron relative">
                      <div className="aspect-[4/3] w-full overflow-hidden relative">
                         <img 
                           src={product.image_url || 'https://via.placeholder.com/400x300'} 
                           alt={product.name} 
                           className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                         />
                         <div className="absolute top-3 left-3 flex gap-2">
                            {product.is_vegetarian ? <Badge variant="veg">Veg</Badge> : <Badge variant="destructive" className="bg-red-900 border-red-800 text-red-100">Non-Veg</Badge>}
                            {product.is_spicy && <Badge variant="spicy">Spicy</Badge>}
                         </div>
                         <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-black/50 backdrop-blur-md rounded-lg p-2 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <div className="flex items-center gap-1 text-white text-xs font-semibold">
                               <Star className="w-3 h-3 fill-[var(--saffron-400)] text-[var(--saffron-400)]" />
                               {product.rating_avg} ({product.rating_count})
                             </div>
                             <span className="text-xs text-gray-300">{product.preparation_time_minutes} mins prep</span>
                         </div>
                      </div>
                      <CardContent className="flex flex-col flex-1 p-5">
                         <div className="flex-1">
                           <div className="text-xs font-semibold uppercase tracking-wider text-[var(--saffron-500)] mb-1">
                              {product.categories?.name}
                           </div>
                           <Link to={`/products/${product.id}`} className="block">
                             <h3 className="font-display font-bold text-[var(--text-primary)] text-lg line-clamp-1 group-hover:text-[var(--saffron-400)] transition-colors">
                               {product.name}
                             </h3>
                           </Link>
                           <p className="mt-2 text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                             {product.description}
                           </p>
                         </div>
                         <div className="mt-5 flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                            <span className="font-display font-bold text-2xl text-[var(--text-primary)]">
                              ₹{product.price}
                            </span>
                            <Button onClick={() => handleAddToCart(product.id)} className="rounded-xl px-5 shadow-[0_4px_15px_rgba(245,137,10,0.2)]">
                               Add
                            </Button>
                         </div>
                      </CardContent>
                   </Card>
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
