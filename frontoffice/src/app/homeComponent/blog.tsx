import Image from "next/image";
import blogPosts from "../data/blog/blog";

const Blog = () => {
  // Shuffle the blog posts to display them in a random order
  const randomBlogPosts = [...blogPosts]
    .sort(() => 0.5 - Math.random())

  return (
    <section className="container mx-auto py-20 px-6">
      <h2 className="text-3xl font-semibold text-center mb-10">
        DÉCOUVRE LE BLOG <span className="text-red-500">❣️</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {randomBlogPosts.map((post, index) => (
          <div
            key={index}
            className="relative card shadow-md rounded-xl overflow-hidden md:h-120 h-96"
          >
            <Image
              src={post.image}
              alt={post.alt}
              fill
              className="object-cover"
            />
            <div
              className="absolute inset-0 z-10"
              style={{ backgroundColor: "rgba(247, 192, 166, 0.6)" }}
            />
            <div className="relative z-20 card-body flex flex-col justify-end text-black">
              <div className="badge badge-neutral w-fit p-4 mb-2 absolute top-5 text-lg">
                {post.category}
              </div>
              <h2 className="card-title pr-4 absolute top-25 text-white text-3xl">
                {post.title}
              </h2>
              <span className="border-white border-1"></span>
              <div className="flex items-center opacity-80 mt-4 text-white text-xl">
                <span className="mr-2">📅</span> {post.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Blog;
