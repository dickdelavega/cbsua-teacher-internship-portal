"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  School,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  PlusCircle,
  BookOpen,
  Star,
  MessageSquare,
  Eye,
  X,
  Award,
  Sparkles,
  KeyRound,
  Lock,
} from "lucide-react";

interface EvaluationCT {
  id: string;
  teacherName: string;
  schoolName: string;
  responses: Record<string, string>;
  comments: string | null;
  rating: {
    average: number;
    totalQuestions: number;
    descriptor: string;
  };
  createdAt: string;
}

interface CooperatingTeacher {
  id: string;
  name: string;
  school: string;
  gradeLevel: string;
}

interface Student {
  id: string;
  studentId: string;
  username?: string | null;
  name: string;
  program: string;
  spId?: string | null;
  ctId?: string | null;
  ct?: CooperatingTeacher | null;
  evaluationCT?: EvaluationCT | null;
  createdAt?: string;
}

export default function SupervisingProfessorDashboard() {
  const router = useRouter();
  const [professor, setProfessor] = useState({
    name: "Dr. Maria Elena Santos",
    email: "mesantos@cbsua.edu.ph",
    department: "College of Education - Department of Teacher Internship",
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [cooperatingTeachers, setCooperatingTeachers] = useState<CooperatingTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "assigned" | "unassigned">("all");

  // Enroll Student Form State
  const [newStudent, setNewStudent] = useState({
    studentId: "",
    username: "",
    name: "",
    program: "BSED - Major in English",
    temporaryPassword: "",
    ctId: "",
  });
  const [showTempPass, setShowTempPass] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // SP Password Reset Modal State
  const [passwordResetStudent, setPasswordResetStudent] = useState<Student | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [confirmPasswordVal, setConfirmPasswordVal] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Add Cooperating Teacher Form State
  const [newCT, setNewCT] = useState({
    name: "",
    school: "",
    gradeLevel: "",
  });
  const [isAddingCT, setIsAddingCT] = useState(false);
  const [ctMsg, setCtMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"students" | "teachers" | "enroll">("students");

  // Selected Student for Full Appraisal Modal
  const [selectedAppraisalStudent, setSelectedAppraisalStudent] = useState<Student | null>(null);

  // Appraisal Stats Computations
  const evaluatedCount = students.filter((s) => s.evaluationCT).length;
  const ratingsWithValues = students
    .map((s) => s.evaluationCT?.rating?.average)
    .filter((r): r is number => typeof r === "number" && r > 0);
  const avgRatingOverall =
    ratingsWithValues.length > 0
      ? (ratingsWithValues.reduce((sum, r) => sum + r, 0) / ratingsWithValues.length).toFixed(2)
      : null;

  useEffect(() => {
    // Check local session
    const stored = sessionStorage.getItem("sp_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setProfessor((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          email: parsed.email || prev.email,
        }));
      } catch (e) {
        // ignore
      }
    }
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resStudents, resCTs, resProf] = await Promise.all([
        fetch("/api/sp/students").then((r) => r.json()),
        fetch("/api/sp/cooperating-teachers").then((r) => r.json()),
        fetch("/api/sp/profile").then((r) => r.json()).catch(() => null),
      ]);

      if (resStudents?.success) setStudents(resStudents.data);
      if (resCTs?.success) setCooperatingTeachers(resCTs.data);
      if (resProf?.success && resProf?.data) {
        setProfessor((prev) => ({ ...prev, ...resProf.data }));
      }
    } catch (err) {
      console.error("Error loading dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEnrolling(true);
    setEnrollMsg(null);

    try {
      const res = await fetch("/api/sp/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      });
      const data = await res.json();

      if (data.success) {
        setEnrollMsg({ type: "success", text: `Student ${newStudent.name} successfully enrolled!` });
        setNewStudent({
          studentId: "",
          username: "",
          name: "",
          program: "BSED - Major in English",
          temporaryPassword: "",
          ctId: "",
        });
        loadData();
      } else {
        setEnrollMsg({ type: "error", text: data.error || "Failed to enroll student." });
      }
    } catch (err) {
      setEnrollMsg({ type: "error", text: "Network error during student enrollment." });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetStudent) return;

    if (newPasswordVal.length < 6) {
      setResetMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    if (newPasswordVal !== confirmPasswordVal) {
      setResetMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    setIsResettingPassword(true);
    setResetMsg(null);

    try {
      const res = await fetch("/api/sp/students/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIdentifier: passwordResetStudent.studentId,
          newPassword: newPasswordVal,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setResetMsg({
          type: "success",
          text: `Password successfully updated for ${passwordResetStudent.name}.`,
        });
        setTimeout(() => {
          setPasswordResetStudent(null);
          setResetMsg(null);
          setNewPasswordVal("");
          setConfirmPasswordVal("");
        }, 1500);
      } else {
        setResetMsg({ type: "error", text: data.error || "Failed to update password." });
      }
    } catch (err) {
      setResetMsg({ type: "error", text: "Network error while updating password." });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleAddCTSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingCT(true);
    setCtMsg(null);

    try {
      const res = await fetch("/api/sp/cooperating-teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCT),
      });
      const data = await res.json();

      if (data.success) {
        setCtMsg({
          type: "success",
          text: `Cooperating Teacher ${newCT.name} registered successfully!`,
        });
        setNewCT({ name: "", school: "", gradeLevel: "" });
        loadData();
      } else {
        setCtMsg({ type: "error", text: data.error || "Failed to register teacher." });
      }
    } catch (err) {
      setCtMsg({ type: "error", text: "Network error during teacher registration." });
    } finally {
      setIsAddingCT(false);
    }
  };

  const handleAssignChange = async (studentId: string, ctId: string) => {
    try {
      const res = await fetch("/api/sp/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, ctId: ctId || null }),
      });
      const data = await res.json();
      if (data.success) {
        // Optimistic / update state
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id === studentId || s.studentId === studentId) {
              const matchedCT = cooperatingTeachers.find((ct) => ct.id === ctId) || null;
              return { ...s, ctId: ctId || null, ct: matchedCT };
            }
            return s;
          })
        );
      } else {
        alert("Assignment failed: " + data.error);
      }
    } catch (err) {
      alert("Error saving assignment.");
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.ct && s.ct.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.ct && s.ct.school.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatus === "assigned") return !!s.ctId;
    if (filterStatus === "unassigned") return !s.ctId;
    return true;
  });

  const assignedCount = students.filter((s) => s.ctId).length;
  const unassignedCount = students.length - assignedCount;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
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
              <div className="font-bold text-sm sm:text-base text-cbsua-green flex items-center gap-2">
                CBSUA Supervising Professor Portal
                <span className="text-[10px] bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded-full uppercase border border-yellow-300">
                  Faculty Lead
                </span>
              </div>
              <div className="text-xs text-slate-500">Student Teacher Internship Management</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <div className="text-sm font-bold text-slate-800">{professor.name}</div>
              <div className="text-xs text-slate-500">{professor.email}</div>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem("sp_user");
                router.push("/sp/login");
              }}
              className="text-xs font-semibold text-slate-600 hover:text-red-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Hero / Faculty Profile Banner */}
        <div className="bg-gradient-to-r from-cbsua-green via-green-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden mb-8">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-yellow-300 text-xs font-semibold mb-3 border border-white/10">
                <GraduationCap className="w-3.5 h-3.5" />
                Teaching Internship Program Coordinator
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {professor.name}
              </h1>
              <p className="text-green-100 text-sm mt-1 max-w-2xl">
                Manage pre-service teacher deployment, enroll eligible intern students, and assign them
                to qualified Cooperating Teachers across accredited partner DepEd schools.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveTab("enroll")}
                className="bg-cbsua-yellow text-green-950 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-yellow-400 transition flex items-center gap-2 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Enroll Student
              </button>
              <button
                onClick={() => setActiveTab("teachers")}
                className="bg-white/15 hover:bg-white/25 text-white font-semibold text-sm px-4 py-2.5 rounded-xl border border-white/20 transition flex items-center gap-2"
              >
                <School className="w-4 h-4" />
                Add Cooperating Teacher
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Enrolled Students
              </span>
              <div className="w-8 h-8 rounded-lg bg-green-50 text-cbsua-green flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800 mt-2">{students.length}</div>
            <div className="text-xs text-slate-400 mt-1">Pre-service teacher interns</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Assigned to CT
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-700 mt-2">{assignedCount}</div>
            <div className="text-xs text-slate-400 mt-1">Active deployment confirmed</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Awaiting Placement
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-amber-600 mt-2">{unassignedCount}</div>
            <div className="text-xs text-slate-400 mt-1">Require cooperating mentor</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Cooperating Teachers
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <School className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-blue-700 mt-2">
              {cooperatingTeachers.length}
            </div>
            <div className="text-xs text-slate-400 mt-1">Identified across schools</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                CT Appraisals
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-800 mt-2">
              {evaluatedCount}
              <span className="text-sm font-semibold text-slate-400 ml-1">/ {students.length}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {avgRatingOverall ? (
                <span className="text-amber-700 font-bold">⭐ {avgRatingOverall} / 5.00 avg</span>
              ) : (
                <span className="text-slate-400">No evaluations yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 gap-2">
          <button
            onClick={() => setActiveTab("students")}
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition ${
              activeTab === "students"
                ? "border-cbsua-green text-cbsua-green"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Internship Student Roster & Assignments ({students.length})
          </button>

          <button
            onClick={() => setActiveTab("teachers")}
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition ${
              activeTab === "teachers"
                ? "border-cbsua-green text-cbsua-green"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <School className="w-4 h-4" />
            Cooperating Teachers Directory ({cooperatingTeachers.length})
          </button>

          <button
            onClick={() => setActiveTab("enroll")}
            className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition ${
              activeTab === "enroll"
                ? "border-cbsua-green text-cbsua-green"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Enrollment Form
          </button>
        </div>

        {/* TAB 1: STUDENTS ROSTER & ASSIGNMENT */}
        {activeTab === "students" && (
          <div className="space-y-6">
            {/* Filter & Action Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="flex-1 w-full relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search student name, ID number, program, cooperating teacher, or school..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-800"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
                  <button
                    onClick={() => setFilterStatus("all")}
                    className={`px-3 py-1.5 rounded-md transition ${
                      filterStatus === "all" ? "bg-white text-cbsua-green shadow-xs" : ""
                    }`}
                  >
                    All ({students.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus("assigned")}
                    className={`px-3 py-1.5 rounded-md transition ${
                      filterStatus === "assigned" ? "bg-white text-cbsua-green shadow-xs" : ""
                    }`}
                  >
                    Assigned ({assignedCount})
                  </button>
                  <button
                    onClick={() => setFilterStatus("unassigned")}
                    className={`px-3 py-1.5 rounded-md transition ${
                      filterStatus === "unassigned" ? "bg-white text-cbsua-green shadow-xs" : ""
                    }`}
                  >
                    Unassigned ({unassignedCount})
                  </button>
                </div>

                <button
                  onClick={loadData}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
                  title="Refresh Roster"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Student ID & Name</th>
                      <th className="py-3.5 px-4">Degree Program</th>
                      <th className="py-3.5 px-4">Cooperating Teacher Details</th>
                      <th className="py-3.5 px-4">CT Rating & Intern Feedback</th>
                      <th className="py-3.5 px-4">Assignment Action</th>
                      <th className="py-3.5 px-4">Account Security</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          No student interns found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-900">{st.name}</div>
                            <div className="text-xs font-mono text-slate-500">{st.studentId}</div>
                            {st.username && (
                              <div className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1 mt-1 font-semibold">
                                <span>@{st.username}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <span className="inline-block bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200">
                              {st.program}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            {st.ct ? (
                              <div className="space-y-1">
                                <div className="font-semibold text-cbsua-green flex items-center gap-1.5">
                                  <Briefcase className="w-3.5 h-3.5 text-cbsua-green shrink-0" />
                                  {st.ct.name}
                                </div>
                                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                                  <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{st.ct.school}</span>
                                </div>
                                <div className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block font-medium border border-amber-200">
                                  {st.ct.gradeLevel}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 w-max">
                                <Clock className="w-3.5 h-3.5" />
                                Not Yet Assigned
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            {st.evaluationCT ? (
                              <div className="space-y-1.5 max-w-xs">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-300 font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                    {st.evaluationCT.rating.average.toFixed(2)} / 5.00
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                    {st.evaluationCT.rating.descriptor}
                                  </span>
                                </div>

                                {st.evaluationCT.comments ? (
                                  <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 italic line-clamp-2">
                                    &ldquo;{st.evaluationCT.comments}&rdquo;
                                  </p>
                                ) : (
                                  <p className="text-[11px] text-slate-400 italic">No written comment</p>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setSelectedAppraisalStudent(st)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-cbsua-green hover:text-green-800 hover:underline"
                                >
                                  <Eye className="w-3 h-3" />
                                  View Full Appraisal
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-slate-400 text-xs italic">
                                <Clock className="w-3.5 h-3.5 text-slate-300" />
                                Pending evaluation
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <select
                                value={st.ctId || ""}
                                onChange={(e) => handleAssignChange(st.id, e.target.value)}
                                className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-cbsua-green font-medium max-w-[220px]"
                              >
                                <option value="">-- Choose Cooperating Teacher --</option>
                                {cooperatingTeachers.map((ct) => (
                                  <option key={ct.id} value={ct.id}>
                                    {ct.name} ({ct.school} • {ct.gradeLevel})
                                  </option>
                                ))}
                              </select>

                              {st.ctId && (
                                <button
                                  onClick={() => handleAssignChange(st.id, "")}
                                  className="text-xs text-red-500 hover:text-red-700 hover:underline shrink-0"
                                  title="Unassign Teacher"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setPasswordResetStudent(st);
                                setNewPasswordVal("");
                                setConfirmPasswordVal("");
                                setResetMsg(null);
                                setShowNewPassword(false);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 transition shadow-2xs"
                              title="Set or reset student password"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                              Change Password
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COOPERATING TEACHERS DIRECTORY */}
        {activeTab === "teachers" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Add Cooperating Teacher Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
              <div className="flex items-center gap-2.5 mb-2 text-cbsua-green">
                <PlusCircle className="w-5 h-5" />
                <h2 className="text-lg font-bold text-slate-900">Add Cooperating Teacher</h2>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Register a partner school mentor who will supervise and evaluate student interns.
              </p>

              {ctMsg && (
                <div
                  className={`mb-4 p-3 rounded-lg text-xs font-semibold ${
                    ctMsg.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {ctMsg.text}
                </div>
              )}

              <form onSubmit={handleAddCTSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Full Name & Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mrs. Rochelle B. Alvarez, LPT"
                    value={newCT.name}
                    onChange={(e) => setNewCT({ ...newCT, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900"
                  />
                  <span className="text-[11px] text-slate-400">Complete legal name with title</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cooperating School *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pili National High School"
                    value={newCT.school}
                    onChange={(e) => setNewCT({ ...newCT, school: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900"
                  />
                  <span className="text-[11px] text-slate-400">Assigned DepEd or laboratory school</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Grade Level & Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grade 10 - English & Literature"
                    value={newCT.gradeLevel}
                    onChange={(e) => setNewCT({ ...newCT, gradeLevel: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900"
                  />
                  <span className="text-[11px] text-slate-400">Level and subject of mentorship</span>
                </div>

                <button
                  type="submit"
                  disabled={isAddingCT}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-cbsua-green hover:bg-green-800 transition shadow-sm disabled:opacity-50"
                >
                  {isAddingCT ? "Registering..." : "Save Cooperating Teacher"}
                </button>
              </form>
            </div>

            {/* Right: List of Cooperating Teachers */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Registered Cooperating Teachers ({cooperatingTeachers.length})
                </h3>
                <span className="text-xs text-slate-500">
                  Identified by Full Name, School, and Grade Level
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cooperatingTeachers.map((ct) => {
                  const assignedStudents = students.filter((s) => s.ctId === ct.id);
                  const ctEvaluations = assignedStudents
                    .map((s) => s.evaluationCT)
                    .filter((e): e is EvaluationCT => !!e);
                  const ctAvg =
                    ctEvaluations.length > 0
                      ? (
                          ctEvaluations.reduce((sum, e) => sum + e.rating.average, 0) /
                          ctEvaluations.length
                        ).toFixed(2)
                      : null;

                  return (
                    <div
                      key={ct.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-cbsua-green transition"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-slate-900 text-base leading-snug">
                            {ct.name}
                          </h4>
                          <span className="shrink-0 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                            {assignedStudents.length} Intern{assignedStudents.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {ctAvg ? (
                          <div className="mb-3 inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>{ctAvg} / 5.00</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({ctEvaluations.length} evaluation{ctEvaluations.length !== 1 ? "s" : ""})
                            </span>
                          </div>
                        ) : (
                          <div className="mb-3 inline-flex items-center gap-1 text-[11px] text-slate-400 italic">
                            <Clock className="w-3 h-3" />
                            <span>No evaluations submitted yet</span>
                          </div>
                        )}

                        <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                          <div className="flex items-center gap-2">
                            <School className="w-4 h-4 text-cbsua-green shrink-0" />
                            <span className="font-medium text-slate-800">{ct.school}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                            <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {ct.gradeLevel}
                            </span>
                          </div>
                        </div>

                        {/* Recent Comments Snippet */}
                        {ctEvaluations.some((e) => e.comments) && (
                          <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              <MessageSquare className="w-3 h-3 text-cbsua-green" />
                              Recent Intern Feedback
                            </div>
                            {ctEvaluations
                              .filter((e) => e.comments)
                              .slice(0, 1)
                              .map((ev) => (
                                <p key={ev.id} className="italic text-slate-600 text-xs line-clamp-2">
                                  &ldquo;{ev.comments}&rdquo;
                                </p>
                              ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 text-xs mt-3">
                        <span className="font-semibold text-slate-500 block mb-1">
                          Assigned Student Interns:
                        </span>
                        {assignedStudents.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {assignedStudents.map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  if (s.evaluationCT) setSelectedAppraisalStudent(s);
                                }}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                                  s.evaluationCT
                                    ? "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 cursor-pointer"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                                title={
                                  s.evaluationCT
                                    ? `Rated ${s.evaluationCT.rating.average}/5.00 - Click to view`
                                    : "Pending evaluation"
                                }
                              >
                                {s.name}
                                {s.evaluationCT && (
                                  <span className="ml-1 text-[10px] font-bold text-amber-700">
                                    ★ {s.evaluationCT.rating.average.toFixed(1)}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No students assigned yet</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ENROLL STUDENTS */}
        {activeTab === "enroll" && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2 text-cbsua-green">
              <UserPlus className="w-6 h-6" />
              <h2 className="text-xl font-bold text-slate-900">Enroll New Pre-Service Intern</h2>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Enter the student teacher&apos;s details to grant them access to the CBSUA Internship
              Portal and assign them to a Cooperating Teacher.
            </p>

            {enrollMsg && (
              <div
                className={`mb-6 p-4 rounded-xl text-sm font-semibold ${
                  enrollMsg.type === "success"
                    ? "bg-green-50 text-green-900 border border-green-200"
                    : "bg-red-50 text-red-900 border border-red-200"
                }`}
              >
                {enrollMsg.text}
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Student ID Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2021-10492"
                    value={newStudent.studentId}
                    onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Portal Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. jdelacruz"
                    value={newStudent.username}
                    onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Student uses this or their Student ID to log in.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Juan Dela Cruz"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Temporary Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showTempPass ? "text" : "password"}
                      required
                      placeholder="Min. 6 characters"
                      value={newStudent.temporaryPassword}
                      onChange={(e) => setNewStudent({ ...newStudent, temporaryPassword: e.target.value })}
                      className="w-full px-4 py-2.5 pr-14 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTempPass(!showTempPass)}
                      className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-700 font-semibold"
                    >
                      {showTempPass ? "Hide" : "Show"}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Assigned for first login. Student can change it afterwards.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Degree Program / Specialization *
                </label>
                <select
                  value={newStudent.program}
                  onChange={(e) => setNewStudent({ ...newStudent, program: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900 font-medium"
                >
                  <option value="BSED - Major in English">BSED - Major in English</option>
                  <option value="BSED - Major in Mathematics">BSED - Major in Mathematics</option>
                  <option value="BSED - Major in General Science">BSED - Major in General Science</option>
                  <option value="BSED - Major in Social Studies">BSED - Major in Social Studies</option>
                  <option value="BSED - Major in Filipino">BSED - Major in Filipino</option>
                  <option value="BEED - Generalist">BEED - Generalist Elementary Education</option>
                  <option value="BTVTED - Food and Service Management">
                    BTVTED - Food and Service Management
                  </option>
                  <option value="BPEd - Bachelor of Physical Education">
                    BPEd - Bachelor of Physical Education
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Assign Cooperating Teacher (Optional at enrollment)
                </label>
                <select
                  value={newStudent.ctId}
                  onChange={(e) => setNewStudent({ ...newStudent, ctId: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900 font-medium"
                >
                  <option value="">-- Assign Later --</option>
                  {cooperatingTeachers.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name} — {ct.school} ({ct.gradeLevel})
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-400 mt-1 block">
                  You can also assign or modify Cooperating Teachers anytime from the Roster table.
                </span>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("students")}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEnrolling}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-cbsua-green hover:bg-green-800 transition shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {isEnrolling ? "Enrolling..." : "Enroll Student"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Appraisal Detail Modal */}
        {selectedAppraisalStudent && selectedAppraisalStudent.evaluationCT && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-cbsua-green to-emerald-900 text-white p-6 relative">
                <button
                  onClick={() => setSelectedAppraisalStudent(null)}
                  className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-yellow-300 text-xs font-semibold mb-2 border border-white/10">
                  <Award className="w-3.5 h-3.5" />
                  Official Appraisal Record
                </div>
                <h3 className="text-xl font-bold">Cooperating Teacher Performance Evaluation</h3>
                <p className="text-green-100 text-xs mt-1">
                  Evaluated by Intern: <span className="font-semibold text-white">{selectedAppraisalStudent.name}</span> ({selectedAppraisalStudent.studentId})
                </p>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Meta details & Overall Rating Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Evaluated Cooperating Teacher
                    </span>
                    <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-cbsua-green shrink-0" />
                      {selectedAppraisalStudent.evaluationCT.teacherName}
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <School className="w-4 h-4 text-slate-400 shrink-0" />
                      {selectedAppraisalStudent.evaluationCT.schoolName}
                    </div>
                    {selectedAppraisalStudent.ct?.gradeLevel && (
                      <div className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block font-medium border border-amber-200">
                        {selectedAppraisalStudent.ct.gradeLevel}
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                        Total Performance Rating
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-extrabold text-amber-900">
                          {selectedAppraisalStudent.evaluationCT.rating.average.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-amber-700">/ 5.00</span>
                      </div>
                      <div className="inline-block mt-1 bg-amber-200/60 text-amber-950 font-bold text-xs px-2.5 py-0.5 rounded-full border border-amber-300">
                        {selectedAppraisalStudent.evaluationCT.rating.descriptor}
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Submitted on: {new Date(selectedAppraisalStudent.evaluationCT.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* Qualitative Feedback / Comments */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-cbsua-green font-bold text-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>Intern&apos;s Qualitative Comments & Suggestions</span>
                  </div>
                  {selectedAppraisalStudent.evaluationCT.comments ? (
                    <blockquote className="p-4 bg-slate-50 rounded-xl border-l-4 border-cbsua-green text-sm text-slate-800 italic leading-relaxed">
                      &ldquo;{selectedAppraisalStudent.evaluationCT.comments}&rdquo;
                    </blockquote>
                  ) : (
                    <p className="text-sm text-slate-400 italic p-3 bg-slate-50 rounded-lg">
                      No additional written feedback provided by the student intern.
                    </p>
                  )}
                </div>

                {/* Question Coverage Info */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Total criteria items evaluated:{" "}
                      <strong className="text-slate-900">
                        {selectedAppraisalStudent.evaluationCT.rating.totalQuestions} items
                      </strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Compliant with DepEd / CBSUA Pre-Service Mentoring Standards
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedAppraisalStudent(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition"
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SP Change Student Password Modal */}
        {passwordResetStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-gradient-to-r from-cbsua-green to-emerald-900 text-white p-5 relative">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordResetStudent(null);
                    setResetMsg(null);
                  }}
                  className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-yellow-300 text-xs font-semibold mb-1 border border-white/10">
                  <KeyRound className="w-3.5 h-3.5" />
                  Account Security
                </div>
                <h3 className="text-lg font-bold">Change Student Password</h3>
                <p className="text-green-100 text-xs mt-0.5">
                  Update login password for <span className="font-semibold text-white">{passwordResetStudent.name}</span>
                </p>
              </div>

              <div className="p-6">
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 mb-5 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Student ID:</span>
                    <span className="font-mono font-bold text-slate-800">{passwordResetStudent.studentId}</span>
                  </div>
                  {passwordResetStudent.username && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Username:</span>
                      <span className="font-mono font-bold text-emerald-800">@{passwordResetStudent.username}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 italic flex items-start gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      For student privacy and security, current passwords are encrypted and cannot be viewed. Entering a new password will immediately overwrite their old password.
                    </span>
                  </div>
                </div>

                {resetMsg && (
                  <div
                    className={`mb-4 p-3.5 rounded-xl text-xs font-semibold ${
                      resetMsg.type === "success"
                        ? "bg-green-50 text-green-900 border border-green-200"
                        : "bg-red-50 text-red-900 border border-red-200"
                    }`}
                  >
                    {resetMsg.text}
                  </div>
                )}

                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="Min. 6 characters"
                        value={newPasswordVal}
                        onChange={(e) => setNewPasswordVal(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-14 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-700 font-semibold"
                      >
                        {showNewPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      placeholder="Re-enter new password"
                      value={confirmPasswordVal}
                      onChange={(e) => setConfirmPasswordVal(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordResetStudent(null);
                        setResetMsg(null);
                      }}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isResettingPassword}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-cbsua-green hover:bg-green-800 transition shadow-md disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      {isResettingPassword ? "Updating..." : "Save New Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
