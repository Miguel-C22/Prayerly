"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Input from "@/components/ui/input/Input";
import Button from "@/components/ui/button/Button";

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
              <Input
                type="text"
                placeholder="Enter your full name"
                required={true}
                value={fullName}
                setValue={setFullName}
              />

              {/* Email */}
              <Input
                type="email"
                placeholder="Enter your email"
                required={true}
                value={email}
                setValue={setEmail}
              />

              {/* Password */}
              <Input
                type="password"
                placeholder="Create a password"
                required={true}
                value={password}
                setValue={setPassword}
              />

              {/* Confirm Password */}
              <Input
                type="password"
                placeholder="Confirm your password"
                required={true}
                value={confirmPassword}
                setValue={setConfirmPassword}
              />

              {/* Error Message */}
              {error && (
                <div className="alert alert-error bg-red-50 border-red-200 text-red-600">
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  fullWidth
                >
                  Create Account
                </Button>
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
