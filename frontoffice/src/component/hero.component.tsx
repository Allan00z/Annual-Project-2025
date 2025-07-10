import pelote from "../medias/images/crochet-bg_files/0b0bc07c-1615-4152-b893-770a637929dc.webp";

export default function HeroComponent() {
  return (
    <div
      className="hero bg-base-200 h-100 rounded-xl flex"
      style={{ backgroundImage: `url(${pelote.src})` }}
    >
      <div className="hero-content text-center p-12">
        <div className="max-w-lg m-auto">
          <h1 className="text-5xl font-bold text-black">Boutique</h1>
          <p className="py-6 font-bold text-black text-xl">
            Retrouvez tout nos produits
          </p>
        </div>
      </div>
    </div>
  );
}
