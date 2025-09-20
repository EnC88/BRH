import React from "react";
const Footer = () => {
  const now = new Date();
  const year = now.getFullYear();

  return (
    <div className="pt-5 grid grid-cols-4 md:grid-cols-12 bg-gradient-to-r from-myRed-300 via-Blue-200 to-myRed-500 pb-14 px-5">
      <div className="col-span-2 md:col-span-6 flex flex-col items-center md:items-start">
        <div className="w-full max-w-md text-left">
          <a href="#hero">
            <h1 className="font-instrument text-md md:text-3xl text-white hover:text-stone-200">
              BRH
            </h1>
            <p className="font-instrument text-xs text-neutral-400 hover:text-neutral-500 font-light">
              Made with love from scratch. &copy; {year}.
            </p>
          </a>
        </div>
      </div>

      <div className="col-span-1 md:col-span-3 flex flex-col items-center md:items-start">
        <h1 className="font-instrument text-md md:text-3xl text-white hover:text-stone-200">
          Quick Links
        </h1>
        <ul className="space-y-1">
          <li>
            <a
              href=""
              target="_blank"
              className="font-instrument font-extralight text-sm md:text-lg text-stone-100 hover:text-stone-200"
            >
              App
            </a>
          </li>
          <li>
            <a
              href=""
              className="font-instrument font-extralight text-sm md:text-lg text-stone-100 hover:text-stone-200"
            >
              About Us
            </a>
          </li>
        </ul>
      </div>

      <div className="col-span-1 md:col-span-3 flex flex-col items-center md:items-start">
        <h1 className="font-instrument text-md md:text-3xl text-white hover:text-stone-200">
          Our Socials
        </h1>
        <ul className="space-y-1">
          <li>
            <a
              href=""
              className="font-instrument font-extralight text-sm md:text-lg text-stone-100 hover:text-stone-200"
            >
              Instagram
            </a>
          </li>
          <li>
            <a
              href=""
              className="font-instrument font-extralight text-sm md:text-lg text-stone-100 hover:text-stone-200"
            >
              Youtube
            </a>
          </li>
          <li>
            <a
              href=""
              className="font-instrument font-extralight text-sm md:text-lg text-stone-100 hover:text-stone-200"
            >
              GitHub
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Footer;
