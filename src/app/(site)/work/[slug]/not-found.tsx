import Link from "next/link";

export default function WorkNotFound() {
  return (
    <div className="max-w-md">
      <p className="text-sm text-neutral-600">This project could not be found.</p>
      <p className="mt-6">
        <Link
          href="/"
          className="text-[0.6875rem] uppercase tracking-[0.14em] text-neutral-400 hover:text-neutral-600"
        >
          Back to index
        </Link>
      </p>
    </div>
  );
}
