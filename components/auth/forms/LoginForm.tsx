"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Input from "@/components/ui/input/Input";
import Button from "@/components/ui/button/Button";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/home");
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
                Welcome Back
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-text-graySecondary max-w-md mx-auto leading-relaxed">
                Sign in to continue your prayer journey
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              className="space-y-5 sm:space-y-6 md:space-y-7"
            >
              {/* Email */}
              <Input
                type="email"
                placeholder="Enter your email"
                required={true}
                value={email}
                setValue={setEmail}
              />

              {/* Password */}
              <div>
                <div className="flex items-center justify-end mb-2">
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs sm:text-sm text-text-purplePrimary hover:underline transition-all duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  required={true}
                  value={password}
                  setValue={setPassword}
                />
              </div>

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
                  Sign In
                </Button>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 sm:mt-8 md:mt-10 text-center">
              <p className="text-sm sm:text-base md:text-lg text-text-graySecondary">
                Don't have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-text-purplePrimary font-semibold hover:underline transition-all duration-200"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
