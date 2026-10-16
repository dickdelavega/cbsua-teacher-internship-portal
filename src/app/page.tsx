import Image from "next/image";
import Link from "next/link";
import { Play, Lock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-cbsua-green flex flex-col font-sans relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cbsua-light rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cbsua-light rounded-full blur-3xl opacity-40 translate-y-1/3 -translate-x-1/4"></div>

      {/* Top Banner */}
      <div className="bg-cbsua-light text-white text-sm py-2 px-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <span className="bg-green-600 rounded px-2 py-0.5 text-xs font-bold">EVALUATION OPEN</span>
          <span>1st Semester, A.Y. 2026-2027 • Closes in <span className="text-cbsua-yellow font-bold">12 Days</span></span>
        </div>
        <div className="text-yellow-300 flex items-center gap-1">
          <span className="text-lg leading-none">⚠</span>
          <span>Completion of teacher evaluation is a prerequisite for viewing final grades.</span>
        </div>
      </div>

      {/* Header */}
      <header className="px-10 py-5 flex items-center justify-between bg-white text-black relative z-10 shadow-sm">
        <div className="flex items-center gap-3.5">
          <Image
            src="/cbsua-logo.png"
            alt="Central Bicol State University of Agriculture Seal"
            width={48}
            height={48}
            className="w-12 h-12 object-contain"
            priority
          />
          <div>
            <h1 className="font-bold text-cbsua-green tracking-tight leading-tight uppercase text-sm">Central Bicol State University of Agriculture</h1>
            <h2 className="text-xs text-cbsua-light font-medium tracking-widest uppercase">Student Teacher Evaluation System • STES</h2>
          </div>
        </div>
        <nav className="flex items-center gap-6 font-medium text-sm text-gray-700">
          <Link href="#" className="text-cbsua-green border-b-2 border-cbsua-green pb-1">Home</Link>
          <Link href="#" className="hover:text-cbsua-green">About STES</Link>
          <Link href="#" className="hover:text-cbsua-green">Evaluation Guidelines</Link>
          <Link href="#" className="hover:text-cbsua-green">FAQs</Link>
          <Link href="#" className="hover:text-cbsua-green">Help & Support</Link>
          <div className="ml-4 flex items-center gap-2">
            <Link href="/dean/login" className="text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-2 rounded-md transition shadow-2xs">
              Dean Portal
            </Link>
            <Link href="/sp/login" className="text-xs font-semibold text-cbsua-green hover:underline px-2 py-2">
              SP Portal
            </Link>
            <Link href="/login" className="bg-cbsua-green text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-green-800 transition-colors flex items-center gap-1.5 shadow-2xs">
              Student Login
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-10 pt-20 flex relative z-10">
        <div className="w-1/2 pt-10">
          <div className="inline-block border border-green-700/50 bg-green-900/30 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-yellow-500 mb-6 flex items-center gap-2 w-max">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            OFFICIAL CBSUA EVALUATION PORTAL
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-6">
            Empowering <br />
            <span className="text-cbsua-yellow">Excellence</span> Through <br />
            Constructive Feedback
          </h1>
          
          <p className="text-green-100 text-lg mb-10 max-w-lg leading-relaxed">
            The official web-based <strong className="text-white">Student Teacher Evaluation System (STES)</strong> of CBSUA — fostering academic quality, transparency, and faculty development across all campuses.
          </p>

          <div className="flex flex-wrap gap-3 mb-16">
            <Link href="/login" className="bg-cbsua-yellow text-green-900 font-bold px-6 py-3 rounded-md hover:bg-yellow-400 transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,193,7,0.3)] text-sm">
              Evaluate Now (Student)
            </Link>
            <Link href="/sp/login" className="bg-white/10 text-white font-bold px-5 py-3 rounded-md hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/20 text-sm">
              Supervising Professor Portal →
            </Link>
            <Link href="/dean/login" className="bg-emerald-950/80 text-yellow-300 font-bold px-5 py-3 rounded-md hover:bg-emerald-900 transition-colors flex items-center gap-2 border border-yellow-400/40 text-sm shadow-md">
              Dean of Education Portal 🎓
            </Link>
          </div>

          <div className="flex gap-12">
            <div>
              <div className="text-4xl font-bold text-cbsua-yellow mb-1">4</div>
              <div className="text-xs tracking-widest font-semibold text-green-300">CAMPUSES</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cbsua-yellow mb-1">100%</div>
              <div className="text-xs tracking-widest font-semibold text-green-300">CONFIDENTIAL</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cbsua-yellow mb-1">Real-time</div>
              <div className="text-xs tracking-widest font-semibold text-green-300">ANALYTICS</div>
            </div>
          </div>
        </div>
        
        <div className="w-1/2 relative flex justify-center items-center pl-10">
          {/* Glass Mockup */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2 shadow-2xl w-full max-w-lg -rotate-2 transform hover:rotate-0 transition-transform duration-500">
            <div className="bg-white rounded-lg overflow-hidden flex flex-col text-black h-80 relative shadow-inner">
              {/* Window Header */}
              <div className="bg-gray-100 px-4 py-2 flex gap-1.5 border-b border-gray-200">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="mx-auto text-[10px] text-gray-500 font-mono">stes.cbsua.edu.ph/dashboard</div>
              </div>
              <div className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-sm text-cbsua-green">
                   <Image src="/cbsua-logo.png" alt="CBSUA" width={20} height={20} className="w-5 h-5 object-contain" />
                   UNIVERSITY TEACHER EVALUATIONS
                </h3>
                <div className="flex gap-6">
                   <div className="w-1/3">
                      <div className="text-[10px] text-gray-500 mb-2">Overall Teaching Rating</div>
                      <div className="w-24 h-24 rounded-full border-4 border-cbsua-light flex items-center justify-center flex-col shadow-[0_0_15px_rgba(46,125,50,0.3)]">
                        <span className="text-2xl font-bold text-cbsua-green">4.7</span>
                        <span className="text-[8px] text-gray-500">/5.0</span>
                      </div>
                   </div>
                   <div className="flex-1">
                      <div className="text-[10px] text-gray-500 mb-2">Detailed Criteria Breakdown</div>
                      <div className="space-y-2">
                         <div>
                            <div className="flex justify-between text-[8px] mb-0.5"><span>Teaching Quality</span><span>4.8</span></div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-cbsua-light h-1.5 rounded-full" style={{width: '95%'}}></div></div>
                         </div>
                         <div>
                            <div className="flex justify-between text-[8px] mb-0.5"><span>Punctuality</span><span>4.9</span></div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-cbsua-light h-1.5 rounded-full" style={{width: '98%'}}></div></div>
                         </div>
                         <div>
                            <div className="flex justify-between text-[8px] mb-0.5"><span>Student Engagement</span><span>4.5</span></div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-cbsua-light h-1.5 rounded-full" style={{width: '90%'}}></div></div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
              {/* Overlay elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-cbsua-green/80 backdrop-blur rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                <Play fill="currentColor" className="w-6 h-6 ml-1" />
              </div>
              <div className="absolute bottom-3 left-3 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 border border-green-200">
                <Lock className="w-3 h-3" /> Anonymized & Secured
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer decorative shape */}
      <div className="absolute bottom-0 w-full h-12 bg-white rounded-t-[50%_100px] z-10"></div>
    </div>
  );
}
