"use client";

import React, { useState, useEffect } from "react";
import { useUIStore } from "@/store/useUIStore";
import { useSession, signOut } from "next-auth/react";
import { exchangePointsForCoupon, getUserPoints } from "@/app/actions/loyalty";
import { useToastStore } from "@/store/useToastStore";
import { useCartStore } from "@/store/useCartStore";
import { useFlyToCart } from "@/store/useFlyToCart";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, Globe, User as UserIcon, LogOut, Award, Sparkles, ChevronDown, Gift } from "lucide-react";
import { usePathname } from "next/navigation";

const TRANSLATIONS = {
  ar: {
    brand: "BioZad",
    tagline: "الثمن ينقص والجودة تزداد",
    cart: "السلة",
    home: "الرئيسية",
    allProducts: "كامل التشكيلة",
    honeyRemedies: "عسل ووصفات",
    honey: "عسل ومشتقاته",
    amlouOils: "املو و زيوت",
    amlou: "أملو الفاخر",
    oils: "زيوت طبيعية",
    teaPerfumes: "شاي و عطور",
    tea: "الشاي المغربي",
    remedies: "خلطات ووصفات علاجية",
    perfumes: "عطور وبخور",
    offers: "العروض الخاصة",
    other: "منتجات أخرى",
    about: "عن العلامة",
    login: "تسجيل الدخول",
    points: "نقطة",
    exchange: "استبدال النقاط بخصم 50 د.م.",
    logout: "خروج",
    menu: "القائمة"
  },
  fr: {
    brand: "BioZad",
    tagline: "Le prix baisse, la qualité augmente",
    cart: "Panier",
    home: "Accueil",
    allProducts: "Toute la Collection",
    honeyRemedies: "Miel & Recettes",
    honey: "Miel & Dérivés",
    amlouOils: "Amlou & Huiles",
    amlou: "Amlou d'Exception",
    oils: "Huiles Naturelles",
    teaPerfumes: "Thés & Parfums",
    tea: "Thé Marocain",
    remedies: "Remèdes & Recettes",
    perfumes: "Parfums & Encens",
    offers: "Offres Spéciales",
    other: "Autres Produits",
    about: "À Propos",
    login: "Se Connecter",
    points: "Points",
    exchange: "Échanger (Coupon 50 DH)",
    logout: "Déconnexion",
    menu: "Menu"
  }
};

