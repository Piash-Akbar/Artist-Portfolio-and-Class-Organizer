'use client';
import { useEffect, useState } from "react";
import Navbar from "./navbar/navbar";
import ConcertCard from "./components/ConcertCards"; // Ensure this path is correct
import { db } from "./firebaseConfig"; // Ensure this import and config are correct
import { collection, getDocs, query, orderBy } from "firebase/firestore";

import HeroSection from "./components/HeroSection";
import Footer from "./components/Footer/footer";
import LineageTree from "./components/LineageTree";

//Images for Hero Section(Slideshow)
const heroImages = [
  '/background.jpg',
  '/anirban01.jpg',
  '/anirban02.jpg',
  '/anirban03.jpg',
  '/anirbanda.jpg',
];

// Fallback videos (shown until admin adds videos to Firestore)
const fallbackVideos = [
  { url: 'https://www.youtube.com/embed/E84fCd7DsNQ' },
  { url: 'https://www.youtube.com/embed/gR7UQY9RdQA' },
  { url: 'https://www.youtube.com/embed/QvvjFYP8ds0' },
  { url: 'https://www.youtube.com/embed/RnKsHJ4BQK8' },
  { url: 'https://www.youtube.com/embed/VQHT88wU7zg' },
  { url: 'https://www.youtube.com/embed/4C_W_D64hqE' },
  { url: 'https://www.youtube.com/embed/tj1iqaApLfw' },
  { url: 'https://www.youtube.com/embed/pSXqfoYHB_0' },
  { url: 'https://www.youtube.com/embed/S-KMcYPjs5A' },
];

// Utility function to format date
const formatDate = (date) => {
  try {
    if (date && typeof date.toDate === "function") {
      // Firestore Timestamp
      return date.toDate().toLocaleDateString();
    } else if (typeof date === "string") {
      // String date (e.g., "2025-10-17" or ISO 8601)
      const parsedDate = new Date(date);
      return isNaN(parsedDate.getTime()) ? "Invalid date" : parsedDate.toLocaleDateString();
    } else if (typeof date === "number") {
      // Unix timestamp (milliseconds)
      return new Date(date).toLocaleDateString();
    }
    return "Unknown date";
  } catch (err) {
    console.error("Error formatting date:", err);
    return "Invalid date";
  }
};

