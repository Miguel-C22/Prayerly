"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
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
            {success ? (
              /* Success State */
              <>
                {/* Header */}
                <div className="text-center mb-8 sm:mb-10 md:mb-12">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-text-purplePrimary mb-3 md:mb-4">
                    Check Your Email
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-text-graySecondary max-w-md mx-auto leading-relaxed">
                    We've sent password reset instructions to your email address.
                  </p>
                </div>

                {/* Back to Login Link */}
                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="btn w-full h-12 sm:h-13 md:h-14 bg-text-purplePrimary hover:bg-text-purplePrimary/90 text-white border-none font-semibold text-sm sm:text-base md:text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </>
            ) : (
              /* Reset Form */
              <>
                {/* Header */}
                <div className="text-center mb-8 sm:mb-10 md:mb-12">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-text-purplePrimary mb-3 md:mb-4">
                    Reset Your Password
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-text-graySecondary max-w-md mx-auto leading-relaxed">
                    Enter your email and we'll send you a link to reset your password
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-5 sm:space-y-6 md:space-y-7">
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
                      {isLoading ? "Sending..." : "Send Reset Email"}
                    </button>
                  </div>
                </form>

                {/* Back to Login Link */}
                <div className="mt-6 sm:mt-8 md:mt-10 text-center">
                  <p className="text-sm sm:text-base md:text-lg text-text-graySecondary">
                    Remember your password?{" "}
                    <Link
                      href="/auth/login"
                      className="text-text-purplePrimary font-semibold hover:underline transition-all duration-200"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
