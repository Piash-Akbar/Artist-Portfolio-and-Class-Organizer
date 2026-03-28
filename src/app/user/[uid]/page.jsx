"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth, db } from "../../firebaseConfig";
import Navbar from "../../navbar/navbar";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  getDocs,
  orderBy,
  limit,
  where,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LoadingSpinner from "../../loading/loadingSpinner";

export default function UserPage() {
  const { uid } = useParams();
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showSchedulePopup, setShowSchedulePopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");

  const [credit, setCredit] = useState(0);
  const [latestClassSchedule, setLatestClassSchedule] = useState(null);
  const [lastPayment, setLastPayment] = useState(null);

  /* ---------------- FETCH USER + NOTICE ---------------- */
  useEffect(() => {
    if (!uid) return;

    const fetchData = async () => {
      try {
        const userSnap = await getDoc(doc(db, "users", uid));
        if (!userSnap.exists()) {
          setError("User profile not found.");
          return;
        }

        const data = userSnap.data();
        setUserData(data);
        setCredit(data.credits || 0);

        if (data.role === "admin") {
          router.push("/admin");
          return;
        }

        const noticeQ = query(
          collection(db, "notices"),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const noticeSnap = await getDocs(noticeQ);
        if (!noticeSnap.empty) setNotice(noticeSnap.docs[0].data());
      } catch {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid, router]);

  /* ---------------- LIVE LATEST CLASS (FIXED) ---------------- */
  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "classesRequests"),
      where("uid", "==", uid),
      orderBy("createdAtClient", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setLatestClassSchedule(data);
        console.log("Latest class (correct):", data);
      } else {
        setLatestClassSchedule(null);
      }
    });

    return () => unsubscribe();
  }, [uid]);

  /* ---------------- LAST PAYMENT ---------------- */
  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "creditRequests"),
      where("targetUserId", "==", uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    getDocs(q).then((snap) => {
      if (!snap.empty) setLastPayment(snap.docs[0].data());
    });
  }, [uid]);

  /* ---------------- ACTIONS ---------------- */
  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select date and time.");
      return;
    }

    await addDoc(collection(db, "classesRequests"), {
      uid,
      date: selectedDate.toLocaleDateString("en-CA"),
      time: selectedTime,
      status: "pending",
      createdAt: serverTimestamp(),
      createdAtClient: new Date(), // 🔥 FIX
    });

    alert("Class schedule request sent!");
    setShowSchedulePopup(false);
    setSelectedDate(null);
    setSelectedTime("");
  };

  const handleBuyCredit = () => router.push(`/user/${uid}/buy-credit`);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  /* ---------------- STATES ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0905]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0c0905]">
        <div className="bg-[#1a1209] border border-[#b8922a]/25 px-6 py-4 rounded-sm text-[#f5efe4]/70">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen bg-[#0c0905] text-[#f5efe4] pt-24 sm:pt-28 px-4 sm:px-6 pb-8">
        <div className="absolute inset-0 bg-[url('/background.jpg')] bg-cover bg-center opacity-20">
          <div className="absolute inset-0 bg-[#0c0905]/80 backdrop-blur-sm" />
        </div>

        <section className="relative z-10 max-w-4xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 animate-fade-up">
          <div className="text-center">
            <p className="text-[10px] tracking-[0.24em] uppercase text-[#b8922a] font-medium mb-3 flex items-center justify-center gap-2.5">
              <span className="w-5 h-px bg-[#b8922a] inline-block"></span>Dashboard
            </p>
            <h1 className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-4xl md:text-5xl font-light italic text-[#f5efe4]">
              Welcome, {userData?.displayName || "User"}
            </h1>
            <p className="text-[#f5efe4]/50 mt-2 text-sm sm:text-base font-[family-name:var(--font-cormorant)] italic">
              Manage your classes, notices & payments
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
            {[
              ["Schedule a Class", () => setShowSchedulePopup(true)],
              ["Buy Credits", handleBuyCredit],
              ["Logout", handleLogout],
            ].map(([text, action]) => (
              <button
                key={text}
                onClick={action}
                className="px-6 py-2.5 border border-[#b8922a] text-[#b8922a] text-[10px] sm:text-xs font-medium tracking-[0.15em] uppercase
                hover:bg-[#b8922a] hover:text-[#f5efe4] cursor-pointer transition-all duration-300 text-sm sm:text-base"
              >
                {text}
              </button>
            ))}
          </div>

          <Card title="Latest Notice">
            {notice?.text || "No notices available."}
          </Card>

          <div className={`p-4 sm:p-5 rounded-sm text-center border shadow-lg text-sm sm:text-base
            ${credit >= 0
              ? "bg-[#1a1209] border-[#b8922a]/25 text-[#b8922a]"
              : "bg-[#1a1209] border-[#b8922a]/40 text-[#f5efe4]/70"}`}>
            {credit >= 0
              ? `You have ${credit} classes left`
              : `Payment due for ${Math.abs(credit)} classes`}
          </div>

          <Card title="Latest Class Schedule">
            {latestClassSchedule ? (
              <>
                <p>Status: {latestClassSchedule.status}</p>
                <p>Date: {latestClassSchedule.date}</p>
                <p>Time: {latestClassSchedule.time}</p>
              </>
            ) : (
              "No class scheduled yet."
            )}
          </Card>

          {lastPayment && (
            <Card title="Last Payment Summary">
              <p>Classes: {lastPayment.amount}</p>
              <p>Status: {lastPayment.status}</p>
              <p>Method: {lastPayment.paymentMethod}</p>
            </Card>
          )}
        </section>

        {showSchedulePopup && (
          <div className="fixed inset-0 z-[9999] bg-[#0c0905]/90 flex items-center justify-center px-4">
            <div className="bg-[#1a1209] border border-[#b8922a]/20 p-6 sm:p-8 rounded-sm max-w-md w-full shadow-2xl">
              <h2 className="font-[family-name:var(--font-cormorant)] text-xl sm:text-2xl font-light italic mb-4 sm:mb-6 text-[#f5efe4]">
                Schedule a Class (IST)
              </h2>

              <DatePicker
                selected={selectedDate}
                onChange={setSelectedDate}
                minDate={new Date()}
                className="w-full p-3 rounded-sm bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] mb-4"
                placeholderText="Select date"
              />

              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-3 rounded-sm bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] mb-6"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleSchedule}
                  className="px-5 py-2 bg-[#b8922a] text-[#0c0905] font-medium rounded-sm hover:bg-[#d4aa4a] transition-colors"
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowSchedulePopup(false)}
                  className="px-5 py-2 border border-[#f5efe4]/20 text-[#f5efe4]/60 rounded-sm hover:border-[#f5efe4]/40 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

/* -------- CARD -------- */
function Card({ title, children }) {
  return (
    <div className="bg-[#1a1209] border border-[#b8922a]/15 rounded-sm p-4 sm:p-6">
      <h2 className="font-[family-name:var(--font-cormorant)] text-xl sm:text-2xl font-light italic text-[#b8922a] mb-2 sm:mb-3">
        {title}
      </h2>
      <div className="text-[#f5efe4]/60 space-y-1 text-sm sm:text-base">{children}</div>
    </div>
  );
}
