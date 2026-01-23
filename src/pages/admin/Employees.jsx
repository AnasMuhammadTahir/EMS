import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    const { data, error } = await supabase
      .from("employees")
      .select(`
        id,
        name,
        date_of_birth,
        user_id,
        emp_id,
        department_id,
        departments (
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (!error) {
      setEmployees(data || []);
    } else {
      console.error("Error fetching employees:", error);
    }

    setLoading(false);
  }

  async function handleDelete(userId) {
    const confirmDelete = window.confirm(
      "This will permanently delete the employee account. Continue?"
    );

    if (!confirmDelete) return;

    // First, find the employee record to get the id
    const employeeToDelete = employees.find(emp => emp.user_id === userId);
    if (!employeeToDelete) return;

    // Delete from employees table first (if it exists)
    const { error: empError } = await supabase
      .from("employees")
      .delete()
      .eq("user_id", userId);

    if (empError) {
      console.error("Error deleting employee:", empError);
      alert("Failed to delete employee record");
      return;
    }

    // Delete from profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Error deleting profile:", profileError);
      // Continue anyway - might not have a profile
    }

    // Delete auth user using Edge Function
    try {
      const { error: deleteAuthError } = await supabase.functions.invoke(
        "delete-employee",
        {
          body: { user_id: userId },
        }
      );

      if (deleteAuthError) {
        console.error("Error deleting auth user:", deleteAuthError);
      }
    } catch (err) {
      console.error("Edge function error:", err);
    }

    // Update local state
    setEmployees((prev) =>
      prev.filter((emp) => emp.user_id !== userId)
    );
    
    alert("Employee deleted successfully");
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 mt-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Employees</h1>

        <button
          onClick={() => navigate("/admin/employees/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Employee
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-gray-500 text-sm">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Date of Birth</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="px-6 py-6 text-center text-gray-500">
                  Loading employees...
                </td>
              </tr>
            )}

            {!loading && employees.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-6 text-center text-gray-400">
                  No employees found
                </td>
              </tr>
            )}

            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-mono text-sm text-gray-600">
                  {emp.emp_id || "—"}
                </td>
                
                <td className="px-6 py-4 font-medium">{emp.name}</td>

                <td className="px-6 py-4">
                  {emp.departments?.name || "—"}
                </td>

                <td className="px-6 py-4">
                  {emp.date_of_birth
                    ? new Date(emp.date_of_birth).toLocaleDateString()
                    : "—"}
                </td>

                <td className="px-6 py-4 text-right space-x-4">
                  <button
                    onClick={() =>
                      navigate(`/admin/employees/${emp.id}`)
                    }
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/admin/employees/${emp.id}/edit`)
                    }
                    className="text-gray-600 hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/admin/employees/${emp.id}/salary`)
                    }
                    className="text-green-600 hover:underline"
                  >
                    Salary
                  </button>

                  <button
                    onClick={() => handleDelete(emp.user_id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}