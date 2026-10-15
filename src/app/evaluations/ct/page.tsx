"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  School,
  User,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowLeft,
  BookOpen,
  ShieldCheck,
  Star,
  Edit3,
  Clock,
  Sparkles,
} from "lucide-react";

const questionsData = {
  "On Content Knowledge and Pedagogy, my cooperating teacher …": [
    "Demonstrates content knowledge and its application within and across curriculum teaching areas.",
    "Exhibits understanding of research-based knowledge and principles of teaching and learning.",
    "Shows skills and the positive use of ICT to facilitate teaching and learning process.",
    "Demonstrates knowledge of teaching strategies that promote literacy and numeracy skills.",
    "Applies teaching strategies that develop critical and creative thinking and/or other higher-order thinking skills.",
    "Uses the mother tongue, Filipino, and English to facilitate teaching and learning.",
    "Demonstrates understanding of the range of verbal and non-verbal classroom communication strategies that support learner’s understanding, participation, engagement, and achievement."
  ],
  "On Learning Environment, my cooperating teacher …": [
    "Orients me on proper classroom management protocols that promote a safe, respectful, and inclusive learning environment.",
    "Establishes a learning environment that respects and acknowledges students’ cultural and socio-economic backgrounds.",
    "Promotes an inclusive learning environment where learners feel safe and secure in expressing themselves.",
    "Guides me in addressing the diverse needs of the learners through behavioral, developmental, and inclusive strategies.",
    "Develops in me the skill to maximize available classroom resources and physical space to ensure active learning engagement.",
    "Models a respectful communication that promotes positive behavior and meaningful interaction among learners.",
    "Guides me in implementing strategies to adapt to diverse classroom situations.",
    "Helps me understand the importance of non-violent discipline in promoting a positive learning environment",
    "Equips me with practical knowledge on how to apply strategies that promote an inclusive and welcoming environment for diverse learners."
  ],
  "On Diversity of Learners, my cooperating teacher…": [
    "Promotes an inclusive and respectful classroom environment for all learners.",
    "Integrates varied teaching methods and activities to address the learner’s individual needs.",
    "Contextualizes teaching strategies to address the individual linguistic, cultural, socio-economic, and religious background of the learners.",
    "Equips me with the necessary skills to create a safe and supportive classroom environment for learners experiencing difficulties.",
    "Uses appropriate teaching methods to address the learner’s special education needs arising from difficult circumstances.",
    "Integrates different activities to ensure flexible and fair opportunities to cater to the learners’ varied interests and abilities.",
    "Equips me with the skills to create individualized learning plans to accommodate learners with special needs."
  ],
  "On Curriculum and Planning, my cooperating teacher…": [
    "Aligns learning objectives with curriculum standards and learners' development levels.",
    "Selects appropriate teaching strategies suited to learners’ developmental stages.",
    "Formulates clear, measurable learning objectives aligned with curriculum competencies and content standards and appropriately links them to instructional methods and teaching approaches.",
    "Clearly states measurable learning outcomes based on curriculum competencies.",
    "Incorporates the DepEd mission, organizational structure, school protocols, and ethical standards, and use this knowledge to plan and implement relevant and responsive learning programs.",
    "Prepares me to collaborate with experienced teachers for personal and professional growth.",
    "Integrates proficiency in selecting, developing, and utilizing varied teaching and learning resources including ICT, and participate in professional development activities (e.g., workshops/seminars) to enhance instructional effectiveness.",
    "Equips me to refine my ability to set clear learning objectives and outcomes for each lesson."
  ],
  "On Assessment and Reporting, my cooperating teacher…": [
    "Designs appropriate assessment tools (diagnostic, formative, and summative) that are aligned with curriculum standards and learning competencies.",
    "Selects assessment strategies based on Bloom’s Taxonomy to ensure a balance between the learners' cognitive levels and conceptual understanding.",
    "Gives me strategies for aligning assessments with learning objectives that accurately measure learners’ depth of understanding across various cognitive domains.",
    "Demonstrates competence in using Table of Specifications (TOS) to ensure content validity and alignment with learning competencies.",
    "Uses assessment results effectively to monitor student progress, provides feedback, and improves instruction in accordance with curriculum goals.",
    "Communicates to students and to other stakeholders clear, evidence-based, and constructive feedback on learning progress.",
    "Provides me with clear understanding of the importance of ethical practices in assessment such as fairness, confidentiality, and respect for student diversity.",
    "Provides timely, specific, and constructive feedback that helps students understand their performance and areas for improvement.",
    "Prepares me to use a variety of assessment methods to measure students’ learning.",
    "Uses varied feedback strategies (written comments, oral conferences, rubrics, peer feedback) to address diverse learner needs."
  ],
  "On Community Linkages and Professional Engagement, my cooperating teacher….": [
    "Encourages me to connect and collaborate with my colleagues, other teachers, parents, and students.",
    "Implements strategies that promote collaboration between the school and community stakeholders.",
    "Helps me understand the role of community support in fostering a positive and productive learning environment.",
    "Demonstrates mentoring and coaching skills by guiding learners in their learning experiences.",
    "Fosters and maintains positive professional relationships with colleagues and the community.",
    "Demonstrates personal and professional responsibilities as outlined in the Code of Ethics for Professional Teachers.",
    "Incorporates community values and culture into the teaching and learning environment.",
    "Develops my honesty and integrity in all my future professional interactions.",
    "Helps me understand the importance of maintaining confidentiality in handling students' personal information.",
    "Applies learning environment ethical standards to ensure student success."
  ],
  "On Personal Growth and Professional Development, my cooperating teacher…": [
    "Upholds the moral principles of teaching as a profession by showing care and respect to learners.",
    "Is neat, confident, poised, and commands presence.",
    "Is punctual with instances of tardiness not exceeding four times.",
    "Is punctual with absences not exceeding four times",
    "Seeks professional feedback and support from colleagues.",
    "Assists the school administration in planning and managing in-service training.",
    "Assists colleagues in planning and managing in-service training.",
    "Conducts action research whose findings and recommendations have been adopted by the school/district.",
    "Serves as committee chairperson/member in different school activities.",
    "Serves as a coach/assistant coach in the academic and non-academic competitions."
  ]
};

