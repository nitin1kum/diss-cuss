"use client";

import { useState } from "react";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setMessage("Verification email sent. Please check your inbox.");
      } else {
        const data = await res.json();
        setMessage(data.message || "Failed to resend verification email.");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-2 bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Verify Your Email Address
        </h2>
        <p className="mt-2 text-gray-600">
          We sent a verification link to your email. Please check your inbox and click the link to verify your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-6 shadow rounded-lg sm:px-10">
        {message && (
          <div className="mb-4 text-green-700 bg-green-100 border border-green-300 px-4 py-2 rounded">
            {message}
          </div>
        )}

        <button
          onClick={handleResend}
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {loading ? "Sending..." : "Resend Verification Email"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          <a
            href="/auth/sign-in"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
