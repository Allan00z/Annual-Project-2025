"use client";

import Image from "next/image";
import Logo from "../medias/logo/logoLongLarge.svg";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import LogoutButton from "./logout-button.component";
import AuthService from "../app/services/auth.service";
import Link from "next/link";

export const NavBar = () => {
  const pathname = usePathname();
  const style = { color: "#e8a499" };
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(AuthService.isLoggedIn());

    const handleStorageChange = () => {
      setIsLoggedIn(AuthService.isLoggedIn());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <nav className="flex justify-between items-center p-6 bg-white z-50 sticky top-0">
      <a href="/" className="flex-shrink-0">
        <Image src={Logo} alt="Logo" className="w-62" />
      </a>

      <div className="space-x-6 hidden md:flex">
        <a
          href="/home"
          style={pathname === "/home" ? style : {}}
          className="text-primary"
        >
          ACCUEIL
        </a>
        <a href="/shop" style={pathname.startsWith("/shop") ? style : {}}>
          BOUTIQUE
        </a>
        <a
          href="/creations"
          style={pathname.startsWith("/creations") ? style : {}}
        >
          CRÉATIONS
        </a>
        <a href="/about" style={pathname.startsWith("/about") ? style : {}}>
          À PROPOS
        </a>
        <a href="/blog" style={pathname.startsWith("/blog") ? style : {}}>
          BLOG
        </a>
        <a
          href="/shop/cart"
          className="btn btn-ghost btn-circle hidden md:flex items-center space-x-4 -translate-y-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="w-6 h-6 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9h14l-2-9M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
            />
          </svg>
        </a>

        {isLoggedIn ? (
          <LogoutButton />
        ) : (
          <Link
            href="/login"
            className="btn btn-ghost btn-circle hidden md:flex items-center space-x-4 -translate-y-2"
          >
            <span className="material-symbols-outlined">
              account_circle
            </span>
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4 md:hidden">
        {/* Cart Icon Mobile */}
        <a href="/cart" className="btn btn-ghost btn-circle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="w-6 h-6 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9h14l-2-9M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z"
            />
          </svg>
        </a>

        {/* Burger Menu */}
        <button
          className="btn btn-ghost btn-circle"
          onClick={() => setIsDrawerOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="w-6 h-6 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 3h18M3 12h18M3 21h18"
            ></path>
          </svg>
        </button>
      </div>

      {/* Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity ${
          isDrawerOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        style={{ backgroundColor: "rgba(236, 236, 236, 0.3)" }}
        onClick={() => setIsDrawerOpen(false)}
      >
        <div
          className={`fixed right-0 top-0 h-full w-64 bg-white shadow-lg p-6 transform transition-transform duration-300 ease-in-out ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="btn btn-ghost btn-circle mb-4"
            onClick={() => setIsDrawerOpen(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="w-6 h-6 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
          <nav className="flex flex-col space-y-4">
            <a href="/home" className="text-primary">
              ACCUEIL
            </a>
            <a href="/shop">BOUTIQUE</a>
            <a href="/creations">CRÉATIONS</a>
            <a href="/about">À PROPOS</a>
            <a href="/blog">BLOG</a>

            {isLoggedIn ? (
              <div className="pt-4">
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/login"
                className="btn btn-ghost btn-circle hidden md:flex items-center space-x-4 -translate-y-2"
              >
                <span className="material-symbols-outlined">
                  account_circle
                </span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
};
