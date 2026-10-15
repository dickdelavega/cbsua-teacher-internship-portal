"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";

export default function Login() {
  const [identifier, setIdentifier] = useState("2021-10492");
  const [password, setPassword] = useState("password123");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const idToUse = identifier.trim() || "2021-10492";
    setIsLoggingIn(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: idToUse, password }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        sessionStorage.setItem("cbsua_student_id", data.data.studentId);
        if (data.data.username) {
          sessionStorage.setItem("cbsua_student_username", data.data.username);
        }
        router.push("/dashboard");
      } else {
        setErrorMsg(data.error || "Invalid username/student ID or password.");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to authentication server.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-3">
          <Image
            src="/cbsua-logo.png"
            alt="CBSUA Seal Logo"
            width={72}
            height={72}
            className="w-20 h-20 object-contain drop-shadow-md"
            priority
          />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          CBSUA Student Teacher Evaluation System
        </h2>
        <p className="mt-1 text-sm text-gray-600 font-medium">
          Pre-Service Teacher Internship Portal • STES
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-green-100">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-900 border border-red-200 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Student ID or Username
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cbsua-green focus:border-cbsua-green sm:text-sm text-black"
                  placeholder="e.g. 2021-10492 or jdelacruz"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cbsua-green focus:border-cbsua-green sm:text-sm text-black"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-cbsua-green focus:ring-cbsua-green border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-cbsua-green hover:text-green-800">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1.5">Select Demo Intern Account:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => { setIdentifier("jdelacruz"); setPassword("password123"); }}
                  className={`px-2 py-1 rounded text-[11px] font-medium border transition ${
                    identifier === "jdelacruz" || identifier === "2021-10492"
                      ? "bg-cbsua-green text-white border-cbsua-green"
                      : "bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300"
                  }`}
                >
                  Juan Dela Cruz (@jdelacruz)
                </button>
                <button
                  type="button"
                  onClick={() => { setIdentifier("ksalazar"); setPassword("password123"); }}
                  className={`px-2 py-1 rounded text-[11px] font-medium border transition ${
                    identifier === "ksalazar" || identifier === "2021-10511"
                      ? "bg-cbsua-green text-white border-cbsua-green"
                      : "bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300"
                  }`}
                >
                  Kristine Salazar (@ksalazar)
                </button>
                <button
                  type="button"
                  onClick={() => { setIdentifier("jdoe"); setPassword("password123"); }}
                  className={`px-2 py-1 rounded text-[11px] font-medium border transition ${
                    identifier === "jdoe" || identifier === "2021-0001"
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-white hover:bg-amber-50 text-amber-800 border-amber-300"
                  }`}
                >
                  John Doe (@jdoe)
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cbsua-green hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cbsua-green transition-colors disabled:opacity-50"
              >
                {isLoggingIn ? "Signing in..." : "Sign in to Portal"}
              </button>
            </div>
          </form>
          
          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col gap-2.5 text-center text-xs">
            <Link
              href="/sp/login"
              className="text-cbsua-green font-bold hover:underline flex items-center justify-center gap-1.5"
            >
              Are you a Supervising Professor? Sign in here →
            </Link>
            <div className="flex justify-center text-gray-500 items-center gap-1">
              <Lock className="w-3 h-3" /> CBSUA Secure Academic Portal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
