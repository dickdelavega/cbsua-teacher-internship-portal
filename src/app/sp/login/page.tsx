"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { UserCheck, Shield, ArrowRight, GraduationCap, Lock, Mail, User, AlertCircle, Sparkles } from "lucide-react";

interface SeededProf {
  name: string;
  email: string;
  program: string;
  department: string;
  badgeColor: string;
}

const SEEDED_PROFESSORS: SeededProf[] = [
  {
    name: "Dr. Maria Elena Santos",
    email: "mesantos@cbsua.edu.ph",
    program: "Bachelor of Secondary Education",
    department: "Secondary Teaching & Internship",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
  },
  {
    name: "Prof. Roberto C. Mendoza, MAEd",
    email: "rmendoza@cbsua.edu.ph",
    program: "Bachelor of Secondary Education",
    department: "Secondary Teaching & Internship",
    badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  {
    name: "Dr. Clarissa T. Ocampo",
    email: "cocampo@cbsua.edu.ph",
    program: "Bachelor of Elementary Education",
    department: "Elementary Teacher Education",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    name: "Engr. Danilo V. Bautista, Ed.D.",
    email: "dbautista@cbsua.edu.ph",
    program: "Bachelor of Technology and Livelihood Education",
    department: "Technical & Livelihood Education",
    badgeColor: "bg-amber-50 text-amber-900 border-amber-200",
  },
];

export default function SupervisingProfessorLogin() {
  const [email, setEmail] = useState("mesantos@cbsua.edu.ph");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("");
  const [program, setProgram] = useState("Bachelor of Secondary Education");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleSelectDemoAccount = (prof: SeededProf) => {
    setEmail(prof.email);
    setPassword("password123");
    setName(prof.name);
    setProgram(prof.program);
    setErrorMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/sp/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          name: name.trim(),
          program: program.trim(),
          isRegistering,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Authentication failed.");
      }

      const prof = json.data;
      const sessionData = {
        id: prof.id,
        name: prof.name,
        email: prof.email,
        program: prof.program || "Bachelor of Secondary Education",
        department: prof.department || "College of Education",
        role: "Supervising Professor",
      };

      sessionStorage.setItem("sp_user", JSON.stringify(sessionData));
      localStorage.setItem("sp_user", JSON.stringify(sessionData));

      router.push("/sp/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
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
        <p className="text-xs text-slate-500 mt-1">
          Individual faculty accounts with program-specific intern assignments
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          <div className="mb-6 p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <Shield className="w-5 h-5 text-cbsua-green shrink-0 mt-0.5" />
            <div className="text-xs text-green-900">
              <strong className="block font-semibold">Faculty Authentication Required</strong>
              Each Supervising Professor logs in with their individual account to manage assigned student interns, evaluations, and cooperating teachers.
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            {isRegistering && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Full Name & Academic Title *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cbsua-green focus:border-cbsua-green text-sm text-gray-900"
                      placeholder="e.g. Dr. Maria Elena Santos, LPT"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Assigned Degree Program *
                  </label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cbsua-green focus:border-cbsua-green text-sm text-gray-900 font-medium"
                  >
                    <option value="Bachelor of Secondary Education">Bachelor of Secondary Education (BSED)</option>
                    <option value="Bachelor of Elementary Education">Bachelor of Elementary Education (BEED)</option>
                    <option value="Bachelor of Technology and Livelihood Education">Bachelor of Technology and Livelihood Education (BTLEd)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Institutional Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cbsua-green focus:border-cbsua-green text-sm text-gray-900"
                  placeholder="faculty@cbsua.edu.ph"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cbsua-green focus:border-cbsua-green text-sm text-gray-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMsg(null);
                }}
                className="text-cbsua-green font-semibold hover:underline"
              >
                {isRegistering ? "← Return to Faculty Sign In" : "+ Register New Professor Account"}
              </button>
              <span className="text-gray-400">CBSUA Auth Service</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-cbsua-green hover:bg-green-800 transition shadow-md hover:shadow-lg focus:outline-none disabled:opacity-60 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              {loading
                ? "Authenticating Faculty..."
                : isRegistering
                ? "Create Account & Enter Dashboard"
                : "Sign In to Professor Dashboard"}
            </button>
          </form>

          {/* Quick Demo Professor Selector */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cbsua-green" />
                Or Select Seeded Professor Account:
              </span>
              <span className="text-[11px] text-slate-400">Pass: password123</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SEEDED_PROFESSORS.map((prof) => {
                const isSelected = email.toLowerCase() === prof.email.toLowerCase();
                return (
                  <button
                    key={prof.email}
                    type="button"
                    onClick={() => handleSelectDemoAccount(prof)}
                    className={`text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-cbsua-green bg-green-50/80 shadow-xs ring-1 ring-cbsua-green"
                        : "border-slate-200 hover:border-cbsua-green/50 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900 leading-snug">{prof.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{prof.email}</div>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${prof.badgeColor}`}>
                        {prof.program.replace("Bachelor of ", "")}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-2 text-center text-xs text-gray-500">
            <Link
              href="/dean/login"
              className="font-bold text-amber-900 hover:text-amber-950 flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 py-2 rounded-xl border border-amber-200 transition"
            >
              🎓 Switch to Dean of College of Education Portal
            </Link>
            <Link
              href="/login"
              className="font-medium text-gray-600 hover:text-cbsua-green flex items-center justify-center gap-1.5 py-1"
            >
              <GraduationCap className="w-4 h-4" />
              Switch to Student Intern Login Portal
            </Link>
            <Link href="/" className="hover:underline text-slate-400">
              ← Return to Main Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