export default function Portfolio() {
  const [concerts, setConcerts] = useState([]);
  const [pastConcerts, setPastConcerts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch upcoming concerts
  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        const concertsQuery = query(
          collection(db, "upcomingConcerts"),
          orderBy("createdAt", "desc")
        );
        const concertsSnapshot = await getDocs(concertsQuery);
        const concertsData = concertsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: formatDate(doc.data().date), // Format date for display
        }));
        setConcerts(concertsData);
        console.log("Fetched concerts:", concertsData);
      } catch (err) {
        console.error("Error fetching concerts:", err);
        setError("Failed to load upcoming concerts.");
      } finally {
        setIsLoading(false); // Set loading to false once fetch is complete (or failed)
      }
    };

    const fetchPastConcerts = async () => {
      try {
        const pastQuery = query(
          collection(db, "pastConcerts"),
          orderBy("createdAt", "desc")
        );
        const pastSnapshot = await getDocs(pastQuery);
        const pastData = pastSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: formatDate(doc.data().date),
        }));
        setPastConcerts(pastData);
      } catch (err) {
        console.error("Error fetching past concerts:", err);
      }
    };

    const fetchVideos = async () => {
      try {
        const vQuery = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const vSnap = await getDocs(vQuery);
        setVideos(vSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching videos:", err);
      }
    };

    fetchConcerts();
    fetchPastConcerts();
    fetchVideos();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0c0905] text-[#f5efe4]">

        {/* Hero Section */}
        <HeroSection
          images={heroImages}
          title="Anirban Bhattacharjee"
          subtitle="Pioneer of the Violin in the Senia-Shahjahanpur Gharana"
          ctaText="Discover My Journey"
          ctaLink="/#about"
        />

        {/* Biography Section */}
        <section id="about" className="bg-[#f5efe4] text-[#1a1209]">
          <div className="max-w-[980px] mx-auto py-[clamp(44px,8vw,80px)] px-[clamp(22px,6vw,52px)]">
            <p className="text-[10px] tracking-[0.24em] uppercase text-[#b8922a] font-medium mb-4 flex items-center gap-2.5">
              <span className="w-5 h-px bg-[#b8922a] inline-block"></span>Biography
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.12] text-[#1a1209] mb-10">
              A Voice in String &amp; Rhythm
            </h2>

            {/* Top row: 1st paragraph + images side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <div>
                <p className="text-[14px] leading-[1.95] text-[#3d2e1a] font-light">
                  Anirban Bhattacharjee is one of the most promising violinists of the young generation in the arena of Hindustani Classical Music, and is among the very few musicians who play Hindustani Classical Music on the viola. Anirban's public performance debut was at the Sri Aurobindo International Centre for Education, Pondicherry.
                </p>
                <p className="text-[14px] leading-[1.95] text-[#3d2e1a] font-light mt-5 pt-9">
                  Beside his pursuit of music, Anirban also holds a remarkable record in academics, with a Bachelors degree in Mathematics from St. Xavier's College, Kolkata and a Masters degree in Applied Mathematics from the Chennai Mathematical Institute. Anirban is currently pursuing his PhD from the Tata Institute of Fundamental Research, Mumbai, and is Research Associate and Teaching Fellow at Ashoka University, Sonipat.
                </p>
              </div>

              {/* Right column: image grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-1 row-span-2">
                  <img
                    src="/anirban01.jpg"
                    alt="Anirban playing violin"
                    className="w-full h-full object-cover sepia-[0.08] hover:scale-[1.03] transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Found'; }}
                  />
                </div>
                <div className="col-span-1">
                  <img
                    src="/anirbanda.jpg"
                    alt="Anirban playing violin"
                    className="w-full h-full object-cover sepia-[0.08] hover:scale-[1.03] transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Found'; }}
                  />
                </div>
                <div className="col-span-1">
                  <img
                    src="/anirban02.jpg"
                    alt="Anirban playing violin"
                    className="w-full h-full object-cover sepia-[0.08] hover:scale-[1.03] transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Found'; }}
                  />
                </div>
              </div>
            </div>

            {/* Below images: paragraphs 2 & 3 side by side with vertical line */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-6 md:gap-8 mt-10">
              <p className="text-[14px] leading-[1.95] text-[#3d2e1a] font-light">
                Anirban's music is a blend of the Tantrakari and Gayaki approaches and bears a strong rhythmic component as a consequence of his initial inclinations to Tabla. Besides being a rapidly rising name in the Hindustani Classical Music scene all over India, Anirban also takes a keen interest in film music and has experience in playing for background scores of films and advertisements, as well as regional independent music in Hindi, Marathi, Punjabi, Bengali, and Assamese. The First Film, featuring Anirban's violin in its background score, has recently won at the National Film Awards for music in the category of non-feature films.
              </p>
              <div className="hidden md:block bg-[#b8922a]/25"></div>
              <p className="text-[14px] leading-[1.95] text-[#3d2e1a] font-light">
                Despite his young age, Anirban has already made an impression as a successful teacher, with students who are registered artists in respectable institutions like All India Radio and Bangladesh Betar, as well as students who have featured in popular platforms like Coke Studio Bangladesh and Zee Bangla Sa Re Ga Ma Pa. Additionally, with the purpose of creating a more educated audience for Indian Classical Music, he co-founded the Upaj group in 2021 with Guitarist Swarnabha Gupta and vocalist Chitrayudh Ghatak. Upaj has already marked its presence in several Indian cities and is looking to expand into newer territories.
              </p>
            </div>
          </div>
        </section>

        {/* Gurus & Tradition Section */}
        <section id="gurus" className="bg-[#1a1209] text-[#f5efe4]">
          <div className="max-w-[980px] mx-auto py-[clamp(44px,8vw,80px)] px-[clamp(22px,6vw,52px)]">
            <p className="text-[10px] tracking-[0.24em] uppercase text-[#b8922a] font-medium mb-4 flex items-center gap-2.5">
              <span className="w-5 h-px bg-[#b8922a] inline-block"></span>Sacred Lineage
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.12] text-[#f5efe4] mb-10">
              Gurus &amp; <em>Tradition</em>
            </h2>

            <div>
              <div className="space-y-6 max-w-[680px]">
                <p className="text-[14px] leading-[1.95] text-[#f5efe4]/70 font-light">
                  Anirban Bhattacharjee's artistry is a tapestry woven from the teachings of revered gurus. From the rhythmic foundations laid by his father,{' '}
                  <strong className="text-[#b8922a]"><a target="_blank" href="https://www.facebook.com/jitesh.bhattacharjee/">Jitesh Bhattacharjee</a></strong>, to the intricate violin techniques imparted by{' '}
                  <strong className="text-[#b8922a]"><a target="_blank" href="https://www.facebook.com/profile.php?id=100052440127869&rdid=PIVCA0F4jOkKzEYl&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F17qCHBxaCx%2F#">Shri Ashim Dutta</a></strong> and{' '}
                  <strong className="text-[#b8922a]"><a target="_blank" href="https://www.facebook.com/manoj.baruah.524?rdid=iItOiAlOY775fXA2&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1BwADahzom%2F#">Shri Manoj Baruah</a></strong>, each mentor has sculpted his unique sound.
                </p>
                <p className="text-[14px] leading-[1.95] text-[#f5efe4]/70 font-light">
                  The legendary <strong className="text-[#b8922a]"><a target="_blank" href="https://en.wikipedia.org/wiki/Sisir_Kana_Dhar_Chowdhury">Dr. Sisirkana Dhar Choudhury</a></strong> of the Senia Maihar Gharana infused his music with soulful depth, while{' '}
                  <strong className="text-[#b8922a]"><a target="_blank" href="https://www.facebook.com/supratik.sengupta.79?rdid=z1NnDkePz80g8tmp&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1AEvNtDWRp%2F#">Shri Supratik Sengupta</a></strong> of the Senia Shahjahanpur Gharana added virtuosic finesse. Under the tutelage of the late{' '}
                  <strong className="text-[#b8922a]"><a href="https://www.facebook.com/swarna.khuntia?rdid=bbatBp9Zq4cEqul3&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Ccp24UQUi%2F#">Dr. Swarna Khuntia</a></strong>, a disciple of Dr. N. Rajam, Anirban mastered the Gayaki style, blending melody with emotion.
                </p>
                <p className="text-[14px] leading-[1.95] text-[#f5efe4]/50 font-light italic">
                  This illustrious lineage fuels his performances with a celestial spark, resonating across time and tradition.
                </p>

                {/* CTA: editorial border button */}
                <div className="pt-6">
                  <a
                    href="/gurus-lineage-2"
                    className="inline-flex items-center border border-[#b8922a] text-[#b8922a] px-7 py-3 text-[13px] tracking-[0.12em] uppercase font-medium hover:bg-[#b8922a] hover:text-[#1a1209] transition-colors duration-300"
                  >
                    <span>View Full Lineage</span>
                    <svg className="ml-2.5 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>

            </div>

            {/* Lineage Tree */}
            <div className="mt-14">
              <LineageTree />
            </div>
          </div>
        </section>

        {/* Highlights Section */}
        <section id="playings" className="bg-[#f5efe4] text-[#1a1209]">
          <div className="max-w-[980px] mx-auto py-[clamp(44px,8vw,80px)] px-[clamp(22px,6vw,52px)]">
            <p className="text-[10px] tracking-[0.24em] uppercase text-[#b8922a] font-medium mb-4 flex items-center gap-2.5">
              <span className="w-5 h-px bg-[#b8922a] inline-block"></span>Performances
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.12] text-[#1a1209] mb-10">
              Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(videos.length > 0 ? videos : fallbackVideos).map((v, i) => (
                <iframe
                  key={v.id || i}
                  src={v.url}
                  title={v.title || "YouTube video player"}
                  style={{border:0}}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="w-full aspect-video rounded-sm"
                ></iframe>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Performances Section */}
        <section id="events" className="bg-[#0c0905]">
          <div className="max-w-[980px] mx-auto py-[clamp(44px,8vw,80px)] px-[clamp(22px,6vw,52px)]">
            <p className="text-[10px] tracking-[0.24em] uppercase text-[#b8922a] font-medium mb-4 flex items-center gap-2.5">
              <span className="w-5 h-px bg-[#b8922a] inline-block"></span>Concerts
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2rem,5vw,3.4rem)] font-light italic leading-[1.12] text-[#f5efe4] mb-10">
              Upcoming Performances
            </h2>

            {/* Loading State */}
            {isLoading && (
              <p className="text-[#f5efe4]/60 text-sm italic text-center">
                Loading performances...
              </p>
            )}

            {error && (
              <div className="mb-8 p-4 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {!isLoading && concerts.length === 0 ? (
              <p className="text-[#f5efe4]/50 text-sm italic text-center">No upcoming concerts found.</p>
            ) : (
              <div className="space-y-6">
                {concerts.map((concert, index) => (
                  <ConcertCard
                    key={concert.id}
                    venue={concert.venue}
                    date={concert.date}
                    time={concert.time}
                    location={concert.location}
                    ticketURL={concert?.ticketURL}
                    style={{ animationDelay: `${index * 100}ms` }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Previous Performances Section */}
        <section className="bg-[#f5efe4] text-[#1a1209]">
          <div className="max-w-[980px] mx-auto py-[clamp(44px,8vw,80px)] px-[clamp(22px,6vw,52px)]">
            <p className="text-[10px] tracking-[0.24em] uppercase text-[#b8922a] font-medium mb-4 flex items-center gap-2.5">
              <span className="w-5 h-px bg-[#b8922a] inline-block"></span>Archive
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-[clamp(2rem,5vw,3.4rem)] font-light italic leading-[1.12] text-[#1a1209] mb-10">
              Previous Performances
            </h2>

            {pastConcerts.length === 0 ? (
              <p className="text-[#3d2e1a]/50 text-sm italic">No previous concerts found.</p>
            ) : (
              <div>
                {pastConcerts.map((concert) => (
                  <div
                    key={concert.id}
                    className="py-4 flex justify-between items-center border-b border-[#1a1209]/10"
                  >
                    <span className="font-[family-name:var(--font-cormorant)] text-[#1a1209] text-lg">
                      {concert.venue}
                    </span>
                    <span className="text-[#b8922a] text-xs tracking-wider">
                      {concert.date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Contact Footer Section */}
        <section id="contact" className="bg-[#1a1209]">
          <div className="py-[clamp(44px,8vw,80px)] px-[clamp(22px,6vw,52px)]">
            <Footer />
          </div>
        </section>
      </div>
    </>
  );
}
