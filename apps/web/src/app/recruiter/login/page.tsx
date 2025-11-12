/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import Script from "next/script";
import api from "@/lib/api";

export default function RecruiterLoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleInit = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
    if (!clientId) {
      console.error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
      return;
    }

    if (!window.google) {
      console.error("Google script not loaded");
      return;
    }

    // Initialize the Google client
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        try {
          const res = await api.post("/api/google", {
            credential: response.credential,
          });
          const data = res.data;
          console.log("Backend Google auth response:", data);

          // ✅ The backend sends `token`, not `credential`
          if (data.token) {
            localStorage.setItem("token", data.token);
            console.log(
              "✅ JWT stored in localStorage:",
              data.token.length,
              "chars"
            );
            router.push("/dashboard");
          } else {
            setError(data.error || "Google login failed.");
          }
        } catch (err) {
          setError("Something went wrong with Google login.");
        }
      },
    });

    const googleDiv = document.getElementById("googleSignInDiv");
    if (googleDiv) {
      window.google.accounts.id.renderButton(googleDiv, {
        theme: "outline",
        size: "large",
        width: 350,
        shape: "rectangular",
        text: "continue_with",
      });
    } else {
      console.error("googleSignInDiv not found in DOM");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      if (err?.response?.data?.error) setError(err.response.data.error);
      else setError("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <Script
        src="https://accounts.google.com/gsi/client"
        async
        defer
        strategy="afterInteractive"
        onLoad={handleGoogleInit}
      />

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your recruiter account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs mt-1 text-indigo-500 hover:text-indigo-600"
              >
                {showPassword ? "Hide Password" : "Show Password"}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-white font-semibold rounded-lg shadow-sm transition-all ${
                isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              }`}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Google Login Section */}
          <div className="mt-6 flex flex-col items-center">
            <div className="text-gray-500 text-sm mb-2">Or continue with</div>
            <div id="googleSignInDiv" className="mt-2 flex justify-center" />
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/recruiter/register"
              className="text-indigo-600 hover:text-indigo-500 font-medium text-sm"
            >
              Create a recruiter account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