const totalAvailableQuestions = Object.values(questionsData).reduce((sum, arr) => sum + arr.length, 0);

export default function CTEvaluation() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [lastSubmittedAt, setLastSubmittedAt] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    teacherName: "",
    schoolName: "",
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
          if (s.ct) {
            // Automatically populate the Cooperating Teacher's Name and School
            setFormData((prev) => ({
              ...prev,
              teacherName: s.ct.name,
              schoolName: s.ct.school,
            }));
          }

          // If the student already rated this Cooperating Teacher, pre-populate for editing
          if (s.evaluationCT) {
            setIsEditing(true);
            setResponses(s.evaluationCT.responses || {});
            setFormData((prev) => ({
              ...prev,
              comments: s.evaluationCT.comments || "",
            }));
            setLastSubmittedAt(s.evaluationCT.createdAt || null);
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching student profile for CT appraisal:", err);
      })
      .finally(() => {
        setIsLoadingProfile(false);
      });
  }, []);

  // Compute real-time rating and summary
  const currentRating = useMemo(() => {
    const values = Object.values(responses)
      .map((v) => Number(v))
      .filter((n) => !isNaN(n) && n > 0);

    if (values.length === 0) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = Number((sum / values.length).toFixed(2));

    let descriptor = "Highly Observed";
    if (avg < 1.5) descriptor = "Not Observed";
    else if (avg < 2.5) descriptor = "Less Observed";
    else if (avg < 3.5) descriptor = "Moderately Observed";
    else if (avg < 4.5) descriptor = "Observed";

    return {
      average: avg,
      answeredCount: values.length,
      totalQuestions: totalAvailableQuestions,
      descriptor,
      isComplete: values.length === totalAvailableQuestions,
    };
  }, [responses]);

  const handleRadioChange = (category: string, index: number, value: string) => {
    setResponses((prev) => ({ ...prev, [category + "_" + index]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!student?.ct) {
      alert("A Cooperating Teacher has not been assigned by your Supervising Professor yet.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/evaluate/ct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.studentId,
          teacherName: formData.teacherName || student.ct.name,
          schoolName: formData.schoolName || student.ct.school,
          responses,
          comments: formData.comments,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsEditing(true);
        alert(
          data.message ||
            `Cooperating Teacher appraisal saved with an overall rating of ${data.rating?.average || currentRating?.average} / 5.00!`
        );
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
        <div className="flex items-center justify-between mb-6 pb-2">
          <Link
            href="/dashboard"
            className="text-sm text-cbsua-green hover:underline inline-flex items-center gap-1.5 font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          {isEditing && (
            <div className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-medium">
              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
              <span>Editing Mode — You can update this rating anytime</span>
            </div>
          )}
        </div>

        {/* Institution Header */}
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
              Cooperating Teacher Appraisal Tool
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Teaching Internship Program — Pre-Service Teacher Support, Supervision, and Mentoring
            </p>
          </div>
        </div>

        {/* Student Intern & Assigned Cooperating Teacher Institutional Card */}
        {isLoadingProfile ? (
          <div className="p-6 mb-8 bg-slate-50 rounded-xl border border-slate-200 text-center text-sm text-slate-500 animate-pulse">
            Loading student intern credentials and assigned Cooperating Teacher details...
          </div>
        ) : student?.ct ? (
          <div className="mb-6 bg-emerald-50/60 rounded-xl border border-emerald-200 p-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 pb-3 border-b border-emerald-200/80">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Verified Mentor Assignment
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Assigned by Supervising Professor ({student.sp?.name || "Dr. Maria Elena Santos"})
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cooperating Teacher Name - Readonly & Automatically displayed */}
              <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-xs">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                  <span>Cooperating Teacher&apos;s Name</span>
                  <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5">
                    <Lock className="w-3 h-3" /> Auto-populated
                  </span>
                </label>
                <div className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-cbsua-green shrink-0" />
                  <span>{student.ct.name}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{student.ct.gradeLevel}</span>
                </div>
                <input type="hidden" name="teacherName" value={formData.teacherName} />
              </div>

              {/* Cooperating School - Readonly & Automatically displayed */}
              <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-xs">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                  <span>Cooperating Partner School</span>
                  <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5">
                    <Lock className="w-3 h-3" /> Auto-populated
                  </span>
                </label>
                <div className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <School className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{student.ct.school}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Intern: <strong>{student.name}</strong> ({student.studentId})
                  </span>
                </div>
                <input type="hidden" name="schoolName" value={formData.schoolName} />
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-amber-50 border-2 border-amber-300 rounded-xl p-5 text-amber-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-base text-amber-900">
                  Cooperating Teacher Not Yet Assigned
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
                  In accordance with the College of Education Teaching Internship Program guidelines,
                  <strong>
                    {" "}
                    the Supervising Professor ({student?.sp?.name || "Dr. Maria Elena Santos"}) is
                    responsible for assigning your Cooperating Teacher
                  </strong>
                  . Your profile is currently awaiting assignment.
                </p>
                <p className="text-xs text-amber-700 mt-2 font-medium">
                  Once your supervisor assigns you to your partner school mentor, their name and school
                  will automatically appear on this form.
                </p>
                <div className="mt-4">
                  <Link
                    href="/dashboard"
                    className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition"
                  >
                    Return to Student Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Total Rating & Evaluation Summary Banner (Required for student to view & edit rating) */}
        {student?.ct && currentRating && (
          <div className="mb-8 bg-gradient-to-r from-emerald-900 via-cbsua-green to-emerald-800 text-white p-5 rounded-2xl shadow-md border border-emerald-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yellow-300">
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  Total Cooperating Teacher Rating
                </div>
                <div className="flex items-baseline gap-3 mt-1.5">
                  <span className="text-4xl font-extrabold text-white">
                    {currentRating.average}
                  </span>
                  <span className="text-lg text-emerald-200 font-semibold">/ 5.00</span>
                  <span className="bg-yellow-400/20 text-yellow-200 border border-yellow-400/40 text-xs font-bold px-3 py-1 rounded-full">
                    {currentRating.descriptor}
                  </span>
                </div>
                <div className="text-xs text-emerald-200 mt-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>
                    Computed based on {currentRating.answeredCount} of {currentRating.totalQuestions}{" "}
                    appraisal indicators rated
                  </span>
                </div>
              </div>

              {isEditing && (
                <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-3 rounded-xl text-xs text-emerald-100 max-w-xs">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <Edit3 className="w-3.5 h-3.5 text-yellow-300" />
                    Rating Can Be Edited
                  </div>
                  <div>
                    Modify any score below to adjust the total rating. Click &quot;Save & Update
                    Rating&quot; to apply your changes.
                  </div>
                  {lastSubmittedAt && (
                    <div className="text-[10px] text-emerald-300 mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last submitted: {new Date(lastSubmittedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Evaluation Scale Guide */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 text-xs text-slate-600">
          <div className="font-bold text-slate-800 mb-1">Rating Scale Guide:</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center mt-2 font-medium">
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="block font-bold text-blue-700 text-sm">5</span>
              <span>Highly Observed</span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="block font-bold text-blue-700 text-sm">4</span>
              <span>Observed</span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="block font-bold text-blue-700 text-sm">3</span>
              <span>Moderately Observed</span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="block font-bold text-blue-700 text-sm">2</span>
              <span>Less Observed</span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="block font-bold text-blue-700 text-sm">1</span>
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
                {questions.map((q, qIdx) => {
                  const key = `${category}_${qIdx}`;
                  const selectedVal = responses[key];

                  return (
                    <div
                      key={qIdx}
                      className={`p-4 rounded-xl border transition ${
                        selectedVal
                          ? "bg-emerald-50/30 border-emerald-200"
                          : "bg-slate-50/70 border-slate-200/80 hover:border-slate-300"
                      }`}
                    >
                      <p className="mb-3 font-medium text-slate-800 text-sm">
                        {qIdx + 1}. {q}
                      </p>
                      <div className="flex flex-wrap gap-3 sm:gap-4">
                        {scaleOptions.map((opt) => (
                          <label
                            key={opt.value}
                            className={`flex items-center gap-2 cursor-pointer text-xs sm:text-sm px-3 py-1.5 rounded-lg border transition ${
                              selectedVal === opt.value
                                ? "bg-cbsua-green text-white border-cbsua-green font-semibold shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:border-cbsua-green"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`ct_${cIdx}_${qIdx}`}
                              value={opt.value}
                              checked={selectedVal === opt.value}
                              required
                              disabled={!student?.ct}
                              onChange={() => handleRadioChange(category, qIdx, opt.value)}
                              className="text-cbsua-green focus:ring-cbsua-green"
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <h3 className="font-bold text-base sm:text-lg mb-3 text-cbsua-green border-l-4 border-cbsua-green pl-3">
              Comments / Suggestions / Areas of Strength
            </h3>
            <textarea
              rows={4}
              disabled={!student?.ct}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cbsua-green text-slate-800 disabled:bg-slate-100 disabled:text-slate-400"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder={
                student?.ct
                  ? `Write your feedback and mentoring observations for ${student.ct.name}...`
                  : "Awaiting supervisor assignment..."
              }
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
              disabled={isSubmitting || !student?.ct}
              className={`w-full sm:w-auto font-bold py-3 px-8 rounded-xl transition shadow-sm text-sm flex items-center justify-center gap-2 ${
                isEditing
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-cbsua-green hover:bg-green-800 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                "Saving to CBSUA System..."
              ) : !student?.ct ? (
                "Assignment Required Before Submission"
              ) : isEditing ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  Save & Update Rating for {student.ct.name} ({currentRating?.average || "—"} / 5.00)
                </>
              ) : (
                `Submit Evaluation for ${student.ct.name}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
