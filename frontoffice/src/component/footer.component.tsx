import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-12">
    <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-6">
      <div className="md:w-1/3 text-center md:text-left">
        <h3 className="text-lg font-bold">Besoin d’aide ?</h3>
        <ul className="mt-2 space-y-1 text-gray-400">
          <li><a href="#" className="hover:text-orange-400">Points de vente physiques</a></li>
          <li><a href="#" className="hover:text-orange-400">Livraison</a></li>
          <li><a href="#" className="hover:text-orange-400">Foire aux questions</a></li>
          <li><a href="#" className="hover:text-orange-400">Me contacter</a></li>
        </ul>
      </div>
      <div className="md:w-1/3 text-center">
        <img src="/logo.svg" alt="Audelweiss Logo" className="mx-auto w-24 mb-4" />
        <p className="text-gray-400 text-sm">
          Chaque pièce est imaginée et réalisée à la main dans les Hautes-Alpes, avec passion et créativité.
        </p>
        <a href="#" className="mt-4 inline-block text-gray-400 hover:text-white text-2xl">📸</a>
      </div>
      <div className="md:w-1/3 text-center md:text-right">
        <h3 className="text-lg font-bold">Liens utiles</h3>
        <ul className="mt-2 space-y-1 text-gray-400">
          <li><a href="#" className="hover:text-orange-400">CGV</a></li>
          <li><a href="#" className="hover:text-orange-400">Mentions légales</a></li>
          <li><a href="#" className="hover:text-orange-400">Politique de confidentialité</a></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-500 text-sm">
      2025 © AUDELWEISS Craft – Site réalisé par <a href="#" className="underline hover:text-white">Audrey HOSSEPIAN</a>
    </div>
  </footer>
  )
}

export default Footer