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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white">
        {/* Background */}
        <div className="absolute inset-0 bg-[url('/background.jpg')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        </div>

        {/* Content Card */}
        <section className="relative z-10 max-w-3xl mx-auto px-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-10 md:p-14 animate-fade-up">

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
              The one stop solution for all your <br />
              <span className="bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">
                violin learning needs!
              </span>
            </h1>

            {error && (
              <p className="mb-6 text-red-400 font-medium">
                Error: {error}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
              <button
                onClick={handleFormRedirect}
                className="px-8 py-4 rounded-full font-semibold
                  bg-gradient-to-r from-green-400 to-emerald-500
                  text-black shadow-lg
                  hover:scale-105 cursor-pointer hover:shadow-xl transition-all"
              >
                For New Students
              </button>

              {!user && (
                <button
                  onClick={handleLogin}
                  className="px-8 py-4 rounded-full font-semibold
                    bg-gradient-to-r from-blue-500 to-indigo-600
                    text-white shadow-lg
                    hover:scale-105 cursor-pointer hover:shadow-xl transition-all"
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
