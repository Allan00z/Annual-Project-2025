"use client";
import React from "react";
import Creatrice from "./homeComponent/creatrice";
import Shop from "./homeComponent/shop";
import Blog from "./homeComponent/blog";
import Hero from "./homeComponent/hero";

const HomePage = () => {


  return (
    <div className="min-h-screen bg-base-100 font-sans">
      <Hero />
      <Shop />
      <Creatrice/>
      <Blog />
    </div>
  );
};

export default HomePage;
