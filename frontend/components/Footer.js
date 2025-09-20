import React from "react";

const Footer = () => {
  const now = new Date();
  const year = now.getFullYear();

  return (
    <footer className="bg-[#2d4a2d] border-t border-green-400/10">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <a href="/" className="group inline-block">
              <h1 className="font-light text-2xl text-white group-hover:text-green-300 transition-colors duration-300 tracking-wide">
                glimpse
              </h1>
              <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                Shared AR experiences for the modern world.
              </p>
            </a>
          </div>

          {/* Navigate */}
          <div>
            <h3 className="font-medium text-white text-sm uppercase tracking-wider mb-6">
              Navigate
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/home"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/camera"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Camera
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-medium text-white text-sm uppercase tracking-wider mb-6">
              Social
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/instagram"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/EnC88/BRH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@glimpse.app"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-green-400/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-xs text-gray-400">
              © {year} glimpse. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a
                href="/privacy"
                className="text-xs text-gray-400 hover:text-white transition-colors duration-200"
              >
                Privacy
              </a>
              <a
                href="/terms"
                className="text-xs text-gray-400 hover:text-white transition-colors duration-200"
              >
                Terms
              </a>
              <a
                href="/accessibility"
                className="text-xs text-gray-400 hover:text-white transition-colors duration-200"
              >
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
