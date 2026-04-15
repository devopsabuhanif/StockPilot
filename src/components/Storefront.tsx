import { useState, useEffect, useRef } from 'react';
import { db, collection, query, where, onSnapshot } from '../firebase';
import { Product } from '../types';
import { Package, Phone, Search, X, ShoppingBag, ArrowRight, Zap, ShieldCheck, Globe, Cpu } from 'lucide-react';
import { Logo } from './Logo';
import { HeartZap } from './HeartZap';
import { cn } from '../lib/utils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'motion/react';

gsap.registerPlugin(ScrollTrigger);

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Only fetch featured products
    const q = query(collection(db, 'products'), where('isFeatured', '==', true));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching featured products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && products.length > 0) {
      // Hero animations
      const ctx = gsap.context(() => {
        gsap.from(".hero-title", {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "power4.out",
          delay: 0.2
        });
        
        gsap.from(".hero-subtitle", {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: "power4.out",
          delay: 0.4
        });

        gsap.from(".hero-badge", {
          scale: 0.8,
          opacity: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
          delay: 0.1
        });

        // Staggered product cards
        gsap.from(".product-card", {
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".product-grid",
            start: "top 85%",
          }
        });
      });

      return () => ctx.revert();
    }
  }, [loading, products.length]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOrder = (product: Product) => {
    const message = `Hi! I'm interested in ordering: ${product.name} (৳${product.price}). Is it available?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Digital Background for Loading */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Logo className="w-8 h-8 text-indigo-500 animate-pulse" />
          </div>
        </div>
        <p className="mt-6 text-indigo-400 font-mono text-sm tracking-widest animate-pulse uppercase">Initializing Storefront...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-200 selection:bg-indigo-500 selection:text-white">
      {/* Digital Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      {/* Header */}
      <header ref={headerRef} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 group-hover:scale-110 transition-transform duration-300">
              <Logo className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">SMART DIGITAL</span>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-[0.2em] uppercase mt-1">Storefront</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              {['Home', 'Products', 'About', 'Contact'].map((item) => (
                <a key={item} href="#" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group">
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </nav>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
            <a href="/" className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm font-bold hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all duration-300 shadow-sm">
              <Cpu size={16} />
              Owner Portal
            </a>
          </div>

          <button className="md:hidden p-2 text-slate-600 dark:text-slate-400">
            <Zap size={24} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-12 pb-24 sm:pt-20 sm:pb-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-6 border border-indigo-200 dark:border-indigo-800">
            <Zap size={14} className="animate-pulse" />
            New Arrivals Available
          </div>
          <h1 className="hero-title text-4xl sm:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
            Upgrade Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400">Digital Life</span>
          </h1>
          <p className="hero-subtitle text-slate-600 dark:text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            Premium electronics and digital accessories curated for the modern professional. 
            Experience technology like never before.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 hover:bg-indigo-700 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group">
              Explore Collection
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300">
              View Deals
            </button>
          </div>
        </div>

        {/* Decorative Digital Elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      </section>

      {/* Features Bar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: <ShieldCheck className="text-emerald-500" />, title: "Authentic Products", desc: "100% genuine electronics" },
            { icon: <Zap className="text-amber-500" />, title: "Fast Delivery", desc: "Same day shipping available" },
            { icon: <Globe className="text-blue-500" />, title: "Online Support", desc: "24/7 dedicated assistance" }
          ].map((feature, i) => (
            <div key={i} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center gap-4 group hover:border-indigo-500 transition-colors duration-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider">{feature.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        
        {/* Filter & Search Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Featured Products</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Handpicked digital essentials just for you.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Search Bar */}
            <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2 w-full sm:w-80 group focus-within:border-indigo-500 transition-all">
              <div className="pl-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 py-2 pr-3 bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 text-sm font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Categories Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto pb-8 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                activeCategory === cat 
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-500"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map(product => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={product.id} 
                className="product-card bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 transition-all duration-500 flex flex-col group relative"
              >
                {/* Sale Badge */}
                {product.price < 1000 && (
                  <div className="absolute top-4 left-4 z-10 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                    Hot Deal
                  </div>
                )}

                <div 
                  className="aspect-[4/5] bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden cursor-pointer"
                  onClick={() => product.imageUrl && setLightboxImage(product.imageUrl)}
                >
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-slate-700">
                      <Package size={64} strokeWidth={1} />
                    </div>
                  )}
                  
                  {/* Digital Scanline Effect on Hover */}
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px]"></div>
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors duration-500"></div>
                  
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center">
                      <span className="bg-white text-slate-950 font-black px-6 py-2.5 rounded-full text-xs uppercase tracking-[0.2em] shadow-2xl">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-md">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Price</span>
                      <span className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter">৳{product.price}</span>
                    </div>
                    
                    <button
                      onClick={() => handleOrder(product)}
                      disabled={product.stock <= 0}
                      className="h-12 w-12 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all duration-300 disabled:opacity-30 disabled:grayscale shadow-lg shadow-slate-200 dark:shadow-indigo-900/20 group/btn"
                    >
                      <ShoppingBag size={20} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-slate-300 dark:text-slate-700" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">No digital treasures found</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
              {searchQuery ? `We couldn't find anything matching "${searchQuery}". Try another search term.` : "Check back later for our next drop of premium electronics!"}
            </p>
          </motion.div>
        )}
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 z-[100] flex items-center justify-center p-4 cursor-pointer backdrop-blur-xl"
            onClick={() => setLightboxImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxImage(null);
              }}
            >
              <X size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={lightboxImage} 
              alt="Product" 
              className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-[0_0_50px_rgba(79,70,229,0.3)]" 
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Newsletter / CTA */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-indigo-600 rounded-[3rem] p-8 sm:p-16 text-center relative overflow-hidden shadow-2xl shadow-indigo-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">Stay in the Digital Loop</h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto font-medium">
              Join our community to get exclusive early access to new product drops and special digital deals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-indigo-200 outline-none focus:bg-white/20 transition-all font-bold"
              />
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black hover:bg-indigo-50 transition-all duration-300 shadow-xl">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 text-white p-2 rounded-xl">
                  <Logo className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">SMART DIGITAL</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm leading-relaxed">
                Your premier destination for high-quality electronics and digital accessories. 
                We bring the future of technology to your doorstep.
              </p>
              <div className="flex items-center gap-4">
                {['Twitter', 'Instagram', 'Facebook', 'LinkedIn'].map(social => (
                  <a key={social} href="#" className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-indigo-600 hover:text-white transition-all duration-300">
                    <Globe size={18} />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-6">Quick Links</h4>
              <ul className="space-y-4">
                {['All Products', 'Featured Deals', 'New Arrivals', 'Support Center'].map(link => (
                  <li key={link}>
                    <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="text-slate-500 dark:text-slate-400 font-bold text-sm">support@smartdigital.com</li>
                <li className="text-slate-500 dark:text-slate-400 font-bold text-sm">+880 1234 567890</li>
                <li className="text-slate-500 dark:text-slate-400 font-bold text-sm">Dhaka, Bangladesh</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">© {new Date().getFullYear()} SMART DIGITAL CARE. All rights reserved.</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              Powered by <HeartZap className="w-4 h-4 text-rose-500" /> <span className="font-black text-slate-900 dark:text-white tracking-tight">StockPilot</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
