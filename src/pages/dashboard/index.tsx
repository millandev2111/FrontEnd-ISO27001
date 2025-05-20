// pages/dashboard/index.tsx
import Sidebar from "@/components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";
import KpiCards from "@/components/Dashboard/KpiCards";
import AuditoriaWidget from "@/components/Dashboard/AuditoriaWidget";
import DashboardLayout from "./layout";
export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="flex h-fit bg-white">
        {/* Sidebar */}

        {/* Main Content */}

          {/* Dashboard Content */}
          <div className="flex-1 p-6 bg-gray-50">
            <h1 className="text-2xl text-black font-medium mb-6">Tu Actividad</h1>

            {/* KPI Cards */}
            <KpiCards />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <AuditoriaWidget />
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            </div>
          </div>
        </div>
    </DashboardLayout>
  );
}