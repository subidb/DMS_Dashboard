import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-slate-200">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Document not found</h1>
        <p className="text-sm text-slate-400">
          The resource you are looking for may have been archived or is not yet ingested.
        </p>
      </div>
      <Link href="/" className="rounded-full bg-brand-500 px-5 py-2 text-sm font-medium text-white">
        Back to dashboard
      </Link>
    </div>
  );
}
