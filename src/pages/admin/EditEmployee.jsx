import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { useNavigate, useParams } from "react-router-dom";

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    dob: "",
    department_id: "",
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: employee } = await supabase
      .from("employees")
      .select("name, dob, department_id")
      .eq("id", id)
      .single();

    const { data: deps } = await supabase
      .from("departments")
      .select("id, name")
      .order("name");

    setForm(employee);
    setDepartments(deps || []);
    setLoading(false);
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();

    await supabase
      .from("employees")
      .update(form)
      .eq("id", id);

    navigate("/admin/employees");
  }

  if (loading) return null;

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Edit Employee</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <Input
          label="Date of Birth"
          type="date"
          name="dob"
          value={form.dob || ""}
          onChange={handleChange}
        />

        <div>
          <label className="text-sm text-gray-600">Department</label>
          <select
            name="department_id"
            value={form.department_id || ""}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 mt-1"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/employees")}
            className="text-gray-600"
          >
            Cancel
          </button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        {...props}
        className="w-full border rounded-lg px-4 py-2 mt-1"
      />
    </div>
  );
}
