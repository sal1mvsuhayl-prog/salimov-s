/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Product, CartItem, ViewState } from "./types";
import { PRODUCTS, BENTO_FEATURED } from "./data";

export default function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<ViewState>("home");
  const [selectedCategory, setSelectedCategory] = useState<"Erkaklar" | "Ayollar" | "Aksessuarlar" | "Barchasi">("Barchasi");
  
  // Default selected product for details page
  const defaultProduct = PRODUCTS.find(p => p.id === "kashmir-palto-salimvs") || PRODUCTS[0];
  const [selectedProduct, setSelectedProduct] = useState<Product>(defaultProduct);

  // Initialize Cart with the exact items from the Stitch Cart design
  const initialCart: CartItem[] = [
    {
      product: PRODUCTS.find(p => p.id === "kashmir-svitshot") || PRODUCTS[0],
      quantity: 1,
      selectedSize: "M"
    },
    {
      product: PRODUCTS.find(p => p.id === "klassik-jun-shim") || PRODUCTS[0],
      quantity: 1,
      selectedSize: "L"
    }
  ];
  const [cart, setCart] = useState<CartItem[]>(initialCart);

  // Interaction States
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  
  // Checkout Order Form State
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");

  // Product Details Size Selection
  const [detailsSize, setDetailsSize] = useState<string>("M");

  // Dynamic Toast Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handle header scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Show dynamic toast feedback
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Navigates to catalog with optional pre-filtered category
  const navigateToCatalog = (category: "Erkaklar" | "Ayollar" | "Aksessuarlar" | "Barchasi") => {
    setSelectedCategory(category);
    setCurrentView("catalog");
    setIsDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToView = (view: ViewState) => {
    setCurrentView(view);
    setIsDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setDetailsSize("M"); // reset selected size
    setCurrentView("product-details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Wishlist toggle
  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
      showToast("Tanlanganlardan o'chirildi");
    } else {
      setWishlist([...wishlist, productId]);
      showToast("Tanlanganlarga qo'shildi");
    }
  };

  // Cart operations
  const addToCart = (product: Product, size: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Check if item already exists with the exact same size
    const existingIndex = cart.findIndex(
      item => item.product.id === product.id && item.selectedSize === size
    );

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { product, quantity: 1, selectedSize: size }]);
    }

    showToast(`${product.name} savatchaga qo'shildi (${size})`);
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    const newQty = updated[index].quantity + delta;
    if (newQty > 0) {
      updated[index].quantity = newQty;
      setCart(updated);
    }
  };

  const removeFromCart = (index: number) => {
    const item = cart[index];
    setCart(cart.filter((_, i) => i !== index));
    showToast(`${item.product.name} savatchadan o'chirildi`);
  };

  // Calculate cart totals
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = 0; // Free delivery
  const total = subtotal;

  const formatUZS = (value: number) => {
    return value.toLocaleString("uz-UZ") + " UZS";
  };

  // Submit Newsletter
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
      showToast("Xabarnomaga muvaffaqiyatli a'zo bo'ldingiz!");
    }
  };

  // Submit Order
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutPhone || !checkoutAddress) {
      showToast("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }
    setOrderSuccess(true);
    setCart([]); // Clear cart after order placement
  };

  // Filter products for Catalog search & selection
  const filteredProducts = PRODUCTS.filter(product => {
    const matchesCategory = selectedCategory === "Barchasi" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.color.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-surface text-on-surface font-body-md selection:bg-primary-fixed selection:text-primary min-h-screen relative overflow-x-hidden">
      
      {/* Premium Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-primary text-on-primary px-8 py-4 shadow-xl border border-outline-variant flex items-center gap-3 transition-all animate-bounce">
          <span className="material-symbols-outlined fill-icon text-[18px]">check_circle</span>
          <span className="font-label-caps text-xs tracking-widest uppercase">{toastMessage}</span>
        </div>
      )}

      {/* SEARCH OVERLAY */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-primary/95 z-[90] flex flex-col justify-center px-6 md:px-24 transition-all duration-500">
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="absolute top-8 right-8 text-on-primary hover:opacity-70 transition-opacity"
          >
            <span className="material-symbols-outlined text-[36px]">close</span>
          </button>
          <div className="max-w-4xl mx-auto w-full">
            <p className="font-label-caps text-label-caps text-on-primary-container tracking-[0.2em] uppercase mb-4">Butik bo'ylab qidirish</p>
            <div className="flex border-b-2 border-on-primary-container py-4 items-center">
              <input 
                type="text"
                autoFocus
                placeholder="Mahsulot yoki rangni kiriting..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsSearchOpen(false);
                    setCurrentView("catalog");
                  }
                }}
                className="w-full bg-transparent border-none text-white text-2xl md:text-4xl outline-none focus:ring-0 placeholder:text-white/30 font-display-lg"
              />
              <span className="material-symbols-outlined text-white text-[32px]">search</span>
            </div>
            {searchQuery && (
              <p className="text-white/60 font-body-md mt-4">
                Topilgan natijalar: {filteredProducts.length} ta mahsulot. Ko'rish uchun Enter tugmasini bosing.
              </p>
            )}
          </div>
        </div>
      )}

      {/* MOBILE MENU DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[80] flex">
          <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-4/5 max-w-sm bg-surface h-full flex flex-col p-8 justify-between border-r border-outline-variant z-10 transition-transform">
            <div>
              <div className="flex justify-between items-center mb-12">
                <h3 className="font-display-lg-mobile text-2xl text-primary tracking-tighter">Salimv's</h3>
                <button onClick={() => setIsDrawerOpen(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <nav className="flex flex-col gap-6">
                <button 
                  onClick={() => navigateToView("home")}
                  className={`font-label-caps text-left text-lg py-2 border-b ${currentView === "home" ? "text-primary border-primary font-bold" : "text-on-surface-variant border-transparent"}`}
                >
                  Asosiy
                </button>
                <button 
                  onClick={() => navigateToCatalog("Barchasi")}
                  className={`font-label-caps text-left text-lg py-2 border-b ${currentView === "catalog" && selectedCategory === "Barchasi" ? "text-primary border-primary font-bold" : "text-on-surface-variant border-transparent"}`}
                >
                  Kiyimlar Katalogi
                </button>
                <button 
                  onClick={() => navigateToCatalog("Ayollar")}
                  className={`font-label-caps text-left text-lg py-2 border-b ${currentView === "catalog" && selectedCategory === "Ayollar" ? "text-primary border-primary font-bold" : "text-on-surface-variant border-transparent"}`}
                >
                  Ayollar kolleksiyasi
                </button>
                <button 
                  onClick={() => navigateToCatalog("Erkaklar")}
                  className={`font-label-caps text-left text-lg py-2 border-b ${currentView === "catalog" && selectedCategory === "Erkaklar" ? "text-primary border-primary font-bold" : "text-on-surface-variant border-transparent"}`}
                >
                  Erkaklar kolleksiyasi
                </button>
                <button 
                  onClick={() => navigateToCatalog("Aksessuarlar")}
                  className={`font-label-caps text-left text-lg py-2 border-b ${currentView === "catalog" && selectedCategory === "Aksessuarlar" ? "text-primary border-primary font-bold" : "text-on-surface-variant border-transparent"}`}
                >
                  Aksessuarlar
                </button>
                <button 
                  onClick={() => navigateToView("cart")}
                  className={`font-label-caps text-left text-lg py-2 border-b ${currentView === "cart" ? "text-primary border-primary font-bold" : "text-on-surface-variant border-transparent"}`}
                >
                  Savatcha ({cart.reduce((sum, i) => sum + i.quantity, 0)})
                </button>
              </nav>
            </div>
            
            <div className="border-t border-outline-variant pt-6">
              <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-4">© 2024 Salimv's. Barcha huquqlar himoyalangan.</p>
              <div className="flex gap-4">
                <span className="font-bold text-xs uppercase tracking-wider cursor-pointer hover:text-primary">In</span>
                <span className="font-bold text-xs uppercase tracking-wider cursor-pointer hover:text-primary">Tg</span>
                <span className="font-bold text-xs uppercase tracking-wider cursor-pointer hover:text-primary">Fb</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WISHLIST DRAWER */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-500" 
            onClick={() => setIsWishlistOpen(false)}
          ></div>
          
          {/* Content Panel */}
          <div className="relative w-full sm:w-[480px] bg-surface h-full flex flex-col p-8 justify-between border-l border-outline-variant z-10 shadow-2xl overflow-y-auto">
            <div>
              <div className="flex justify-between items-center mb-10 border-b border-outline-variant pb-6">
                <div>
                  <h3 className="font-display-lg-mobile text-2xl text-primary tracking-tight font-serif italic">Tanlanganlar</h3>
                  <p className="text-xs text-on-surface-variant font-label-caps uppercase tracking-wider mt-1">{wishlist.length} ta premium model</p>
                </div>
                <button 
                  onClick={() => setIsWishlistOpen(false)}
                  className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {wishlist.length === 0 ? (
                <div className="py-24 text-center">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 font-light">favorite_border</span>
                  <p className="font-headline-sm text-primary mb-2">Hozircha bo'sh</p>
                  <p className="text-on-surface-variant text-sm max-w-xs mx-auto mb-8">Sizga yoqqan kiyimlarni shu yerda saqlash uchun yurakcha belgisini bosing.</p>
                  <button 
                    onClick={() => { setIsWishlistOpen(false); navigateToCatalog("Barchasi"); }}
                    className="bg-primary text-on-primary font-label-caps text-xs tracking-widest uppercase px-8 py-4 hover:bg-primary-container"
                  >
                    Katalogni ko'rish
                  </button>
                </div>
              ) : (
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                  {wishlist.map((id) => {
                    const item = PRODUCTS.find(p => p.id === id);
                    if (!item) return null;
                    return (
                      <div key={item.id} className="flex gap-4 pb-6 border-b border-outline-variant/60 items-center">
                        <div 
                          className="w-20 aspect-[3/4] bg-surface-container overflow-hidden cursor-pointer flex-shrink-0"
                          onClick={() => { navigateToProductDetails(item); setIsWishlistOpen(false); }}
                        >
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover img-sharp" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 
                            className="font-body-md text-sm uppercase text-primary font-bold truncate hover:underline cursor-pointer"
                            onClick={() => { navigateToProductDetails(item); setIsWishlistOpen(false); }}
                          >
                            {item.name}
                          </h4>
                          <p className="text-xs text-on-surface-variant font-semibold mt-1">{item.formattedPrice}</p>
                          <button 
                            onClick={() => addToCart(item, "M")}
                            className="mt-3 bg-primary text-on-primary py-2 px-4 font-label-caps text-[9px] tracking-widest uppercase hover:bg-primary-container transition-colors"
                          >
                            Savatchaga qo'shish
                          </button>
                        </div>
                        <button 
                          onClick={(e) => toggleWishlist(item.id, e)}
                          className="text-on-surface-variant hover:text-error transition-colors p-2"
                        >
                          <span className="material-symbols-outlined fill-icon text-error text-[20px]">favorite</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-outline-variant pt-6 mt-auto">
              <button 
                onClick={() => { setIsWishlistOpen(false); navigateToCatalog("Barchasi"); }}
                className="w-full bg-primary text-on-primary py-4 font-label-caps text-xs tracking-widest uppercase hover:bg-primary-container transition-all"
              >
                Katalogni davom ettirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIZING GUIDE MODAL */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSizeGuideOpen(false)}></div>
          <div className="bg-surface relative max-w-lg w-full p-8 border border-outline-variant shadow-2xl z-10">
            <button onClick={() => setSizeGuideOpen(false)} className="absolute top-4 right-4 text-primary">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-sm text-primary mb-6 uppercase">O'lchamlar Jadvali (Sizlar uchun)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-md text-sm border-collapse">
                <thead>
                  <tr className="border-b border-outline">
                    <th className="py-2 font-bold uppercase">O'lcham</th>
                    <th className="py-2 font-bold uppercase">Ko'krak qafasi (cm)</th>
                    <th className="py-2 font-bold uppercase">Bel (cm)</th>
                    <th className="py-2 font-bold uppercase">Bo'y (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  <tr>
                    <td className="py-3 font-semibold">S</td>
                    <td className="py-3">88 - 92</td>
                    <td className="py-3">78 - 82</td>
                    <td className="py-3">165 - 170</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold">M</td>
                    <td className="py-3">93 - 97</td>
                    <td className="py-3">83 - 87</td>
                    <td className="py-3">171 - 176</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold">L</td>
                    <td className="py-3">98 - 102</td>
                    <td className="py-3">88 - 92</td>
                    <td className="py-3">177 - 182</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold">XL</td>
                    <td className="py-3">103 - 108</td>
                    <td className="py-3">93 - 98</td>
                    <td className="py-3">183 - 188</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-on-surface-variant mt-6 leading-relaxed">
              * Ushbu jadval taxminiy o'lchamlarni ko'rsatadi. Har bir kiyimning bichimi modelga qarab farq qilishi mumkin.
            </p>
          </div>
        </div>
      )}

      {/* TOP APP BAR */}
      <header className={`fixed top-0 w-full z-50 bg-surface border-b transition-all duration-300 ${scrolled ? "shadow-md border-outline" : "border-outline-variant"}`}>
        {/* Premium Announcement Bar */}
        <div className="bg-primary text-on-primary py-2 px-4 text-center text-[10px] tracking-[0.25em] font-label-caps uppercase select-none flex items-center justify-center gap-3">
          <span className="w-1.5 h-1.5 bg-primary-fixed-dim rounded-full animate-ping"></span>
          <span>Butun O'zbekiston bo'ylab bepul tezkor yetkazib berish</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">Hashamatli premium qadoqlash bepul</span>
        </div>
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 w-full max-w-container-max mx-auto">
          
          {/* Burger menu & Left links */}
          <div className="flex items-center gap-6">
            <span 
              onClick={() => setIsDrawerOpen(true)}
              className="material-symbols-outlined text-primary cursor-pointer active:opacity-70 transition-opacity"
              id="menu-trigger-button"
            >
              menu
            </span>
            <nav className="hidden md:flex gap-8 items-center">
              <button 
                onClick={() => navigateToView("home")}
                className={`font-label-caps text-label-caps transition-colors duration-300 uppercase tracking-widest ${currentView === "home" ? "text-primary border-b border-primary" : "text-on-surface-variant hover:text-primary"}`}
              >
                Asosiy
              </button>
              <button 
                onClick={() => navigateToCatalog("Barchasi")}
                className={`font-label-caps text-label-caps transition-colors duration-300 uppercase tracking-widest ${currentView === "catalog" ? "text-primary border-b border-primary" : "text-on-surface-variant hover:text-primary"}`}
              >
                Katalog
              </button>
              <button 
                onClick={() => navigateToCatalog("Ayollar")}
                className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors duration-300 uppercase tracking-widest"
              >
                Ayollar
              </button>
              <button 
                onClick={() => navigateToCatalog("Erkaklar")}
                className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors duration-300 uppercase tracking-widest"
              >
                Erkaklar
              </button>
            </nav>
          </div>

          {/* Centered Brand Title */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 
              onClick={() => navigateToView("home")}
              className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg tracking-tighter text-primary cursor-pointer active:opacity-75"
            >
              Salimv's
            </h1>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-6">
            <span 
              onClick={() => setIsSearchOpen(true)}
              className="material-symbols-outlined text-primary cursor-pointer active:opacity-70 transition-opacity"
              id="search-trigger-button"
            >
              search
            </span>
            {/* Wishlist Trigger */}
            <div 
              onClick={() => setIsWishlistOpen(true)}
              className="relative flex items-center cursor-pointer active:opacity-70 transition-opacity"
              id="wishlist-trigger-button"
            >
              <span className={`material-symbols-outlined text-primary ${wishlist.length > 0 ? "fill-icon text-error" : ""}`}>favorite</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-error text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </div>
            {/* Cart Trigger */}
            <div 
              onClick={() => navigateToView("cart")}
              className="relative flex items-center cursor-pointer active:opacity-70 transition-opacity"
              id="cart-trigger-button"
            >
              <span className="material-symbols-outlined text-primary">shopping_bag</span>
              {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                <span className="absolute -top-1 -right-2 bg-primary-container text-on-primary-container text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN VIEW CONTROLLER */}
      <main className="pt-28 md:pt-[112px]">

        {/* 1. HOME VIEW */}
        {currentView === "home" && (
          <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="relative h-[795px] w-full overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 z-0">
                <img 
                  className="w-full h-full object-cover animate-ken-burns img-sharp" 
                  alt="Salimv's Editorial Model Shoot"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuALIwpwRtRSSEuo102zvqqN8nt5qvDOFtPHaSe3FCSB08738k3jhTNn10yI_Cw88O69LYrMY7I2sGI0K_wI6Ou6IVAWx_qOodjJap8FfaBDEjMSxZDbBxD-bjAu5enASKGt8J3zCGjvQ0VG9cznUmwJ-bvk3vPcH0KB_4ffOGH68uj10_U_ZcY-dwHlzvZulqPT7Wn0fLmGswiBYRJqMWjtbvF23F7rAABdb_kFxbulqz_HOdXkyLlLg1a8U2X26yf27dW5PU91XiKc"
                />
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
              <div className="relative z-10 text-center px-margin-mobile fade-in-up">
                <p className="font-label-caps text-label-caps text-white mb-6 tracking-[0.3em] uppercase text-xs md:text-sm">MAVSUMIY PREMYERA</p>
                <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-white mb-10 max-w-4xl mx-auto leading-tight font-light">
                  Zamonaviy <span className="font-serif italic font-normal">Nafosat</span> Dunyosi
                </h2>
                <button 
                  onClick={() => navigateToCatalog("Barchasi")}
                  className="bg-white text-primary border border-white hover:bg-transparent hover:text-white px-12 py-5 font-label-caps text-label-caps transition-all duration-500 uppercase tracking-widest active:scale-95 text-xs font-semibold"
                >
                  Yangi kolleksiya
                </button>
              </div>
            </section>

            {/* Values Section */}
            <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto border-b border-outline-variant">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="text-center md:text-left">
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Sifat Kafolati</h3>
                  <p className="text-on-surface-variant font-body-md">Biz faqat eng sara materiallardan foydalanamiz va har bir tikuvga alohida e'tibor qaratamiz.</p>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Eksklyuzivlik</h3>
                  <p className="text-on-surface-variant font-body-md">Har bir kolleksiya cheklangan miqdorda chiqariladi, bu sizning betakrorligingizni ta'minlaydi.</p>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Barqarorlik</h3>
                  <p className="text-on-surface-variant font-body-md">Biz atrof-muhitni asrash va mas'uliyatli ishlab chiqarish tamoyillariga sodiqmiz.</p>
                </div>
              </div>
            </section>

            {/* Categories / Kolleksiyalar Section */}
            <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div>
                  <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">Katalog</span>
                  <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg mt-4 font-light">
                    Eksklyuziv <span className="font-serif italic font-normal">Kolleksiyalar</span>
                  </h2>
                </div>
                <button 
                  onClick={() => navigateToCatalog("Barchasi")}
                  className="font-label-caps text-label-caps border-b border-primary pb-1 text-primary hover:opacity-70 transition-opacity uppercase tracking-wider text-xs"
                >
                  Barchasini ko'rish
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
                {/* Men Category */}
                <div className="group cursor-pointer luxury-card" onClick={() => navigateToCatalog("Erkaklar")}>
                  <div className="aspect-[3/4] overflow-hidden mb-6 relative bg-surface-container-low">
                    <img 
                      className="w-full h-full object-cover img-sharp" 
                      alt="Men Collection"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4mZuFmStCotxtsE3DTfudEZFcNOR-AA0tbc53kMMiEJhqtWV0QhtVHC2r9Oe4pABsDVc_LGrkdQFJp23qKjKwZoOKzrRVbyUQzCT4_zfyh2oH1-IIe8NRT9W6fETDvQtMoeem2kx_tlVHd3BEjUgfvZe-RScv9RZf4MHIardhzHV7SCSaMfbmE4n3McKVSIOV0Z0D4geXSJ0K6OD-i3mc2ErqV9oYdELdVkX3wQyV6zqM4qJnM11oisA1rdVxhVoi0vx_4KnEsqCF"
                    />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <h3 className="font-headline-sm text-headline-sm text-primary font-serif italic">Erkaklar kolleksiyasi</h3>
                    <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform">arrow_forward</span>
                  </div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant mt-2 tracking-wider text-[10px]">42 TA MAHSULOT</p>
                </div>

                {/* Women Category */}
                <div className="group cursor-pointer luxury-card" onClick={() => navigateToCatalog("Ayollar")}>
                  <div className="aspect-[3/4] overflow-hidden mb-6 relative bg-surface-container-low">
                    <img 
                      className="w-full h-full object-cover img-sharp" 
                      alt="Women Collection"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvJQoM_ID6ccAk_Pv8Fr5SvDDjsicS5AFfXf964Qc_8K61JDuaqOPAuY8iottXPk3cno1N9c793E8zlSCJ35Hhy8BRaN9S6gC3phB1sxN_cRXTxXmVIZxDrx9aETg7LTwB0gL1J34xjql7i-il2CSlDnyUvhgsJ8krbtAbKD7UDtyiujrSzvBKhoAG_PUJFyiyh7Kakye-DvbOhyEIEFwBZ3fHmr0i_0RFGZamD2IcfjiHA1DfzJL-8UP0S5Pvo19fse6akPP-ykaV"
                    />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <h3 className="font-headline-sm text-headline-sm text-primary font-serif italic">Ayollar kolleksiyasi</h3>
                    <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform">arrow_forward</span>
                  </div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant mt-2 tracking-wider text-[10px]">58 TA MAHSULOT</p>
                </div>

                {/* Accessories Category */}
                <div className="group cursor-pointer luxury-card" onClick={() => navigateToCatalog("Aksessuarlar")}>
                  <div className="aspect-[3/4] overflow-hidden mb-6 relative bg-surface-container-low">
                    <img 
                      className="w-full h-full object-cover img-sharp" 
                      alt="Accessories Collection"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE0BZKpcaV9IyhRUsv8QXnKm9Fh55ju8wQXozRtQYizYuCgXNOid2980UXRF_2DjMFhif3fjW4_kQgG8jhzqcVMqqy93X6-gf39RbYqqlnSh4GBQ1-uCDM-RzhiLWoQT5WvpfAfNOPSv5RFcxlCIQUOkeRWpdLWLQftOE6NHkKuJayWvFMPBobemkMurokdsSx-oSnTFqJWDppR7rAkB-59NzYIg_dQHMk5pFxBHnu1eqOUKCiSUVxxAOZyGlaLLlmXetqTo0cBDoH"
                    />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <h3 className="font-headline-sm text-headline-sm text-primary font-serif italic">Hashamatli aksessuarlar</h3>
                    <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform">arrow_forward</span>
                  </div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant mt-2 tracking-wider text-[10px]">24 TA MAHSULOT</p>
                </div>
              </div>
            </section>

            {/* Featured Products (Bento Style) */}
            <section className="py-24 bg-surface-container-low px-margin-mobile md:px-margin-desktop">
              <div className="max-w-container-max mx-auto">
                <div className="mb-16 text-center">
                  <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg font-light">
                    Mavsumiy <span className="font-serif italic font-normal">Tafsilotlar</span>
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-gutter h-auto md:h-[900px]">
                  {BENTO_FEATURED.map((item, idx) => {
                    const targetProduct = PRODUCTS.find(p => p.id === item.productId) || PRODUCTS[0];
                    return (
                      <div 
                        key={idx} 
                        className={`${item.gridClass} group relative overflow-hidden cursor-pointer aspect-square md:aspect-auto luxury-card`}
                        onClick={() => navigateToProductDetails(targetProduct)}
                      >
                        <img 
                          className="w-full h-full object-cover img-sharp" 
                          alt={item.title}
                          src={item.image}
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-500"></div>
                        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end">
                          <h4 className="text-white font-headline-sm font-serif italic text-lg md:text-2xl">{item.title}</h4>
                          <p className="text-white/80 font-label-caps mt-2 tracking-widest text-[10px] uppercase font-semibold">{item.price}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Editorial Quote Section */}
            <section className="py-32 px-margin-mobile text-center bg-[#fcf9f8] max-w-container-max mx-auto border-t border-outline-variant/30">
              <div className="max-w-3xl mx-auto space-y-6">
                <span className="material-symbols-outlined text-primary/30 text-[40px] block">format_quote</span>
                <p className="font-display-lg-mobile text-2xl md:text-3xl text-primary leading-relaxed font-light italic">
                  "Kiyim-kechak — bu o'zlikni ifodalash san'ati. Biz yaratgan har bir asar sizning nafisligingiz va yuksak didingizdan so'zlaydi."
                </p>
                <div className="w-12 h-px bg-primary/20 mx-auto my-6"></div>
                <p className="font-label-caps text-xs tracking-[0.2em] text-primary uppercase font-bold">SALIMV'S EDITORIAL</p>
              </div>
            </section>

            {/* Home Newsletter */}
            <section className="py-32 px-margin-mobile text-center bg-primary text-on-primary">
              <div className="max-w-2xl mx-auto">
                <h2 className="font-display-lg-mobile text-display-lg-mobile mb-6">Yangiliklardan xabardor bo'ling</h2>
                <p className="font-body-lg text-on-primary/80 mb-10">Yangi kolleksiyalar va maxsus takliflar haqida birinchilardan bo'lib biling.</p>
                {newsletterSubscribed ? (
                  <div className="bg-primary-container p-6 border border-on-primary-container/30 text-on-primary-container font-label-caps text-sm tracking-widest uppercase">
                    A'zoligingiz uchun tashakkur!
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col md:flex-row gap-4">
                    <input 
                      className="flex-1 bg-transparent border-b border-white/30 py-4 px-2 focus:border-white outline-none placeholder:text-white/40 font-body-md text-white" 
                      placeholder="Email manzilingiz" 
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                    />
                    <button type="submit" className="bg-white text-primary px-10 py-4 font-label-caps text-label-caps uppercase tracking-widest hover:bg-surface transition-colors cursor-pointer">
                      A'zo bo'lish
                    </button>
                  </form>
                )}
              </div>
            </section>
          </div>
        )}


        {/* 2. CATALOG VIEW */}
        {currentView === "catalog" && (
          <div className="animate-fade-in max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
            
            {/* Catalog Header & Filters */}
            <section className="mb-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">PREMIUM TO'PLAM</p>
                  <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary">Kiyimlar Katalogi</h1>
                </div>
                <div className="flex items-center gap-4 border-b border-outline-variant pb-2">
                  <span className="font-body-md text-on-surface-variant font-semibold">
                    {filteredProducts.length} ta mahsulot {selectedCategory !== "Barchasi" && `(${selectedCategory})`}
                  </span>
                </div>
              </div>

              {/* Toolbar & Filters */}
              <div className="flex flex-wrap items-center justify-between mt-12 gap-4 border-y border-outline-variant py-4">
                <div className="flex items-center gap-8">
                  <button className="flex items-center gap-2 font-label-caps text-label-caps text-primary hover:opacity-70 transition-opacity">
                    <span className="material-symbols-outlined text-[18px]">tune</span>
                    Saralash
                  </button>
                  <div className="flex items-center gap-4 md:gap-6 flex-wrap">
                    {(["Barchasi", "Erkaklar", "Ayollar", "Aksessuarlar"] as const).map((cat) => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`font-label-caps text-label-caps transition-colors tracking-widest ${selectedCategory === cat ? "text-primary border-b-2 border-primary font-bold" : "text-on-surface-variant hover:text-primary"}`}
                      >
                        {cat.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="font-label-caps text-label-caps text-primary border-b border-primary uppercase">Ohirgi qo'shilganlar</span>
                  <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
                </div>
              </div>
            </section>

            {/* Search warning if empty */}
            {filteredProducts.length === 0 && (
              <div className="py-24 text-center">
                <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-4">search_off</span>
                <p className="font-headline-sm text-primary mb-2">Hech narsa topilmadi</p>
                <p className="text-on-surface-variant max-w-md mx-auto mb-8">"{searchQuery}" so'zi bo'yicha mahsulot topilmadi. Qidiruv so'zini o'zgartirib ko'ring yoki barcha mahsulotlarni ko'ring.</p>
                <button 
                  onClick={() => { setSearchQuery(""); setSelectedCategory("Barchasi"); }}
                  className="bg-primary text-on-primary font-label-caps text-xs tracking-widest uppercase px-8 py-4 hover:bg-primary-container"
                >
                  Filtrlarni tozalash
                </button>
              </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-gutter gap-y-12">
              {filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="product-card group cursor-pointer relative"
                  onClick={() => navigateToProductDetails(product)}
                >
                  <div className="relative overflow-hidden aspect-[3/4] bg-surface-container mb-4">
                    <img 
                      className="w-full h-full object-cover img-sharp" 
                      alt={product.name}
                      src={product.image}
                    />
                    
                    {/* Favorite / Wishlist Overlay */}
                    <button 
                      onClick={(e) => toggleWishlist(product.id, e)}
                      className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-md"
                    >
                      <span className={`material-symbols-outlined ${wishlist.includes(product.id) ? "fill-icon text-error" : "text-primary"}`}>
                        favorite
                      </span>
                    </button>

                    {/* Quick Add To Cart Overlay */}
                    <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, "M");
                        }}
                        className="w-full bg-primary text-on-primary py-3 font-label-caps text-label-caps flex items-center justify-center gap-2 hover:bg-primary-container transition-colors uppercase tracking-widest text-[10px]"
                      >
                        <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                        Savatchaga qo'shish
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-body-md text-on-surface uppercase tracking-wider text-sm md:text-base group-hover:underline underline-offset-4">{product.name}</h3>
                    <p className="font-label-caps text-label-caps text-on-surface-variant text-[10px] md:text-xs">{product.color}</p>
                    <p className="font-body-lg text-primary font-bold text-base md:text-lg">{product.formattedPrice}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-24 flex justify-center items-center gap-8 border-t border-outline-variant pt-12">
              <button className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined">west</span> Oldingi
              </button>
              <div className="flex gap-6">
                <span className="font-label-caps text-label-caps text-primary border-b border-primary text-xs font-bold">01</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary cursor-pointer transition-colors text-xs">02</span>
                <span className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary cursor-pointer transition-colors text-xs">03</span>
              </div>
              <button className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 text-xs uppercase tracking-wider">
                Keyingi <span className="material-symbols-outlined">east</span>
              </button>
            </div>
          </div>
        )}


        {/* 3. PRODUCT DETAILS VIEW */}
        {currentView === "product-details" && (
          <div className="animate-fade-in max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
            
            {/* Breadcrumb */}
            <nav className="mb-12 font-label-caps text-label-caps text-on-surface-variant flex gap-2 text-xs tracking-wider uppercase">
              <button onClick={() => navigateToView("home")} className="hover:text-primary transition-colors">Asosiy</button>
              <span>/</span>
              <button onClick={() => navigateToCatalog(selectedProduct.category)} className="hover:text-primary transition-colors">{selectedProduct.category.toUpperCase()}</button>
              <span>/</span>
              <span className="text-primary font-bold">{selectedProduct.name.toUpperCase()}</span>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
              {/* Product Images (Left) */}
              <div className="md:col-span-7 space-y-gutter">
                <div className="relative product-image-container aspect-[4/5] overflow-hidden group bg-surface-container-low">
                  <img 
                    className="w-full h-full object-cover img-sharp" 
                    alt={selectedProduct.name}
                    src={selectedProduct.image}
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300 pointer-events-none flex items-center justify-center group-hover:opacity-100">
                    <span className="material-symbols-outlined text-white text-4xl">zoom_in</span>
                  </div>
                </div>

                {/* Grid of detail views */}
                <div className="grid grid-cols-2 gap-gutter">
                  <div className="aspect-[4/5] overflow-hidden bg-surface-container-low">
                    <img 
                      className="w-full h-full object-cover img-sharp" 
                      alt="Detail shot 1"
                      src={selectedProduct.images?.[1] || selectedProduct.image}
                    />
                  </div>
                  <div className="aspect-[4/5] overflow-hidden bg-surface-container-low">
                    <img 
                      className="w-full h-full object-cover img-sharp" 
                      alt="Detail shot 2"
                      src={selectedProduct.images?.[2] || selectedProduct.image}
                    />
                  </div>
                </div>
              </div>

              {/* Product Details (Right) */}
              <div className="md:col-span-5 md:pl-12">
                <div className="sticky top-32">
                  <div className="mb-8">
                    <p className="font-label-caps text-label-caps text-primary mb-2 uppercase tracking-widest text-xs">Premium To'plam</p>
                    <h1 className="font-headline-md text-headline-md md:font-display-lg md:text-display-lg mb-4 text-on-surface tracking-tight leading-tight">
                      {selectedProduct.name}
                    </h1>
                    <p className="font-headline-sm text-headline-sm text-on-surface-variant font-medium">
                      {selectedProduct.formattedPrice}
                    </p>
                  </div>

                  {/* Size selector */}
                  <div className="mb-12">
                    <h3 className="font-label-caps text-label-caps mb-4 tracking-widest text-xs uppercase">O'lchamni tanlang</h3>
                    <div className="flex flex-wrap gap-3">
                      {["S", "M", "L", "XL"].map((size) => (
                        <button 
                          key={size}
                          onClick={() => setDetailsSize(size)}
                          className={`w-16 h-16 flex items-center justify-center font-label-caps text-label-caps transition-all cursor-pointer ${detailsSize === size ? "border-2 border-primary bg-primary text-on-primary font-bold" : "border border-outline hover:border-primary"}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setSizeGuideOpen(true)}
                      className="mt-4 font-label-caps text-label-caps text-secondary underline hover:text-primary transition-colors text-[10px] tracking-wider uppercase bg-transparent border-none cursor-pointer"
                    >
                      O'lchamlar jadvali
                    </button>
                  </div>

                  {/* Add buttons */}
                  <div className="space-y-4 mb-12">
                    <button 
                      onClick={() => addToCart(selectedProduct, detailsSize)}
                      className="w-full bg-primary text-on-primary py-6 font-label-caps text-label-caps tracking-[0.2em] hover:bg-primary-container active:scale-[0.98] transition-all duration-300 uppercase text-xs font-semibold cursor-pointer"
                    >
                      Savatchaga qo'shish
                    </button>
                    
                    <button 
                      onClick={(e) => toggleWishlist(selectedProduct.id, e)}
                      className="w-full border border-outline py-6 font-label-caps text-label-caps tracking-[0.2em] hover:bg-surface-container-low active:scale-[0.98] transition-all duration-300 uppercase text-xs flex justify-center items-center gap-2 cursor-pointer"
                    >
                      <span className={`material-symbols-outlined text-[18px] ${wishlist.includes(selectedProduct.id) ? "fill-icon text-error" : ""}`}>
                        favorite
                      </span>
                      {wishlist.includes(selectedProduct.id) ? "Tanlanganlar ro'yxatida" : "Tanlanganlarga qo'shish"}
                    </button>
                  </div>

                  {/* Description & specs */}
                  <div className="border-t border-outline-variant pt-8 space-y-6">
                    <div>
                      <h4 className="font-label-caps text-label-caps mb-2 text-primary tracking-widest text-xs uppercase font-bold">Tavsif</h4>
                      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed text-sm">
                        {selectedProduct.description || "Ushbu premium model Salimv's brendining eng sara an'analarini o'zida aks ettiradi. Mukammal dizayn, toza materiallar va detallarga beqiyos e'tibor sizning betakror qiyofangizni ta'minlaydi."}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                      <span className="font-label-caps text-label-caps text-[10px] tracking-wider uppercase font-semibold">O'zbekiston bo'ylab bepul yetkazib berish</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related products (Sizga yoqishi mumkin) */}
            <section className="mt-32">
              <div className="flex justify-between items-end mb-12 border-b border-outline-variant pb-4">
                <h2 className="font-headline-md text-headline-md text-primary">Sizga yoqishi mumkin</h2>
                <button 
                  onClick={() => navigateToCatalog(selectedProduct.category)}
                  className="font-label-caps text-label-caps text-primary border-b border-primary pb-1 text-xs tracking-wider uppercase"
                >
                  Barchasini ko'rish
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
                {PRODUCTS.filter(p => p.id !== selectedProduct.id).slice(0, 4).map((prod) => (
                  <div 
                    key={prod.id} 
                    className="group cursor-pointer"
                    onClick={() => navigateToProductDetails(prod)}
                  >
                    <div className="aspect-[3/4] overflow-hidden mb-4 relative bg-surface-container">
                      <img 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        alt={prod.name}
                        src={prod.image}
                      />
                      <button 
                        onClick={(e) => toggleWishlist(prod.id, e)}
                        className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-md"
                      >
                        <span className={`material-symbols-outlined text-[16px] ${wishlist.includes(prod.id) ? "fill-icon text-error" : "text-primary"}`}>
                          favorite
                        </span>
                      </button>
                    </div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant mb-1 text-[10px] tracking-wider uppercase">SALIMV'S</p>
                    <h3 className="font-body-md text-body-md mb-1 text-sm uppercase group-hover:underline underline-offset-4">{prod.name}</h3>
                    <p className="font-label-caps text-label-caps font-bold text-xs tracking-widest">{prod.formattedPrice}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}


        {/* 4. CART / SAVATCHA VIEW */}
        {currentView === "cart" && (
          <div className="animate-fade-in max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">
            
            {orderSuccess ? (
              /* ORDER SUCCESS SCREEN */
              <div className="py-24 text-center max-w-xl mx-auto">
                <span className="material-symbols-outlined text-[80px] text-primary-container fill-icon mb-6 animate-pulse">
                  check_circle
                </span>
                <h2 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-4">Sizning buyurtmangiz muvaffaqiyatli qabul qilindi!</h2>
                <p className="text-on-surface-variant font-body-md leading-relaxed mb-10 text-base">
                  Rahmat! Bizning administratorlarimiz tez orada buyurtmani tasdiqlash va yetkazib berish tafsilotlarini kelishib olish uchun ko'rsatilgan telefon raqami orqali siz bilan bog'lanishadi.
                </p>
                <div className="border border-outline-variant p-6 mb-12 bg-surface-container-low text-left">
                  <p className="font-label-caps text-xs tracking-widest uppercase mb-4 text-primary font-bold">Yetkazib berish ma'lumotlari:</p>
                  <p className="text-sm font-body-md text-on-surface mb-2"><strong>Mijoz:</strong> {checkoutName}</p>
                  <p className="text-sm font-body-md text-on-surface mb-2"><strong>Telefon:</strong> {checkoutPhone}</p>
                  <p className="text-sm font-body-md text-on-surface"><strong>Manzil:</strong> {checkoutAddress}</p>
                </div>
                <button 
                  onClick={() => { setOrderSuccess(false); setOrderFormOpen(false); navigateToView("home"); }}
                  className="bg-primary text-on-primary px-12 py-5 font-label-caps text-label-caps hover:bg-primary-container tracking-widest uppercase text-xs"
                >
                  Asosiy sahifaga qaytish
                </button>
              </div>
            ) : (
              /* SHOPPING BAG LIST & SUMMARY */
              <div className="flex flex-col md:flex-row gap-gutter">
                
                {/* List of items */}
                <div className="flex-1">
                  <h2 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg mb-12 text-primary tracking-tight">
                    Sizning Savatchangiz
                  </h2>

                  {cart.length === 0 ? (
                    <div className="py-16 text-center border-y border-outline-variant">
                      <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-4">shopping_cart_off</span>
                      <p className="font-headline-sm text-primary mb-2">Savatchangiz hozircha bo'sh</p>
                      <p className="text-on-surface-variant max-w-sm mx-auto mb-8 text-sm">Savatchangizda hozirda hech qanday mahsulot yo'q. Katalogimizni ko'rib chiqing va o'zingizga yoqqan kiyimni tanlang.</p>
                      <button 
                        onClick={() => navigateToCatalog("Barchasi")}
                        className="bg-primary text-on-primary font-label-caps text-xs tracking-widest uppercase px-8 py-4 hover:bg-primary-container"
                      >
                        Katalogni ko'rish
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {cart.map((item, idx) => (
                        <div key={`${item.product.id}-${item.selectedSize}-${idx}`} className="flex flex-col md:flex-row gap-8 pb-12 border-b border-outline-variant">
                          <div 
                            className="w-full md:w-48 aspect-[3/4] bg-surface-container overflow-hidden cursor-pointer"
                            onClick={() => navigateToProductDetails(item.product)}
                          >
                            <img 
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                              alt={item.product.name}
                              src={item.product.image}
                            />
                          </div>

                          <div className="flex flex-col flex-1 justify-between py-2">
                            <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
                              <div>
                                <h3 
                                  onClick={() => navigateToProductDetails(item.product)}
                                  className="font-headline-sm text-headline-sm mb-1 uppercase hover:underline cursor-pointer text-primary"
                                >
                                  {item.product.name}
                                </h3>
                                <p className="font-body-md text-sm text-on-surface-variant">Rang: {item.product.color}</p>
                                <p className="font-body-md text-sm text-on-surface-variant">O'lcham: {item.selectedSize}</p>
                              </div>
                              <span className="font-headline-sm text-lg sm:text-2xl text-primary font-bold">
                                {formatUZS(item.product.price * item.quantity)}
                              </span>
                            </div>

                            <div className="flex justify-between items-end mt-8">
                              <div className="flex items-center border border-outline px-4 py-2">
                                <button 
                                  onClick={() => updateQuantity(idx, -1)}
                                  className="hover:text-primary px-2 transition-colors text-lg font-bold"
                                >
                                  -
                                </button>
                                <span className="font-label-caps text-label-caps px-6 font-bold">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(idx, 1)}
                                  className="hover:text-primary px-2 transition-colors text-lg font-bold"
                                >
                                  +
                                </button>
                              </div>
                              <button 
                                onClick={() => removeFromCart(idx)}
                                className="font-label-caps text-label-caps text-on-surface-variant underline underline-offset-4 hover:text-error transition-colors uppercase text-xs font-semibold bg-transparent border-none cursor-pointer"
                              >
                                O'chirish
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary Panel */}
                {cart.length > 0 && (
                  <aside className="w-full md:w-96">
                    <div className="bg-surface-container-low p-8 sticky top-32 border border-outline-variant">
                      <h3 className="font-label-caps text-label-caps mb-8 uppercase tracking-widest text-on-surface-variant text-xs font-bold">
                        Buyurtma Xulosasi
                      </h3>
                      
                      <div className="space-y-4 mb-8 text-sm">
                        <div className="flex justify-between">
                          <span className="font-body-md text-on-surface-variant">Oraliq jami</span>
                          <span className="font-body-md font-semibold text-primary">{formatUZS(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-body-md text-on-surface-variant">Yetkazib berish</span>
                          <span className="font-body-md text-primary font-bold uppercase text-xs">Bepul</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-body-md text-on-surface-variant">Soliqlar</span>
                          <span className="font-body-md text-on-surface-variant">Hisoblangan</span>
                        </div>
                      </div>

                      <div className="border-t border-outline-variant pt-6 mb-12">
                        <div className="flex justify-between items-baseline">
                          <span className="font-headline-sm text-headline-sm">Jami</span>
                          <span className="font-headline-md text-headline-md text-primary font-bold">
                            {formatUZS(total)}
                          </span>
                        </div>
                      </div>

                      {orderFormOpen ? (
                        /* ORDER FORM DIRECT PLACEMENT */
                        <form onSubmit={handlePlaceOrder} className="space-y-4">
                          <div>
                            <label className="block text-xs font-label-caps uppercase tracking-wider text-on-surface-variant mb-1 font-bold">Ism va Familiyangiz *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Ismingizni kiriting"
                              value={checkoutName}
                              onChange={(e) => setCheckoutName(e.target.value)}
                              className="w-full border border-outline px-4 py-3 text-sm focus:border-primary outline-none bg-surface"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-label-caps uppercase tracking-wider text-on-surface-variant mb-1 font-bold">Telefon raqamingiz *</label>
                            <input 
                              type="tel" 
                              required
                              placeholder="+998 90 123 45 67"
                              value={checkoutPhone}
                              onChange={(e) => setCheckoutPhone(e.target.value)}
                              className="w-full border border-outline px-4 py-3 text-sm focus:border-primary outline-none bg-surface"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-label-caps uppercase tracking-wider text-on-surface-variant mb-1 font-bold">Yetkazib berish manzili *</label>
                            <textarea 
                              required
                              rows={3}
                              placeholder="To'liq manzilingizni kiriting"
                              value={checkoutAddress}
                              onChange={(e) => setCheckoutAddress(e.target.value)}
                              className="w-full border border-outline px-4 py-3 text-sm focus:border-primary outline-none bg-surface resize-none"
                            />
                          </div>
                          <div className="pt-4 flex gap-3">
                            <button 
                              type="button"
                              onClick={() => setOrderFormOpen(false)}
                              className="flex-1 border border-outline py-4 font-label-caps text-xs tracking-wider uppercase hover:bg-surface-container"
                            >
                              Orqaga
                            </button>
                            <button 
                              type="submit"
                              className="flex-1 bg-primary text-on-primary py-4 font-label-caps text-xs tracking-wider uppercase hover:bg-primary-container"
                            >
                              Tasdiqlash
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button 
                          onClick={() => setOrderFormOpen(true)}
                          className="w-full bg-primary text-on-primary py-6 font-label-caps text-label-caps tracking-widest hover:opacity-90 transition-opacity uppercase active:scale-[0.98] duration-200 text-xs font-semibold cursor-pointer"
                        >
                          Buyurtma berish
                        </button>
                      )}

                      <div className="mt-8 flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[20px]">verified</span>
                          <span className="text-xs uppercase tracking-tight font-semibold">Xavfsiz To'lov Kafolati</span>
                        </div>
                        <div className="flex items-center gap-3 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                          <span className="text-xs uppercase tracking-tight font-semibold">3-5 Kun Ichida Yetkazish</span>
                        </div>
                      </div>
                    </div>
                  </aside>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-surface pt-24 pb-32 md:pb-12 border-t border-outline-variant">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="md:col-span-2">
            <h2 onClick={() => navigateToView("home")} className="font-display-lg text-primary mb-8 tracking-tighter cursor-pointer inline-block">
              Salimv's
            </h2>
            <p className="max-w-sm text-on-surface-variant font-body-md leading-relaxed text-sm">
              Sifat, nafosat va zamonaviylikning uyg'unligi. Biz faqat kiyim emas, balki hayot tarzi yaratamiz.
            </p>
          </div>

          <div>
            <h4 className="font-label-caps text-label-caps text-primary mb-8 uppercase tracking-widest text-xs font-bold">Yordam</h4>
            <ul className="space-y-4 font-body-md text-on-surface-variant text-sm">
              <li><button onClick={() => navigateToView("home")} className="hover:text-primary transition-colors bg-transparent border-none cursor-pointer">Biz haqimizda</button></li>
              <li><button onClick={() => navigateToCatalog("Barchasi")} className="hover:text-primary transition-colors bg-transparent border-none cursor-pointer">Yetkazib berish</button></li>
              <li><button onClick={() => setSizeGuideOpen(true)} className="hover:text-primary transition-colors bg-transparent border-none cursor-pointer">O'lchamlar jadvali</button></li>
              <li><button onClick={() => navigateToView("cart")} className="hover:text-primary transition-colors bg-transparent border-none cursor-pointer">Savollar va javoblar</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-label-caps text-label-caps text-primary mb-8 uppercase tracking-widest text-xs font-bold">Ijtimoiy Tarmoqlar</h4>
            <div className="flex gap-6">
              <a className="w-10 h-10 border border-outline flex items-center justify-center hover:bg-primary hover:text-white transition-all text-xs font-bold uppercase tracking-wider" href="#">
                In
              </a>
              <a className="w-10 h-10 border border-outline flex items-center justify-center hover:bg-primary hover:text-white transition-all text-xs font-bold uppercase tracking-wider" href="#">
                Tg
              </a>
              <a className="w-10 h-10 border border-outline flex items-center justify-center hover:bg-primary hover:text-white transition-all text-xs font-bold uppercase tracking-wider" href="#">
                Fb
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-20 pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-on-surface-variant uppercase tracking-widest">© 2024 Salimv's. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-8">
            <a className="text-xs text-on-surface-variant uppercase tracking-widest hover:text-primary" href="#">Maxfiylik siyosati</a>
            <a className="text-xs text-on-surface-variant uppercase tracking-widest hover:text-primary" href="#">Foydalanish shartlari</a>
          </div>
        </div>
      </footer>

      {/* BOTTOM NAVIGATION BAR (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-4 bg-surface border-t border-outline-variant z-[60] shadow-lg">
        <button 
          onClick={() => navigateToView("home")}
          className={`flex flex-col items-center justify-center bg-transparent border-none cursor-pointer ${currentView === "home" ? "text-primary font-bold" : "text-on-surface-variant"}`}
        >
          <span className={`material-symbols-outlined ${currentView === "home" ? "fill-icon" : ""}`}>home</span>
          <span className="font-label-caps text-[9px] mt-1 tracking-wider uppercase">Asosiy</span>
        </button>

        <button 
          onClick={() => navigateToCatalog("Barchasi")}
          className={`flex flex-col items-center justify-center bg-transparent border-none cursor-pointer ${currentView === "catalog" ? "text-primary font-bold" : "text-on-surface-variant"}`}
        >
          <span className={`material-symbols-outlined ${currentView === "catalog" ? "fill-icon" : ""}`}>storefront</span>
          <span className="font-label-caps text-[9px] mt-1 tracking-wider uppercase">Do'kon</span>
        </button>

        <button 
          onClick={() => navigateToView("cart")}
          className={`flex flex-col items-center justify-center bg-transparent border-none cursor-pointer relative ${currentView === "cart" ? "text-primary font-bold" : "text-on-surface-variant"}`}
        >
          <span className={`material-symbols-outlined ${currentView === "cart" ? "fill-icon" : ""}`}>shopping_cart</span>
          {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
            <span className="absolute top-0 right-1 bg-primary text-on-primary text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
          <span className="font-label-caps text-[9px] mt-1 tracking-wider uppercase">Savatcha</span>
        </button>

        <button 
          onClick={() => showToast("Ushbu sahifa hozircha yaratilmagan")}
          className="flex flex-col items-center justify-center text-on-surface-variant bg-transparent border-none cursor-pointer"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-caps text-[9px] mt-1 tracking-wider uppercase">Profil</span>
        </button>
      </nav>
    </div>
  );
}
