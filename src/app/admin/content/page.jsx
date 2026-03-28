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

  // Videos
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    if (!passcodeGate.verified) return;
    const load = async () => {
      if (!auth.currentUser) await signInAnonymously(auth);
      await Promise.all([fetchNotices(), fetchConcerts(), fetchArchivedConcerts(), fetchVideos()]);
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

  /* ────── VIDEO HANDLERS ────── */
  const extractEmbedUrl = (input) => {
    const trimmed = input.trim();
    // Already an embed URL
    if (trimmed.includes('youtube.com/embed/')) return trimmed.split('?')[0];
    // Standard watch URL: https://www.youtube.com/watch?v=XXXXX
    const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    // Short URL: https://youtu.be/XXXXX
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    return null;
  };

  const fetchVideos = async () => {
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setVideos(snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: fmt(d.data().createdAt) })));
  };

  const addVideo = async () => {
    const embedUrl = extractEmbedUrl(videoUrl);
    if (!embedUrl) return setError("Invalid YouTube URL. Paste a YouTube link or embed URL.");
    await addDoc(collection(db, "videos"), {
      url: embedUrl,
      title: videoTitle.trim() || "Untitled",
      createdAt: new Date().toISOString(),
      createdBy: "admin"
    });
    setVideoUrl("");
    setVideoTitle("");
    fetchVideos();
  };

  const deleteVideo = async (id) => {
    await deleteDoc(doc(db, "videos", id));
    fetchVideos();
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
      <div className="min-h-screen bg-[#0c0905] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0c0905] text-[#f5efe4] py-20 sm:py-12 px-4 sm:px-6 md:px-8">
        <style jsx>{`
          @keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
          .fade { animation: fadeIn 0.8s forwards; }
        `}</style>

        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-cormorant)] font-light italic mb-8 sm:mb-12 text-center text-[#f5efe4] fade">
            Content Management
          </h1>

          {error && <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-[#1a1209] border border-[#b8922a]/25 rounded-sm text-sm sm:text-base">{error}</div>}

          {/* ────── NAV BUTTONS ────── */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12">
            <button onClick={handleLogout} className="text-[#b8922a] bg-[#1a1209] border border-[#b8922a]/25 px-4 py-2 rounded-sm hover:cursor-pointer text-sm sm:text-base">Logout</button>
            <button
              onClick={() => router.push("/admin")}
              className="bg-[#b8922a] hover:bg-[#d4aa4a] text-[#0c0905] px-6 py-2 rounded-lg font-medium hover:cursor-pointer  text-sm sm:text-base"
            >
              Back to Dashboard
            </button>
          </div>

          {/* ────── ADD CONCERT ────── */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-cormorant)] font-light italic mb-3 sm:mb-4 text-[#b8922a]">Add Upcoming Concert</h2>
            <form onSubmit={postConcert} className="bg-[#1a1209] border border-[#b8922a]/10 p-4 sm:p-6 rounded-sm space-y-3 sm:space-y-4">
              <input
                placeholder="Venue"
                value={concert.venue}
                onChange={e => setConcert(p => ({ ...p, venue: e.target.value }))}
                required
                className="w-full p-2.5 sm:p-3 rounded bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none text-sm sm:text-base"
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
                className="w-full p-2.5 sm:p-3 rounded bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none text-sm sm:text-base"
              />
              <input
                placeholder="Location"
                value={concert.location}
                onChange={e => setConcert(p => ({ ...p, location: e.target.value }))}
                required
                className="w-full p-2.5 sm:p-3 rounded bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none text-sm sm:text-base"
              />
              <input
                placeholder="Ticket URL (optional)"
                value={concert.ticketURL ?? ""}
                onChange={e => setConcert(p => ({ ...p, ticketURL: e.target.value }))}
                className="w-full p-2.5 sm:p-3 rounded bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none text-sm sm:text-base"
              />
              <button
                type="submit"
                className="w-full hover:cursor-pointer bg-[#b8922a] hover:bg-[#d4aa4a] text-[#0c0905] py-2 rounded-lg font-medium  text-sm sm:text-base"
              >
                Add Concert
              </button>
            </form>
          </section>

          {/* ────── POST NOTICE ────── */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-cormorant)] font-light italic mb-3 sm:mb-4 text-[#b8922a]">Post Notice</h2>
            <div className="bg-[#1a1209] border border-[#b8922a]/10 p-4 sm:p-6 rounded-sm space-y-3">
              <textarea
                value={noticeText}
                onChange={e => setNoticeText(e.target.value)}
                placeholder="Notice text…"
                rows={4}
                maxLength={1000}
                className="w-full p-2.5 sm:p-3 rounded bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none resize-y text-sm sm:text-base"
              />
              <div className="text-right text-xs sm:text-sm text-[#f5efe4]/30">{noticeText.length}/1000</div>
              <button
                onClick={postNotice}
                disabled={!noticeText.trim()}
                className={`w-full py-2 rounded-lg font-medium text-white hover:cursor-pointer text-sm sm:text-base ${
                  noticeText.trim()
                    ? "bg-[#b8922a] hover:bg-[#d4aa4a] text-[#0c0905] "
                    : "bg-[#f5efe4]/10 text-[#f5efe4]/30"
                }`}
              >
                Post Notice
              </button>
            </div>
          </section>

          {/* ────── LATEST NOTICES ────── */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-cormorant)] font-light italic mb-3 sm:mb-4 text-[#b8922a]">Latest Notices</h2>
            {notices.length === 0 ? (
              <p className="text-[#f5efe4]/50 italic text-sm sm:text-base">No notices.</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {notices.map((n, i) => (
                  <div
                    key={n.id}
                    className="bg-[#1a1209] border border-[#b8922a]/10 p-4 sm:p-5 rounded-sm flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 fade"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {editingNotice?.id === n.id ? (
                      <div className="flex-1 space-y-2">
                        <textarea
                          value={editingNotice.text}
                          onChange={e => setEditingNotice({ ...editingNotice, text: e.target.value })}
                          className="w-full p-2 rounded bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none text-sm sm:text-base"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={updateNotice}
                            className="bg-[#b8922a] hover:bg-[#d4aa4a] text-[#0c0905] px-3 py-1 hover:cursor-pointer rounded text-white text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingNotice(null)}
                            className="bg-[#f5efe4]/10 text-[#f5efe4]/30 hover:bg-gray-700 px-3 py-1 hover:cursor-pointer rounded text-white text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base break-words">{n.text}</p>
                          <p className="text-xs text-[#f5efe4]/30 mt-1">Posted: {n.createdAt}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setEditingNotice({ id: n.id, text: n.text })}
                            className="border border-[#b8922a]/40 text-[#b8922a] hover:bg-[#b8922a] hover:text-[#0c0905] px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteNotice(n.id)}
                            className="border border-[#f5efe4]/15 text-[#f5efe4]/40 hover:border-[#f5efe4]/30 hover:text-[#f5efe4]/60 px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
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
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-cormorant)] font-light italic mb-3 sm:mb-4 text-[#b8922a]">Upcoming Concerts</h2>
            {concerts.length === 0 ? (
              <p className="text-[#f5efe4]/50 italic text-sm sm:text-base">No concerts.</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {concerts.map((c, i) => (
                  <div
                    key={c.id}
                    className="bg-[#1a1209] border border-[#b8922a]/10 p-4 sm:p-5 rounded-sm flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 fade"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {editingConcert?.id === c.id ? (
                      <div className="flex-1 space-y-2">
                        <input
                          value={editingConcert.venue}
                          onChange={e => setEditingConcert(p => ({ ...p, venue: e.target.value }))}
                          placeholder="Venue"
                          className="w-full p-2 rounded bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none text-sm sm:text-base"
                        />
                        <input
                          value={editingConcert.date}
                          onChange={e => setEditingConcert(p => ({ ...p, date: e.target.value }))}
                          placeholder="Date"
                          className="w-full p-2 rounded bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none text-sm sm:text-base"
                        />
                        <input
                          value={editingConcert.time}
                          onChange={e => setEditingConcert(p => ({ ...p, time: e.target.value }))}
                          placeholder="Time"
                          className="w-full p-2 rounded bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none text-sm sm:text-base"
                        />
                        <input
                          value={editingConcert.location}
                          onChange={e => setEditingConcert(p => ({ ...p, location: e.target.value }))}
                          placeholder="Location"
                          className="w-full p-2 rounded bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none text-sm sm:text-base"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={updateConcert}
                            className="bg-[#b8922a] hover:bg-[#d4aa4a] text-[#0c0905] px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingConcert(null)}
                            className="bg-[#f5efe4]/10 text-[#f5efe4]/30 hover:bg-gray-700 px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0">
                          <p className="font-bold text-sm sm:text-base">{c.venue}</p>
                          <p className="text-xs sm:text-sm text-[#f5efe4]/50">{c.date} @ {c.time} – {c.location}</p>
                          <p className="text-xs text-[#f5efe4]/30 mt-1">Posted: {c.createdAt}</p>
                        </div>
                        <div className="flex gap-2 shrink-0 flex-wrap">
                          <button
                            onClick={() => archiveConcert(c)}
                            className="bg-[#b8922a] hover:bg-[#d4aa4a] text-[#0c0905] px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Archive
                          </button>
                          <button
                            onClick={() => setEditingConcert({ id: c.id, ...c })}
                            className="border border-[#b8922a]/40 text-[#b8922a] hover:bg-[#b8922a] hover:text-[#0c0905] px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteConcert(c.id)}
                            className="border border-[#f5efe4]/15 text-[#f5efe4]/40 hover:border-[#f5efe4]/30 hover:text-[#f5efe4]/60 px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
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
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-cormorant)] font-light italic mb-3 sm:mb-4 text-[#b8922a]">Archived Concerts</h2>
            {archivedConcerts.length === 0 ? (
              <p className="text-[#f5efe4]/50 italic text-sm sm:text-base">No archived concerts.</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {archivedConcerts.map((c, i) => (
                  <div
                    key={c.id}
                    className="bg-[#1a1209] border border-[#b8922a]/10 p-4 sm:p-5 rounded-sm flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 fade"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {editingArchived?.id === c.id ? (
                      <div className="flex-1 space-y-2">
                        <input
                          value={editingArchived.venue}
                          onChange={e => setEditingArchived(p => ({ ...p, venue: e.target.value }))}
                          placeholder="Venue"
                          className="w-full p-2 rounded bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none text-sm sm:text-base"
                        />
                        <input
                          value={editingArchived.date}
                          onChange={e => setEditingArchived(p => ({ ...p, date: e.target.value }))}
                          placeholder="Date"
                          className="w-full p-2 rounded bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none text-sm sm:text-base"
                        />
                        <input
                          value={editingArchived.time || ""}
                          onChange={e => setEditingArchived(p => ({ ...p, time: e.target.value }))}
                          placeholder="Time"
                          className="w-full p-2 rounded bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none text-sm sm:text-base"
                        />
                        <input
                          value={editingArchived.location || ""}
                          onChange={e => setEditingArchived(p => ({ ...p, location: e.target.value }))}
                          placeholder="Location"
                          className="w-full p-2 rounded bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none text-sm sm:text-base"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={updateArchivedConcert}
                            className="bg-[#b8922a] hover:bg-[#d4aa4a] text-[#0c0905] px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingArchived(null)}
                            className="bg-[#f5efe4]/10 text-[#f5efe4]/30 hover:bg-gray-700 px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="min-w-0">
                          <p className="font-bold text-sm sm:text-base">{c.venue}</p>
                          <p className="text-xs sm:text-sm text-[#f5efe4]/50">{c.date} {c.time ? `@ ${c.time}` : ""} {c.location ? `– ${c.location}` : ""}</p>
                          <p className="text-xs text-[#f5efe4]/30 mt-1">Archived: {c.createdAt}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setEditingArchived({ id: c.id, ...c })}
                            className="border border-[#b8922a]/40 text-[#b8922a] hover:bg-[#b8922a] hover:text-[#0c0905] px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteArchivedConcert(c.id)}
                            className="border border-[#f5efe4]/15 text-[#f5efe4]/40 hover:border-[#f5efe4]/30 hover:text-[#f5efe4]/60 px-3 py-1 rounded text-white text-sm hover:cursor-pointer"
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

          {/* ────── ADD VIDEO ────── */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-cormorant)] font-light italic mb-3 sm:mb-4 text-[#b8922a]">Add Video</h2>
            <div className="bg-[#1a1209] border border-[#b8922a]/10 p-4 sm:p-6 rounded-sm space-y-3">
              <input
                placeholder="YouTube URL (watch link, short link, or embed link)"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                className="w-full p-2.5 sm:p-3 rounded bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none text-sm sm:text-base"
              />
              <input
                placeholder="Title (optional)"
                value={videoTitle}
                onChange={e => setVideoTitle(e.target.value)}
                className="w-full p-2.5 sm:p-3 rounded bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none text-sm sm:text-base"
              />
              {videoUrl && extractEmbedUrl(videoUrl) && (
                <div className="max-w-sm">
                  <p className="text-xs text-[#f5efe4]/30 mb-2">Preview:</p>
                  <iframe
                    src={extractEmbedUrl(videoUrl)}
                    title="Preview"
                    style={{border:0}}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    className="w-full aspect-video rounded-sm"
                  ></iframe>
                </div>
              )}
              <button
                onClick={addVideo}
                disabled={!videoUrl.trim()}
                className={`w-full py-2 rounded-lg font-medium hover:cursor-pointer text-sm sm:text-base ${
                  videoUrl.trim()
                    ? "bg-[#b8922a] hover:bg-[#d4aa4a] text-[#0c0905]"
                    : "bg-[#f5efe4]/10 text-[#f5efe4]/30"
                }`}
              >
                Add Video
              </button>
            </div>
          </section>

          {/* ────── MANAGE VIDEOS ────── */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-[family-name:var(--font-cormorant)] font-light italic mb-3 sm:mb-4 text-[#b8922a]">Videos ({videos.length})</h2>
            {videos.length === 0 ? (
              <p className="text-[#f5efe4]/50 italic text-sm sm:text-base">No videos added yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((v, i) => (
                  <div
                    key={v.id}
                    className="bg-[#1a1209] border border-[#b8922a]/10 p-3 rounded-sm fade"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <iframe
                      src={v.url}
                      title={v.title}
                      style={{border:0}}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      className="w-full aspect-video rounded-sm mb-2"
                    ></iframe>
                    <div className="flex justify-between items-center">
                      <div className="min-w-0">
                        <p className="text-sm truncate">{v.title}</p>
                        <p className="text-xs text-[#f5efe4]/30">{v.createdAt}</p>
                      </div>
                      <button
                        onClick={() => deleteVideo(v.id)}
                        className="border border-[#f5efe4]/15 text-[#f5efe4]/40 hover:border-[#f5efe4]/30 hover:text-[#f5efe4]/60 px-3 py-1 rounded text-sm hover:cursor-pointer shrink-0 ml-2"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12">
            <button onClick={handleLogout} className="text-[#b8922a] bg-[#1a1209] border border-[#b8922a]/25 px-4 py-2 rounded-sm hover:cursor-pointer text-sm sm:text-base">Logout</button>
            <button
              onClick={() => router.push("/admin")}
              className="bg-[#b8922a] hover:bg-[#d4aa4a] text-[#0c0905] px-6 py-2 rounded-lg font-medium hover:cursor-pointer text-sm sm:text-base"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}