import Link from "next/link";
import AddList from "@/components/dashboard/add-list";
import DashboardSidebarPage from "@/components/dashboard/dashboard-sidebar-page";
import { getListsWithItems } from "~/lib/db/list-utils";
import { auth, signOut } from "~/server/auth";
import { ListWithItems, ListWithItemsView } from "~/types";
import AddListButton from "@/components/dashboard/add-list-button";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth(); // Your auth implementation
  if (!session)
    return (
      <>
        <p>Not Authenticated</p>
        <Link href="/">Sign In</Link>
      </>
    );

  //need to fetch from db here and pass data to page wrapper as props b/c the wrapper is client comp
  const listsWithItems: ListWithItems[] = await getListsWithItems(
    session.user.id,
  );
  //convert db data from db type to view type
  const listsWithItemsView: ListWithItemsView[] = listsWithItems.map(
    (list) => ({
      id: list.id, // Use the database id
      title: list.title,
      items: list.items.map((item) => ({
        id: item.id,
        isComplete: item.isComplete,
        description: item.description,
        position: item.position,
      })),
    }),
  );

  return (
    <div className="flex min-h-screen flex-col gap-1">
      <div className="flex gap-1">
        {/* sign out button */}
        <button
          className="w-20 rounded-lg border shadow-md"
          onClick={async () => {
            "use server";
            await signOut({ redirectTo: "/api/auth/signin" });
          }}
        >
          Sign Out
        </button>
      </div>

      {/* use a wrapper comp here to contain page.tsx
      because this layout.tsx needs to be server comp, as it is using auth() */}
      <DashboardSidebarPage
        userId={session.user.id}
        listsWithItemsView={listsWithItemsView}
      >
        {children}
      </DashboardSidebarPage>
    </div>
  );
}
