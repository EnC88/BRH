export default function Page() {
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
            <h1 className="font-space font-light text-8xl md:text-9xl lg:text-[12rem] text-white leading-none mb-8 tracking-tight drop-shadow-lg">
              Glimpse
            </h1>
            <p className="font-instrument text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              An online platform to remember your friend's favorite places and moments. 
              What drives meaningful connections?
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 md:px-16 lg:px-24 bg-[#e8f5e8]/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-space font-light text-2xl text-[#2d4a2d] mb-12">Most popular</h2>
          
          <div className="space-y-8">
            <article className="group cursor-pointer p-6 rounded-lg bg-white/50 hover:bg-white/70 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
                <div className="flex-1">
                  <h3 className="font-instrument text-lg md:text-xl text-[#2d4a2d] mb-3 group-hover:text-[#4a7c59] transition-colors leading-tight">
                    Collection Spotlight #3 | Sarah's Coffee Journey
                  </h3>
                  <p className="font-instrument text-sm text-[#4a4a4a] mb-4 leading-relaxed">
                    Sarah's curated collection of the most beloved coffee spots, 
                    each with its own story and character. From hidden gems to neighborhood favorites.
                  </p>
                  <span className="font-space text-sm text-[#b8870b]">Dec 15, 2024</span>
                </div>
                <div className="w-full md:w-48 h-32 bg-gradient-to-br from-[#9dc2a3] to-[#d4b896] group-hover:from-[#6b9b7a] group-hover:to-[#b8870b] transition-all duration-300 rounded-lg"></div>
              </div>
            </article>

            <article className="group cursor-pointer p-6 rounded-lg bg-white/50 hover:bg-white/70 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
                <div className="flex-1">
                  <h3 className="font-instrument text-lg md:text-xl text-[#2d4a2d] mb-3 group-hover:text-[#4a7c59] transition-colors leading-tight">
                    How top brands create memorable experiences (and you could too)
                  </h3>
                  <p className="font-instrument text-sm text-[#4a4a4a] mb-4 leading-relaxed">
                    Leading consumer & retail brands like Casper, Away, and Adore Me are seeing measurable results from creating 
                    meaningful connections. Learn how they're building lasting relationships.
                  </p>
                  <span className="font-space text-sm text-[#b8870b]">Dec 12, 2024</span>
                </div>
                <div className="w-full md:w-48 h-32 bg-gradient-to-br from-[#d4b896] to-[#9dc2a3] group-hover:from-[#b8870b] group-hover:to-[#6b9b7a] transition-all duration-300 rounded-lg"></div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 md:px-16 lg:px-24 bg-[#f5f1e8]/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-space font-light text-2xl text-[#2d4a2d] mb-12">Glimpse</h2>
          
          <div className="space-y-12">
            <article className="group cursor-pointer p-8 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-300 border border-[#9dc2a3]/30">
              <div className="mb-4">
                <span className="font-space text-sm text-[#b8870b] uppercase tracking-wider">Featured</span>
              </div>
              <h3 className="font-instrument text-3xl md:text-4xl text-[#2d4a2d] mb-4 group-hover:text-[#4a7c59] transition-colors leading-tight">
                For many friends, shared memories are no longer just casual mentions
              </h3>
              <p className="font-instrument text-lg text-[#4a4a4a] leading-relaxed max-w-3xl">
                A follow-up to the Glimpse study, this article explores how leading 
                friend groups are moving beyond casual mentions into meaningful documentation, 
                shared experiences, and lasting memories. Packed with real examples, it shows 
                how collections are being built into the friendship model — and why success 
                depends on authentic moments, shared values, and genuine connections.
              </p>
              <div className="mt-6">
                <span className="font-space text-sm text-[#b8870b]">Dec 10, 2024</span>
              </div>
            </article>

            <article className="group cursor-pointer p-8 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-300 border border-[#9dc2a3]/30">
              <div className="mb-4">
                <span className="font-space text-sm text-[#b8870b] uppercase tracking-wider">Featured</span>
              </div>
              <h3 className="font-instrument text-3xl md:text-4xl text-[#2d4a2d] mb-4 group-hover:text-[#4a7c59] transition-colors leading-tight">
                For many friends, shared memories are no longer just casual mentions
              </h3>
              <p className="font-instrument text-lg text-[#4a4a4a] leading-relaxed max-w-3xl">
                A follow-up to the Glimpse study, this article explores how leading 
                friend groups are moving beyond casual mentions into meaningful documentation, 
                shared experiences, and lasting memories. Packed with real examples, it shows 
                how collections are being built into the friendship model — and why success 
                depends on authentic moments, shared values, and genuine connections.
              </p>
              <div className="mt-6">
                <span className="font-space text-sm text-[#b8870b]">Dec 10, 2024</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 md:px-16 lg:px-24 bg-[#9dc2a3]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-space font-light text-2xl text-[#2d4a2d] mb-12">Recent insights</h2>
          
          <div className="space-y-6">
            {[
              {
                title: "Collection Radar: Top friend groups in H2 of 2024",
                description: "This H2 2024 report analyzes 250 friend groups - from close-knit circles to diverse communities.",
                date: "Dec 8, 2024"
              },
              {
                title: "Collection Radar: Top friend groups in H2 of 2024",
                description: "This H2 2024 report analyzes 250 friend groups - from close-knit circles to diverse communities.",
                date: "Dec 8, 2024"
              },
              {
                title: "Expert Interview #4 | Alex from The Brooklyn Collective",
                description: "The Brooklyn Collective's founder Alex isn't your typical social organizer. Before starting the group, they spent a decade running community events.",
                date: "Dec 5, 2024"
              },
              {
                title: "Expert Interview #4 | Alex from The Brooklyn Collective",
                description: "The Brooklyn Collective's founder Alex isn't your typical social organizer. Before starting the group, they spent a decade running community events.",
                date: "Dec 5, 2024"
              },
              {
                title: "For many friend groups, shared experiences are no longer just casual mentions",
                description: "A follow-up to the Collection Radar, this article explores how leading friend groups are moving beyond casual mentions into meaningful documentation.",
                date: "Dec 3, 2024"
              }
            ].map((item, index) => (
              <article key={index} className="group cursor-pointer p-4 rounded-lg bg-white/40 hover:bg-white/60 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
                  <div className="flex-1">
                    <h3 className="font-instrument text-lg md:text-xl text-[#2d4a2d] mb-3 group-hover:text-[#4a7c59] transition-colors leading-tight">
                      {item.title}
                    </h3>
                    <p className="font-instrument text-sm text-[#4a4a4a] mb-4 leading-relaxed">
                      {item.description}
                    </p>
                    <span className="font-space text-sm text-[#b8870b]">{item.date}</span>
                  </div>
                  <div className="w-full md:w-32 h-24 bg-gradient-to-br from-green-light to-warm-tan group-hover:from-green-medium group-hover:to-warm-gold transition-all duration-300 rounded-lg"></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-8 md:px-16 lg:px-24 bg-[#f5f1e8]/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-space font-light text-4xl md:text-5xl text-[#2d4a2d] mb-8 leading-tight">
              Explore our<br />
              resources to<br />
              win the<br />
              connection<br />
              game
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group cursor-pointer p-6 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-300 border border-[#9dc2a3]/30">
              <div className="mb-6">
                <h3 className="font-space font-light text-lg text-[#2d4a2d] mb-2">Collections & Technology</h3>
                <p className="font-instrument text-sm text-[#4a4a4a]">Our view on technology impact on meaningful connections.</p>
              </div>
              <div className="w-full h-48 bg-gradient-to-br from-green-pale to-warm-tan group-hover:from-green-light group-hover:to-warm-gold transition-all duration-300 rounded-lg mb-4"></div>
              <button className="font-space text-sm text-[#b8870b] border-b border-transparent group-hover:border-[#b8870b] transition-colors">
                View More
              </button>
            </div>
            
            <div className="group cursor-pointer p-6 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-300 border border-[#9dc2a3]/30">
              <div className="mb-6">
                <h3 className="font-space font-light text-lg text-[#2d4a2d] mb-2">Glimpse Navigator</h3>
                <p className="font-instrument text-sm text-[#4a4a4a]">An independent exploration tool that will help you gain a clear view of your social infrastructure.</p>
              </div>
              <div className="w-full h-48 bg-gradient-to-br from-warm-tan to-green-pale group-hover:from-warm-gold group-hover:to-green-light transition-all duration-300 rounded-lg mb-4"></div>
              <button className="font-space text-sm text-[#b8870b] border-b border-transparent group-hover:border-[#b8870b] transition-colors">
                Explore
              </button>
            </div>

            <div className="group cursor-pointer p-6 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-300 border border-[#9dc2a3]/30">
              <div className="mb-6">
                <h3 className="font-space font-light text-lg text-[#2d4a2d] mb-2">Glimpse Navigator</h3>
                <p className="font-instrument text-sm text-[#4a4a4a]">An independent exploration tool that will help you gain a clear view of your social infrastructure.</p>
              </div>
              <div className="w-full h-48 bg-gradient-to-br from-green-light to-warm-tan group-hover:from-green-medium group-hover:to-warm-gold transition-all duration-300 rounded-lg mb-4"></div>
              <button className="font-space text-sm text-[#b8870b] border-b border-transparent group-hover:border-[#b8870b] transition-colors">
                Explore
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 md:px-16 lg:px-24 bg-gradient-to-br from-[#e8f5e8] to-[#f5f1e8]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-space font-light text-3xl md:text-4xl text-[#2d4a2d] mb-8">
            Stay in the loop
          </h2>
          <p className="font-instrument text-lg text-[#4a4a4a] mb-8 max-w-2xl mx-auto">
            Want the news about our content and events to come to you?
          </p>
          <button className="font-space text-sm text-[#b8870b] border-b border-[#b8870b] hover:border-transparent transition-colors">
            Read the archive
          </button>
        </div>
      </section>
    </main>
  );
}
