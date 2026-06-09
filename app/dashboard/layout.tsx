import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-neutral-100">
      <DashboardSidebar />

      <main className="min-h-screen w-full px-4 pb-8 pt-24 md:ml-80 md:w-[calc(100%-20rem)] md:p-8">
        {children}
      </main>
    </div>
  );
}