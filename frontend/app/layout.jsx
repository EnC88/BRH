// app/layout.jsx
import { instrumentSerif, spaceGrotesk } from "./fonts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${spaceGrotesk.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className={`${instrumentSerif.variable}`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}