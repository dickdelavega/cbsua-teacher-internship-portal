"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  Users,
  GraduationCap,
  School,
  RefreshCw,
  PlusCircle,
  Search,
  LogOut,
  ChevronRight,
  BookOpen,
  X,
} from "lucide-react";
import { EDUCATION_PROGRAMS } from "@/lib/dean-service";

interface SupervisingProfessorAssignment {
  id: string;
  name: string;
  email: string;
  program: string;
  studentsCount: number;
  evaluatedStudentsCount: number;
  createdAt: string;
}

interface ProgramOverviewStat {
  program: string;
  shortCode: string;
  supervisingProfessorsCount: number;
  studentsCount: number;
  professors: { id: string; name: string; email: string }[];
}

export default function DeanDashboard() {
  const router = useRouter();

  const [dean, setDean] = useState({
    name: "Dr. Raquel M. Reapor, Ed.D.",
    email: "dean.education@cbsua.edu.ph",
    title: "Dean, College of Education",
    department: "College of Education - Office of the Dean",
  });

  const [professors, setProfessors] = useState<SupervisingProfessorAssignment[]>([]);
  const [programStats, setProgramStats] = useState<ProgramOverviewStat[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [totalCTs, setTotalCTs] = useState<number>(4);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal: Assign / Reassign Program
  const [assignModalProf, setAssignModalProf] = useState<SupervisingProfessorAssignment | null>(null);
  const [selectedNewProgram, setSelectedNewProgram] = useState<string>(EDUCATION_PROGRAMS[0]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignMsg, setAssignMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal: Appoint New Supervising Professor
  const [isAddProfOpen, setIsAddProfOpen] = useState(false);
  const [newProf, setNewProf] = useState({
    name: "",
    email: "",
    program: EDUCATION_PROGRAMS[0] as string,
    temporaryPassword: "password123",
  });
  const [isAddingProf, setIsAddingProf] = useState(false);
  const [addProfMsg, setAddProfMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchJson = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resProfs, resStats, resProfile] = await Promise.all([
        fetchJson("/api/dean/professors"),
        fetchJson("/api/dean/stats"),
        fetchJson("/api/dean/profile"),
      ]);

      if (resProfs?.success && Array.isArray(resProfs.data)) {
        setProfessors(resProfs.data);
      }
      if (resStats?.success && resStats.data) {
        setProgramStats(resStats.data.programStats || []);
        setTotalStudents(resStats.data.totalStudents || 0);
        setTotalCTs(resStats.data.totalCooperatingTeachers || 4);
      }
      if (resProfile?.success && resProfile.data) {
        setDean((prev) => ({ ...prev, ...resProfile.data }));
      }
    } catch (err) {
      console.error("Error loading dean data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const stored = sessionStorage.getItem("dean_user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setDean((prev) => ({
            ...prev,
            name: parsed.name || prev.name,
            email: parsed.email || prev.email,
          }));
        } catch {
          // ignore
        }
      }
      await loadData();
    };
    init();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("dean_user");
    router.push("/dean/login");
  };

  const handleAssignProgramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalProf) return;
    setIsAssigning(true);
    setAssignMsg(null);

    try {
      const res = await fetch("/api/dean/assign-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professorId: assignModalProf.id,
          program: selectedNewProgram,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setAssignMsg({
          type: "success",
          text: `Program successfully assigned to ${selectedNewProgram}!`,
        });
        setTimeout(() => {
          setAssignModalProf(null);
          setAssignMsg(null);
        }, 1200);
        await loadData();
      } else {
        setAssignMsg({ type: "error", text: data.error || "Failed to assign program." });
      }
    } catch {
      setAssignMsg({ type: "error", text: "Network error assigning program." });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAppointProfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingProf(true);
    setAddProfMsg(null);

    try {
      const res = await fetch("/api/dean/professors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProf),
      });
      const data = await res.json();

      if (data.success) {
        setAddProfMsg({
          type: "success",
          text: `Supervising Professor ${newProf.name} appointed to ${newProf.program}!`,
        });
        setNewProf({
          name: "",
          email: "",
          program: EDUCATION_PROGRAMS[0],
          temporaryPassword: "password123",
        });
        setTimeout(() => {
          setIsAddProfOpen(false);
          setAddProfMsg(null);
        }, 1200);
        await loadData();
      } else {
        setAddProfMsg({ type: "error", text: data.error || "Failed to appoint professor." });
      }
    } catch {
      setAddProfMsg({ type: "error", text: "Network error creating professor account." });
    } finally {
      setIsAddingProf(false);
    }
  };

  const filteredProfessors = professors.filter((p) => {
    const matchesProgram =
      selectedProgramFilter === "all" || p.program === selectedProgramFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.program.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesProgram && matchesSearch;
  });

  const getProgramBadgeStyle = (program: string) => {
    if (program.includes("Secondary")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (program.includes("Elementary")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Leadership Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/cbsua-logo.png"
              alt="CBSUA Seal Logo"
              width={42}
              height={42}
              className="w-10 h-10 object-contain drop-shadow"
              priority
            />
            <div>
              <div className="font-extrabold text-sm sm:text-base text-cbsua-green flex items-center gap-2">
                Office of the Dean • College of Education
                <span className="text-[10px] bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded-full uppercase border border-yellow-300">
                  Dean Governance
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {dean.name} • {dean.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/sp/dashboard"
              className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>View SP Portal</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-cbsua-green to-emerald-800 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/5 skew-x-12 pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-400 text-green-950 uppercase tracking-wider mb-3">
              <Award className="w-3 h-3" />
              Degree Program Governance Authority
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Supervising Professor Oversight & Program Appointments
            </h1>
            <p className="mt-2 text-sm text-emerald-100 leading-relaxed">
              As Dean of the College of Education, oversee and appoint multiple Supervising Professors across the three core teacher education degree programs: <strong className="text-white">Secondary Education</strong>, <strong className="text-white">Elementary Education</strong>, and <strong className="text-white">Technology and Livelihood Education</strong>.
            </p>
          </div>
        </div>

        {/* Executive Metrics Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Supervising Professors
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-cbsua-green flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{professors.length}</div>
            <div className="text-xs text-slate-400 mt-1">Appointed faculty leads</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Education Programs
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-blue-700 mt-2">3</div>
            <div className="text-xs text-slate-400 mt-1">BSED • BEED • BTLEd</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Enrolled Interns
              </span>
              <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{totalStudents}</div>
            <div className="text-xs text-slate-400 mt-1">Across all 3 programs</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Cooperating Mentors
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <School className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-purple-700 mt-2">{totalCTs}</div>
            <div className="text-xs text-slate-400 mt-1">Active partner schools</div>
          </div>
        </div>

        {/* Program Cards: The 3 Programs */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Degree Programs & Supervising Professor Allocations
              </h2>
              <p className="text-xs text-slate-500">
                Multiple supervising professors can be assigned to each degree program.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {EDUCATION_PROGRAMS.map((progName) => {
              const stat = programStats.find((s) => s.program === progName);
              const count = stat ? stat.supervisingProfessorsCount : 0;
              const studentCount = stat ? stat.studentsCount : 0;
              const profsInProg = professors.filter((p) => p.program === progName);

              return (
                <div
                  key={progName}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-cbsua-green transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {stat?.shortCode || "PROGRAM"}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-base mt-2">
                          {progName}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-cbsua-green">{count}</span>
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                          Faculty Leads
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Enrolled Student Interns:</span>
                        <span className="font-bold text-slate-800">{studentCount} interns</span>
                      </div>

                      <div className="pt-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Assigned Professors:
                        </span>
                        {profsInProg.length === 0 ? (
                          <span className="text-slate-400 italic text-[11px]">No professor assigned yet</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {profsInProg.map((p) => (
                              <span
                                key={p.id}
                                className="inline-block text-[11px] bg-slate-50 text-slate-800 font-medium px-2 py-0.5 rounded border border-slate-200"
                              >
                                {p.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedProgramFilter(progName)}
                      className="text-xs font-bold text-cbsua-green hover:underline inline-flex items-center gap-1"
                    >
                      Filter this program roster
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Supervising Professor Management Table */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header & Filter Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Supervising Professor Roster & Program Assignment
              </h2>
              <p className="text-xs text-slate-500">
                Assign and reassign supervising professors to your teacher education programs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setIsAddProfOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-cbsua-green hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                Appoint Supervising Professor
              </button>

              <button
                onClick={loadData}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition"
                title="Refresh Roster"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search professor name, email, or program..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-800"
              />
            </div>

            {/* Program Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto text-xs font-semibold">
              <button
                onClick={() => setSelectedProgramFilter("all")}
                className={`px-3 py-1.5 rounded-md transition ${
                  selectedProgramFilter === "all"
                    ? "bg-cbsua-green text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                All Programs ({professors.length})
              </button>
              {EDUCATION_PROGRAMS.map((prog) => {
                const count = professors.filter((p) => p.program === prog).length;
                const short =
                  prog === "Bachelor of Secondary Education"
                    ? "BSED"
                    : prog === "Bachelor of Elementary Education"
                    ? "BEED"
                    : "BTLEd";

                return (
                  <button
                    key={prog}
                    onClick={() => setSelectedProgramFilter(prog)}
                    className={`px-3 py-1.5 rounded-md transition ${
                      selectedProgramFilter === prog
                        ? "bg-cbsua-green text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {short} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Supervising Professor</th>
                  <th className="py-3 px-4">Assigned Degree Program</th>
                  <th className="py-3 px-4 text-center">Student Interns</th>
                  <th className="py-3 px-4 text-center">CT Appraisals</th>
                  <th className="py-3 px-4 text-right">Dean Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProfessors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      No supervising professors found for this filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProfessors.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{p.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md border ${getProgramBadgeStyle(
                            p.program
                          )}`}
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          {p.program}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-extrabold text-slate-800 text-sm">
                          {p.studentsCount}
                        </span>
                        <span className="block text-[10px] text-slate-400">interns</span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-extrabold text-emerald-700 text-sm">
                          {p.evaluatedStudentsCount}
                        </span>
                        <span className="block text-[10px] text-slate-400">completed</span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setAssignModalProf(p);
                            setSelectedNewProgram(p.program || EDUCATION_PROGRAMS[0]);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-cbsua-green hover:text-white text-slate-700 text-xs font-bold rounded-lg transition"
                        >
                          <span>Assign Program</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modal: Assign / Reassign Program */}
      {assignModalProf && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-cbsua-green" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Assign Program for Faculty
                </h3>
              </div>
              <button
                onClick={() => setAssignModalProf(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Target Supervising Professor
              </div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                {assignModalProf.name}
              </div>
              <div className="text-xs text-slate-500 font-mono">{assignModalProf.email}</div>
            </div>

            {assignMsg && (
              <div
                className={`mb-4 p-3 rounded-lg text-xs font-semibold ${
                  assignMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {assignMsg.text}
              </div>
            )}

            <form onSubmit={handleAssignProgramSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Degree Program Assignment
                </label>
                <div className="space-y-2">
                  {EDUCATION_PROGRAMS.map((prog) => (
                    <label
                      key={prog}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                        selectedNewProgram === prog
                          ? "bg-emerald-50/70 border-cbsua-green text-emerald-950 font-bold"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="educationProgram"
                        value={prog}
                        checked={selectedNewProgram === prog}
                        onChange={(e) => setSelectedNewProgram(e.target.value)}
                        className="mt-0.5 text-cbsua-green focus:ring-cbsua-green"
                      />
                      <div>
                        <div>{prog}</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                          Multiple supervising professors can lead this program
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssignModalProf(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-cbsua-green hover:bg-emerald-800 transition shadow-sm"
                >
                  {isAssigning ? "Saving..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Appoint New Supervising Professor */}
      {isAddProfOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-cbsua-green" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Appoint Supervising Professor
                </h3>
              </div>
              <button
                onClick={() => setIsAddProfOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addProfMsg && (
              <div
                className={`my-3 p-3 rounded-lg text-xs font-semibold ${
                  addProfMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {addProfMsg.text}
              </div>
            )}

            <form onSubmit={handleAppointProfSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Professor Full Name & Academic Degree
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Clarissa T. Ocampo"
                  value={newProf.name}
                  onChange={(e) => setNewProf({ ...newProf, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Institutional CBSUA Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@cbsua.edu.ph"
                  value={newProf.email}
                  onChange={(e) => setNewProf({ ...newProf, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Assigned Degree Program
                </label>
                <select
                  value={newProf.program}
                  onChange={(e) => setNewProf({ ...newProf, program: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900"
                >
                  {EDUCATION_PROGRAMS.map((prog) => (
                    <option key={prog} value={prog}>
                      {prog}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Temporary Password
                </label>
                <input
                  type="text"
                  required
                  value={newProf.temporaryPassword}
                  onChange={(e) => setNewProf({ ...newProf, temporaryPassword: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900 font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProfOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingProf}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-cbsua-green hover:bg-emerald-800 transition shadow-sm"
                >
                  {isAddingProf ? "Appointing..." : "Appoint Faculty"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
