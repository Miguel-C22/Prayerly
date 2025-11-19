export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-gray-200 bg-base-100 shadow">
            <div className="flex flex-col space-y-1.5 p-6">
              <h1 className="text-2xl font-semibold leading-none tracking-tight">
                Thank you for signing up!
              </h1>
              <p className="text-sm text-text-graySecondary">
                Check your email to confirm
              </p>
            </div>
            <div className="p-6 pt-0">
              <p className="text-sm text-text-graySecondary">
                You&apos;ve successfully signed up. Please check your email to
                confirm your account before signing in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
