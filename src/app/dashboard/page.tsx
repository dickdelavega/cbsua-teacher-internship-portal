"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FileText, CheckCircle, School, User, BookOpen, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <span className="hidden sm:inline font-medium text-green-100">
            Welcome, {student ? student.name : "Pre-Service Teacher"}
          </span>
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
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Student ID: {student ? student.studentId : "2021-10492"} •{" "}
                {student ? student.program : "BSED - Major in English"}
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
                  <span className="font-bold text-emerald-900 block">Assigned Cooperating Teacher:</span>
                  <div className="text-slate-800 font-semibold mt-0.5">{student.ct.name}</div>
                  <div className="text-slate-500 text-[11px]">{student.ct.school} • {student.ct.gradeLevel}</div>
                </div>
              ) : (
                <div className="mx-5 mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  <span className="font-bold block">Pending CT Assignment</span>
                  Waiting for Supervising Professor to assign your mentor.
                </div>
              )}
            </div>
            <div className="p-5 pt-0">
              <Link
                href="/evaluations/ct"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-xs text-sm"
              >
                {student?.ct ? `Evaluate ${student.ct.name} →` : "Open CT Appraisal Form →"}
              </Link>
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
      </main>
    </div>
  );
}
