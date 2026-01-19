import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    const { data } = await supabase
      .from("employees")
      .select(`
        id,
        name,
        dob,
        departments ( name ),
        salaries ( total, status )
      `)
      .order("created_at", { ascending: false });

    setEmployees(data || []);
  }

  async function deleteEmployee(id) {
    if (!confirm("Delete this employee?")) return;
    await supabase.from("employees").delete().eq("id", id);
    fetchEmployees();
  }

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search..."
            className="border rounded-lg px-4 py-2 w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={() => navigate("/admin/employees/new")}
            className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Salary</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id} className="border-t">
                <td className="px-4 py-3 font-medium">{emp.name}</td>
                <td className="px-4 py-3">{emp.departments?.name || "—"}</td>
                <td className="px-4 py-3">
                  {emp.salaries?.[0]?.total
                    ? `Rs ${emp.salaries[0].total}`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => navigate(`/admin/employees/${emp.id}`)}>
                      <Eye size={18} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/admin/employees/${emp.id}/edit`)
                      }
                    >
                      <Pencil size={18} className="text-indigo-600" />
                    </button>
                    <button onClick={() => deleteEmployee(emp.id)}>
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE FAB */}
      <button
        onClick={() => navigate("/admin/employees/new")}
        className="sm:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg"
      >
        <Plus />
      </button>
    </div>
  );
}
