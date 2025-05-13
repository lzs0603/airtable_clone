import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { Plus, Database } from "lucide-react";
import Leftbar from "../_components/dashboard/Leftbar";
import { BaseCard } from "../_components/dashboard/BaseCard";
import type { Base } from "@prisma/client";
import DashboardHeader from "../_components/dashboard/DashboardHeader";

export default async function page() {
  const session = await auth();

  if (!session?.user) {
    return redirect("/");
  }
  console.log(session.user);

  const bases = await db.base.findMany({
    where: {
      ownerId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <DashboardHeader user={session.user} />
      <div className="flex flex-1">
        {/*  left sidebar */}
        <Leftbar />

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>

          {/* Bases section */}
          <div className="mb-6">
            <h3 className="mb-4 text-sm font-medium text-gray-500">
              Your Bases
            </h3>

            {bases.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bases.map((base: Base) => (
                  <BaseCard base={base} key={base.id} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 py-8 text-center">
                <Database className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <h3 className="mb-1 text-lg font-medium text-gray-700">
                  No bases yet
                </h3>
                <p className="mb-4 text-gray-500">
                  Create your first base to get started
                </p>
                <button className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Base
                </button>
              </div>
            )}
          </div>

          {/* Quick actions section - only Create New Base */}
          <div className="mb-6">
            <h3 className="mb-4 text-sm font-medium text-gray-500">
              Quick Actions
            </h3>

            <div>
              <button className="flex items-center rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md">
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="font-medium">Create New Base</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
