// app/fonts.js
import { Instrument_Serif, Space_Grotesk } from "next/font/google";

export const instrumentSerif = Instrument_Serif({
  weight: ["400"], // Instrument Serif only has "400"
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

export const spaceGrotesk = Space_Grotesk({
  weight: ["300", "500", "700"],
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
