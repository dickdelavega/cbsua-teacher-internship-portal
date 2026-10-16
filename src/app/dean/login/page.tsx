"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Award, GraduationCap, ArrowRight, BookOpen } from "lucide-react";

export default function DeanLogin() {
  const [email, setEmail] = useState("dean.education@cbsua.edu.ph");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/dean/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        sessionStorage.setItem("dean_user", JSON.stringify(data.data));
        router.push("/dean/dashboard");
      } else {
        setErrorMsg(data.error || "Invalid institutional credentials.");
      }
    } catch {
      // Local fallback session
      sessionStorage.setItem(
        "dean_user",
        JSON.stringify({
          name: "Dr. Raquel M. Reapor, Ed.D.",
          email: email || "dean.education@cbsua.edu.ph",
          title: "Dean, College of Education",
          department: "College of Education - Office of the Dean",
        })
      );
      router.push("/dean/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Decorative gradient accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cbsua-green/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
            <Image
              src="/cbsua-logo.png"
              alt="CBSUA Seal Logo"
              width={80}
              height={80}
              className="w-20 h-20 object-contain drop-shadow-lg"
              priority
            />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 mb-3">
          <Award className="w-3.5 h-3.5 text-yellow-400" />
          Executive Leadership Access
        </div>

        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Dean of College of Education
        </h2>
        <p className="mt-1 text-sm text-slate-300 font-medium">
          Supervising Professor Oversight & Program Governance Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/30">
          <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cbsua-green shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950">
              <strong className="block font-bold">Office of the Dean Authority</strong>
              Assign and supervise professors across <span className="font-semibold text-emerald-900">BSED</span>, <span className="font-semibold text-emerald-900">BEED</span>, and <span className="font-semibold text-emerald-900">BTLEd</span> teacher internship programs.
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Institutional Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cbsua-green focus:bg-white transition"
                placeholder="dean.education@cbsua.edu.ph"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Executive Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cbsua-green focus:bg-white transition"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                Default: password123
              </span>
              <span className="font-semibold text-emerald-800">CBSUA Secure Token</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-cbsua-green hover:bg-emerald-800 transition shadow-lg hover:shadow-emerald-900/40 focus:outline-none mt-2"
            >
              {isLoading ? "Authenticating..." : "Enter Dean Governance Portal"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col gap-2.5 text-center text-xs">
            <Link
              href="/sp/login"
              className="font-medium text-slate-600 hover:text-cbsua-green flex items-center justify-center gap-1.5 transition"
            >
              <BookOpen className="w-4 h-4 text-emerald-700" />
              Switch to Supervising Professor Portal
            </Link>
            <Link
              href="/login"
              className="font-medium text-slate-600 hover:text-cbsua-green flex items-center justify-center gap-1.5 transition"
            >
              <GraduationCap className="w-4 h-4 text-slate-500" />
              Switch to Student Intern Login Portal
            </Link>
            <Link href="/" className="text-slate-400 hover:text-slate-600 pt-1">
              ← Return to CBSUA Main Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
