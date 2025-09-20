import Image from "next/image";
import brh_hero from "@/public/brh_hero.png"; // put image in /assets

export default function Page() {
  return (
    <main className="relative min-h-screen">
      <Image src={brh_hero} alt="Hero" fill className="object-cover" />
      <div className="absolute inset-0 flex items-start justify-center pt-16 md:pt-24">
        <h1 className="font-instrument font-bold text-4xl md:text-6xl lg:text-8xl text-white text-center max-w-8xl px-8 drop-shadow-lg">
          Welcome to BigRed Collections - remember your friend's favorite places and
          moments!
        </h1>
      </div>
    </main>
  );
}
