import handwithcrochet from "../medias/images/crochet-bg_files/4b016c7372b5440180c5e265eed458d1-scaled.webp";
import pelote from "../medias/images/crochet-bg_files/0b0bc07c-1615-4152-b893-770a637929dc.webp";

export default function HeroComponent() {
  return (
    <div
      className="hero grayscale-75 bg-base-200 h-100 rounded-xl"
      style={{ backgroundImage: `url(${pelote.src})` }}
    >
      <div className="hero-content text-center">
        <div className="max-w-lg m-auto">
          <h1 className="text-5xl font-bold text-white">Boutique</h1>
          <p className="py-6 text-center font-bold text-white text-xl">
            Retrouvez tout nos produits
          </p>
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <a className="text-white font-bold text-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    ></path>
                  </svg>
                  Home
                </a>
              </li>
              <li>
                <a className="text-white font-bold text-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    ></path>
                  </svg>
                  Documents
                </a>
              </li>
              <li>
                <span className="inline-flex items-center gap-2 text-white font-bold text-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  Add Document
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
