import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    applied: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    setLoading(true);

    // Total Employees
    const { count: employeeCount } = await supabase
      .from("employees")
      .select("*", { count: "exact", head: true });

    // Total Departments
    const { count: departmentCount } = await supabase
      .from("departments")
      .select("*", { count: "exact", head: true });

    // Leave counts
    const { count: appliedCount } = await supabase
      .from("leaves")
      .select("*", { count: "exact", head: true });

    const { count: approvedCount } = await supabase
      .from("leaves")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    const { count: pendingCount } = await supabase
      .from("leaves")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: rejectedCount } = await supabase
      .from("leaves")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected");

    setStats({
      employees: employeeCount || 0,
      departments: departmentCount || 0,
      applied: appliedCount || 0,
      approved: approvedCount || 0,
      pending: pendingCount || 0,
      rejected: rejectedCount || 0,
    });

    setLoading(false);
  }

  if (loading) {
    return <p className="mt-10 text-gray-500">Loading dashboard...</p>;
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-8 mt-10">
        Dashboard Overview
      </h1>

      {/* Top Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <StatCard
          title="Total Employees"
          value={stats.employees}
          bg="bg-indigo-100"
          text="text-indigo-600"
        />

        <StatCard
          title="Total Departments"
          value={stats.departments}
          bg="bg-yellow-100"
          text="text-yellow-600"
        />
      </div>

      {/* Leave Overview */}
      <h2 className="text-xl font-semibold mb-4">Leave Overview</h2>

      <div className="grid md:grid-cols-4 gap-6">
        <StatCard title="Applied" value={stats.applied} bg="bg-blue-100" text="text-blue-600" />
        <StatCard title="Approved" value={stats.approved} bg="bg-green-100" text="text-green-600" />
        <StatCard title="Pending" value={stats.pending} bg="bg-orange-100" text="text-orange-600" />
        <StatCard title="Rejected" value={stats.rejected} bg="bg-red-100" text="text-red-600" />
      </div>
    </>
  );
}

function StatCard({ title, value, bg, text }) {
  return (
    <div className={`${bg} p-6 rounded-xl shadow`}>
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className={`text-3xl font-bold ${text}`}>{value}</p>
    </div>
  );
}
