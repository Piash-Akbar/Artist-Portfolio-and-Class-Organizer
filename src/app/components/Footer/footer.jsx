// components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-[#1a1209] border-t border-[#f5efe4]/4">
      <div className="py-[clamp(40px,6vw,60px)] px-[clamp(22px,6vw,52px)] grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
        {/* Col 1: Brand */}
        <div>
          <p className="font-[family-name:var(--font-cormorant)] italic text-[1.15rem] text-[#f5efe4]">
            Anirban Bhattacharjee
          </p>
          <p className="text-[12px] text-[#f5efe4]/26 leading-[1.7] mt-2">
            Pioneer of the Violin in the<br />Senia-Shahjahanpur Gharana
          </p>
        </div>

        {/* Col 2: Navigation */}
        <div>
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#b8922a]/40 mb-3 flex items-center gap-1.5">
            <span className="w-3 h-px bg-[#b8922a]/40 inline-block" />
            Navigation
          </p>
          <a href="/" className="text-[12px] text-[#f5efe4]/32 hover:text-[#b8922a] block mb-1.5 transition-colors">
            Home
          </a>
          <a href="/gurus" className="text-[12px] text-[#f5efe4]/32 hover:text-[#b8922a] block mb-1.5 transition-colors">
            Gurus &amp; Lineage
          </a>
          <a href="/students" className="text-[12px] text-[#f5efe4]/32 hover:text-[#b8922a] block mb-1.5 transition-colors">
            Students&apos; Corner
          </a>
          <a href="/contact" className="text-[12px] text-[#f5efe4]/32 hover:text-[#b8922a] block mb-1.5 transition-colors">
            Contact
          </a>
        </div>

        {/* Col 3: Connect */}
        <div>
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#b8922a]/40 mb-3 flex items-center gap-1.5">
            <span className="w-3 h-px bg-[#b8922a]/40 inline-block" />
            Connect
          </p>
          <div className="flex items-center gap-2.5 mb-5">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/violin.anirban/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 border border-[#f5efe4]/15 rounded-full flex items-center justify-center text-[#f5efe4]/35 hover:text-[#b8922a] hover:border-[#b8922a] transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/violin.anirban"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 border border-[#f5efe4]/15 rounded-full flex items-center justify-center text-[#f5efe4]/35 hover:text-[#b8922a] hover:border-[#b8922a] transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.333v21.334C0 23.403.597 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.658-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.728 0 1.325-.597 1.325-1.333V1.333C24 .597 23.403 0 22.675 0z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://www.youtube.com/@AnirbanBhattacharjee"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 border border-[#f5efe4]/15 rounded-full flex items-center justify-center text-[#f5efe4]/35 hover:text-[#b8922a] hover:border-[#b8922a] transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            {/* whatsapp */}
            <a
              href="https://wa.me/+917002303349"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 border border-[#f5efe4]/15 rounded-full flex items-center justify-center text-[#f5efe4]/35 hover:text-[#b8922a] hover:border-[#b8922a] transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>


          </div>

          <a
            href="mailto:anirban94@gmail.com"
            className="text-[12px] text-[#f5efe4]/32 hover:text-[#b8922a] transition-colors"
          >
            anirban94@gmail.com
          </a>

          <p className="text-[9px] text-[#f5efe4]/15 mt-4">
            &copy; {new Date().getFullYear()} Anirban Bhattacharjee. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
