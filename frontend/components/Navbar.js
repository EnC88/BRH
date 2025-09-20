"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  faBars,
  faClose,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Navbar = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hamburgerOpen, setIsHamburgerOpen] = useState(false);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-hide hamburger on resize
  useEffect(() => {
    const resize = () => {
      if (window.innerWidth >= 640) setIsHamburgerOpen(false);
    };
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Don't show navbar on the landing page and Instagram page
  if (pathname === "/" || pathname === "/instagram") {
    return null;
  }

  return (
    <nav
      className={`bg-[#f5f5f0] border-b border-green-400/20 transition-colors duration-300 ${
        isScrolled ? "py-4" : "py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 sm:px-10">
        {/* Logo and Brand */}
        <div className="flex items-center">
          <Link
            href="/"
            className="text-[#2d4a2d] hover:text-[#4a7c59] font-bold transition-colors duration-300 text-3xl tracking-wide"
          >
            glimpse
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/camera"
            className="w-10 h-10 rounded-full border-2 border-[#2d4a2d] bg-transparent hover:bg-[#2d4a2d] flex items-center justify-center transition-colors duration-300"
          >
            <FontAwesomeIcon
              icon={faPlus}
              className="text-[#2d4a2d] hover:text-white text-lg transition-colors duration-300"
            />
          </Link>
          <Link
            href="/home"
            className="px-4 py-3 rounded-lg text-[#2d4a2d] hover:text-[#4a7c59] hover:bg-green-400/10 font-medium transition-colors duration-300 text-lg"
          >
            Feed
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
