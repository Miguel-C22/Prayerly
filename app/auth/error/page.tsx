export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-gray-200 bg-base-100 shadow">
            <div className="flex flex-col space-y-1.5 p-6">
              <h1 className="text-2xl font-semibold leading-none tracking-tight">
                Sorry, something went wrong.
              </h1>
            </div>
            <div className="p-6 pt-0">
              {params?.error ? (
                <p className="text-sm text-text-graySecondary">
                  Code error: {params.error}
                </p>
              ) : (
                <p className="text-sm text-text-graySecondary">
                  An unspecified error occurred.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
