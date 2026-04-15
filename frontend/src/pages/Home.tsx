import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Heart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-hero mix-blend-multiply" />
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#f5890a] to-[#ffaa14] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-[var(--text-primary)]">
          <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
            The True Taste of <br className="hidden lg:block" />
            <span className="gradient-text italic font-light drop-shadow-sm">Traditional Pickles</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-[var(--text-secondary)]">
            Authentic homemade Pachallu, Podis, and masalas passed down through generations. Sun-dried, hand-ground, and packed with love.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto font-bold tracking-wide shadow-lg shadow-[#f5890a]/30">
                  Shop Pickles & Podis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
             </Link>
             <Link to="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-medium">
                  Our Story
                </Button>
             </Link>
          </div>
          
          <div className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-16 text-sm font-medium text-[var(--text-muted)] animate-fade-in">
             <div className="flex items-center gap-2"><Star className="h-5 w-5 text-[var(--saffron-400)]" /> 4.9+ Rated</div>
             <div className="flex items-center gap-2"><Truck className="h-5 w-5 text-[var(--saffron-400)]" /> Free Delivery &gt; ₹500</div>
             <div className="flex items-center gap-2"><Heart className="h-5 w-5 text-[var(--saffron-400)]" /> 100% Homemade Without Preservatives</div>
          </div>
        </div>
      </section>

      {/* ─── Featured Categories ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="flex items-end justify-between mb-12">
             <div>
                <h2 className="text-3xl font-display font-bold text-[var(--text-primary)] md:text-4xl">
                  Shop by Category
                </h2>
                <p className="mt-2 text-[var(--text-secondary)]">Discover our heritage flavors</p>
             </div>
             <Link to="/products" className="hidden sm:flex items-center text-sm font-semibold text-[var(--saffron-400)] hover:text-[var(--saffron-500)] transition">
               View all <ArrowRight className="ml-1 h-4 w-4" />
             </Link>
           </div>

           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Mango Pickles', img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&fit=crop', count: 'Avakaya & More', slug: 'mango-pickles' },
                { name: 'Veg Pickles', img: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600&fit=crop', count: 'Tomato, Gongura...', slug: 'veg-pickles' },
                { name: 'Non-Veg Pickles', img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&fit=crop', count: 'Chicken, Mutton', slug: 'non-veg-pickles' },
                { name: 'Podis & Powders', img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&fit=crop', count: 'Kandi Podi, Idli Karam', slug: 'podis-powders' },
              ].map((cat, i) => (
                <Link key={i} to={`/products?category=${cat.slug}`} className="group relative overflow-hidden rounded-2xl block card-hover">
                   <div className="aspect-[4/5] w-full">
                     <img src={cat.img} alt={cat.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                     <div className="absolute bottom-0 left-0 p-6">
                        <h3 className="text-lg font-bold text-white font-display uppercase tracking-wide">{cat.name}</h3>
                        <p className="text-sm text-gray-300 mt-1">{cat.count}</p>
                     </div>
                   </div>
                </Link>
              ))}
           </div>
        </div>
      </section>

      {/* ─── Trending Pickles & Podis ──────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[var(--bg-primary)]">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-bold text-center text-[var(--text-primary)] md:text-5xl mb-16">
              Our Bestsellers
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Dummy data for design */}
               {[
{ name: "Andhra Special Avakaya (500g)", id: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01", price: 349, rating: 4.9, img: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80", veg: true, spicy: true },
                 { name: "Spicy Chicken Pickle (250g)", id: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05", price: 499, rating: 4.8, img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80", veg: false, spicy: true },
                 { name: "Guntur Gongura Pachadi", id: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03", price: 299, rating: 4.7, img: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&q=80", veg: true, spicy: true },
                 { name: "Authentic Kandi Podi", id: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07", price: 199, rating: 4.9, img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80", veg: true, spicy: false }
               ].map((dish, i) => (
                 <Card key={i} className="group overflow-hidden bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--saffron-500)] transition-all duration-300 hover:shadow-saffron-lg flex flex-col">
                    <div className="relative aspect-square overflow-hidden bg-[var(--bg-elevated)] shrink-0">
                      <img src={dish.img} alt={dish.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {dish.veg ? <Badge variant="veg">Veg</Badge> : <Badge variant="destructive" className="bg-red-900 text-red-100 border border-red-800">Non-Veg</Badge>}
                        {dish.spicy && <Badge variant="spicy">Spicy</Badge>}
                      </div>
                      <div className="absolute top-3 right-3 bg-[var(--bg-primary)]/80 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                        <Star className="h-3 w-3 fill-[var(--saffron-400)] text-[var(--saffron-400)]" />
                        <span className="text-xs font-bold text-white">{dish.rating}</span>
                      </div>
                    </div>
                    <CardContent className="p-5 flex flex-col flex-1">
                       <h3 className="font-display font-bold text-[var(--text-primary)] text-lg line-clamp-2 leading-tight group-hover:text-[var(--saffron-400)] transition-colors flex-1">{dish.name}</h3>
                       <div className="mt-4 flex items-center justify-between">
                         <span className="font-bold text-xl text-[var(--text-primary)]">₹{dish.price}</span>
                         <Button 
                           asChild 
                           size="sm" 
                           className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                         >
                           <Link to={`/products/${dish.id}`}>View Details</Link>
                         </Button>
                       </div>
                    </CardContent>
                 </Card>
               ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link to="/products">
                <Button variant="outline" size="lg" className="rounded-full">
                  Explore Entire Range <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
         </div>
      </section>
      
    </div>
  );
}
