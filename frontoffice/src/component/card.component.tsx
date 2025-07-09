import Image from "next/image";

type CardProps = {
  image: any;
  title: string;
  description: string;
  price: string;
  feedbacks?: { grade: number }[];
  handleAddToCart: React.MouseEventHandler<HTMLButtonElement>;
};

export default function CardComponent({
  image,
  title,
  description,
  price,
  feedbacks = [],
  handleAddToCart,
}: CardProps) {
  const averageRating = feedbacks.length
    ? feedbacks.reduce((sum, f) => sum + f.grade, 0) / feedbacks.length
    : 0;

  return (
    <div className="card bg-base-100 w-full sm:w-[48%] lg:w-[30%] shadow-sm rounded-xl">
      <figure className="h-48 overflow-hidden">
        <Image
          src={image}
          alt={title || "Image produit"}
          width={500}
          height={500}
          className="w-full h-full object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>

        {/* ⭐ Stars here */}
        <div className="flex flex-row items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ${
                i < Math.round(averageRating)
                  ? "fill-yellow-400"
                  : "fill-gray-300"
              }`}
              viewBox="0 0 24 24"
            >
              <path d="M12 .587l3.668 7.568L24 9.75l-6 5.792L19.336 24 12 20.01 4.664 24 6 15.542 0 9.75l8.332-1.595z" />
            </svg>
          ))}
        </div>

        <p>{description}</p>
        <div className="card-actions justify-between items-center">
          <span className="text-[#BF7451] font-semibold">{price}</span>
          <button className="bg-[#f7c0a6] px-6 hover:text-orange-400 cursor-pointer py-2 rounded-lg text-black font-bold" onClick={handleAddToCart}>
            Sélectionner
          </button>
        </div>
      </div>
    </div>
  );
}
