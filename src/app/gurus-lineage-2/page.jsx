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
  const gurus = [
    {
      name: "Shri Jitesh Bhattacharjee",
      role: "Tabla — Rhythmic Foundation",
      images: ["/jitesh-bhattacharjee.jpg"],
      text: "The seeds of music were sown in Anirban even before he developed a conscious memory of his own. Anirban has famously said that he has no recollection of not knowing Teentaal, Ektaal, Jhaptaal, Rupak Taal, Keherwa or Dadra. The credit for this goes entirely to his father, Shri Jitesh Bhattacharjee, who, despite being an engineer by profession, is an accomplished Tabla artist who has had the great fortune of accompanying legends like Pandit Hariprasad Chaurasia and Vidushi Girija Devi.<br />Besides rhythmic training, Anirban also learned the basics of melody from his father, who is as adept with Rabindrasangeet and harmonium as he is with the Tabla."
    },
    {
      name: "Shri Ashim Dutta & Shri Manoj Baruah",
      role: "Early Violin Training — Guwahati, Assam",
      images: ["/ashim-dutta.jpg", "/manoj-baruah.jpg"],
      text: "Anirban's training in violin began at the age of 15 under Shri Ashim Dutta of Guwahati, Assam. In recognition of Anirban's prodigious talent, Mr. Dutta chose to not train Anirban within a mere ten months of starting to teach him, and handed him over to Shri Manoj Baruah, a virtuoso who had already compounded manifold the popularity of the violin in the North-East. A disciple of the legendary Dr. Sisirkana Dhar Choudhury of the Senia-Maihar Gharana, Shri Manoj Baruah did not fail to see the immense potential that lay dormant in his new student, and almost immediately began educating Anirban in advanced techniques of the violin. This is an association that lasted nearly a decade, where Anirban learned not only the nitty-gritties of Tantrakari violin-playing, but also a lot of Gayaki-ang as well as the difference between performing classical music on stage and playing in recording sessions for commercial projects. Anirban still emphasises that he is yet to see a smarter violin session artist than Manoj Ji."
    },
    {
      name: "Dr. Sisirkana Dhar Choudhury",
      role: "Senia Maihar Gharana",
      images: ["/sisirkana-choudhury.jpg"],
      text: "While under the tutelage of Manoj Ji, Anirban moved to Kolkata to pursue a bachelors degree in Mathematics from the renowned St. Xavier's College. During this period, Anirban had the privilege of being mentored by Manoj Ji's legendary Guru, Dr. Sisirkana Dhar Choudhury herself. Sisirkana Ji's Maargdarshan opened up horizons of raga music hitherto unknown to Anirban. Under the legend's tutelage, Anirban was exposed to several rare Ragas that are performed exclusively in the Senia-Maihar Gharana, in addition to being taught rather intricate paths of raga development even in common ragas."
    },
    {
      name: "Prof. Biswajit Roy Choudhury",
      role: "Disciple of Pandit V.G. Jog — Tantrakari Tradition",
      images: ["/biswajit-roy-choudhury.jpeg"],
      text: "Pandit V.G. Jog was a pioneering figure in Tantrakari-ang violin playing, and Anirban received exposure to Pandit Jog's perspectives from Prof. Biswajit Roy Choudhury, one of Pandit Jog's several illustrious disciples."
    },
    {
      name: "Dr. Swarna Khuntia",
      role: "Disciple of Dr. N. Rajam — Gayaki Style",
      images: ["/swarna-khuntia.jpeg"],
      text: "Even though almost the entirety of Anirban's training has been in the Tantrakari system, his formative training ensured that the Gayaki method was never too far from his periphery of vision. In particular, Dr. N. Rajam's music left a deep impression in Anirban's mind. So, he sought the guidance of Dr. Swarna Khuntia, a celebrated disciple of Amma Ji (as Dr. Rajam is called by everyone in her lineage), and Swarna Ji was more than happy to oblige. This turned out to be the final piece in cementing Anirban's very individual style of violin playing - the unprecedented hybrid of the Tantrakari and Gayaki systems that his audience is now witness to."
    },
    {
      name: "Shri Supratik Sengupta",
      role: "Senia Shahjahanpur Gharana — Current Guru",
      images: ["/supratik-sengupta.jpg"],
      text: "Inspired by the transcendent sitar legacies of Pandit Nikhil Banerjee and Pandit Ravi Shankar, Anirban embarked on a decade-long journey with Shri Supratik Sengupta. A torchbearer of Pandit Buddhadev Dasgupta's Senia-Shahjahanpur lineage, Supratik ji also carries profound sitar wisdom from masters like Pandit Debaprasad Chakraborty. Under his holistic mentorship, Anirban's repertoire blossomed into its mature form, seamlessly blending sitar aesthetics with violin expression while continuing its evolutionary journey."
    }
  ];

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
          <div className="max-w-[980px] mx-auto py-[clamp(44px,8vw,80px)] px-[clamp(22px,6vw,52px)] text-center">
            <p className="text-[10px] tracking-[0.24em] uppercase text-[#b8922a] font-medium mb-4 flex items-center justify-center gap-2.5">
              <span className="w-5 h-px bg-[#b8922a] inline-block"></span>Parampara
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(1.8rem,4.5vw,3rem)] font-light italic text-[#f5efe4] mb-1.5">
              The Sacred <em>Lineage Tree</em>
            </h2>
            <p className="font-[family-name:var(--font-cormorant)] italic text-[14px] text-[#f5efe4]/34 mb-9">
              Tracing the musical tradition from legend to student
            </p>
            <LineageTree />
          </div>
        </section>

        {/* Guru Rows */}
        <section className="bg-[#f5efe4] text-[#1a1209]">
          <div className="max-w-[980px] mx-auto py-[clamp(36px,6vw,60px)] px-[clamp(22px,6vw,52px)]">
            <p className="text-[10px] tracking-[0.24em] uppercase text-[#b8922a] font-medium mb-4 flex items-center gap-2.5">
              <span className="w-5 h-px bg-[#b8922a] inline-block"></span>Sacred Tradition
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(1.8rem,4.5vw,3rem)] font-light leading-[1.12] text-[#1a1209] mb-10">
              The Gurus Who Shaped Anirban&apos;s <em>Musical Journey</em>
            </h2>

            {gurus.map((guru, index) => (
              <div
                key={index}
                className={`grid grid-cols-1 md:grid-cols-[130px_1fr] gap-[clamp(22px,5vw,52px)] items-start py-[clamp(28px,5vw,48px)] border-b border-[#b8922a]/15 ${
                  index === gurus.length - 1 ? 'border-b-0' : ''
                }`}
              >
                {/* Image */}
                <div className="overflow-hidden max-w-[130px]">
                  <div className="grid grid-cols-1 gap-2">
                    {guru.images.map((imgSrc, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={imgSrc}
                        alt={guru.name}
                        className="w-full aspect-[3/4] object-cover object-top sepia-[0.09] hover:scale-[1.04] transition-transform duration-500"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=' + encodeURIComponent(guru.name); }}
                      />
                    ))}
                  </div>
                </div>

                {/* Text */}
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#b8922a] mb-1.5">
                    Guru {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="font-[family-name:var(--font-cormorant)] text-[clamp(1.4rem,3.5vw,2rem)] font-light text-[#1a1209] mb-1">
                    {guru.name}
                  </h3>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#7a6548] mb-3.5">
                    {guru.role}
                  </p>
                  <span className="block w-[17px] h-px bg-[#b8922a] mb-3.5"></span>
                  <p
                    className="text-[13.5px] leading-[1.9] text-[#3d2e1a] font-light"
                    dangerouslySetInnerHTML={{ __html: guru.text.replace(/<br \/>/g, '<br/><br/>') }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#1a1209] border-t border-[#f5efe4]/4 py-10 text-center">
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
