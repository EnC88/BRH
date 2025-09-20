import React from "react";

const Footer = () => {
  const now = new Date();
  const year = now.getFullYear();

  return (
    <div className="pt-5 grid grid-cols-1 md:grid-cols-3 gap-8 bg-[#2d4a2d] pb-14 px-20">
      {/* Left Section */}
      <div className="w-full text-center md:text-left">
        <a href="#hero">
          <h1 className="font-instrument text-4xl md:text-5xl text-white hover:text-[#c8e6c9]">
            BRH
          </h1>
          <p className="font-instrument text-sm md:text-base text-[#e8f5e8] hover:text-[#c8e6c9] font-light">
            Made with love from scratch. &copy; {year}.
          </p>
        </a>
      </div>

      {/* Quick Links */}
      <div className="flex flex-col items-center md:items-start">
        <h2 className="font-instrument text-2xl md:text-3xl text-white hover:text-[#c8e6c9] mb-2">
          Quick Links
        </h2>
        <ul className="space-y-2">
          <li>
            <a
              href=""
              target="_blank"
              className="font-instrument font-medium text-base md:text-lg text-[#e8f5e8] hover:text-[#c8e6c9]"
            >
              App
            </a>
          </li>
          <li>
            <a
              href=""
              className="font-instrument font-medium text-base md:text-lg text-[#e8f5e8] hover:text-[#c8e6c9]"
            >
              About Us
            </a>
          </li>
        </ul>
      </div>

      {/* Socials */}
      <div className="flex flex-col items-center md:items-start">
        <h2 className="font-instrument text-2xl md:text-3xl text-white hover:text-[#c8e6c9] mb-2">
          Our Socials
        </h2>
        <ul className="space-y-2">
          <li>
            <a
              href=""
              className="font-instrument font-medium text-base md:text-lg text-[#e8f5e8] hover:text-[#c8e6c9]"
            >
              Instagram
            </a>
          </li>
          <li>
            <a
              href=""
              className="font-instrument font-medium text-base md:text-lg text-[#e8f5e8] hover:text-[#c8e6c9]"
            >
              Youtube
            </a>
          </li>
          <li>
            <a
              href=""
              className="font-instrument font-medium text-base md:text-lg text-[#e8f5e8] hover:text-[#c8e6c9]"
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
