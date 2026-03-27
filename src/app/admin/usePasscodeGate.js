"use client";

import { useState, useEffect, useCallback } from "react";

const SESSION_KEY = "admin_passcode_verified";

export function usePasscodeGate() {
  const [verified, setVerified] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "true") {
      setVerified(true);
    }
  }, []);

  const verify = useCallback(async () => {
    if (!input.trim()) return;
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/verify-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: input }),
      });
      const data = await res.json();
      if (data.valid) {
        sessionStorage.setItem(SESSION_KEY, "true");
        setVerified(true);
      } else {
        setError("Invalid passcode");
        setInput("");
      }
    } catch {
      setError("Verification failed. Try again.");
    } finally {
      setChecking(false);
    }
  }, [input]);

  return { verified, input, setInput, error, checking, verify };
}

export function PasscodeGate({ gate }) {
  const { verified, input, setInput, error, checking, verify } = gate;

  if (verified) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-gray-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center">
              <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Admin Access</h2>
            <p className="text-sm text-gray-400 mt-1">Enter passcode to continue</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verify();
            }}
            className="space-y-4"
          >
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Passcode"
              autoFocus
              className="w-full px-4 py-3 bg-gray-900/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors"
            />
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={checking || !input.trim()}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-gray-900 font-semibold rounded-xl hover:from-amber-400 hover:to-rose-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checking ? "Verifying..." : "Enter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
