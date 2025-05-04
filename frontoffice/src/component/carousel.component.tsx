"use client";

import products from "../app/data/carousel/carousel";
import Image from "next/image";
import {useState, useEffect, useRef} from "react";

const Carousel = () => {
  const [hoveredProduct, setHoveredProduct] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollDirection, setScrollDirection] = useState<"right" | "left">("right");

  // Déplacement du curseur pour tooltip
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const scrollBy = (offset: number) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ left: offset, behavior: "smooth" });
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
      setScrollDirection("left");
    } else if (container.scrollLeft <= 0) {
      setScrollDirection("right");
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
  
    let animationFrame: number;
    const scrollSpeed = 1;
  
    const animate = () => {
      if (!container) return;
  
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
  
      // Appliquer le scroll
      container.scrollLeft += scrollDirection === "right" ? scrollSpeed : -scrollSpeed;
  
      // Détection de fin / début pour inverser
      if (container.scrollLeft >= maxScrollLeft - 1) {
        setScrollDirection("left");
      } else if (container.scrollLeft <= 1) {
        setScrollDirection("right");
      }
  
      animationFrame = requestAnimationFrame(animate);
    };
  
    animationFrame = requestAnimationFrame(animate);
  
    return () => cancelAnimationFrame(animationFrame);
  }, [scrollDirection]);

  return (
    <section className="w-full relative py-10">
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-scroll scroll-smooth no-scrollbar px-10"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="min-w-[300px] h-52 relative flex-shrink-0"
            onMouseEnter={() => setHoveredProduct(product)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            <Image
              src={product.image}
              alt={product.nom}
              fill
              className="object-cover rounded-xl cursor-pointer"
            />
          </div>
        ))}
      </div>

      {/* TOOLTIP */}
      {hoveredProduct && (
        <div
          className="fixed z-50 px-3 py-1 rounded-md text-sm text-black font-semibold pointer-events-none"
          style={{
            top: mousePos.y + 15,
            left: mousePos.x + 15,
            backgroundColor: "#f7c0a6",
            whiteSpace: "nowrap",
          }}
        >
          {hoveredProduct.nom}
        </div>
      )}
    </section>
  );
};

export default Carousel;
