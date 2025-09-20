"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  faBars,
  faClose,
  faCamera, // 👈 use camera icon
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Navbar = () => {
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

  return (
    <nav
      className={`bg-white shadow-sm border-b border-stone-200 transition-colors duration-300 ${
        isScrolled ? "py-4" : "py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 sm:px-10">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <FontAwesomeIcon
            icon={faCamera}
            className="text-emerald-800 text-2xl"
          />
          <Link
            href="/"
            className="text-emerald-700 hover:text-emerald-800 font-light transition-colors duration-300 text-3xl"
          >
            Glimpse
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/camera"
            className="px-3 py-2 rounded-lg text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-light transition-colors duration-300 text-lg"
          >
            Create Post
          </Link>
          <Link
            href="/feed"
            className="px-3 py-2 rounded-lg text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 font-light transition-colors duration-300 text-lg"
          >
            Feed
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
