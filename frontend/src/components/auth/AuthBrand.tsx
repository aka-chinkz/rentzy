import Link from "next/link";

export function AuthBrand() {
  return (
    <Link href="/" className="mb-6 inline-flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary">
        <span className="text-sm font-semibold text-white">R</span>
      </div>
      <span className="font-display text-2xl font-bold text-text-primary">Rentzy</span>
    </Link>
  );
}
