"use client";
import React from "react";
import Creatrice from "./creatrice";
import Shop from "./shop";
import Blog from "./blog";
import Hero from "./hero";

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
