"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const questionsData = {
  "On Content Knowledge and Pedagogy, my cooperating teacher \u2026": [
    "Demonstrates content knowledge and its application within and across curriculum teaching areas.",
    "Exhibits understanding of research-based knowledge and principles of teaching and learning.",
    "Shows skills and the positive use of ICT to facilitate teaching and learning process.",
    "Demonstrates knowledge of teaching strategies that promote literacy and numeracy skills.",
    "Applies teaching strategies that develop critical and creative thinking and/or other higher-order thinking skills.",
    "Uses the mother tongue, Filipino, and English to facilitate teaching and learning.",
    "Demonstrates understanding of the range of verbal and non-verbal classroom communication strategies that support learner\u2019s understanding, participation, engagement, and achievement."
  ],
  "On Learning Environment, my cooperating teacher \u2026": [
    "Orients me on proper classroom management protocols that promote a safe, respectful, and inclusive learning environment.",
    "Establishes a learning environment that respects and acknowledges students\u2019 cultural and socio-economic backgrounds.",
    "Promotes an inclusive learning environment where learners feel safe and secure in expressing themselves.",
    "Guides me in addressing the diverse needs of the learners through behavioral, developmental, and inclusive strategies.",
    "Develops in me the skill to maximize available classroom resources and physical space to ensure active learning engagement.",
    "Models a respectful communication that promotes positive behavior and meaningful interaction among learners.",
    "Guides me in implementing strategies to adapt to diverse classroom situations.",
    "Helps me understand the importance of non-violent discipline in promoting a positive learning environment",
    "Equips me with practical knowledge on how to apply strategies that promote an inclusive and welcoming environment for diverse learners."
  ],
  "On Diversity of Learners, my cooperating teacher\u2026": [
    "Promotes an inclusive and respectful classroom environment for all learners.",
    "Integrates varied teaching methods and activities to address the learner\u2019s individual needs.",
    "Contextualizes teaching strategies to address the individual linguistic, cultural, socio-economic, and religious background of the learners.",
    "Equips me with the necessary skills to create a safe and supportive classroom environment for learners experiencing difficulties.",
    "Uses appropriate teaching methods to address the learner\u2019s special education needs arising from difficult circumstances.",
    "Integrates different activities to ensure flexible and fair opportunities to cater to the learners\u2019 varied interests and abilities.",
    "Equips me with the skills to create individualized learning plans to accommodate learners with special needs."
  ],
  "On Curriculum and Planning, my cooperating teacher\u2026": [
    "Aligns learning objectives with curriculum standards and learners' development levels.",
    "Selects appropriate teaching strategies suited to learners\u2019 developmental stages.",
    "Formulates clear, measurable learning objectives aligned with curriculum competencies and content standards and appropriately links them to instructional methods and teaching approaches.",
    "Clearly states measurable learning outcomes based on curriculum competencies.",
    "Incorporates the DepEd mission, organizational structure, school protocols, and ethical standards, and use this knowledge to plan and implement relevant and responsive learning programs.",
    "Prepares me to collaborate with experienced teachers for personal and professional growth.",
    "Integrates proficiency in selecting, developing, and utilizing varied teaching and learning resources including ICT, and participate in professional development activities (e.g., workshops/seminars) to enhance instructional effectiveness.",
    "Equips me to refine my ability to set clear learning objectives and outcomes for each lesson."
  ],
  "On Assessment and Reporting, my cooperating teacher\u2026": [
    "Designs appropriate assessment tools (diagnostic, formative, and summative) that are aligned with curriculum standards and learning competencies.",
    "Selects assessment strategies based on Bloom\u2019s Taxonomy to ensure a balance between the learners' cognitive levels and conceptual understanding.",
    "Gives me strategies for aligning assessments with learning objectives that accurately measure learners\u2019 depth of understanding across various cognitive domains.",
    "Demonstrates competence in using Table of Specifications (TOS) to ensure content validity and alignment with learning competencies.",
    "Uses assessment results effectively to monitor student progress, provides feedback, and improves instruction in accordance with curriculum goals.",
    "Communicates to students and to other stakeholders clear, evidence-based, and constructive feedback on learning progress.",
    "Provides me with clear understanding of the importance of ethical practices in assessment such as fairness, confidentiality, and respect for student diversity.",
    "Provides timely, specific, and constructive feedback that helps students understand their performance and areas for improvement.",
    "Prepares me to use a variety of assessment methods to measure students\u2019 learning.",
    "Uses varied feedback strategies (written comments, oral conferences, rubrics, peer feedback) to address diverse learner needs.",
    "On Community Linkages and Professional Engagement, my cooperating teacher\u2026.",
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
  "On Personal Growth and Professional Development, my cooperating teacher\u2026": [
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

export default function CTEvaluation() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    teacherName: "",
    schoolName: "",
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
      const res = await fetch("/api/evaluate/ct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, responses }),
      });
      if (res.ok) {
        alert("Evaluation for Cooperating Teacher submitted successfully!");
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
              Cooperating Teacher Appraisal Tool
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Teaching Internship Program — Pre-Service Teacher Support, Supervision, and Mentoring
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cooperating Teacher&apos;s Name</label>
              <input type="text" required className="w-full border border-gray-300 rounded-md px-3 py-2" value={formData.teacherName} onChange={e => setFormData({...formData, teacherName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cooperating School</label>
              <input type="text" required className="w-full border border-gray-300 rounded-md px-3 py-2" value={formData.schoolName} onChange={e => setFormData({...formData, schoolName: e.target.value})} />
            </div>
          </div>

          {Object.entries(questionsData).map(([category, questions], cIdx) => (
            <div key={cIdx} className="mb-8">
              <h3 className="font-bold text-lg mb-4 text-cbsua-green border-l-4 border-blue-500 pl-3">{category}</h3>
              <div className="space-y-6">
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="mb-3 font-medium">{qIdx + 1}. {q}</p>
                    <div className="flex flex-wrap gap-4">
                      {scaleOptions.map(opt => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="radio" name={`ct_${cIdx}_${qIdx}`} value={opt.value} required onChange={() => handleRadioChange(category, qIdx, opt.value)} className="text-blue-600 focus:ring-blue-500" />
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
            <h3 className="font-bold text-lg mb-4 text-cbsua-green border-l-4 border-blue-500 pl-3">Comments / Suggestions</h3>
            <textarea rows={4} className="w-full border border-gray-300 rounded-md px-3 py-2" value={formData.comments} onChange={e => setFormData({...formData, comments: e.target.value})} placeholder="Any additional feedback..." />
          </div>

          <div className="pt-6 border-t flex justify-end">
            <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 px-8 rounded-md transition shadow-md">
              {isSubmitting ? "Submitting..." : "Submit Evaluation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
