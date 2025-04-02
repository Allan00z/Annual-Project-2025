'use client'

import Image from "next/image";
import Logo from "../medias/logo/logoLongLarge.svg";
import { usePathname } from "next/navigation";
import { useState } from 'react';

export const NavBar = () => {
    const pathname = usePathname();
    const style = { color: "#e8a499" };
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <nav className="flex justify-between items-center p-6 shadow-md bg-white">
            <a href="/">
                <Image src={Logo} alt="Logo" className="w-62" />
            </a>
            <div className="space-x-6 hidden md:flex">
                <a href="/" style={pathname === "/" ? style : {}} className="text-primary">ACCUEIL</a>
                <a href="shop" style={pathname.startsWith("/shop") ? style : {}}>BOUTIQUE</a>
                <a href="#" style={pathname.startsWith("/creations") ? style : {}}>CRÉATIONS</a>
                <a href="about" style={pathname.startsWith("/about") ? style : {}}>À PROPOS</a>
                <a href="blog" style={pathname.startsWith("/blog") ? style : {}} >BLOG</a>
            </div>
            <div className="flex items-center space-x-4 md:hidden">
                <button className="btn btn-ghost btn-circle" onClick={() => setIsDrawerOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18M3 12h18M3 21h18"></path></svg>
                </button>
            </div>
            {/* Drawer */}
            {isDrawerOpen && (
                <div className="fixed inset-0 bg-opacity-50 flex justify-end">
                    <div className="w-64 bg-white h-full shadow-lg p-6">
                        <button className="btn btn-ghost btn-circle mb-4" onClick={() => setIsDrawerOpen(false)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6 stroke-current">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                        <nav className="flex flex-col space-y-4">
                            <a href="#" className="text-primary">ACCUEIL</a>
                            <a href="#">BOUTIQUE</a>
                            <a href="#">CRÉATIONS</a>
                            <a href="#">À PROPOS</a>
                            <a href="#">BLOG</a>
                        </nav>
                    </div>
                </div>
            )}
        </nav>
    )
}