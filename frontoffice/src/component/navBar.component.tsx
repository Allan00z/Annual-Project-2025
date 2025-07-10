"use client";

import Image from "next/image";
import Logo from "../medias/logo/logoLongLarge.svg";
import SmallLogo from "../medias/logo/logoDefault.svg";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import LogoutButton from "./account-button.component";
import AuthService from "../app/services/auth.service";
import Link from "next/link";
import { useCart } from "../hooks/useCart";
import AdminLink from "./AdminLink";

export const NavBar = () => {
  const pathname = usePathname();
  const style = { color: "#e8a499" };
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  const fetchedProducts = async (): Promise<any[]> => {
    try {
      const response = await fetch("http://localhost:1338/api/products?populate=product_categories");
      if (!response.ok) throw new Error("Failed to fetch products");
      const res = await response.json();
      console.log("Fetched products:", res.data);
      return res.data || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  };

  useEffect(() => {
    setIsLoggedIn(AuthService.isLoggedIn());

    const handleStorageChange = () => {
      setIsLoggedIn(AuthService.isLoggedIn());
    };

    fetchedProducts().then((fetchedProducts) => {
      setProducts(fetchedProducts);
    });

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const uniqueCategories = Array.from(
    new Map(
      products.flatMap(p => p.product_categories || []).map(cat => [cat.id, cat])
    ).values()
  );

  return (
    <nav className="flex justify-between items-center p-6 bg-white z-50 sticky top-0 relative">
      <a href="/" className="flex-shrink-0">
        <Image src={Logo} alt="Logo" className="w-62 hidden lg:block" />
        <Image src={SmallLogo} alt="Small Logo" className="w-12 block lg:hidden" />
      </a>

      {/* Menu Desktop avec wrapper */}
      <div className="relative hidden md:flex">
        <div
          className="flex space-x-6"
          onMouseLeave={() => setActiveDrawer(null)}
        >
          {["home", "shop", "creations", "about", "blog"].map((item) => (
            <a
              key={item}
              href={item === "home" ? "/" : `/${item}`}
              style={
                pathname === "/" && item === "home" ? style :
                  pathname.startsWith(`/${item}`) ? style : {}
              }
              className="text-primary"
              onMouseEnter={() => setActiveDrawer(item)}
            >
              {item === "home" ? "ACCUEIL" :
                item === "shop" ? "BOUTIQUE" :
                  item === "creations" ? "CRÉATIONS" :
                    item === "about" ? "À PROPOS" :
                      item === "blog" ? "BLOG" :
                        item.toUpperCase()}
            </a>
          ))}

          <a href="/shop/cart" className="btn btn-ghost btn-circle -translate-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9h14l-2-9M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
          </a>

          {isLoggedIn ? (
            <LogoutButton />
          ) : (
            <Link href="/login" className="btn btn-ghost btn-circle -translate-y-2">
              <span className="material-symbols-outlined">account_circle</span>
            </Link>
          )}
        </div>

        {/* Drawer positionné sous la navbar */}
        {activeDrawer && (
          <div
            className="absolute top-full left-0 w-full bg-base-100 shadow-lg rounded-md border-primary z-40 animate-slideDown"
            onMouseEnter={() => setActiveDrawer(activeDrawer)}
            onMouseLeave={() => setActiveDrawer(null)}
          >
            <div className="p-6 text-primary">
              {activeDrawer === "home" && <div>🎉 Bienvenue sur la page d’accueil !</div>}
              {activeDrawer === "shop" && (
                <div>
                  <div className="mb-2">🛍 Découvrez notre boutique :</div>
                  <ul className="ml-6 flex flex-row gap-4 list-none">
                    {uniqueCategories.map(cat => {
                      const productsInCategory = products.filter(p =>
                        (p.product_categories || []).some((c: { id: any }) => c.id === cat.id)
                      );

                      return (
                        <li key={cat.id} className="flex flex-col gap-2 w-full">
                          <Link
                            href={`/shop?category=${cat.id}`}
                            className="font-semibold cursor-pointer text-[#e8a499] hover:underline"
                          >
                            {cat.name}
                          </Link>
                          {productsInCategory.length > 0 ? (
                            <ul className="flex flex-col gap-2 list-none pl-2">
                              {productsInCategory.map(prod => (
                                <Link href={`/shop/product/${prod.documentId}`} key={prod.id} className="text-sm cursor-pointer hover:underline">
                                  {prod.name}
                                </Link>
                              ))}
                            </ul>
                          ) : (
                            <div className="italic text-gray-500 pl-2 text-sm">Aucun produit</div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {activeDrawer === "creations" && <div>🎨 Nos créations faites main !</div>}
              {activeDrawer === "about" && <div>📖 En savoir plus sur nous !</div>}
              {activeDrawer === "blog" && <div>📝 Lisez nos derniers articles !</div>}
            </div>
          </div>
        )}
      </div>

      {/* Menu Mobile (inchangé) */}
      <div className="flex items-center space-x-4 md:hidden">
        <a href="/shop/cart" className="btn btn-ghost btn-circle">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9h14l-2-9M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        </a>
        <button className="btn btn-ghost btn-circle" onClick={() => setIsDrawerOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 stroke-current">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M3 3h18M3 12h18M3 21h18" />
          </svg>
        </button>
      </div>

      {/* Drawer Mobile (inchangé) */}
      {/* ... */}
    </nav>
  );
};

export default NavBar;
