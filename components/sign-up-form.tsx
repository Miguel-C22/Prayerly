"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/home`,
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-screen bg-base-100 sm:bg-backgrounds-veryLight",
        className
      )}
      {...props}
    >
      <div className="w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <div className="card sm:shadow-xl sm:border sm:border-gray-200 sm:rounded-2xl sm:bg-base-100">
          <div className="card-body p-6 sm:p-8 md:p-10 lg:p-12">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-text-purplePrimary mb-3 md:mb-4">
                Join AI Prayer Partner
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-text-graySecondary max-w-md mx-auto leading-relaxed">
                Start your consistent prayer journey today
              </p>
            </div>

            <form
              onSubmit={handleSignUp}
              className="space-y-5 sm:space-y-6 md:space-y-7"
            >
              {/* Full Name */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm sm:text-base font-medium text-text-grayPrimary">
                  Full Name
                </legend>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full input h-12 sm:h-13 md:h-14 border-gray-200 text-text-grayPrimary placeholder:text-text-graySecondary focus:border-text-purplePrimary focus:outline-text-purplePrimary text-sm sm:text-base md:text-lg px-4 rounded-xl transition-all duration-200"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </fieldset>

              {/* Email */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm sm:text-base font-medium text-text-grayPrimary">
                  Email
                </legend>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full input h-12 sm:h-13 md:h-14 border-gray-200 text-text-grayPrimary placeholder:text-text-graySecondary focus:border-text-purplePrimary focus:outline-text-purplePrimary text-sm sm:text-base md:text-lg px-4 rounded-xl transition-all duration-200"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </fieldset>

              {/* Password */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm sm:text-base font-medium text-text-grayPrimary">
                  Password
                </legend>
                <input
                  type="password"
                  placeholder="Create a password"
                  className="w-full input h-12 sm:h-13 md:h-14 border-gray-200 text-text-grayPrimary placeholder:text-text-graySecondary focus:border-text-purplePrimary focus:outline-text-purplePrimary text-sm sm:text-base md:text-lg px-4 rounded-xl transition-all duration-200"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </fieldset>

              {/* Confirm Password */}
              <fieldset className="fieldset">
                <legend className="fieldset-legend text-sm sm:text-base font-medium text-text-grayPrimary">
                  Confirm Password
                </legend>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="w-full input h-12 sm:h-13 md:h-14 border-gray-200 text-text-grayPrimary placeholder:text-text-graySecondary focus:border-text-purplePrimary focus:outline-text-purplePrimary text-sm sm:text-base md:text-lg px-4 rounded-xl transition-all duration-200"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </fieldset>

              {/* Error Message */}
              {error && (
                <div className="alert alert-error bg-red-50 border-red-200 text-red-600">
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn w-full h-12 sm:h-13 md:h-14 bg-text-purplePrimary hover:bg-text-purplePrimary/90 text-white border-none font-semibold text-sm sm:text-base md:text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 sm:mt-8 md:mt-10 text-center">
              <p className="text-sm sm:text-base md:text-lg text-text-graySecondary">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-text-purplePrimary font-semibold hover:underline transition-all duration-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