export function Header() {
  const { lang, setLang, cartOpen, setCartOpen, dir } = useUIStore();
  const { data: session } = useSession();
  
  // حالات القوائم المنسدلة للمكتب
  const [isHoneyRemediesOpen, setIsHoneyRemediesOpen] = useState(false);
  const [isAmlouOilsOpen, setIsAmlouOilsOpen] = useState(false);
  const [isTeaPerfumesOpen, setIsTeaPerfumesOpen] = useState(false);

  // حالات القوائم المنسدلة للجوال
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileHoneyRemediesOpen, setMobileHoneyRemediesOpen] = useState(false);
  const [mobileAmlouOilsOpen, setMobileAmlouOilsOpen] = useState(false);
  const [mobileTeaPerfumesOpen, setMobileTeaPerfumesOpen] = useState(false);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [loyaltySuccessCode, setLoyaltySuccessCode] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [loadingPoints, setLoadingPoints] = useState(false);
  
  const { showToast } = useToastStore();
  const pathname = usePathname();

  // الحصول على عدد منتجات السلة الإجمالي
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const isCartBouncing = useFlyToCart((state) => state.cartBouncing);

  const isRtl = dir === "rtl";

  const fetchFreshPoints = async () => {
    if (!session?.user) return;
    setLoadingPoints(true);
    const res = await getUserPoints();
    if (res.success) {
      setUserPoints(res.points);
    }
    setLoadingPoints(false);
  };

  useEffect(() => {
    if (session?.user) {
      setUserPoints((session.user as any).points || 0);
      fetchFreshPoints();
    } else {
      setUserPoints(null);
    }
  }, [session]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/pos") || pathname.startsWith("/lp")) {
    return null; // يختفي الهيدر تماماً في صفحات الإدارة والـ POS وصفحات الهبوط
  }

  const t = TRANSLATIONS[lang];

  const handleExchangePoints = async () => {
    if (userPoints === null || userPoints < 100) {
      showToast(
        lang === "ar"
          ? "⚠️ عذراً، يجب أن تملك 100 نقطة على الأقل للحصول على كود الخصم."
          : "⚠️ Désolé, vous devez avoir au moins 100 points pour obtenir un coupon.",
        "error"
      );
      return;
    }

    const res = await exchangePointsForCoupon();
    if (res.success && res.couponCode) {
      setLoyaltySuccessCode(res.couponCode);
      if (res.newPointsBalance !== undefined) {
        setUserPoints(res.newPointsBalance);
      } else {
        fetchFreshPoints();
      }
      showToast(
        lang === "ar" 
          ? `مبروك! تم توليد كوبون خصم بقيمة 50 درهم: ${res.couponCode}` 
          : `Félicitations ! Un coupon de 50 DH a été généré : ${res.couponCode}`,
        "success"
      );
    } else {
      showToast(res.message || (lang === "ar" ? "حدث خطأ أثناء التبديل" : "Erreur lors de l'échange"), "error");
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(
      lang === "ar" ? "تم نسخ كود الخصم بنجاح! 📋" : "Code coupon copié avec succès ! 📋",
      "success"
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-neutral-100/50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* الشعار والهوية البصرية */}
          <div className="flex items-center gap-6">
            <a href="/" className="flex flex-col items-center gap-1 shrink-0 group py-1">
              <img 
                src="/logo.png" 
                alt="BioZad Logo" 
                className="h-12 w-auto dark:invert-0 dark:brightness-110 object-contain transition-all duration-300 group-hover:scale-[1.03] select-none" 
              />
              <span className="text-[7px] tracking-wide text-accent font-bold uppercase leading-none transition-colors duration-300 group-hover:text-primary dark:group-hover:text-accent hidden sm:inline-block">
                {t.tagline}
              </span>
            </a>

            {/* 🖥️ روابط التنقل المكتبية المحسنة والذكية (Desktop Navigation) */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
              {/* الرئيسية */}
              <a href="/" className="relative py-2 text-xs xl:text-sm font-bold text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-accent transition-colors group">
                <span>{t.home}</span>
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </a>

              {/* كامل التشكيلة */}
              <a href="/shop#products" className="relative py-2 text-xs xl:text-sm font-bold text-neutral-700 dark:text-neutral-200 hover:text-primary dark:hover:text-accent transition-colors group">
                <span>{t.allProducts}</span>
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </a>

              {/* عسل ووصفات (Dropdown) */}
              <div 
                className="relative"
                onMouseEnter={() => setIsHoneyRemediesOpen(true)}
                onMouseLeave={() => setIsHoneyRemediesOpen(false)}
              >
                <button className="relative flex items-center gap-1 text-xs xl:text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-accent transition-colors py-2 group">
                  <span>{t.honeyRemedies}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isHoneyRemediesOpen ? "rotate-180 text-primary dark:text-accent" : "text-neutral-400"}`} />
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                </button>

                <AnimatePresence>
                  {isHoneyRemediesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-0.5 w-56 rounded-2xl border border-neutral-100 bg-white p-2.5 shadow-premium-lg dark:border-neutral-900 dark:bg-neutral-950 z-50"
                    >
                      <div className="space-y-1">
                        <a 
                          href="/honey#products" 
                          className="block rounded-xl px-3 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-accent hover:bg-primary/5 dark:hover:bg-neutral-900/50 transition-all duration-200 transform hover:translate-x-1.5 rtl:hover:-translate-x-1.5"
                        >
                          {t.honey}
                        </a>
                        <a 
                          href="/remedies#products" 
                          className="block rounded-xl px-3 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-accent hover:bg-primary/5 dark:hover:bg-neutral-900/50 transition-all duration-200 transform hover:translate-x-1.5 rtl:hover:-translate-x-1.5"
                        >
                          {t.remedies}
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* املو وزيوت (Dropdown) */}
              <div 
                className="relative"
                onMouseEnter={() => setIsAmlouOilsOpen(true)}
                onMouseLeave={() => setIsAmlouOilsOpen(false)}
              >
                <button className="relative flex items-center gap-1 text-xs xl:text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-accent transition-colors py-2 group">
                  <span>{t.amlouOils}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isAmlouOilsOpen ? "rotate-180 text-primary dark:text-accent" : "text-neutral-400"}`} />
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                </button>

                <AnimatePresence>
                  {isAmlouOilsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-0.5 w-56 rounded-2xl border border-neutral-100 bg-white p-2.5 shadow-premium-lg dark:border-neutral-900 dark:bg-neutral-950 z-50"
                    >
                      <div className="space-y-1">
                        <a 
                          href="/amlou#products" 
                          className="block rounded-xl px-3 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-accent hover:bg-primary/5 dark:hover:bg-neutral-900/50 transition-all duration-200 transform hover:translate-x-1.5 rtl:hover:-translate-x-1.5"
                        >
                          {t.amlou}
                        </a>
                        <a 
                          href="/oils#products" 
                          className="block rounded-xl px-3 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-accent hover:bg-primary/5 dark:hover:bg-neutral-900/50 transition-all duration-200 transform hover:translate-x-1.5 rtl:hover:-translate-x-1.5"
                        >
                          {t.oils}
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* شاي وعطور (Dropdown) */}
              <div 
                className="relative"
                onMouseEnter={() => setIsTeaPerfumesOpen(true)}
                onMouseLeave={() => setIsTeaPerfumesOpen(false)}
              >
                <button className="relative flex items-center gap-1 text-xs xl:text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-accent transition-colors py-2 group">
                  <span>{t.teaPerfumes}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isTeaPerfumesOpen ? "rotate-180 text-primary dark:text-accent" : "text-neutral-400"}`} />
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                </button>

                <AnimatePresence>
                  {isTeaPerfumesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-0.5 w-56 rounded-2xl border border-neutral-100 bg-white p-2.5 shadow-premium-lg dark:border-neutral-900 dark:bg-neutral-950 z-50"
                    >
                      <div className="space-y-1">
                        <a 
                          href="/tea#products" 
                          className="block rounded-xl px-3 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-accent hover:bg-primary/5 dark:hover:bg-neutral-900/50 transition-all duration-200 transform hover:translate-x-1.5 rtl:hover:-translate-x-1.5"
                        >
                          {t.tea}
                        </a>
                        <a 
                          href="/perfumes#products" 
                          className="block rounded-xl px-3 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-primary dark:hover:text-accent hover:bg-primary/5 dark:hover:bg-neutral-900/50 transition-all duration-200 transform hover:translate-x-1.5 rtl:hover:-translate-x-1.5"
                        >
                          {t.perfumes}
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>


              {/* عروض */}
              <a href="/offers#products" className="relative py-2 text-xs xl:text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-accent transition-colors flex items-center gap-1 group">
                <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
                <span>{t.offers}</span>
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </a>

              {/* منتجات أخرى */}
              <a href="/other#products" className="relative py-2 text-xs xl:text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:text-primary dark:hover:text-accent transition-colors group">
                <span>{t.other}</span>
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </a>
            </nav>
          </div>

          {/* الأيقونات، تبديل اللغات، وحالة الحساب */}
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* محول اللغات الدائري */}
            <button 
              onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
              className="hidden sm:flex items-center gap-1 rounded-full border border-neutral-200/60 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-all dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{lang === "ar" ? "FR" : "عربي"}</span>
            </button>

            {/* 🛒 سلة المشتريات مجهزة بعداد تفاعلي ذكي وتأثير ارتدادي عند وصول المنتج الطائر */}
            <motion.button 
              id="header-cart-icon"
              onClick={() => setCartOpen(!cartOpen)}
              animate={isCartBouncing ? {
                scale: [1, 1.35, 0.9, 1.15, 1],
                rotate: [0, -10, 10, -5, 0]
              } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="relative rounded-full p-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              title={t.cart}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-accent text-[8px] font-black text-white ring-2 ring-white dark:ring-neutral-950 ${isCartBouncing ? "scale-125 bg-amber-500 transition-transform" : "animate-bounce"}`}>
                  {totalItems}
                </span>
              )}

              {/* حلقة تموج وتوهج ذهبية عند وصول المنتج الطائر للسلة */}
              {isCartBouncing && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0.9 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border-2 border-amber-400 pointer-events-none"
                />
              )}
            </motion.button>

            {/* نظام حساب المستخدم الذكي (تسجيل الدخول / لوحة نقاط الولاء) */}
            <div className="relative hidden sm:block">
              {session?.user ? (
                <>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1.5 border border-primary/10 text-xs font-bold text-primary dark:text-accent hover:bg-primary/10 transition-all"
                  >
                    <Award className="h-4 w-4" />
                    <span>{t.points}: {userPoints !== null ? userPoints : ((session.user as any).points || 0)}</span>
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-neutral-100 bg-white p-4 shadow-premium-lg dark:bg-neutral-950 dark:border-neutral-800">
                        <div className="space-y-3">
                          <div className="border-b pb-2 flex flex-col gap-1">
                            <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{session.user.name}</p>
                            <p className="text-[10px] text-neutral-400">{session.user.email}</p>
                            <span className="inline-block self-start text-[9px] font-extrabold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              رتبة الحساب: {(session.user as any).role}
                            </span>
                          </div>
                          
                          {((session.user as any).role === "admin" || (session.user as any).role === "manager") && (
                            <a 
                              href="/admin"
                              className="block text-xs font-bold text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 p-2.5 rounded-xl transition-all"
                            >
                              📊 لوحة تحكم الإدارة / Admin
                            </a>
                          )}

                          {((session.user as any).role === "admin" || (session.user as any).role === "manager" || (session.user as any).role === "cashier") && (
                            <a 
                              href="/pos"
                              className="block text-xs font-bold text-blue-700 bg-blue-50/50 hover:bg-blue-50 p-2.5 rounded-xl transition-all"
                            >
                              🖥️ نظام الكاشير ونقاط البيع / POS
                            </a>
                          )}

                          {/* استبدال النقاط وحالة الكوبون المولد */}
                          <div className="space-y-2 bg-neutral-50 dark:bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-900 text-right">
                            <div className="flex justify-between items-center text-[10px] text-neutral-500 font-semibold">
                              <span>رصيدك المتاح:</span>
                              <span className="font-extrabold text-primary dark:text-accent">
                                {userPoints !== null ? userPoints : 0} نقطة
                              </span>
                            </div>

                            {loyaltySuccessCode ? (
                              <div className="space-y-1.5 pt-1">
                                <span className="block text-[9px] text-emerald-600 font-bold">✓ تم توليد كوبون خصم 50 درهم:</span>
                                <div className="flex items-center gap-1 bg-white dark:bg-neutral-950 border p-2 rounded-lg font-mono text-[10px] font-extrabold text-neutral-800 dark:text-neutral-200 justify-between select-all">
                                  <span>{loyaltySuccessCode}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyCoupon(loyaltySuccessCode)}
                                    className="text-[9px] bg-primary text-white font-serif px-2 py-1 rounded hover:bg-primary/95 transition-all cursor-pointer shrink-0 font-normal"
                                  >
                                    نسخ 📋
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setLoyaltySuccessCode(null)}
                                  className="w-full text-center text-[8px] text-neutral-400 hover:text-neutral-600 font-bold"
                                >
                                  إغلاق / توليد آخر
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={handleExchangePoints}
                                  disabled={userPoints === null || userPoints < 100}
                                  className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold transition-all ${
                                    userPoints !== null && userPoints >= 100
                                      ? "bg-accent text-white hover:bg-accent/95 shadow-premium-sm"
                                      : "bg-neutral-100 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-600 cursor-not-allowed"
                                  }`}
                                >
                                  <Award className="h-3.5 w-3.5" />
                                  <span>
                                    {userPoints !== null && userPoints >= 100
                                      ? "استبدل 100 نقطة بخصم 50 درهم"
                                      : "استبدال النقاط (تحتاج 100 نقطة) 🔒"}
                                  </span>
                                </button>
                                {userPoints !== null && userPoints < 100 && (
                                  <span className="block text-center text-[8px] text-neutral-400 font-semibold">
                                    المتبقي لك: {100 - userPoints} نقطة لتفعيل الخصم.
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          <button 
                            onClick={() => signOut()}
                            className="w-full text-start text-xs font-semibold text-rose-600 flex items-center gap-1.5 pt-2 border-t dark:border-neutral-800"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            <span>{t.logout}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <a 
                  href="/login" 
                  className="flex items-center gap-1.5 rounded-full bg-primary text-white text-xs font-bold px-4 py-2 hover:bg-primary/95 transition-all"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>{t.login}</span>
                </a>
              )}
            </div>

            {/* 📱 زر قائمة الجوال (Hamburger Button) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex lg:hidden rounded-full p-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

          </div>
        </div>
      </div>
    </header>

      {/* 📱 لوحة تنقل الجوال (Mobile Navigation Drawer Menu) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* الخلفية المظلمة */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black lg:hidden"
            />

            {/* القائمة المنزلقة */}
            <motion.div
              initial={{ x: isRtl ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-0 bottom-0 h-full z-50 w-full max-w-xs bg-white dark:bg-neutral-950 p-6 shadow-premium-lg flex flex-col lg:hidden ${
                isRtl ? "left-0" : "right-0"
              }`}
            >
              {/* رأس القائمة - يبقى ثابتاً في الأعلى */}
              <div className="relative flex items-center justify-center border-b pb-4 dark:border-neutral-800 shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <img src="/logo.png" alt="BioZad Logo" className="h-10 w-auto object-contain select-none" />
                  <span className="text-[7.5px] text-accent font-bold tracking-wider leading-none">{t.tagline}</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute end-0 top-1/2 -translate-y-1/2 rounded-full p-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                >
                  <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                </button>
              </div>

              {/* حاوية المحتوى القابل للتمرير (الروابط والفوتر) مع استقرار لمنع انضغاط العناصر */}
              <div className="flex-1 overflow-y-auto min-h-0 flex flex-col space-y-6 pr-1 mt-6">
                
                {/* روابط التنقل الرئيسية المباشرة للموبايل */}
                <nav className="flex flex-col gap-4 text-xs font-bold text-neutral-700 dark:text-neutral-300 shrink-0">
                  {/* الرئيسية */}
                  <a href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary py-1 transition-colors">
                    {t.home}
                  </a>

                  {/* كامل التشكيلة */}
                  <a href="/shop#products" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary py-1 transition-colors">
                    {t.allProducts}
                  </a>

                  {/* عسل ووصفات */}
                  <div className="border-t border-neutral-100 pt-2 dark:border-neutral-800">
                    <button 
                      onClick={() => setMobileHoneyRemediesOpen(!mobileHoneyRemediesOpen)}
                      className="w-full flex items-center justify-between py-1.5 hover:text-primary transition-colors text-xs font-bold"
                    >
                      <span>{t.honeyRemedies}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${mobileHoneyRemediesOpen ? "rotate-180 text-primary" : "text-neutral-400"}`} />
                    </button>
                    <AnimatePresence>
                      {mobileHoneyRemediesOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden flex flex-col gap-2 ps-4 pt-2 text-[11px] font-bold text-neutral-500"
                        >
                          <a href="/honey#products" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors py-0.5">• {t.honey}</a>
                          <a href="/remedies#products" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors py-0.5">• {t.remedies}</a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* املو وزيوت */}
                  <div className="border-t border-neutral-100 pt-2 dark:border-neutral-800">
                    <button 
                      onClick={() => setMobileAmlouOilsOpen(!mobileAmlouOilsOpen)}
                      className="w-full flex items-center justify-between py-1.5 hover:text-primary transition-colors text-xs font-bold"
                    >
                      <span>{t.amlouOils}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${mobileAmlouOilsOpen ? "rotate-180 text-primary" : "text-neutral-400"}`} />
                    </button>
                    <AnimatePresence>
                      {mobileAmlouOilsOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden flex flex-col gap-2 ps-4 pt-2 text-[11px] font-bold text-neutral-500"
                        >
                          <a href="/amlou#products" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors py-0.5">• {t.amlou}</a>
                          <a href="/oils#products" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors py-0.5">• {t.oils}</a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* شاي وعطور */}
                  <div className="border-t border-neutral-100 pt-2 dark:border-neutral-800">
                    <button 
                      onClick={() => setMobileTeaPerfumesOpen(!mobileTeaPerfumesOpen)}
                      className="w-full flex items-center justify-between py-1.5 hover:text-primary transition-colors text-xs font-bold"
                    >
                      <span>{t.teaPerfumes}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${mobileTeaPerfumesOpen ? "rotate-180 text-primary" : "text-neutral-400"}`} />
                    </button>
                    <AnimatePresence>
                      {mobileTeaPerfumesOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden flex flex-col gap-2 ps-4 pt-2 text-[11px] font-bold text-neutral-500"
                        >
                          <a href="/tea#products" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors py-0.5">• {t.tea}</a>
                          <a href="/perfumes#products" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors py-0.5">• {t.perfumes}</a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>


                  {/* عروض */}
                  <a href="/offers#products" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary py-1 transition-colors border-t border-neutral-100 pt-2 dark:border-neutral-800 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
                    <span>{t.offers}</span>
                  </a>

                  {/* منتجات أخرى */}
                  <a href="/other#products" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary py-1 transition-colors border-t border-neutral-100 pt-2 dark:border-neutral-800">
                    {t.other}
                  </a>
                </nav>

                {/* ذيل القائمة - حساب العميل ومحولات اللغة (يتموقع بالأسفل بشكل مرن) */}
                <div className="mt-auto border-t pt-6 space-y-4 dark:border-neutral-800 shrink-0">
                  {/* تبديل اللغة */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400 font-medium">{lang === "ar" ? "اللغة:" : "Langue :"}</span>
                    <button 
                      onClick={() => setLang(lang === "ar" ? "fr" : "ar")}
                      className="flex items-center gap-1 rounded-full border border-neutral-200/60 px-3 py-1.5 font-bold text-neutral-700 dark:border-neutral-800 dark:text-neutral-300"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>{lang === "ar" ? "Français" : "العربية"}</span>
                    </button>
                  </div>

                  {/* حساب العميل بالجوال */}
                  <div>
                    {session?.user ? (
                      <div className="space-y-3 bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-2xl">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">{session.user.name}</span>
                          <span className="text-[9px] text-neutral-400 truncate">{session.user.email}</span>
                        </div>
                        
                        {/* روابط المشرف */}
                        {((session.user as any).role === "admin" || (session.user as any).role === "manager") && (
                          <a 
                            href="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-center text-[10px] font-bold text-emerald-700 bg-emerald-50 py-2 rounded-xl"
                          >
                            📊 لوحة تحكم الإدارة / Admin
                          </a>
                        )}
                        {((session.user as any).role === "admin" || (session.user as any).role === "manager" || (session.user as any).role === "cashier") && (
                          <a 
                            href="/pos"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-center text-[10px] font-bold text-blue-700 bg-blue-50 py-2 rounded-xl"
                          >
                            🖥️ نظام الـ POS / الكاشير
                          </a>
                        )}

                        {/* استبدال النقاط وحالة الكوبون المولد للجوال */}
                        <div className="space-y-2 bg-neutral-100 dark:bg-neutral-900 p-3 rounded-xl border text-right">
                          <div className="flex justify-between items-center text-[10px] text-neutral-500 font-semibold">
                            <span>رصيد النقاط:</span>
                            <span className="font-extrabold text-primary dark:text-accent">
                              {userPoints !== null ? userPoints : 0} نقطة
                            </span>
                          </div>

                          {loyaltySuccessCode ? (
                            <div className="space-y-1.5 pt-1">
                              <span className="block text-[9px] text-emerald-600 font-bold">✓ تم توليد كوبون خصم 50 درهم:</span>
                              <div className="flex items-center gap-1 bg-white dark:bg-neutral-950 border p-2 rounded-lg font-mono text-[10px] font-extrabold text-neutral-800 dark:text-neutral-200 justify-between select-all">
                                <span>{loyaltySuccessCode}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyCoupon(loyaltySuccessCode)}
                                  className="text-[9px] bg-primary text-white font-serif px-2 py-1 rounded hover:bg-primary/95 transition-all cursor-pointer shrink-0 font-normal"
                                >
                                  نسخ 📋
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => setLoyaltySuccessCode(null)}
                                className="w-full text-center text-[8px] text-neutral-400 hover:text-neutral-600 font-bold"
                              >
                                إغلاق / توليد آخر
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={handleExchangePoints}
                                disabled={userPoints === null || userPoints < 100}
                                className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold transition-all ${
                                  userPoints !== null && userPoints >= 100
                                    ? "bg-accent text-white hover:bg-accent/95 shadow-premium-sm"
                                    : "bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600 cursor-not-allowed"
                                }`}
                              >
                                <Award className="h-3.5 w-3.5" />
                                <span>
                                  {userPoints !== null && userPoints >= 100
                                    ? "استبدل 100 نقطة بخصم 50 درهم"
                                    : "استبدال النقاط (تحتاج 100 نقطة) 🔒"}
                                </span>
                              </button>
                              {userPoints !== null && userPoints < 100 && (
                                <span className="block text-center text-[8px] text-neutral-400 font-semibold">
                                  المتبقي لك: {100 - userPoints} نقطة لتفعيل الخصم.
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        <button 
                          onClick={() => {
                            setMobileMenuOpen(false);
                            signOut();
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-rose-600 border-t dark:border-neutral-800"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          <span>{t.logout}</span>
                        </button>
                      </div>
                    ) : (
                      <a 
                        href="/login" 
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full py-3.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-2"
                      >
                        <UserIcon className="h-4 w-4" />
                        <span>{t.login}</span>
                      </a>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
