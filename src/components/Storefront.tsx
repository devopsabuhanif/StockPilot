import { useState, useEffect, useRef } from 'react';
import { db, collection, query, where, onSnapshot, limit } from '../firebase';
import { Product } from '../types';
import { 
  Package, 
  Phone, 
  Search, 
  X, 
  ShoppingBag, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Cpu, 
  Info, 
  ListChecks, 
  Settings as SettingsIcon,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Logo } from './Logo';
import { HeartZap } from './HeartZap';
import { cn } from '../lib/utils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'motion/react';

gsap.registerPlugin(ScrollTrigger);

interface StorefrontProps {
  user?: any;
}

export default function Storefront({ user }: StorefrontProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const hasNewArrivals = products.some(p => {
    if (!p.updatedAt) return false;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return p.updatedAt.toMillis() > oneDayAgo;
  });

  useEffect(() => {
    // Fetch limited products for a "cute" curated look
    const q = query(collection(db, 'products'), limit(10)); // Fetch a few more to filter/sort but we'll slice
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      // Sort: Featured first, then by updatedAt
      const sortedProducts = productsData.sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0);
      }).slice(0, 6); // Limit to 6 products
      setProducts(sortedProducts);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
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
      {/* Stock Arrival Banner */}
      {hasNewArrivals && (
        <div className="bg-indigo-600 py-2 px-4 relative z-[60] overflow-hidden">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-12 whitespace-nowrap"
          >
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 text-white text-[10px] font-black uppercase tracking-[0.3em]">
                <Zap size={12} className="fill-white" />
                New Stock Arrival Mode Active
                <span className="opacity-50">•</span>
                Check Out Latest Gear
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Digital Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Cyber Grid */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0], 
            y: [0, -50, 0],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"
        />
      </div>

      {/* Header */}
      <header ref={headerRef} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.hash = '#/'}>
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
            <div className="flex items-center gap-2 sm:gap-4">
              <a href="#/admin" className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all duration-300 shadow-sm whitespace-nowrap">
                <Cpu size={16} />
                {user ? 'Dashboard' : 'Staff Login'}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a href="#/admin" className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all duration-300 shadow-sm whitespace-nowrap">
              <Cpu size={16} />
              <span className="hidden xs:inline">{user ? 'Dashboard' : 'Staff Login'}</span>
              <span className="xs:hidden">{user ? 'Dash' : 'Login'}</span>
            </a>
            <button className="md:hidden p-2 text-slate-600 dark:text-slate-400">
              <Zap size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-12 pb-24 sm:pt-32 sm:pb-48 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-8 border border-indigo-200 dark:border-indigo-800">
                <Zap size={14} className="animate-pulse" />
                The Future of Tech is Here
              </div>
              <h1 className="hero-title text-5xl sm:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[0.9]">
                Next-Gen <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400">Digital Gear</span>
              </h1>
              <p className="hero-subtitle text-slate-600 dark:text-slate-400 text-lg sm:text-2xl max-w-xl mb-12 font-medium leading-relaxed">
                Discover our curated collection of high-performance electronics and professional digital tools. 
                Engineered for excellence.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  onClick={() => gridRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/40 hover:bg-indigo-700 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                  Shop Now
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300">
                  View Catalog
                </button>
              </div>
            </div>

            {/* Hero Image/Visual */}
            <div className="hidden lg:block relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10"
              >
                <div className="relative aspect-square rounded-[4rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000" 
                    alt="Tech Hero" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-12">
                    <span className="text-indigo-400 font-black uppercase tracking-[0.3em] text-xs mb-2">Featured Product</span>
                    <h3 className="text-white text-3xl font-black tracking-tight">Pro Series Workstation</h3>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-10 -right-10 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 z-20"
                >
                  <Cpu size={40} className="text-indigo-600 mb-2" />
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white">99.9%</div>
                </motion.div>
              </motion.div>
              
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/10 rounded-full blur-[120px] -z-10"></div>
            </div>
          </div>
        </div>
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

      {/* Bento Grid Featured Categories - More compact */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 h-auto md:h-[450px]">
          <div className="md:col-span-2 md:row-span-2 h-[400px] md:h-full bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden group cursor-pointer border border-slate-800">
            <img 
              src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=1000" 
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
              alt="Laptops"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent p-6 sm:p-8 flex flex-col justify-end">
              <span className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[8px] sm:text-[10px] mb-1">High Performance</span>
              <h3 className="text-white text-2xl sm:text-3xl font-black mb-1 sm:mb-2 tracking-tighter">Pro Computing</h3>
              <p className="text-slate-400 max-w-sm font-medium text-xs sm:text-sm">Latest generation professional workstations.</p>
            </div>
          </div>
          <div className="md:col-span-2 h-[200px] md:h-full bg-indigo-600 rounded-[1.5rem] sm:rounded-[2rem] relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)]"></div>
            <div className="p-6 sm:p-8 h-full flex flex-col justify-center">
              <h3 className="text-white text-xl sm:text-2xl font-black mb-1 tracking-tighter">Mobile Excellence</h3>
              <p className="text-indigo-100 font-medium mb-3 sm:mb-4 text-xs sm:text-sm">Smartphones for life on the go.</p>
              <div className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-[8px] sm:text-[10px]">
                Browse Mobile <ArrowRight size={14} />
              </div>
            </div>
            <motion.div 
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -right-8 -bottom-8 opacity-20"
            >
              <Zap size={120} className="sm:size-[150px]" />
            </motion.div>
          </div>
          <div className="h-[120px] md:h-full bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col justify-between group cursor-pointer hover:border-indigo-500 transition-colors">
            <div className="bg-slate-100 dark:bg-slate-800 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck size={18} className="text-indigo-600" />
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-black tracking-tight text-xs sm:text-sm">Secure Tech</h4>
              <p className="text-slate-500 text-[8px] sm:text-[9px] font-medium">Full Warranty</p>
            </div>
          </div>
          <div className="h-[120px] md:h-full bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 flex flex-col justify-between group cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
            <div className="bg-white dark:bg-slate-900 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Globe size={18} className="text-indigo-600" />
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-black tracking-tight text-xs sm:text-sm">Global Reach</h4>
              <p className="text-slate-500 text-[8px] sm:text-[9px] font-medium">Fast Shipping</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main ref={gridRef} className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        
        {/* Filter & Search Header - More compact */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Curated <span className="text-indigo-600">Gear</span></h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Handpicked digital essentials for you.</p>
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

        {/* Product Grid - More compact "cute" grid */}
        <div className="product-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map(product => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={product.id} 
                className="product-card bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-[0_20px_40px_-12px_rgba(79,70,229,0.12)] transition-all duration-500 flex flex-col group relative"
              >
                {/* Status Badges - Smaller */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex flex-col gap-1.5">
                  {product.isFeatured && (
                    <div className="bg-indigo-600 text-white text-[8px] sm:text-[9px] font-black px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                      Featured
                    </div>
                  )}
                </div>

                <div 
                  className="aspect-square bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
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
                      <Package size={40} strokeWidth={1} />
                    </div>
                  )}
                  
                  {/* Overlay on Hover - More subtle */}
                  <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors duration-500 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-black text-slate-900 dark:text-white shadow-lg">
                      <Info size={12} />
                      Details
                    </div>
                  </div>
                </div>
                
                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                  <div className="mb-3">
                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">
                      {product.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  
                  <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tighter">৳{product.price}</span>
                    <button
                      onClick={() => handleOrder(product)}
                      disabled={product.stock <= 0}
                      className="h-8 w-8 sm:h-10 sm:w-10 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all duration-300 disabled:opacity-30 group/btn shadow-md shadow-slate-200 dark:shadow-none"
                    >
                      <ShoppingBag size={16} className="group-hover/btn:scale-110 transition-transform" />
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

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 inset-y-4 sm:inset-auto sm:w-full sm:max-w-5xl sm:h-[85vh] bg-white dark:bg-slate-900 z-[110] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col sm:flex-row border border-slate-200 dark:border-slate-800"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 z-20 p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-lg"
              >
                <X size={20} />
              </button>

              {/* Left: Image Section */}
              <div className="w-full sm:w-1/2 h-64 sm:h-auto bg-slate-50 dark:bg-slate-800/50 relative group overflow-hidden">
                {selectedProduct.imageUrl ? (
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-slate-700">
                    <Package size={120} strokeWidth={1} />
                  </div>
                )}
                
                {/* Brand Badge */}
                {selectedProduct.brand && (
                  <div className="absolute bottom-8 left-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-0.5">Brand</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{selectedProduct.brand}</span>
                  </div>
                )}
              </div>

              {/* Right: Content Section */}
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 sm:p-12 custom-scrollbar">
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100 dark:border-indigo-800">
                          {selectedProduct.category}
                        </span>
                        {selectedProduct.stock > 0 ? (
                          <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-800">
                            In Stock
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-100 dark:border-red-800">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        {selectedProduct.name}
                      </h2>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">৳{selectedProduct.price.toLocaleString()}</span>
                        <span className="text-sm font-bold text-slate-400 line-through">৳{(selectedProduct.price * 1.1).toFixed(0)}</span>
                      </div>
                    </div>

                    {/* Description */}
                    {selectedProduct.description && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                          <div className="w-1 h-4 bg-indigo-600 rounded-full" />
                          Overview
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                          {selectedProduct.description}
                        </p>
                      </div>
                    )}

                    {/* Key Features */}
                    {selectedProduct.keyFeatures && selectedProduct.keyFeatures.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                          <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                          Key Features
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedProduct.keyFeatures.map((feature, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-500 transition-colors">
                              <div className="mt-1 p-1 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                                <ListChecks size={12} className="text-indigo-600" />
                              </div>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Specifications */}
                    {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                      <div className="space-y-6">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] flex items-center gap-3">
                          <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                          Technical Specifications
                        </h4>
                        <div className="grid grid-cols-1 gap-px bg-slate-200 dark:bg-slate-800 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800">
                          {Object.entries(selectedProduct.specifications).map(([key, val]) => (
                            <div key={key} className="flex flex-col sm:flex-row bg-white dark:bg-slate-900 group">
                              <div className="sm:w-1/3 px-8 py-5 bg-slate-50/50 dark:bg-slate-800/30 border-r border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{key}</span>
                              </div>
                              <div className="flex-1 px-8 py-5">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{val}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-8 sm:p-10 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-6">
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Secure Checkout</p>
                    <div className="flex items-center gap-3 opacity-50">
                      <ShieldCheck size={20} />
                      <Globe size={20} />
                      <Zap size={20} />
                    </div>
                  </div>
                  <button 
                    onClick={() => handleOrder(selectedProduct)}
                    className="flex-1 sm:flex-none px-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/40 hover:bg-indigo-700 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group"
                  >
                    Order on WhatsApp
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
