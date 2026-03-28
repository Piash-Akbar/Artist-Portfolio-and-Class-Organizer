"use client";

import { useEffect, useState } from "react";
import Navbar from "../navbar/navbar";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebaseConfig";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import LoadingSpinner from "../loading/loadingSpinner";

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingForm, setCheckingForm] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.email) {
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "N/A",
            displayName: firebaseUser.displayName || "Organizer User",
            photoURL: firebaseUser.photoURL || "",
            role: "user",
            classFee: 600,
            createdAt: new Date().toISOString(),
          });
        } else {
          const userData = docSnap.data();
          // Admin access is now via passcode at /admin, no redirect needed
        }

        setUser(firebaseUser);
        setCheckingForm(true);

        try {
          const response = await fetch("/api/checkFormSubmission", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: firebaseUser.email }),
          });

          const data = await response.json();

          if (data.hasSubmitted) {
            await setDoc(userRef, { role: "student" }, { merge: true });
            router.push(`/user/${firebaseUser.uid}`);
          } else {
            router.push(`/user/${firebaseUser.uid}/complete-form`);
          }
        } catch (err) {
          setError(err.message);
          router.push(`/user/${firebaseUser.uid}/complete-form`);
        } finally {
          setCheckingForm(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleFormRedirect = () => {
    window.location.href =
      "https://docs.google.com/forms/d/1_tdk6BvpHvKqWZQhZJ-7D9i6GSC2fngkg3c62vyPYzc/viewform?edit_requested=true";
  };

  if (loading || checkingForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0905]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0c0905] text-[#f5efe4]">
        {/* Background */}
        <div className="absolute inset-0 bg-[url('/background.jpg')] bg-cover bg-center opacity-20">
          <div className="absolute inset-0 bg-[#0c0905]/80 backdrop-blur-sm" />
        </div>

        {/* Content Card */}
        <section className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6">
          <div className="rounded-sm border border-[#b8922a]/15 bg-[#1a1209] p-6 sm:p-10 md:p-14 animate-fade-up">

            <p className="text-[10px] tracking-[0.24em] uppercase text-[#b8922a] font-medium mb-4 flex items-center justify-center gap-2.5">
              <span className="w-5 h-px bg-[#b8922a] inline-block"></span>Students&apos; Corner
            </p>

            <h1 className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-4xl md:text-5xl font-light italic leading-tight mb-6 sm:mb-8 text-center">
              The one stop solution for all your <br className="hidden sm:block" />
              <em className="text-[#b8922a]">violin learning needs!</em>
            </h1>

            {error && (
              <p className="mb-4 sm:mb-6 text-[#b8922a]/80 font-medium text-sm sm:text-base">
                Error: {error}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mt-8 sm:mt-10">
              <button
                onClick={handleFormRedirect}
                className="px-6 sm:px-8 py-2.5 sm:py-3 border border-[#b8922a] text-[#b8922a] text-[10px] sm:text-xs font-medium tracking-[0.15em] uppercase
                  hover:bg-[#b8922a] hover:text-[#f5efe4] cursor-pointer transition-all duration-300"
              >
                For New Students
              </button>

              {!user && (
                <button
                  onClick={handleLogin}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#b8922a] text-[#0c0905] text-[10px] sm:text-xs font-medium tracking-[0.15em] uppercase
                    hover:bg-[#d4aa4a] cursor-pointer transition-all duration-300"
                >
                  Login to Continue
                </button>
              )}
            </div>

          </div>
        </section>
      </main>
    </>
  );
}
