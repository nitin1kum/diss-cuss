"use client";

import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage({
  params,
}: {
  params: { ins: string };
}) {
  const { ins: instruction } = params;
  const { data } = useSession();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // ⏳ cooldown in seconds

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (data && data.user) {
    return redirect("/");
  }

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setMessage("Verification email sent. Please check your inbox.");
        setCooldown(60); // Start cooldown
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
    <div className="min-h-screen p-4 bg-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-text">
          Verify Your Email Address
        </h2>
        <p className="mt-2 text-subtext">
          {instruction !== "send" &&
            "We sent a verification link to your email. Please check your inbox and click the link to verify your account and then log in again."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-card py-8 px-6 shadow rounded-lg sm:px-10">
        {message && (
          <div className="mb-4 text-green-700 bg-green-100 border border-green-300 px-4 py-2 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleResend}>
          <label
            htmlFor="email"
            className="block text-sm mb-1 font-medium text-subtext"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="xyz123@gmail.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full mb-6 px-3 text-text py-2 border border-border-secondary rounded-md shadow-sm placeholder-text/20 focus:outline-none tracking-wide"
          />
          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
          >
            {loading ? (
              <Loader className="size-5 animate-spin" />
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : instruction === "send" ? (
              "Send Verification Email"
            ) : (
              "Resend Verification Email"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          <Link
            href="/auth/sign-in"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
