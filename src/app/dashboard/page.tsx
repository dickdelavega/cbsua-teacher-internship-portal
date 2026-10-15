"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  CheckCircle,
  School,
  User,
  BookOpen,
  AlertCircle,
  Star,
  Edit3,
  Award,
  KeyRound,
  Lock,
  X,
} from "lucide-react";

export default function Dashboard() {
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Student Change Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordValues, setShowPasswordValues] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordMsg, setChangePasswordMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const sessionStudentId =
      typeof window !== "undefined" ? sessionStorage.getItem("cbsua_student_id") : null;
    const url = sessionStudentId
      ? `/api/student/profile?studentId=${encodeURIComponent(sessionStudentId)}`
      : "/api/student/profile";

    fetch(url)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setStudent(res.data);
        }
      })
      .catch((err) => console.error("Error fetching student profile", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    if (newPassword.length < 6) {
      setChangePasswordMsg({
        type: "error",
        text: "New password must be at least 6 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    setIsChangingPassword(true);
    setChangePasswordMsg(null);

    try {
      const res = await fetch("/api/student/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIdentifier: student.studentId,
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setChangePasswordMsg({
          type: "success",
          text: "Password updated successfully!",
        });
        setTimeout(() => {
          setShowPasswordModal(false);
          setChangePasswordMsg(null);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }, 1500);
      } else {
        setChangePasswordMsg({
          type: "error",
          text: data.error || "Failed to change password.",
        });
      }
    } catch (err) {
      setChangePasswordMsg({
        type: "error",
        text: "Network error while changing password.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-cbsua-green text-white py-3.5 px-6 sm:px-8 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <Image
            src="/cbsua-logo.png"
            alt="CBSUA Logo"
            width={42}
            height={42}
            className="w-10 h-10 object-contain drop-shadow"
            priority
          />
          <div>
            <span className="font-bold text-base sm:text-lg tracking-wide block leading-tight">
              Student Teacher Evaluation System
            </span>
            <span className="text-xs text-yellow-300 font-medium">Intern Portal • STES</span>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
          <span className="hidden md:inline font-medium text-green-100">
            Welcome, {student ? student.name : "Pre-Service Teacher"}
          </span>
          <button
            type="button"
            onClick={() => {
              setShowPasswordModal(true);
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setChangePasswordMsg(null);
            }}
            className="bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1.5 text-xs text-white"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change Password</span>
            <span className="sm:hidden">Password</span>
          </button>
          <Link
            href="/"
            className="bg-green-800 hover:bg-green-700 px-3 py-1.5 rounded-lg transition font-semibold"
          >
            Logout
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-8 sm:py-10 px-4 sm:px-6">
        {/* Student Intern Profile & Assignment Status Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="text-xs uppercase font-bold text-cbsua-green tracking-wider mb-1">
                Internship Profile
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {student ? student.name : "Pre-Service Teacher Intern"}
              </h2>
              <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                <span>Student ID: <strong className="text-slate-700">{student ? student.studentId : "2021-10492"}</strong></span>
                {student?.username && (
                  <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold text-[11px]">
                    @{student.username}
                  </span>
                )}
                <span>• {student ? student.program : "BSED - Major in English"}</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-xs text-green-900">
              <span className="font-bold block">Supervising Professor:</span>
              <span>Dr. Maria Elena Santos (College of Education)</span>
            </div>
          </div>

          <div className="pt-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Assigned Cooperating Teacher (CT)
            </h3>
            {student?.ct ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-cbsua-green" />
                    {student.ct.name}
                  </div>
                  <div className="text-xs text-slate-600 flex items-center gap-2">
                    <School className="w-3.5 h-3.5 text-slate-400" />
                    <span>School: <strong>{student.ct.school}</strong></span>
                  </div>
                  <div className="text-xs text-amber-700 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                    <span>Grade Level: <strong>{student.ct.gradeLevel}</strong></span>
                  </div>
                </div>

                <div className="shrink-0 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-300">
                  Assigned by Supervising Professor
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800 text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Cooperating Teacher not yet assigned. Your Supervising Professor will assign you to a
                  partner school mentor shortly.
                </span>
              </div>
            )}
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">Evaluation Tasks</h2>
        <p className="text-slate-600 text-sm mb-6">
          Please complete your required appraisal tools for your Cooperating Teacher and Supervising
          Professor.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CT Evaluation Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="bg-blue-50 border-b border-blue-100 p-5 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full mb-2 inline-block border border-blue-200">
                    REQUIRED APPRISAL
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">Cooperating Teacher</h3>
                  <p className="text-xs text-slate-500">Mentoring & Support Appraisal Tool (7 Domains)</p>
                </div>
                <FileText className="text-blue-500 w-8 h-8" />
              </div>
              <div className="p-5 text-sm text-slate-600">
                Evaluate the performance and mentoring provided by your Cooperating Teacher in Content
                Knowledge, Learning Environment, Diversity of Learners, Curriculum, Assessment, Community
                Linkages, and Personal Growth.
              </div>
              {student?.ct ? (
                <div className="mx-5 mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-emerald-900 block">Assigned Cooperating Teacher:</span>
                      <div className="text-slate-800 font-semibold mt-0.5">{student.ct.name}</div>
                      <div className="text-slate-500 text-[11px]">{student.ct.school} • {student.ct.gradeLevel}</div>
                    </div>
                    {student?.evaluationCT ? (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        ✓ Evaluated
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                        Pending Rating
                      </span>
                    )}
                  </div>

                  {student?.evaluationCT && (
                    <div className="mt-3 pt-2.5 border-t border-emerald-200/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                          ⭐ Total Rating Given:
                        </span>
                        <span className="font-extrabold text-cbsua-green text-sm">
                          {Number(student.evaluationCT.rating.average).toFixed(2)} / 5.00
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-medium">
                        Rating Standard: {student.evaluationCT.rating.descriptor}
                      </div>
                      {student.evaluationCT.comments && (
                        <div className="mt-1 text-[11px] text-slate-600 italic bg-white/70 p-2 rounded border border-emerald-100 line-clamp-2">
                          &ldquo;{student.evaluationCT.comments}&rdquo;
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mx-5 mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  <span className="font-bold block">Pending CT Assignment</span>
                  Waiting for Supervising Professor to assign your mentor.
                </div>
              )}
            </div>
            <div className="p-5 pt-0">
              {student?.evaluationCT ? (
                <div className="flex gap-2">
                  <Link
                    href="/evaluations/ct"
                    className="flex-1 text-center font-bold py-2.5 px-3 rounded-xl transition shadow-xs text-xs sm:text-sm bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center gap-1.5"
                  >
                    <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                    View Total Rating ({Number(student.evaluationCT.rating.average).toFixed(2)})
                  </Link>
                  <Link
                    href="/evaluations/ct?edit=1"
                    className="text-center font-bold py-2.5 px-3 rounded-xl transition shadow-xs text-xs sm:text-sm bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1 shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Rating
                  </Link>
                </div>
              ) : (
                <Link
                  href="/evaluations/ct"
                  className="block w-full text-center font-bold py-2.5 rounded-xl transition shadow-xs text-sm bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {!student?.ct ? "Open CT Appraisal Form →" : `Evaluate ${student.ct.name} →`}
                </Link>
              )}
            </div>
          </div>

          {/* SP Evaluation Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="bg-emerald-50 border-b border-emerald-100 p-5 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full mb-2 inline-block border border-emerald-200">
                    REQUIRED APPRISAL
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">Supervising Professor</h3>
                  <p className="text-xs text-slate-500">Deployment Activities Appraisal Tool (3 Phases)</p>
                </div>
                <FileText className="text-cbsua-green w-8 h-8" />
              </div>
              <div className="p-5 text-sm text-slate-600">
                Evaluate the support, supervision, and mentoring provided by your Supervising Professor
                during Pre-Deployment, Deployment, and Post-Deployment phases.
              </div>
            </div>
            <div className="p-5 pt-0">
              <Link
                href="/evaluations/sp"
                className="block w-full text-center bg-cbsua-green hover:bg-green-800 text-white font-bold py-2.5 rounded-xl transition shadow-xs text-sm"
              >
                Start SP Evaluation →
              </Link>
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="bg-gradient-to-r from-cbsua-green to-emerald-900 text-white p-5 relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setChangePasswordMsg(null);
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
                <h3 className="text-lg font-bold">Change Your Password</h3>
                <p className="text-green-100 text-xs mt-0.5">
                  Update your personal login password for the student intern portal.
                </p>
              </div>

              <div className="p-6">
                {changePasswordMsg && (
                  <div
                    className={`mb-4 p-3.5 rounded-xl text-xs font-semibold ${
                      changePasswordMsg.type === "success"
                        ? "bg-green-50 text-green-900 border border-green-200"
                        : "bg-red-50 text-red-900 border border-red-200"
                    }`}
                  >
                    {changePasswordMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswordValues ? "text" : "password"}
                        required
                        placeholder="Enter your current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-14 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordValues(!showPasswordValues)}
                        className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-700 font-semibold"
                      >
                        {showPasswordValues ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      New Password *
                    </label>
                    <input
                      type={showPasswordValues ? "text" : "password"}
                      required
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type={showPasswordValues ? "text" : "password"}
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-900"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setChangePasswordMsg(null);
                      }}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-cbsua-green hover:bg-green-800 transition shadow-md disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {isChangingPassword ? "Saving..." : "Update Password"}
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
