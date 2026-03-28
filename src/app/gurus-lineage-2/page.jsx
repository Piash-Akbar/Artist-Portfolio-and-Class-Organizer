'use client';
import Navbar from "../navbar/navbar";
import Link from "next/link";
import HeroSection from "../components/HeroSection";
import LineageTree from "../components/LineageTree";

const heroImages = [
  '/background.jpg',
  '/jitesh-bhattacharjee.jpg',
  '/sisirkana-choudhury.jpg',
  '/swarna-khuntia.jpeg',
  '/ashim-dutta.jpg',
  '/manoj-baruah.jpg',
  '/biswajit-roy-choudhury.jpeg',
  '/supratik-sengupta.jpg',
];

export default function GurusLineage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0c0905] text-[#f5efe4]">

        {/* Hero */}
        <HeroSection
          images={heroImages}
          title="Gurus & Lineage"
          subtitle="The Masters Who Shaped Anirban's Music."
          ctaText="Back to Home"
          ctaLink="/"
        />

        {/* Lineage Tree */}
        <section className="bg-[#1a1209]">
          <div className="max-w-[980px] lg:max-w-[1100px] mx-auto py-[clamp(32px,8vw,80px)] px-[clamp(16px,5vw,52px)] text-center">
            <p className="text-[10px] tracking-[0.24em] uppercase text-[#b8922a] font-medium mb-3 sm:mb-4 flex items-center justify-center gap-2.5">
              <span className="w-5 h-px bg-[#b8922a] inline-block"></span>Parampara
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(1.5rem,4.5vw,3rem)] font-light italic text-[#f5efe4] mb-1.5">
              The Sacred <em>Lineage Tree</em>
            </h2>
            <p className="font-[family-name:var(--font-cormorant)] italic text-[clamp(12px,2.5vw,14px)] text-[#f5efe4]/34 mb-6 sm:mb-9">
              Tracing the musical tradition from legend to student
            </p>
            <LineageTree />
          </div>
        </section>

        {/* Essay Section — Dark */}
        <section className="bg-[#1a1209] text-[#f5efe4]">
          <div className="max-w-[780px] lg:max-w-[820px] mx-auto py-[clamp(36px,8vw,80px)] px-[clamp(16px,5vw,52px)]">
            <p className="text-[10px] tracking-[0.24em] uppercase text-[#b8922a] font-medium mb-3 sm:mb-4 flex items-center justify-center gap-2.5">
              <span className="w-5 h-px bg-[#b8922a] inline-block"></span>Sacred Tradition
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(1.5rem,4.5vw,3rem)] font-light leading-[1.12] text-[#f5efe4] text-center mb-[clamp(24px,5vw,48px)]">
              The Gurus Who Shaped Anirban&apos;s <em>Musical Journey</em>
            </h2>

            <div className="text-[clamp(13px,1.8vw,15px)] leading-[1.9] sm:leading-[2] font-light text-[#f5efe4]/70">

              <p>
                The seeds of music were sown in Anirban even before he developed a conscious memory of his own. Anirban has famously said that he has no recollection of not knowing Teentaal, Ektaal, Jhaptaal, Rupak Taal, Keherwa or Dadra. The credit for this goes entirely to his father, Shri Jitesh Bhattacharjee, who, despite being an engineer by profession, is an accomplished Tabla artist who has had the great fortune of accompanying legends like Pandit Hariprasad Chaurasia and Vidushi Girija Devi.
              </p>

              <figure className="my-8 flex justify-center">
                <img src="/jitesh-bhattacharjee.jpg" alt="Shri Jitesh Bhattacharjee" className="w-[140px] sm:w-[160px] aspect-[3/4] object-cover object-top sepia-[0.15] border border-[#b8922a]/30 p-[3px] shadow-[0_4px_20px_rgba(184,146,42,0.15)] hover:sepia-0 hover:shadow-[0_6px_28px_rgba(184,146,42,0.25)] transition-all duration-500" />
              </figure>

              <p>
                Besides rhythmic training, Anirban also learned the basics of melody from his father, who is as adept with Rabindrasangeet and harmonium as he is with the Tabla.
              </p>

              <p className="mt-6">
                Anirban&apos;s training in violin began at the age of 15 under Shri Ashim Dutta of Guwahati, Assam. In recognition of Anirban&apos;s prodigious talent, Mr. Dutta chose to not train Anirban within a mere ten months of starting to teach him, and handed him over to Shri Manoj Baruah, a virtuoso who had already compounded manifold the popularity of the violin in the North-East.
              </p>

              <figure className="my-8 flex justify-center gap-4">
                <img src="/ashim-dutta.jpg" alt="Shri Ashim Dutta" className="w-[120px] sm:w-[140px] aspect-[3/4] object-cover object-top sepia-[0.15] border border-[#b8922a]/30 p-[3px] shadow-[0_4px_20px_rgba(184,146,42,0.15)] hover:sepia-0 hover:shadow-[0_6px_28px_rgba(184,146,42,0.25)] transition-all duration-500" />
                <img src="/manoj-baruah.jpg" alt="Shri Manoj Baruah" className="w-[120px] sm:w-[140px] aspect-[3/4] object-cover object-top sepia-[0.15] border border-[#b8922a]/30 p-[3px] shadow-[0_4px_20px_rgba(184,146,42,0.15)] hover:sepia-0 hover:shadow-[0_6px_28px_rgba(184,146,42,0.25)] transition-all duration-500" />
              </figure>

              <p>
                A disciple of the legendary Dr. Sisirkana Dhar Choudhury of the Senia-Maihar Gharana, Shri Manoj Baruah did not fail to see the immense potential that lay dormant in his new student, and almost immediately began educating Anirban in advanced techniques of the violin. This is an association that lasted nearly a decade, where Anirban learned not only the nitty-gritties of Tantrakari violin-playing, but also a lot of Gayaki-ang as well as the difference between performing classical music on stage and playing in recording sessions for commercial projects. Anirban still emphasises that he is yet to see a smarter violin session artist than Manoj Ji.
              </p>

              <p className="mt-6">
                While under the tutelage of Manoj Ji, Anirban moved to Kolkata to pursue a bachelors degree in Mathematics from the renowned St. Xavier&apos;s College. During this period, Anirban had the privilege of being mentored by Manoj Ji&apos;s legendary Guru, Dr. Sisirkana Dhar Choudhury herself.
              </p>

              <figure className="my-8 flex justify-center">
                <img src="/sisirkana-choudhury.jpg" alt="Dr. Sisirkana Dhar Choudhury" className="w-[140px] sm:w-[160px] aspect-[3/4] object-cover object-top sepia-[0.15] border border-[#b8922a]/30 p-[3px] shadow-[0_4px_20px_rgba(184,146,42,0.15)] hover:sepia-0 hover:shadow-[0_6px_28px_rgba(184,146,42,0.25)] transition-all duration-500" />
              </figure>

              <p>
                Sisirkana Ji&apos;s Maargdarshan opened up horizons of raga music hitherto unknown to Anirban. Under the legend&apos;s tutelage, Anirban was exposed to several rare Ragas that are performed exclusively in the Senia-Maihar Gharana, in addition to being taught rather intricate paths of raga development even in common ragas.
              </p>

              <p className="mt-6">
                Pandit V.G. Jog was a pioneering figure in Tantrakari-ang violin playing, and Anirban received exposure to Pandit Jog&apos;s perspectives from Prof. Biswajit Roy Choudhury, one of Pandit Jog&apos;s several illustrious disciples.
              </p>

              <figure className="my-8 flex justify-center">
                <img src="/biswajit-roy-choudhury.jpeg" alt="Prof. Biswajit Roy Choudhury" className="w-[140px] sm:w-[160px] aspect-[3/4] object-cover object-top sepia-[0.15] border border-[#b8922a]/30 p-[3px] shadow-[0_4px_20px_rgba(184,146,42,0.15)] hover:sepia-0 hover:shadow-[0_6px_28px_rgba(184,146,42,0.25)] transition-all duration-500" />
              </figure>

              <p>
                Even though almost the entirety of Anirban&apos;s training has been in the Tantrakari system, his formative training ensured that the Gayaki method was never too far from his periphery of vision. In particular, Dr. N. Rajam&apos;s music left a deep impression in Anirban&apos;s mind. So, he sought the guidance of Dr. Swarna Khuntia, a celebrated disciple of Amma Ji (as Dr. Rajam is called by everyone in her lineage), and Swarna Ji was more than happy to oblige.
              </p>

              <figure className="my-8 flex justify-center">
                <img src="/swarna-khuntia.jpeg" alt="Dr. Swarna Khuntia" className="w-[140px] sm:w-[160px] aspect-[3/4] object-cover object-top sepia-[0.15] border border-[#b8922a]/30 p-[3px] shadow-[0_4px_20px_rgba(184,146,42,0.15)] hover:sepia-0 hover:shadow-[0_6px_28px_rgba(184,146,42,0.25)] transition-all duration-500" />
              </figure>

              <p>
                This turned out to be the final piece in cementing Anirban&apos;s very individual style of violin playing &mdash; the unprecedented hybrid of the Tantrakari and Gayaki systems that his audience is now witness to.
              </p>

              <p className="mt-6">
                Inspired by the transcendent sitar legacies of Pandit Nikhil Banerjee and Pandit Ravi Shankar, Anirban embarked on a decade-long journey with Shri Supratik Sengupta. A torchbearer of Pandit Buddhadev Dasgupta&apos;s Senia-Shahjahanpur lineage, Supratik Ji also carries profound sitar wisdom from masters like Pandit Debaprasad Chakraborty.
              </p>

              <figure className="my-8 flex justify-center">
                <img src="/supratik-sengupta.jpg" alt="Shri Supratik Sengupta" className="w-[140px] sm:w-[160px] aspect-[3/4] object-cover object-top sepia-[0.15] border border-[#b8922a]/30 p-[3px] shadow-[0_4px_20px_rgba(184,146,42,0.15)] hover:sepia-0 hover:shadow-[0_6px_28px_rgba(184,146,42,0.25)] transition-all duration-500" />
              </figure>

              <p>
                Under his holistic mentorship, Anirban&apos;s repertoire blossomed into its mature form, seamlessly blending sitar aesthetics with violin expression while continuing its evolutionary journey.
              </p>

            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#1a1209] border-t border-[#f5efe4]/4 py-8 sm:py-10 text-center px-4">
          <p className="text-[#f5efe4]/15 text-[10px]">
            &copy; {new Date().getFullYear()} Anirban Bhattacharjee | Preserving the Sacred Tradition
          </p>
          <p className="text-[#f5efe4]/10 text-[9px] mt-1">
            Naman to the Gurus | Parampara
          </p>
        </footer>
      </div>
    </>
  );
}
