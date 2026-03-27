'use client';

import { useEffect, useState } from "react";
import Navbar from "../../navbar/navbar";
import { auth, db } from "../../firebaseConfig";
import {
  collection, getDocs, addDoc, updateDoc, doc, deleteDoc,
  query, orderBy, limit, getDoc
} from "firebase/firestore";
import { signOut, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../../loading/loadingSpinner";
import { usePasscodeGate, PasscodeGate } from "../usePasscodeGate";
import dynamic from "next/dynamic";
import "react-datepicker/dist/react-datepicker.css";

const DatePicker = dynamic(() => import("react-datepicker"), { ssr: false });

export default function AdminContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const passcodeGate = usePasscodeGate();

  // Notices
  const [noticeText, setNoticeText] = useState("");
  const [notices, setNotices] = useState([]);
  const [editingNotice, setEditingNotice] = useState(null);

  // Concerts
  const [concert, setConcert] = useState({ venue: "", date: "", time: "", location: "", ticketURL: "" });
  const [concerts, setConcerts] = useState([]);
  const [editingConcert, setEditingConcert] = useState(null);

  // Archived Concerts
  const [archivedConcerts, setArchivedConcerts] = useState([]);
  const [editingArchived, setEditingArchived] = useState(null);

  useEffect(() => {
    if (!passcodeGate.verified) return;
    const load = async () => {
      if (!auth.currentUser) await signInAnonymously(auth);
      await Promise.all([fetchNotices(), fetchConcerts(), fetchArchivedConcerts()]);
      setLoading(false);
    };
    load();
  }, [passcodeGate.verified]);

  const fmt = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString();
  };

  const fetchNotices = async () => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"), limit(10));
    const snap = await getDocs(q);
    setNotices(snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: fmt(d.data().createdAt) })));
  };

  const fetchConcerts = async () => {
    const q = query(collection(db, "upcomingConcerts"), orderBy("createdAt", "desc"), limit(10));
    const snap = await getDocs(q);
    setConcerts(snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: fmt(d.data().createdAt) })));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch {
      setError("Logout failed");
    }
  };

  /* ────── NOTICE HANDLERS ────── */
  const postNotice = async () => {
    if (!noticeText.trim()) return setError("Notice cannot be empty");
    await addDoc(collection(db, "notices"), {
      text: noticeText.trim(),
      createdAt: new Date().toISOString(),
      createdBy: "admin"
    });
    setNoticeText("");
    fetchNotices();
  };

  const updateNotice = async () => {
    if (!editingNotice) return;
    await updateDoc(doc(db, "notices", editingNotice.id), {
      text: editingNotice.text,
      updatedAt: new Date().toISOString()
    });
    setEditingNotice(null);
    fetchNotices();
  };

  const deleteNotice = async (id) => {
    await deleteDoc(doc(db, "notices", id));
    fetchNotices();
  };

  /* ────── CONCERT HANDLERS ────── */
  const postConcert = async (e) => {
    e.preventDefault();
    const { venue, date, time, location, ticketURL } = concert;
    if (!venue || !date || !time || !location) return setError("All fields required");
    await addDoc(collection(db, "upcomingConcerts"), {
      venue: venue.trim(),
      date: date.trim(),
      time: time.trim(),
      location: location.trim(),
      ticketURL: ticketURL.trim(),
      createdAt: new Date().toISOString(),
      createdBy: "admin"
    });
    setConcert({ venue: "", date: "", time: "", location: "" });
    fetchConcerts();
  };

  const updateConcert = async () => {
    if (!editingConcert) return;
    const { id, venue, date, time, location } = editingConcert;
    if (!venue || !date || !time || !location) return setError("All fields required");
    await updateDoc(doc(db, "upcomingConcerts", id), {
      venue, date, time, location,
      updatedAt: new Date().toISOString()
    });
    setEditingConcert(null);
    fetchConcerts();
  };

  const deleteConcert = async (id) => {
    await deleteDoc(doc(db, "upcomingConcerts", id));
    fetchConcerts();
  };

  const archiveConcert = async (concertData) => {
    const { id, createdAt, ...data } = concertData;
    await addDoc(collection(db, "pastConcerts"), {
      ...data,
      archivedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    await deleteDoc(doc(db, "upcomingConcerts", id));
    await Promise.all([fetchConcerts(), fetchArchivedConcerts()]);
  };

  const fetchArchivedConcerts = async () => {
    const q = query(collection(db, "pastConcerts"), orderBy("createdAt", "desc"), limit(20));
    const snap = await getDocs(q);
    setArchivedConcerts(snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: fmt(d.data().createdAt) })));
  };

  const updateArchivedConcert = async () => {
    if (!editingArchived) return;
    const { id, venue, date, time, location } = editingArchived;
    if (!venue || !date) return setError("Venue and date are required");
    await updateDoc(doc(db, "pastConcerts", id), {
      venue, date, time: time || "", location: location || "",
      updatedAt: new Date().toISOString()
    });
    setEditingArchived(null);
    fetchArchivedConcerts();
  };

  const deleteArchivedConcert = async (id) => {
    await deleteDoc(doc(db, "pastConcerts", id));
    fetchArchivedConcerts();
  };

  const handleDateChange = (date) => {
    if (!date) {
      setConcert(p => ({ ...p, date: "", time: "" }));
      return;
    }
    const d = date.toISOString().split("T")[0];
    const t = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    setConcert(p => ({ ...p, date: d, time: t }));
  };

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
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4 md:px-8">
        <style jsx>{`
          @keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
          .fade { animation: fadeIn 0.8s forwards; }
        `}</style>

        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-serif font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-pink-500 fade">
            Content Management
          </h1>

          {error && <div className="mb-6 p-4 bg-red-900/80 rounded-xl">{error}</div>}

          {/* ────── ADD CONCERT ────── */}
          <div className="flex gap-4 justify-center mb-12">
            <button onClick={handleLogout} className="text-amber-400 bg-red-900/80 px-4 py-2 rounded-xl hover:cursor-pointer">Logout</button>
            <button
              onClick={() => router.push("/admin")}
              className="bg-gradient-to-r from-amber-400 to-pink-500 px-6 py-2 rounded-lg font-medium hover:cursor-pointer hover:from-amber-500 hover:to-pink-600"
            >
              Back to Dashboard
            </button>
          </div>
          <section className="mb-12">
            <h2 className="text-3xl font-serif mb-4 text-amber-400">Add Upcoming Concert</h2>
            <form onSubmit={postConcert} className="bg-gray-800/90 backdrop-blur p-6 rounded-xl space-y-4">
              <input
                placeholder="Venue"
                value={concert.venue}
                onChange={e => setConcert(p => ({ ...p, venue: e.target.value }))}
                required
                className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-500"
              />
              <DatePicker
                selected={concert.date && concert.time ? new Date(`${concert.date}T${concert.time}`) : null}
                onChange={handleDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="Select date & time"
                minDate={new Date()}
                required
                className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-500"
              />
              <input
                placeholder="Location"
                value={concert.location}
                onChange={e => setConcert(p => ({ ...p, location: e.target.value }))}
                required
                className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-500"
              />
              <input
                placeholder="Ticket URL (optional)"
                value={concert.ticketURL ?? ""}
                onChange={e => setConcert(p => ({ ...p, ticketURL: e.target.value }))}
                className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="w-full hover:cursor-pointer bg-gradient-to-r from-amber-400 to-pink-500 py-2 rounded-lg font-medium hover:from-amber-500 hover:to-pink-600"
              >
                Add Concert
              </button>
            </form>
          </section>

          {/* ────── POST NOTICE ────── */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif mb-4 text-amber-400">Post Notice</h2>
            <div className="bg-gray-800/90 backdrop-blur p-6 rounded-xl space-y-3">
              <textarea
                value={noticeText}
                onChange={e => setNoticeText(e.target.value)}
                placeholder="Notice text…"
                rows={4}
                maxLength={1000}
                className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-500 resize-y"
              />
              <div className="text-right text-sm text-gray-400">{noticeText.length}/1000</div>
              <button
                onClick={postNotice}
                disabled={!noticeText.trim()}
                className={`w-full py-2 rounded-lg font-medium text-white hover:cursor-pointer ${
                  noticeText.trim()
                    ? "bg-gradient-to-r from-amber-400 to-pink-500 hover:from-amber-500 hover:to-pink-600"
                    : "bg-gray-600"
                }`}
              >
                Post Notice
              </button>
            </div>
          </section>

          {/* ────── LATEST NOTICES ────── */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif mb-4 text-amber-400">Latest Notices</h2>
            {notices.length === 0 ? (
              <p className="text-gray-300 italic">No notices.</p>
            ) : (
              <div className="space-y-4">
                {notices.map((n, i) => (
                  <div
                    key={n.id}
                    className="bg-gray-800/90 backdrop-blur p-5 rounded-xl flex justify-between items-start gap-3 fade"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {editingNotice?.id === n.id ? (
                      <div className="flex-1 space-y-2">
                        <textarea
                          value={editingNotice.text}
                          onChange={e => setEditingNotice({ ...editingNotice, text: e.target.value })}
                          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-500"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={updateNotice}
                            className="bg-green-600 hover:bg-green-700 px-3 py-1 hover:cursor-pointer rounded text-white text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingNotice(null)}
                            className="bg-gray-600 hover:bg-gray-700 px-3 py-1 hover:cursor-pointer rounded text-white text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p>{n.text}</p>
                          <p className="text-xs text-gray-400 mt-1">Posted: {n.createdAt}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingNotice({ id: n.id, text: n.text })}
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteNotice(n.id)}
                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ────── UPCOMING CONCERTS ────── */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif mb-4 text-amber-400">Upcoming Concerts</h2>
            {concerts.length === 0 ? (
              <p className="text-gray-300 italic">No concerts.</p>
            ) : (
              <div className="space-y-4">
                {concerts.map((c, i) => (
                  <div
                    key={c.id}
                    className="bg-gray-800/90 backdrop-blur p-5 rounded-xl flex justify-between items-start gap-3 fade"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {editingConcert?.id === c.id ? (
                      <div className="flex-1 space-y-2">
                        <input
                          value={editingConcert.venue}
                          onChange={e => setEditingConcert(p => ({ ...p, venue: e.target.value }))}
                          placeholder="Venue"
                          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-500"
                        />
                        <input
                          value={editingConcert.date}
                          onChange={e => setEditingConcert(p => ({ ...p, date: e.target.value }))}
                          placeholder="Date"
                          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-500"
                        />
                        <input
                          value={editingConcert.time}
                          onChange={e => setEditingConcert(p => ({ ...p, time: e.target.value }))}
                          placeholder="Time"
                          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-500"
                        />
                        <input
                          value={editingConcert.location}
                          onChange={e => setEditingConcert(p => ({ ...p, location: e.target.value }))}
                          placeholder="Location"
                          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={updateConcert}
                            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingConcert(null)}
                            className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="font-bold">{c.venue}</p>
                          <p className="text-sm text-gray-300">{c.date} @ {c.time} – {c.location}</p>
                          <p className="text-xs text-gray-400 mt-1">Posted: {c.createdAt}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => archiveConcert(c)}
                            className="bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Archive
                          </button>
                          <button
                            onClick={() => setEditingConcert({ id: c.id, ...c })}
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteConcert(c.id)}
                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ────── ARCHIVED CONCERTS ────── */}
          <section className="mb-12">
            <h2 className="text-3xl font-serif mb-4 text-amber-400">Archived Concerts</h2>
            {archivedConcerts.length === 0 ? (
              <p className="text-gray-300 italic">No archived concerts.</p>
            ) : (
              <div className="space-y-4">
                {archivedConcerts.map((c, i) => (
                  <div
                    key={c.id}
                    className="bg-gray-800/90 backdrop-blur p-5 rounded-xl flex justify-between items-start gap-3 fade"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {editingArchived?.id === c.id ? (
                      <div className="flex-1 space-y-2">
                        <input
                          value={editingArchived.venue}
                          onChange={e => setEditingArchived(p => ({ ...p, venue: e.target.value }))}
                          placeholder="Venue"
                          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-500"
                        />
                        <input
                          value={editingArchived.date}
                          onChange={e => setEditingArchived(p => ({ ...p, date: e.target.value }))}
                          placeholder="Date"
                          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-500"
                        />
                        <input
                          value={editingArchived.time || ""}
                          onChange={e => setEditingArchived(p => ({ ...p, time: e.target.value }))}
                          placeholder="Time"
                          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-500"
                        />
                        <input
                          value={editingArchived.location || ""}
                          onChange={e => setEditingArchived(p => ({ ...p, location: e.target.value }))}
                          placeholder="Location"
                          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-amber-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={updateArchivedConcert}
                            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingArchived(null)}
                            className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="font-bold">{c.venue}</p>
                          <p className="text-sm text-gray-300">{c.date} {c.time ? `@ ${c.time}` : ""} {c.location ? `– ${c.location}` : ""}</p>
                          <p className="text-xs text-gray-400 mt-1">Archived: {c.createdAt}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingArchived({ id: c.id, ...c })}
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteArchivedConcert(c.id)}
                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="flex gap-4 justify-center mb-12">
            <button onClick={handleLogout} className="text-amber-400 bg-red-900/80 px-4 py-2 rounded-xl hover:cursor-pointer">Logout</button>
            <button
              onClick={() => router.push("/admin")}
              className="bg-gradient-to-r from-amber-400 to-pink-500 px-6 py-2 rounded-lg font-medium hover:from-amber-500 hover:cursor-pointer hover:to-pink-600"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}