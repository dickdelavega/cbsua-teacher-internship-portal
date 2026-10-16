"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { UserCheck, Shield, ArrowRight, GraduationCap } from "lucide-react";

export default function SupervisingProfessorLogin() {
  const [email, setEmail] = useState("mesantos@cbsua.edu.ph");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("Dr. Maria Elena Santos");
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Save current active professor profile in sessionStorage
    sessionStorage.setItem(
      "sp_user",
      JSON.stringify({
        name: name || "Dr. Maria Elena Santos",
        email: email || "mesantos@cbsua.edu.ph",
        role: "Supervising Professor",
        department: "College of Education",
      })
    );
    router.push("/sp/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-3">
          <Image
            src="/cbsua-logo.png"
            alt="CBSUA Seal Logo"
            width={76}
            height={76}
            className="w-20 h-20 object-contain drop-shadow-md"
            priority
          />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Supervising Professor Portal
        </h2>
        <p className="mt-1 text-center text-sm text-gray-600 font-medium">
          Central Bicol State University of Agriculture • College of Education
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <Shield className="w-5 h-5 text-cbsua-green shrink-0 mt-0.5" />
            <div className="text-xs text-green-900">
              <strong className="block font-semibold">Faculty & Coordinator Access Only</strong>
              Manage student teacher enrollments, deployment records, and cooperating teacher assignments.
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {isRegistering && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Full Name & Title
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cbsua-green focus:border-cbsua-green text-sm text-gray-900"
                  placeholder="e.g. Dr. Maria Elena Santos, LPT"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cbsua-green focus:border-cbsua-green text-sm text-gray-900"
                placeholder="name@cbsua.edu.ph"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cbsua-green focus:border-cbsua-green text-sm text-gray-900"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-cbsua-green font-medium hover:underline text-xs"
              >
                {isRegistering ? "← Already have an account? Sign In" : "+ Register New Professor Account"}
              </button>
              <span className="text-xs text-gray-400">CBSUA Auth</span>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-cbsua-green hover:bg-green-800 transition shadow-md hover:shadow-lg focus:outline-none"
            >
              <UserCheck className="w-4 h-4" />
              {isRegistering ? "Create Professor Account & Enter" : "Access Professor Dashboard"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-2.5 text-center text-xs text-gray-500">
            <Link
              href="/dean/login"
              className="font-bold text-amber-900 hover:text-amber-950 flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 py-1.5 rounded-lg border border-amber-200 transition"
            >
              🎓 Switch to Dean of College of Education Portal
            </Link>
            <Link
              href="/login"
              className="font-medium text-gray-600 hover:text-cbsua-green flex items-center justify-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4" />
              Switch to Student Intern Login Portal
            </Link>
            <Link href="/" className="hover:underline">
              ← Return to Main Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
