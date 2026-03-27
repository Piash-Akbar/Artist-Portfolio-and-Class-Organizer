'use client';
import { Great_Vibes } from "next/font/google";
import Navbar from "../navbar/navbar";
import Link from "next/link";
import HeroSection from "../components/HeroSection";
import LineageTree from "../components/LineageTree";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});


const heroImages = [
  '/background.jpg',
  '/anirban01.jpg',
  '/anirban02.jpg',
  '/anirban03.jpg',
  '/anirbanda.jpg',
  // '/background-7.jpg',
  // '/background-8.jpg',
];




export default function GurusLineage() {
  const gurus = [
    {
      name: "Shri Jitesh Bhattacharjee",
      title: "Foundation of Rhythm & Melody",
      image: "/jitesh-bhattacharjee.jpg",
      images: ["/jitesh-bhattacharjee.jpg"], // Single image
      text: "The seeds of music were sown in Anirban even before he developed a conscious memory of his own. Anirban has famously said that he has no recollection of not knowing Teentaal, Ektaal, Jhaptaal, Rupak Taal, Keherwa or Dadra. The credit for this goes entirely to his father, Shri Jitesh Bhattacharjee, who, despite being an engineer by profession, is an accomplished Tabla artist who has had the great fortune of accompanying legends like Pandit Hariprasad Chaurasia and Vidushi Girija Devi. <br /> Besides rhythmic training, Anirban also learned the basics of melody from his father, who is as adept with Rabindrasangeet and harmonium as he is with the Tabla.",
      specialties: ["Tabla Mastery", "Rhythmic Foundation", "Rabindrasangeet"],
      gharana: "Familial Tradition"
    },
    {
      name: "Shri Ashim Dutta & Shri Manoj Baruah",
      title: "Masters of Violin Artistry",
      images: ["/ashim-dutta.jpg", "/manoj-baruah.jpg"], // Two separate images
      text: "Anirban's training in violin began at the age of 15 under Shri Ashim Dutta of Guwahati, Assam. In recognition of Anirban's prodigious talent, Mr. Dutta chose to not train Anirban within a mere ten months of starting to teach him, and handed him over to Shri Manoj Baruah, a virtuoso who had already compounded manifold the popularity of the violin in the North-East. A disciple of the legendary Dr. Sisirkana Dhar Choudhury of the Senia-Maihar Gharana, Shri Manoj Baruah did not fail to see the immense potential that lay dormant in his new student, and almost immediately began educating Anirban in advanced techniques of the violin. This is an association that lasted nearly a decade, where Anirban learned not only the nitty-gritties of Tantrakari violin-playing, but also a lot of Gayaki-ang as well as the difference between performing classical music on stage and playing in recording sessions for commercial projects. Anirban still emphasises that he is yet to see a smarter violin session artist than Manoj Ji.",
      specialties: ["Tantrakari Technique", "Violin Virtuosity", "Senia-Maihar", "Performance Craft"],
      gharana: "Senia-Maihar Gharana"
    },
    {
      name: "Dr. Sisirkana Dhar Choudhury",
      title: "Architect of Raga Realms",
      image: "/sisirkana-choudhury.jpg",
      images: ["/sisirkana-choudhury.jpg"], // Single image
      text: "While under the tutelage of Manoj Ji, Anirban moved to Kolkata to pursue a bachelors degree in Mathematics from the renowned St. Xavier's College. During this period, Anirban had the privilege of being mentored by Manoj Ji's legendary Guru, Dr. Sisirkana Dhar Choudhury herself. Sisirkana Ji's Maargdarshan opened up horizons of raga music hitherto unknown to Anirban. Under the legend's tutelage, Anirban was exposed to several rare Ragas that are performed exclusively in the Senia-Maihar Gharana, in addition to being taught rather intricate paths of raga development even in common ragas.",
      specialties: ["Raga Elaboration", "Senia-Maihar Secrets", "Maargdarshan", "Rare Ragas"],
      gharana: "Senia-Maihar Gharana"
    },
    {
      name: "Dr. Swarna Khuntia",
      title: "Gayaki Ang",
      images: ["/swarna-khuntia.jpeg"], // Two separate images
      text: "Even though almost the entirety of Anirban's training has been in the Tantrakari system, his formative training ensured that the Gayaki method was never too far from his periphery of vision. In particular, Dr. N. Rajam's music left a deep impression in Anirban's mind. So, he sought the guidance of Dr. Swarna Khuntia, a celebrated disciple of Amma Ji (as Dr. Rajam is called by everyone in her lineage), and Swarna Ji was more than happy to oblige. This turned out to be the final piece in cementing Anirban's very individual style of violin playing - the unprecedented hybrid of the Tantrakari and Gayaki systems that his audience is now witness to.",
      specialties: ["Gayaki Ang", "Style Synthesis", "Dr. N. Rajam Legacy", "V.G. Jog Influence"],
      gharana: "Gwalior Gharana"
    },


     {
      name: "Prof. Biswajit Roy Choudhury",
      title: "Roots of Tantrakari Tradition",
      images: ["/biswajit-roy-choudhury.jpeg"], // Two separate images
      text: "Pandit V.G. Jog was a pioneering figure in Tantrakari-ang violin playing, and Anirban received exposure to Pandit Jog's perspectives from Prof. Biswajit Roy Choudhury, one of Pandit Jog's several illustrious disciples.",
      specialties: ["Gayaki Ang", "Style Synthesis", "Dr. N. Rajam Legacy", "V.G. Jog Influence"],
      gharana: "Senia-Maihar Gharana"
    },





    {
      name: "Shri Supratik Sengupta",
      title: "Sitar Symphony on Violin Strings",
      image: "/supratik-sengupta.jpg",
      images: ["/supratik-sengupta.jpg"], // Single image
      text: "Inspired by the transcendent sitar legacies of Pandit Nikhil Banerjee and Pandit Ravi Shankar, Anirban embarked on a decade-long journey with Shri Supratik Sengupta. A torchbearer of Pandit Buddhadev Dasgupta's Senia-Shahjahanpur lineage, Supratik ji also carries profound sitar wisdom from masters like Pandit Debaprasad Chakraborty. Under his holistic mentorship, Anirban's repertoire blossomed into its mature form, seamlessly blending sitar aesthetics with violin expression while continuing its evolutionary journey.",
      specialties: ["Sitar Repertoire", "Senia-Shahjahanpur", "Buddhadev Legacy", "String Synthesis"],
      gharana: "Senia-Shahjahanpur Gharana"
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
        <style jsx>{`
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
          .animate-float { animation: float 3s ease-in-out infinite; }
          .image-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          .single-image { grid-column: 1 / -1; }
        `}</style>

        {/* Hero Section */}
        {/* <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('/background.jpg')] bg-cover bg-center opacity-50"></div>
          <div className="relative z-10 text-center px-4">
            <h1 className={`text-8xl font-bold mb-4 animate-fade-in font-serif antialiased ${greatVibes.className}`}>
              Gurus & Lineage
            </h1>
            <p className="text-4xl font-palisade font-bold mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              The Masters Who Shaped Anirban's Music.
            </p>
            <Link 
              href="/portfolio#gurus" 
              className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-opacity-90 transition animate-bounce"
            >
              ← Back to Portfolio
            </Link>
          </div>
        </section> */}


        <HeroSection
          images={heroImages}
          title="Gurus & Lineage"
          subtitle="The Masters Who Shaped Anirban's Music."
          ctaText="← Back to Portfolio"
          ctaLink="/"
        />

        {/* Lineage Tree */}
        <section className="py-16 px-4 md:px-20 bg-gray-900/80">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className={`text-5xl md:text-7xl font-serif font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 antialiased ${greatVibes.className}`}>
              Sacred Parampara
            </h2>
            <p className="text-gray-400 italic mb-6">Tracing the musical tradition from legend to student</p>
            <LineageTree />
          </div>
        </section>

        {/* Gurus Content */}
        <section className="py-24 px-4 md:px-20 bg-gray-900/50">
          <div className="max-w-7xl mx-auto space-y-20">
            {gurus.map((guru, index) => (
              <div 
                key={index}
                className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/10 hover:border-amber-500/30 transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${300 + (index * 300)}ms` }}
              >
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-full blur-xl"></div>
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                  <div>
                    <h3 className={`text-3xl md:text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent antialiased ${greatVibes.className}`}>
                      {guru.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-rose-500/20 rounded-full text-amber-300 border border-amber-500/30">
                        {guru.gharana}
                      </span>
                      <span className="text-gray-400">Guru Parampara</span>
                    </div>
                  </div>
                  <h4 className="text-xl font-semibold text-pink-400 uppercase tracking-wide mt-2 md:mt-0">
                    {guru.title}
                  </h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                  {/* Images Section */}
                  <div className="space-y-4">
                    <div className={`image-grid ${guru.images.length === 1 ? 'single-image' : ''}`}>
                      {guru.images.map((imgSrc, imgIndex) => (
                        <div key={imgIndex} className="relative group/image">
                          <img 
                            src={imgSrc}
                            alt={`${guru.name} - ${imgIndex === 0 ? 'Primary' : 'Secondary'}`}
                            className="w-full h-64 md:h-80 object-cover rounded-xl shadow-xl border-2 border-white/10 group-hover/image:border-amber-400/50 transition-all duration-500"
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/400x300?text=${guru.name.split(' ')[0]}`;
                            }}
                          />
                          {guru.images.length > 1 && (
                            <div className="absolute -top-2 -right-2 bg-amber-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                              {imgIndex + 1}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {guru.images.length > 1 && (
                      <p className="text-sm text-gray-400 italic text-center">
                        Dual masters of the tradition
                      </p>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="space-y-6">
                    <p className="text-lg leading-relaxed text-gray-200 font-light">
                      {guru.text}
                    </p>
                    
                    {/* Specialties */}
                    {/* <div>
                      <h5 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-3">Key Contributions</h5>
                      <div className="flex flex-wrap gap-2">
                        {guru.specialties.map((specialty, sIndex) => (
                          <span 
                            key={sIndex}
                            className="px-3 py-2 bg-white/5 backdrop-blur-sm rounded-lg text-sm font-medium text-amber-300 border border-white/10 hover:bg-white/10 transition-colors animate-float"
                            style={{ animationDelay: `${sIndex * 100}ms` }}
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div> */}

                    {/* Legacy Quote */}
                    <blockquote className="border-l-4 border-amber-500/30 pl-4 italic text-gray-400">
                      "A guru's wisdom echoes through generations, shaping not just technique, but the very soul of music."
                    </blockquote>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Lineage Tree / Summary */}
        <section className="py-24 px-4 md:px-20 bg-gradient-to-b from-gray-900 to-black">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className={`text-5xl md:text-7xl font-serif font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 antialiased ${greatVibes.className}`}>
              Sacred Parampara
            </h2>
            <LineageTree />
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              This sacred lineage weaves through multiple gharanas, each guru contributing unique facets to Anirban's extraordinary musical identity. From rhythmic foundations to raga mastery, vocal expression to sitar aesthetics, this parampara creates performances that transcend tradition while honoring its deepest roots.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['Senia-Maihar', 'Senia-Shahjahanpur', 'Gayaki Ang', 'Tantrakari', 'Sitar Influence'].map((tradition, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-rose-500/20 backdrop-blur-sm rounded-full text-sm font-semibold text-amber-300 border border-amber-500/30 hover:scale-105 transition-all"
                >
                  {tradition}
                </span>
              ))}
            </div>
            <Link 
              href="/#playings"
              className="inline-flex items-center bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:via-orange-400 hover:to-rose-400 text-gray-900 px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Witness the Mastery
              <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-black/50 border-t border-white/10">
          <div className="text-center">
            <p className="text-gray-400 mb-2">© 2025 Anirban Bhattacharjee | Preserving the Sacred Tradition</p>
            <p className="text-sm text-gray-500">Naman to the Gurus | Parampara Parampara</p>
          </div>
        </footer>
      </div>
    </>
  );
}