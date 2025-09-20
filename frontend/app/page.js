'use client';
import { useRouter } from 'next/navigation'; // or from 'next/router' in pages router
import { auth } from '/utils/firebase'; // update path as needed
import { onAuthStateChanged } from 'firebase/auth';

export default function Page() {

  const router = useRouter();

  const handleLoginClick = () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/home'); // or wherever authenticated users go
      } else {
        router.push('/instagram'); // or your login/signup page
      }
      unsubscribe(); // prevent memory leaks
    });
  };

  return (
    <main className="min-h-screen bg-[#2d4a2d]">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30 hero-video"
        >
          <source src="/Background.mp4" type="video/mp4" />
        </video>
        
        <div className="absolute inset-0 bg-gradient-to-br from-[#2d4a2d]/20 via-[#4a7c59]/15 to-[#6b9b7a]/25"></div>
        <div className="relative z-10 text-center px-8 md:px-16 lg:px-24">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-space font-black text-8xl md:text-9xl lg:text-[12rem] text-white leading-none mb-16 tracking-tight drop-shadow-lg">
              glimpse
            </h1>
            <p className="font-space font-light text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed drop-shadow-lg mb-16 tracking-wide">
              Capture memories. Share moments. Build connections.
            </p>
            <button
              onClick={handleLoginClick} 
              className="inline-block px-16 py-5 bg-white/20 hover:bg-white/30 text-white font-space font-medium text-lg rounded-full border border-white/30 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
            >
              Login
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}