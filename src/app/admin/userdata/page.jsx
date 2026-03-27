'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../firebaseConfig";
import {
  collection, getDocs, query, where, orderBy, limit,
  updateDoc, doc, deleteDoc
} from "firebase/firestore";
import { signOut, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import LoadingSpinner from "../../loading/loadingSpinner";
import { usePasscodeGate, PasscodeGate } from "../usePasscodeGate";

const formatDate = (date) => {
  try {
    if (!date) return "—";
    if (date.toDate) return date.toDate().toLocaleDateString();
    const d = new Date(date);
    return isNaN(d.getTime()) ? "Invalid" : d.toLocaleDateString();
  } catch {
    return "Invalid";
  }
};

export default function UsersDataPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const passcodeGate = usePasscodeGate();
  const [errors, setErrors] = useState([]);
  const [users, setUsers] = useState([]);
  const [notices, setNotices] = useState([]);
  const [concerts, setConcerts] = useState([]);
  const [editNotice, setEditNotice] = useState(null);
  const [editConcert, setEditConcert] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch {
      setErrors(p => [...p, "Logout failed"]);
    }
  };

  const updateNotice = async () => {
    if (!editNotice) return;
    await updateDoc(doc(db, "notices", editNotice.id), {
      text: editNotice.text,
      updatedAt: new Date().toISOString()
    });
    setEditNotice(null);
    fetchNoticesAndConcerts();
  };

  const deleteNotice = async (id) => {
    await deleteDoc(doc(db, "notices", id));
    fetchNoticesAndConcerts();
  };

  const updateConcert = async () => {
    if (!editConcert) return;
    const { id, venue, date, time, location } = editConcert;
    await updateDoc(doc(db, "upcomingConcerts", id), { venue, date, time, location, updatedAt: new Date().toISOString() });
    setEditConcert(null);
    fetchNoticesAndConcerts();
  };

  const deleteConcert = async (id) => {
    await deleteDoc(doc(db, "upcomingConcerts", id));
    fetchNoticesAndConcerts();
  };

  const fetchNoticesAndConcerts = async () => {
    const noticeQ = query(collection(db, "notices"), orderBy("createdAt", "desc"), limit(10));
    const noticeSnap = await getDocs(noticeQ);
    setNotices(noticeSnap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: formatDate(d.data().createdAt) })));

    const concertQ = query(collection(db, "upcomingConcerts"), orderBy("createdAt", "desc"), limit(10));
    const concertSnap = await getDocs(concertQ);
    setConcerts(concertSnap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: formatDate(d.data().createdAt) })));
  };

  useEffect(() => {
    if (!passcodeGate.verified) return;
    const load = async () => {
      if (!auth.currentUser) await signInAnonymously(auth);
      const usersQ = query(collection(db, "users"), where("role", "==", "student"));
      const usersSnap = await getDocs(usersQ);
      const raw = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const withLast = await Promise.all(raw.map(async (u) => {
        const classQ = query(
          collection(db, "classesRequests"),
          where("uid", "==", u.id),
          where("status", "==", "approved"),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const classSnap = await getDocs(classQ);
        const last = classSnap.docs[0]?.data();
        return {
          ...u,
          lastClass: last
            ? { date: formatDate(last.date), time: last.time || "—", rawDate: last.date }
            : null
        };
      }));

      withLast.sort((a, b) => {
        if (!a.lastClass) return 1;
        if (!b.lastClass) return -1;
        const da = a.lastClass.rawDate?.toDate?.() || new Date(a.lastClass.rawDate);
        const dbVal = b.lastClass.rawDate?.toDate?.() || new Date(b.lastClass.rawDate);
        return dbVal.getTime() - da.getTime();
      });

      setUsers(withLast);
      await fetchNoticesAndConcerts();
      setLoading(false);
    };
    load();
  }, [passcodeGate.verified]);

  const filtered = users.filter(u =>
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!passcodeGate.verified) {
    return <PasscodeGate gate={passcodeGate} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4 md:px-8">
        <style jsx>{`
          @keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
          .fade { animation: fadeIn 0.8s forwards; }
          .pulse { animation: pulse 3s infinite; }
          @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.02); } }
        `}</style>

        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-serif font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-pink-500 fade">
            Student Data & Content
          </h1>

          {errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-900/80 rounded-xl text-red-200">
              {errors.map((e, i) => <p key={i}>Warning: {e}</p>)}
            </div>
          )}

          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full p-3 mb-6 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          {/* Students */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif mb-4 text-amber-400">Students</h2>
            {filtered.length === 0 ? (
              <p className="text-gray-300 italic">No students found.</p>
            ) : (
              <div className="space-y-4">
                {filtered.map((u, i) => (
                  <div
                    key={u.id}
                    className="bg-gray-800/90 backdrop-blur p-5 rounded-xl fade pulse"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <p className="font-bold">{u.displayName || "N/A"}</p>
                    <p className="text-sm text-gray-300">Email: {u.email}</p>
                    <p className="text-sm text-gray-300">Credits: {u.credits ?? 0}</p>
                    <p className="text-sm text-gray-300">
                      Last Class: {u.lastClass ? `${u.lastClass.date} @ ${u.lastClass.time}` : "None"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Notices & Concerts (same as content page) */}
          {/* ... (copy the notices & concerts sections from content/page.jsx) ... */}

          <div className="text-center space-x-4">
            <button
              onClick={() => router.push("/admin")}
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-800"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-3 rounded-lg font-medium hover:from-red-600 hover:to-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}