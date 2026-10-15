"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";

export default function Login() {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for now
    if (studentId) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-3">
          <Image
            src="/cbsua-logo.png"
            alt="CBSUA Seal Logo"
            width={72}
            height={72}
            className="w-20 h-20 object-contain drop-shadow-md"
            priority
          />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          CBSUA Student Teacher Evaluation System
        </h2>
        <p className="mt-1 text-sm text-gray-600 font-medium">
          Pre-Service Teacher Internship Portal • STES
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-green-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Student ID</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cbsua-green focus:border-cbsua-green sm:text-sm text-black"
                  placeholder="e.g. 2021-0001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cbsua-green focus:border-cbsua-green sm:text-sm text-black"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-cbsua-green focus:ring-cbsua-green border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-cbsua-green hover:text-green-800">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cbsua-green hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cbsua-green transition-colors"
              >
                Sign in to Portal
              </button>
            </div>
          </form>
          
          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col gap-2.5 text-center text-xs">
            <Link
              href="/sp/login"
              className="text-cbsua-green font-bold hover:underline flex items-center justify-center gap-1.5"
            >
              Are you a Supervising Professor? Sign in here →
            </Link>
            <div className="flex justify-center text-gray-500 items-center gap-1">
              <Lock className="w-3 h-3" /> CBSUA Secure Academic Portal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
