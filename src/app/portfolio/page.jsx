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
          console.warn("No email found for user:", firebaseUser.uid);
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
            body: JSON.stringify({
              email: firebaseUser.email,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API error: ${response.status} ${errorData.details || response.statusText}`);
          }

          const data = await response.json();
          console.log("API response:", data);

          if (data.hasSubmitted) {
            await setDoc(userRef, { role: "student" }, { merge: true });
            console.log("User role updated to 'student' in Firestore");
            router.push(`/user/${firebaseUser.uid}`);
          } else {
            router.push(`/user/${firebaseUser.uid}/complete-form`);
          }
        } catch (error) {
          console.error("Error checking form submission:", error.message);
          setError(error.message);
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
      console.error("Login error:", error.message);
      setError(error.message);
    }
  };

  const handleFormRedirect = () => {
    window.location.href = "https://docs.google.com/forms/d/1_tdk6BvpHvKqWZQhZJ-7D9i6GSC2fngkg3c62vyPYzc/viewform?edit_requested=true";
  };

  if (loading || checkingForm) {
    return (
      <div className="p-8 text-white">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen flex flex-col items-center justify-center text-center bg-gray-900">
        <div className="absolute inset-0 bg-[url('/background.jpg')] bg-cover bg-center opacity-30"></div>
        <div className="relative z-10 flex flex-col">
          <h1 className="text-4xl font-bold font-opensans bg-transparent text-white p-4 rounded-2xl mb-6">
            The one stop solution for all your <br /> violin learning needs!
          </h1>
          {error && (
            <p className="text-red-500 mb-4">Error: {error}</p>
          )}
          <button
            className="bg-green-600 m-4 hover:bg-blue-700 hover:cursor-pointer px-6 py-3 rounded text-white font-bold"
            onClick={handleFormRedirect}
          >
            For New Students
          </button>
          {!user && (
            <button
              onClick={handleLogin}
              className="bg-blue-600 m-4 hover:bg-blue-700 hover:cursor-pointer px-6 py-3 rounded text-white font-bold"
            >
              Login to Continue
            </button>
          )}
        </div>
      </div>
    </>
  );
}