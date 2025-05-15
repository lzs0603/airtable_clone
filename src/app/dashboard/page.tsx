import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { Database, Plus, ListFilter, CalendarRange, GridIcon } from "lucide-react";
import Leftbar from "../_components/dashboard/Leftbar";
import { BaseCard } from "../_components/dashboard/BaseCard";
import type { Base } from "@prisma/client";
import DashboardHeader from "../_components/dashboard/DashboardHeader";
import CreateBaseButton from "../_components/dashboard/CreateBaseButton";
import { Button } from "~/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";
import DashboardLayoutClient from "../_components/dashboard/DashboardLayoutClient";

export default async function page() {
  const session = await auth();

  if (!session?.user) {
    return redirect("/");
  }

  const bases = await db.base.findMany({
    where: {
      ownerId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const recentBases = bases.slice(0, 3);

  return (
    <DashboardLayoutClient
      user={session.user}
      bases={bases}
      recentBases={recentBases}
    />
  );
}
