"use client";
import { use, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, addDoc,doc,getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Image from "next/image";
import { db, auth } from "../../../firebaseConfig";
// import {doc} 

export default function BuyCreditPage() {
  const { uid } = useParams();
  const router = useRouter();
  const [classFee, setClassFee] = useState(); // Default class fee
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [proof, setProof] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount || !paymentMethod || !proof) {
      alert("Please fill all fields.");
      return;
    }

    try {
      await addDoc(collection(db, "creditRequests"), {
        targetUserId: uid,
        amount,
        classFee,
        paymentMethod,
        proof,
        message,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      alert("Credit request sent to admin.");
      router.push(`/user/${uid}`);
    } catch (error) {
      console.error("Error submitting credit request:", error);
      alert("Failed to submit request.");
    }
  }

  async function handleLogout() {
    await signOut(auth);
    router.push("/");
  }

  useEffect(() => {
    // Fetch class fee from user document if needed
    const fetchClassFee = async () => {
      const userRef = doc(db, "users", uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setClassFee(userData.classFee || "00"); // Default to 600 if not set
      }
    };
    fetchClassFee();
  }, []);




  return (
    <div className="relative min-h-screen bg-[#0c0905] text-[#f5efe4]">
      <div className="absolute inset-0 bg-[url('/background.jpg')] bg-cover bg-center opacity-15"></div>

      <div className="relative z-10">
        <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-20 sm:py-12">
          <button
            onClick={handleLogout}
            className="absolute top-5 right-5 border border-[#f5efe4]/20 text-[#f5efe4]/60 px-4 py-2 rounded-sm hover:border-[#f5efe4]/40 transition-colors text-[10px] tracking-[0.15em] uppercase hover:cursor-pointer"
          >
            Logout
          </button>

          <p className="text-[10px] tracking-[0.24em] uppercase text-[#b8922a] font-medium mb-3 flex items-center justify-center gap-2.5">
            <span className="w-5 h-px bg-[#b8922a] inline-block"></span>Payment
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-4xl font-light italic mb-4">Buy Class</h1>
          <span className="text-[#f5efe4]/60 text-sm sm:text-base mb-6">Your class fee is <b className="font-medium text-xl sm:text-2xl text-[#b8922a]">{classFee}</b> INR per class</span>

          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 bg-[#1a1209] border border-[#b8922a]/10 p-4 sm:p-6 rounded-sm w-full max-w-4xl">
            {/* ===== Left Side: Form ===== */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 sm:gap-4 w-full md:w-1/2"
            >
              <input
                type="number"
                placeholder="Number of classes you want to pay for"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="p-2.5 sm:p-3 rounded-sm bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none text-sm sm:text-base"
              />

              <span className="text-sm sm:text-base text-[#f5efe4]/60">
                Total payable amount for {amount} {amount == 1 ? 'class' : 'classes'} is
                <b className="ml-2 font-medium text-xl sm:text-2xl text-[#b8922a]">
                  ₹{(amount * classFee).toLocaleString('en-IN')}
                </b>
              </span>

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="p-2.5 sm:p-3 rounded-sm bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none hover:cursor-pointer text-sm sm:text-base"
              >
                <option value="">Select Payment Method</option>
                <option value="UPI">UPI (for payments from India only)</option>
                <option value="Bank transfer">Bank Transfer</option>
              </select>

              <input
                type="number"
                placeholder="Paste your transaction number"
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                className="p-2.5 sm:p-3 rounded-sm bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none text-sm sm:text-base"
              />

              <textarea
                placeholder="Additional message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="p-2.5 sm:p-3 rounded-sm bg-[#0c0905] border border-[#b8922a]/20 text-[#f5efe4] focus:ring-1 focus:ring-[#b8922a]/50 focus:outline-none resize-y text-sm sm:text-base"
              ></textarea>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  type="submit"
                  className="bg-[#b8922a] hover:bg-[#d4aa4a] text-[#0c0905] hover:cursor-pointer px-4 py-2.5 rounded-sm font-medium w-full transition-colors text-[10px] sm:text-xs tracking-[0.15em] uppercase"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/user/${uid}`)}
                  className="border border-[#f5efe4]/20 text-[#f5efe4]/60 hover:border-[#f5efe4]/40 hover:cursor-pointer px-4 py-2.5 rounded-sm font-medium w-full transition-colors text-[10px] sm:text-xs tracking-[0.15em] uppercase"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* ===== Right Side: Dynamic Content ===== */}
            <div className="flex flex-col items-center justify-center w-full md:w-1/2 bg-[#0c0905] border border-[#b8922a]/10 p-4 sm:p-5 rounded-sm">
              {paymentMethod === "UPI" && (
                <div className="text-center">
                  <h2 className="font-[family-name:var(--font-cormorant)] text-lg sm:text-xl font-light italic mb-3 text-[#b8922a]">
                    Scan QR to Pay via Upay
                  </h2>
                  <Image
                    src="/qr_code.jpeg"
                    alt="Upay QR Code"
                    width={250}
                    height={250}
                    className="mx-auto rounded-sm"
                  />
                </div>
              )}

              {paymentMethod === "" && (
                <div className="text-center">
                  <h2 className="font-[family-name:var(--font-cormorant)] text-lg sm:text-xl font-light italic text-[#f5efe4]/40">
                    Please select a payment method to proceed.
                  </h2>
                </div>
              )}

              {paymentMethod === "Bank transfer" && (
                <div className="text-left space-y-2 text-sm sm:text-base text-[#f5efe4]/70">
                  <h2 className="font-[family-name:var(--font-cormorant)] text-lg sm:text-xl font-light italic mb-3 text-center text-[#b8922a]">
                    Bank Transfer Details
                  </h2>
                  <p>
                    <span className="font-medium text-[#f5efe4]">Account Name:</span> Anirban
                    Bhattacharjee
                  </p>
                  <p>
                    <span className="font-medium text-[#f5efe4]">Bank Name:</span> SBI (State
                    Bank of India)
                  </p>
                  <p>
                    <span className="font-medium text-[#f5efe4]">Account Type:</span> Savings
                    Account
                  </p>
                  <p>
                    <span className="font-medium text-[#f5efe4]">Account Number:</span>{" "}
                    32907754939
                  </p>
                  <p>
                    <span className="font-medium text-[#f5efe4]">Branch:</span> PBB Marine Drive
                  </p>
                  <p>
                    <span className="font-medium text-[#f5efe4]">IFSC Code:</span> SBIN0019255
                  </p>

                  <div className="mt-4">
                    <h3 className="font-medium text-[#f5efe4]">Address:</h3>
                    <p className="text-[#f5efe4]/50">
                      Apartment no. 137 TF, <br />
                      TDI Lake Grove, Water Site, <br />
                      Sector 64 Patla, Kundli, Sonipat, <br />
                      Haryana 131023.
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-[#f5efe4]/40 mt-3">
                    Please include your name and number of classes in the payment reference.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
