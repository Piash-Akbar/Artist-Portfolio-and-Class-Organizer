"use client";

import { useEffect, useState } from "react";
import Navbar from "../navbar/navbar";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  writeBatch,
  increment,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { signOut, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../loading/loadingSpinner";
import { usePasscodeGate, PasscodeGate } from "./usePasscodeGate";

export default function AdminDashboard() {
  const [classRequests, setClassRequests] = useState([]);
  const [creditRequests, setCreditRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [approving, setApproving] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const passcodeGate = usePasscodeGate();
  // edit students 
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ displayName: "", classFee: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!passcodeGate.verified) return;
    const load = async () => {
      try {
        if (!auth.currentUser) await signInAnonymously(auth);
        await Promise.all([fetchRequests(), fetchStudents()]);
      } catch (e) {
        setError("Failed to load data: " + e.message);
      }
      setLoading(false);
    };
    load();
  }, [passcodeGate.verified]);

  const fetchRequests = async () => {
    const classQ = query(collection(db, "classesRequests"), where("status", "==", "pending"));
    const classSnap = await getDocs(classQ);
    const classData = await Promise.all(
      classSnap.docs.map(async (d) => {
        const data = d.data();
        const userSnap = data.uid ? await getDoc(doc(db, "users", data.uid)) : null;
        return { id: d.id, ...data, displayName: userSnap?.data()?.displayName ?? "Unknown" };
      })
    );
    setClassRequests(classData);

    

    const creditQ = query(collection(db, "creditRequests"), where("status", "==", "pending"));
    const creditSnap = await getDocs(creditQ);
    const creditData = await Promise.all(
      creditSnap.docs.map(async (d) => {
        const data = d.data();
        const userSnap = data.targetUserId ? await getDoc(doc(db, "users", data.targetUserId)) : null;
        return { id: d.id, ...data, displayName: userSnap?.data()?.displayName ?? "Unknown" };
      })
    );
    setCreditRequests(creditData);
  };

  const fetchStudents = async () => {
    const usersQ = query(collection(db, "users"), where("role", "==", "student"));
    const snap = await getDocs(usersQ);
    const students = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setStudents(students);
  };

  const approveRequest = async (col, id) => {
    const key = `${col}-${id}`;
    setApproving((p) => ({ ...p, [key]: true }));
    try {
      const reqRef = doc(db, col, id);
      const reqSnap = await getDoc(reqRef);
      const req = reqSnap.data();

      if (col === "creditRequests") {
        const { targetUserId, amount } = req;
        const batch = writeBatch(db);
        batch.update(doc(db, "users", targetUserId), { credits: increment(amount) });
        batch.update(reqRef, { status: "approved", approvedAt: new Date().toISOString() });
        await batch.commit();
      } else if (col === "classesRequests") {
  const uid = req.uid || req.targetUserId;

  // Deduct one credit + approve request
  const batch = writeBatch(db);
  batch.update(doc(db, "users", uid), { credits: increment(-1) });
  batch.update(reqRef, { status: "approved", approvedAt: new Date().toISOString() });
  await batch.commit();

  // 🎯 CALL GOOGLE CALENDAR API
  try {
    const startDateTime = new Date(`${req.date}T${req.time}:00+06:00`);
    const endDateTime = new Date(startDateTime.getTime() + 45 * 60000); // 45 minute class

    // const calendarResponse = await fetch("/api/calendar/create", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     summary: `Violin Class - ${classRequests[0].displayName}`,
    //     description: `Scheduled class for ${classRequests[0].displayName}`,
    //     startDateTime: startDateTime.toISOString(),
    //     endDateTime: endDateTime.toISOString(),
    //     timeZone: "Asia/Dhaka"
    //   })
    // });
    const calendarResponse = await fetch("/api/calendar/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: `Violin Class - ${classRequests.find(c => c.id === id)?.displayName || 'Student'}`,
        description: `Scheduled class for ${classRequests.find(c => c.id === id)?.displayName || 'Student'}`,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        timeZone: "Asia/Dhaka"
      })
    });

    const data = await calendarResponse.json();
    if (!data.success) {
      console.error("Calendar error:", data);
      setError("⚠ Class approved but calendar event could not be created!");
    }
  } catch (err) {
    console.error("Calendar API call failed:", err.message);
    setError("Calendar event creation failed. Check logs.");
  }
}

      await fetchRequests();
    } catch (e) {
      setError(e.message);
    } finally {
      setApproving((p) => ({ ...p, [key]: false }));
    }
  };

  const declineRequest = async (col, id) => {
    const key = `${col}-${id}`;
    setApproving((p) => ({ ...p, [key]: true }));
    try {
      await updateDoc(doc(db, col, id), {
        status: "declined",
        declinedAt: new Date().toISOString(),
      });
      await fetchRequests();
    } catch (e) {
      setError(e.message);
    } finally {
      setApproving((p) => ({ ...p, [key]: false }));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch {
      setError("Logout failed");
    }
  };

  const isProcessing = (col, id) => approving[`${col}-${id}`];

  const filteredStudents = students.filter(
    (s) =>
      (s.displayName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  //student edit functions
  // Open edit Model function
  const openEditModal = (student) => {
  setEditingStudent(student.id);
  setEditForm({
    // displayName: student.displayName ?? "",
    classFee: student.classFee ?? "Not Set Yet"
  });
};

// Save edit changes function 
const saveStudentChanges = async () => {
  setSaving(true);
  try {
    await updateDoc(doc(db, "users", editingStudent), {
      displayName: editForm.displayName,
      classFee: Number(editForm.classFee),
    });

    // Refresh student list
    await fetchStudents();
    setEditingStudent(null);
  } catch (e) {
    setError("Failed to update student info: " + e.message);
  } finally {
    setSaving(false);
  }
};





  // console.log("Fetched class requests:", classRequests[0].displayName);

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen bg-[#0c0905] text-[#f5efe4] flex flex-col items-center py-20 sm:py-16 px-4 sm:px-6">
        <div className="absolute inset-0 bg-[url('/background.jpg')] bg-cover bg-center opacity-15"></div>
        <div className="relative z-10 w-full max-w-5xl">

          <p className="text-[10px] tracking-[0.24em] uppercase text-[#b8922a] font-medium mb-3 flex items-center justify-center gap-2.5">
            <span className="w-5 h-px bg-[#b8922a] inline-block"></span>Administration
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-4xl font-light italic mb-8 sm:mb-10 text-center text-[#f5efe4]">
            Admin Dashboard
          </h1>

          {error && (
            <div className="mb-6 p-3 sm:p-4 bg-[#1a1209] border border-[#b8922a]/25 rounded-sm text-center text-sm sm:text-base text-[#f5efe4]/70">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12">
            <button
              onClick={handleLogout}
              className="border border-[#f5efe4]/20 text-[#f5efe4]/60 px-6 py-2 rounded-sm font-medium transition-all duration-300 hover:cursor-pointer hover:border-[#f5efe4]/40 text-[10px] sm:text-xs tracking-[0.15em] uppercase"
            >
              Logout
            </button>
            <button
              onClick={() => router.push("/admin/content")}
              className="bg-[#b8922a] hover:bg-[#d4aa4a] text-[#0c0905] hover:cursor-pointer px-6 py-2 rounded-sm font-medium transition-all duration-300 text-[10px] sm:text-xs tracking-[0.15em] uppercase"
            >
              Manage Content
            </button>
          </div>

          {/* Class Requests */}
          <section className="bg-[#1a1209] border border-[#b8922a]/10 p-4 sm:p-6 rounded-sm mb-6 sm:mb-10">
            <h2 className="font-[family-name:var(--font-cormorant)] text-xl sm:text-2xl font-light italic mb-3 sm:mb-4 text-[#b8922a]">
              Pending Class Requests ({classRequests.length})
            </h2>
            {classRequests.length === 0 ? (
              <p className="text-[#f5efe4]/40 italic text-sm sm:text-base">No pending requests.</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {classRequests.map((r) => (
                  <div
                    key={r.id}
                    className="bg-[#0c0905] border border-[#b8922a]/10 p-3 sm:p-4 rounded-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-all hover:border-[#b8922a]/25"
                  >
                    <div>
                      <p className="font-medium text-[#f5efe4] text-sm sm:text-base">{r.displayName}</p>
                      <p className="text-sm text-[#f5efe4]/50">
                        Date: {r.date} | Time: {r.time}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveRequest("classesRequests", r.id)}
                        disabled={isProcessing("classesRequests", r.id)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm font-medium hover:cursor-pointer text-[10px] sm:text-xs tracking-[0.1em] uppercase ${
                          isProcessing("classesRequests", r.id)
                            ? "bg-[#f5efe4]/10 text-[#f5efe4]/30"
                            : "bg-[#b8922a] text-[#0c0905] hover:bg-[#d4aa4a]"
                        } transition-colors`}
                      >
                        {isProcessing("classesRequests", r.id) ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() => declineRequest("classesRequests", r.id)}
                        disabled={isProcessing("classesRequests", r.id)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm font-medium hover:cursor-pointer text-[10px] sm:text-xs tracking-[0.1em] uppercase ${
                          isProcessing("classesRequests", r.id)
                            ? "bg-[#f5efe4]/10 text-[#f5efe4]/30"
                            : "border border-[#f5efe4]/20 text-[#f5efe4]/60 hover:border-[#f5efe4]/40"
                        } transition-colors`}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Credit Requests */}
          <section className="bg-[#1a1209] border border-[#b8922a]/10 p-4 sm:p-6 rounded-sm mb-6 sm:mb-10">
            <h2 className="font-[family-name:var(--font-cormorant)] text-xl sm:text-2xl font-light italic mb-3 sm:mb-4 text-[#b8922a]">
              Pending Credit Requests ({creditRequests.length})
            </h2>
            {creditRequests.length === 0 ? (
              <p className="text-[#f5efe4]/40 italic text-sm sm:text-base">No pending requests.</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {creditRequests.map((r) => (
                  <div
                    key={r.id}
                    className="bg-[#0c0905] border border-[#b8922a]/10 p-3 sm:p-4 rounded-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 transition-all hover:border-[#b8922a]/25"
                  >
                    <div className="space-y-0.5">
                      <p className="font-medium text-[#f5efe4] text-sm sm:text-base">{r.displayName}</p>
                      <p className="text-sm text-[#f5efe4]/50">
                        {r.amount} classes
                      </p>
                      <p className="text-sm text-[#f5efe4]/40">
                        Payment Method: {r.paymentMethod}
                      </p>
                      <p className="text-sm text-[#f5efe4]/40">
                        Transaction Proof: {r.proof}
                      </p>
                      <p className="text-sm text-[#f5efe4]/40">
                        Additional Message: {r.message || "N/A"}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => approveRequest("creditRequests", r.id)}
                        disabled={isProcessing("creditRequests", r.id)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm hover:cursor-pointer font-medium text-[10px] sm:text-xs tracking-[0.1em] uppercase ${
                          isProcessing("creditRequests", r.id)
                            ? "bg-[#f5efe4]/10 text-[#f5efe4]/30"
                            : "bg-[#b8922a] text-[#0c0905] hover:bg-[#d4aa4a]"
                        } transition-colors`}
                      >
                        {isProcessing("creditRequests", r.id) ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() => declineRequest("creditRequests", r.id)}
                        disabled={isProcessing("creditRequests", r.id)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm hover:cursor-pointer font-medium text-[10px] sm:text-xs tracking-[0.1em] uppercase ${
                          isProcessing("creditRequests", r.id)
                            ? "bg-[#f5efe4]/10 text-[#f5efe4]/30"
                            : "border border-[#f5efe4]/20 text-[#f5efe4]/60 hover:border-[#f5efe4]/40"
                        } transition-colors`}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Students */}
          <section className="bg-[#1a1209] border border-[#b8922a]/10 p-4 sm:p-6 rounded-sm">
            <h2 className="font-[family-name:var(--font-cormorant)] text-xl sm:text-2xl font-light italic mb-3 sm:mb-4 text-[#b8922a]">Students</h2>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 mb-4 sm:mb-6 rounded-sm bg-[#0c0905] text-[#f5efe4] border border-[#b8922a]/20 focus:outline-none focus:ring-1 focus:ring-[#b8922a]/50 text-sm sm:text-base"
            />
            {filteredStudents.length === 0 ? (
              <p className="text-[#f5efe4]/40 italic text-sm sm:text-base">No students found.</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredStudents.map((s) => (
                  <div
                    key={s.id}
                    className="bg-[#0c0905] border border-[#b8922a]/10 p-3 sm:p-4 rounded-sm transition-all hover:border-[#b8922a]/25"
                  >
                    <p className="font-medium text-[#f5efe4] text-sm sm:text-base">{s.displayName}</p>
                    <p className="text-sm sm:text-base text-[#f5efe4]/60">
                      Classes Remain: {s.credits ?? 0}
                    </p>
                    <p className="text-xs sm:text-sm text-[#f5efe4]/40">
                      Email: {s.email}
                    </p>
                    <p className="text-sm sm:text-base text-[#f5efe4]/60">
                      Class Fee: {s.classFee ? `$${s.classFee}` : "Not set"}
                    </p>

                    <div className="flex gap-2 mt-2 sm:mt-3">
                    <button
                      onClick={() => openEditModal(s)}
                      className="px-3 py-1 rounded-sm bg-[#b8922a] text-[#0c0905] font-medium hover:cursor-pointer hover:bg-[#d4aa4a] text-[10px] tracking-[0.1em] uppercase transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  {editingStudent && (
  <div className="fixed inset-0 bg-[#0c0905]/90 flex justify-center items-center z-50 px-4">
    <div className="bg-[#1a1209] border border-[#b8922a]/20 p-5 sm:p-6 rounded-sm w-full max-w-md">
      <h2 className="font-[family-name:var(--font-cormorant)] text-lg sm:text-xl font-light italic text-[#b8922a] mb-3 sm:mb-4">Edit Student</h2>

      <label className="block mb-3 text-sm sm:text-base text-[#f5efe4]/60">
        Display Name
        <input
          type="text"
          value={editForm.displayName}
          onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
          className="w-full p-2 rounded-sm bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] mt-1 text-sm sm:text-base"
        />
      </label>

      <label className="block mb-4 text-sm sm:text-base text-[#f5efe4]/60">
        Class Fee
        <input
          type="number"
          value={editForm.classFee}
          onChange={(e) => setEditForm({ ...editForm, classFee: e.target.value })}
          className="w-full p-2 rounded-sm bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] mt-1 text-sm sm:text-base"
        />
      </label>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setEditingStudent(null)}
          className="px-4 py-2 border border-[#f5efe4]/20 text-[#f5efe4]/60 rounded-sm hover:cursor-pointer font-medium hover:border-[#f5efe4]/40 text-sm sm:text-base transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={saveStudentChanges}
          disabled={saving}
          className={`px-4 py-2 rounded-sm font-medium hover:cursor-pointer text-sm sm:text-base transition-colors ${
            saving ? "bg-[#f5efe4]/10 text-[#f5efe4]/30" : "bg-[#b8922a] text-[#0c0905] hover:bg-[#d4aa4a]"
          }`}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  </div>
)}


                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
