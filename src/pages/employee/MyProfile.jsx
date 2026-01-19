import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Employee profile
    const { data: employee } = await supabase
      .from("employees")
      .select(
        `
        id,
        name,
        emp_id,
        dob,
        departments ( name )
      `
      )
      .eq("user_id", user.id)
      .single();

    setProfile(employee);

    // Salary info
    const { data: salaryData } = await supabase
      .from("salaries")
      .select("salary, pay_date, status")
      .eq("employee_id", employee.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    setSalary(salaryData || null);

    setLoading(false);
  }

  if (loading) {
    return <p className="mt-10">Loading profile...</p>;
  }

  return (
    <div className="flex justify-center mt-10">
      <div className="bg-white shadow rounded-xl p-8 w-full max-w-2xl flex gap-6">
        
        {/* Profile Image */}
        <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-3xl">
          👤
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4">My Profile</h2>

          <Info label="Name" value={profile?.name} />
          <Info label="Employee ID" value={profile?.emp_id} />
          <Info label="Department" value={profile?.departments?.name || "-"} />
          <Info label="Date of Birth" value={profile?.dob || "-"} />

          <hr className="my-4" />

          <h3 className="font-semibold mb-2">Salary Info</h3>

          <Info label="Salary" value={salary?.salary ?? "-"} />
          <Info label="Pay Date" value={salary?.pay_date ?? "-"} />
          <Info
            label="Status"
            value={
              salary?.status === "paid"
                ? "Paid ✅"
                : salary?.status === "unpaid"
                ? "Unpaid ❌"
                : "-"
            }
          />
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between mb-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
