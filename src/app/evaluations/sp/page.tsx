"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const questionsData = {
  "On planning activities, the College of Education through the Supervising Professor \u2026": [
    "Ensures that the subject area and grade level match the pre-service teacher\u2019s specialization.",
    "Considers the distance, transportation availability, and personal circumstances of the pre-service teachers in planning deployment.",
    "Checks and verifies all submitted required documents."
  ],
  "On orientation activities, the College of Education through the Supervising Professor \u2026": [
    "Clearly explains the roles, policies, and procedures stated in the MOA between CBSUA and DepEd on internship partnership.",
    "Orients pre-service teachers on important school policies and professional conduct.",
    "Clearly discusses the roles, responsibilities, and performance expectations from pre-service teachers.",
    "Provides guidance to ensure that pre-service teachers are ready to respond to the academic and professional needs of the assigned school.",
    "Presents clear and organized deployment plan including schedule, school assignments, and expected tasks.",
    "Provides complete and accurate information about the assigned school - address, contact persons, and reporting procedures.",
    "Encourages pre-service teachers to raise questions and clarification about internship program and all its requirements."
  ],
  "C. On Preparatory Activities prior to deployment, the College of Education through the Supervising Professor \u2026": [
    "Conducts ocular visits to sites to ensure that the standards outlined in the Internship Manual are met.",
    "Meets with the school head or practice teaching coordinator for approval of the practice teaching schedule and plan.",
    "Provides support strategies for the mental health of pre-service teachers prior to deployment to assigned school.",
    "Ensures that the pre-service teacher\u2019s strengths and readiness are taken into account prior to deployment.",
    "Ensures that the expectations of the cooperating school and the College of Education are clearly aligned and communicated.",
    "Organizes the conduct of the pinning ceremony."
  ],
  "A. On Coordination Activities with the cooperating school, the College of Education through the Supervising Professor \u2026": [
    "Formally endorses the assigned pre-service teachers to school administrator and cooperating teachers.",
    "Sets-up communication channel among supervising professor, cooperating teacher, and the assigned pre-service teacher/s.",
    "Explains how the required documents be accomplished and submitted.",
    "Facilitates the issuance of certificates of appreciation to the principal, department head, and cooperating teachers after the final demo-teaching."
  ],
  "B. On monitoring activities, the College of Education through the Supervising Professor \u2026": [
    "Conducts preliminary visit to pre-service teachers after weeks of deployment.",
    "Contacts pre-service teachers to gather feedback about their assignments, experience, and challenges in the field.",
    "Regularly consults with pre-service teachers to identify and understand problems or issues encountered during the internship.",
    "If any, validates reported issues or concerns by communicating directly with the concerned pre-service teacher.",
    "Regularly reminds pre-service teachers about completion and submission of all requirements upon returning to the University.",
    "Conducts at least two supervisory visits to assess the pre-service teachers\u2019 progress, professional growth, and attainment of internship objectives.",
    "Ensures complete and prompt submission of required clearance and reports prior to culmination of internship."
  ],
  "C. On Supervisory Activities, the College of Education through the Supervising Professor \u2026": [
    "Responds promptly to urgent issues and concerns raised by pre-service teachers during the internship period, if any.",
    "Provides timely guidance, feedback, and support to pre-service teachers either through in-person or virtual communication platform to resolve issues, concerns, or challenges.",
    "Regularly informs pre-service teachers of the timeline related to internship and graduation requirements.",
    "Provides valuable feedback to improve instruction practices based on initial post-deployment evaluation.",
    "Communicates the academic and program requirements for graduation based on coordination with the Office of the Registrar."
  ],
  "A. On Mentoring Activities, the College of Education through the Supervising Professor \u2026": [
    "Conducts follow-up meetings in support of the pre-service teachers\u2019 transition from internship experience to the next level.",
    "Helps assess one\u2019s performance based on the class observation and performance evaluation results.",
    "Assists integrate lessons learned during the internship into one\u2019s future teaching and professional journey.",
    "Provides emotional support and encouragement to maintain confidence in teaching.",
    "Assists in preparing for the exit interview as part of the graduation process.",
    "Facilitates the preparation of the necessary paperwork, forms, and documents as graduation requirements.",
    "During culminating activity, discusses pre and post internship issues, concerns, and recommendations for future personal actions.",
    "During classroom culminating activity, checks the pre-service teacher\u2019s e- portfolio using agreed rubrics.",
    "Checks the completeness of required documents"
  ]
};

export default function SPEvaluation() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    profName: "",
    program: "",
    comments: "",
  } as any);

  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRadioChange = (category: string, index: number, value: string) => {
    setResponses(prev => ({ ...prev, [category + "_" + index]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/evaluate/sp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, responses }),
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
    { value: "1", label: "1 - Not Observed" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-black py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <Link href="/dashboard" className="text-sm text-cbsua-green hover:underline mb-6 inline-block font-medium">← Back to Dashboard</Link>
        
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
          <Image
            src="/cbsua-logo.png"
            alt="CBSUA Seal Logo"
            width={64}
            height={64}
            className="w-16 h-16 object-contain drop-shadow"
            priority
          />
          <div>
            <h2 className="text-xs font-bold text-cbsua-green uppercase tracking-wider">
              Central Bicol State University of Agriculture • College of Education
            </h2>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-0.5">
              Supervising Professor Appraisal Tool
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Deployment Activities — Support, Supervision, and Mentoring (Pre-Deployment, Deployment, Post-Deployment)
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supervising Professor&apos;s Name</label>
              <input type="text" required className="w-full border border-gray-300 rounded-md px-3 py-2" value={formData.profName} onChange={e => setFormData({...formData, profName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
              <input type="text" required className="w-full border border-gray-300 rounded-md px-3 py-2" value={formData.program} onChange={e => setFormData({...formData, program: e.target.value})} />
            </div>
          </div>

          {Object.entries(questionsData).map(([category, questions], cIdx) => (
            <div key={cIdx} className="mb-8">
              <h3 className="font-bold text-lg mb-4 text-cbsua-green border-l-4 border-cbsua-yellow pl-3">{category}</h3>
              <div className="space-y-6">
                {(questions as string[]).map((q, qIdx) => (
                  <div key={qIdx} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="mb-3 font-medium">{qIdx + 1}. {q}</p>
                    <div className="flex flex-wrap gap-4">
                      {scaleOptions.map(opt => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="radio" name={`sp_${cIdx}_${qIdx}`} value={opt.value} required onChange={() => handleRadioChange(category, qIdx, opt.value)} className="text-cbsua-green focus:ring-cbsua-green" />
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
            <h3 className="font-bold text-lg mb-4 text-cbsua-green border-l-4 border-cbsua-yellow pl-3">Comments / Suggestions</h3>
            <textarea rows={4} className="w-full border border-gray-300 rounded-md px-3 py-2" value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})} placeholder="Any additional feedback..." />
          </div>

          <div className="pt-6 border-t flex justify-end">
            <button type="submit" disabled={isSubmitting} className="bg-cbsua-green hover:bg-green-800 disabled:opacity-50 text-white font-medium py-3 px-8 rounded-md transition shadow-md">
              {isSubmitting ? "Submitting..." : "Submit Evaluation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
