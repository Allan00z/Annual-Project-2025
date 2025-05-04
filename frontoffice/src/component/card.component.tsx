// component/card.component.jsx
import Image from "next/image";

type CardProps = {
  image: any;
  title: string;
  description: string;
  price: string;
  handleAddToCart: React.MouseEventHandler<HTMLButtonElement>;
};

export default function CardComponent({
  image,
  title,
  description,
  price,
  handleAddToCart,
}: CardProps) {
  return (
    <div className="card bg-base-100 w-full sm:w-[48%] lg:w-[30%] shadow-sm rounded-xl">
      <figure className="h-48 overflow-hidden">
        {" "}
        {/* Hauteur fixe */}
        <Image
          src={image}
          alt={title}
          width={500}
          height={500}
          className="w-full h-full object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>{description}</p>
        <div className="card-actions justify-between items-center">
          <span className="text-[#BF7451] font-semibold">{price}</span>
          <button
            className="bg-[#f7c0a6] px-6 py-2 rounded-lg text-white font-bold"
            onClick={handleAddToCart}
          >
            Acheter
          </button>
        </div>
      </div>
    </div>
  );
}
