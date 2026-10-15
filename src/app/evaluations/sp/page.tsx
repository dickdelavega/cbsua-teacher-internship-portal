"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  User,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Building,
  ShieldCheck,
} from "lucide-react";

const questionsData = {
  "On Pre-Deployment Activities, the supervising professor \u2026": [
    "Orients student teachers on internship expectations, policies, code of ethics, and grading system.",
    "Coordinates with cooperating schools regarding student teacher deployment and requirements.",
    "Ensures that student teachers are properly matched with their cooperating schools and mentors.",
    "Provides clear guidance on the preparation of instructional plans and teaching learning materials.",
    "Facilitates smooth endorsement and introduction of student teachers to partner schools.",
    "Clarifies communication channels, submission schedules, and emergency protocols."
  ],
  "On Deployment Activities, the supervising professor \u2026": [
    "Conducts regular and unannounced supervisory classroom visits and teaching observations.",
    "Provides constructive, timely, and specific post-observation feedback and debriefing.",
    "Coordinates proactively with Cooperating Teachers to monitor student intern progress and performance.",
    "Assists in resolving challenges encountered in classroom management, pedagogy, or school integration.",
    "Reviews and signs lesson plans, instructional materials, and internship learning journals promptly.",
    "Upholds professionalism, objectivity, and empathy during mentoring interactions.",
    "Maintains continuous availability and responsiveness for academic consultation and moral support."
  ],
  "On Post-Deployment Activities, the supervising professor \u2026": [
    "Conducts comprehensive exit conferences, debriefing, and post-internship evaluation sessions.",
    "Guides student interns in the systematic preparation, organization, and defense of their Final Teaching Portfolios.",
    "Collaborates with Cooperating Teachers and School Principals to consolidate final performance ratings.",
    "Computes and releases final internship grades fairly, transparently, and on schedule.",
    "Facilitates meaningful reflection on pre-service experiences to prepare interns for the Licensure Examination (LET) and professional teaching careers."
  ]
};

export default function SPEvaluation() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    profName: "Dr. Maria Elena Santos",
    program: "BSED - Major in English",
    comments: "",
  });

  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const sessionStudentId =
      typeof window !== "undefined" ? sessionStorage.getItem("cbsua_student_id") : null;
    const url = sessionStudentId
      ? `/api/student/profile?studentId=${encodeURIComponent(sessionStudentId)}`
      : "/api/student/profile";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const s = data.data;
          setStudent(s);
          setFormData((prev) => ({
            ...prev,
            profName: s.sp?.name || "Dr. Maria Elena Santos",
            program: s.program || "BSED - Major in English",
          }));
        }
      })
      .catch((err) => {
        console.error("Error fetching student profile for SP appraisal:", err);
      });
  }, []);

  const handleRadioChange = (category: string, index: number, value: string) => {
    setResponses((prev) => ({ ...prev, [category + "_" + index]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/evaluate/sp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student?.studentId || "2021-10492",
          profName: formData.profName,
          program: formData.program,
          responses,
          comments: formData.comments,
        }),
      });
      if (res.ok) {
        alert("Evaluation for Supervising Professor submitted successfully!");
        router.push("/dashboard");
      } else {
        alert("Failed to submit evaluation. Make sure database is configured.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scaleOptions = [
    { value: "5", label: "5 - Highly Observed" },
    { value: "4", label: "4 - Observed" },
    { value: "3", label: "3 - Moderately Observed" },
    { value: "2", label: "2 - Less Observed" },
    { value: "1", label: "1 - Not Observed" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
        <Link
          href="/dashboard"
          className="text-sm text-cbsua-green hover:underline mb-6 inline-flex items-center gap-1.5 font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
          <Image
            src="/cbsua-logo.png"
            alt="CBSUA Seal Logo"
            width={68}
            height={68}
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow"
            priority
          />
          <div>
            <h2 className="text-xs font-bold text-cbsua-green uppercase tracking-wider">
              Central Bicol State University of Agriculture • College of Education
            </h2>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
              Supervising Professor Appraisal Tool
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Deployment Activities — Support, Supervision, and Mentoring (Pre-Deployment, Deployment, Post-Deployment)
            </p>
          </div>
        </div>

        {/* Verified Professor Assignment Card */}
        <div className="mb-8 bg-emerald-50/60 rounded-xl border border-emerald-200 p-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 pb-3 border-b border-emerald-200/80">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Verified Faculty Supervisor
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Official Teaching Internship Lead
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                <span>Supervising Professor</span>
                <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5">
                  <Lock className="w-3 h-3" /> Auto-populated
                </span>
              </label>
              <div className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-cbsua-green shrink-0" />
                <span>{formData.profName}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>College of Education • CBSUA Main Campus</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                <span>Student Intern & Degree Program</span>
                <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5">
                  <Lock className="w-3 h-3" /> Auto-populated
                </span>
              </label>
              <div className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cbsua-green shrink-0" />
                <span>{formData.program}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Intern: <strong>{student ? student.name : "Juan Dela Cruz"}</strong> (
                {student ? student.studentId : "2021-10492"})
              </div>
            </div>
          </div>
        </div>

        {/* Rating Scale Guide */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 text-xs text-slate-600">
          <div className="font-bold text-slate-800 mb-1">Rating Scale Guide:</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center mt-2 font-medium">
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="block font-bold text-cbsua-green text-sm">5</span>
              <span>Highly Observed</span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="block font-bold text-cbsua-green text-sm">4</span>
              <span>Observed</span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="block font-bold text-cbsua-green text-sm">3</span>
              <span>Moderately Observed</span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="block font-bold text-cbsua-green text-sm">2</span>
              <span>Less Observed</span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="block font-bold text-cbsua-green text-sm">1</span>
              <span>Not Observed</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {Object.entries(questionsData).map(([category, questions], cIdx) => (
            <div key={cIdx} className="mb-8">
              <h3 className="font-bold text-base sm:text-lg mb-4 text-cbsua-green border-l-4 border-cbsua-green pl-3">
                {category}
              </h3>
              <div className="space-y-4">
                {(questions as string[]).map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition"
                  >
                    <p className="mb-3 font-medium text-slate-800 text-sm">
                      {qIdx + 1}. {q}
                    </p>
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                      {scaleOptions.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-cbsua-green transition"
                        >
                          <input
                            type="radio"
                            name={`sp_${cIdx}_${qIdx}`}
                            value={opt.value}
                            required
                            onChange={() => handleRadioChange(category, qIdx, opt.value)}
                            className="text-cbsua-green focus:ring-cbsua-green"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 text-cbsua-green border-l-4 border-cbsua-green pl-3">
              Comments / Suggestions / Areas of Strength
            </h3>
            <textarea
              rows={4}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-800"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Any additional feedback regarding supervisory support and mentoring..."
            />
          </div>

          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel and return to Dashboard
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-cbsua-green hover:bg-green-800 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl transition shadow-sm text-sm"
            >
              {isSubmitting ? "Submitting to CBSUA System..." : "Submit Evaluation for Dr. Maria Elena Santos"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
