"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeClosed, Loader } from "lucide-react";
import { toast } from "react-toastify";
import UpdateLoader from "@/components/global/update-loader";
import { useLoader } from "@/contexts/LoaderStateProvider";
import DefaultLink from "@/components/global/default-link";
import { fetcher } from "@/utils/fetcher";

export default function SignInPage() {
  const router = useRouter();
  const context = useLoader();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide required fields");
      return;
    }
    try {
      setLoading(true);
      setError("");

      await fetcher(`/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success("Login successfully");
      if (context) {
        context.setShowLoader(true);
        context.setProgress(20);
      }
      return window.location.href = "/";
    } catch (error) {
      console.log("Error while signing up ", error);
      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
          ? error.message
          : "Some error occurred.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <UpdateLoader />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-text">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-subtext max-w">
          Or{" "}
          <DefaultLink href="/auth/sign-up" className="font-medium">
            create a new account
          </DefaultLink>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card border shadow-lg border-border backdrop-blur-xl py-8 px-6 rounded-lg sm:px-10">
          {error && (
            <div
              className="mb-4 text-red-600 bg-red-100 border border-red-300 px-4 py-2 rounded"
              dangerouslySetInnerHTML={{ __html: error }}
            >
              {/* {error} */}
            </div>
          )}

          <a
            href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/oauth/google`}
            className="w-full flex gap-3 justify-center items-center rounded-md border border-border-secondary bg-bg py-2 px-4 text-sm font-medium text-subtext shadow-sm hover:bg-opacity-30"
          >
            <Image src="/google.svg" alt="google icon" width={20} height={20} />
            Sign in with Google
          </a>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card text-subtext px-2 text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2 text-subtext"
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
                className="appearance-none block w-full px-3 text-text py-2 border border-border-secondary rounded-md shadow-sm ouline-none placeholder-text/20 focus:outline-none tracking-wide"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2 text-subtext"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  placeholder="*******"
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 text-text py-2 border border-border-secondary rounded-md shadow-sm ouline-none placeholder-text/20 focus:outline-none tracking-wide"
                />
                <button
                  type="button"
                  className="absolute right-5 text-text"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Eye className="size-5" />
                  ) : (
                    <EyeClosed className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {loading ? (
                  <Loader className="size-5 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
