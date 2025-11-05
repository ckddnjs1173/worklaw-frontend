// 📄 src/app/error.tsx
"use client";
export default function ErrorPage({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold mb-2 text-red-600">500 Error</h1>
      <p>{error.message}</p>
    </div>
  );
}
