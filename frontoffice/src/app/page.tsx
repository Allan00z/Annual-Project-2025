import React from "react";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-base-100 font-sans">
      {/* Navbar */}


      {/* Hero Section */}
      <section className="container mx-auto flex flex-col md:flex-row items-center py-12 px-6">
        <div className="md:w-1/2 flex justify-center">
          <img src="/your-image-url.jpg" alt="Hand with crochet art" className="max-w-md rounded-lg shadow-lg" />
        </div>
        <div className="md:w-1/2 text-center md:text-left mt-6 md:mt-0">
          <h1 className="text-5xl font-bold">
            Des créations <span className="text-primary">uni</span> au crochet
          </h1>
          <p className="mt-4 text-lg">
            Chaque pièce est soigneusement confectionnée à la main dans les Hautes-Alpes. Offrez-vous ou à vos proches un savoir-faire authentique, alliant douceur et originalité.
          </p>
          <button className="btn btn-primary mt-6">Découvrir la boutique</button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;