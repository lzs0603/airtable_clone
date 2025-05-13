import { Database } from "lucide-react";
import Link from "next/link";

export function BaseCard({ base }: { base: any }) {
  return (
    <Link
      href={`/base/${base.id}`}
      className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center">
        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-md bg-purple-600 text-white">
          <Database className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-base font-medium">
            {base.name || "Untitled Base"}
          </h4>
          <p className="text-sm text-gray-500">
            Last updated: {new Date(base.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
