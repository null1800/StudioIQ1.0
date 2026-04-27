import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark-900">
      <Sidebar />
      <div className="lg:ml-64 min-h-screen">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
