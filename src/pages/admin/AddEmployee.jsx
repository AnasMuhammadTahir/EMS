import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AddEmployee() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    department_id: "",
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("departments")
      .select("id, name")
      .order("name")
      .then(({ data }) => setDepartments(data || []));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1️⃣ Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2️⃣ Insert employee profile
    const { error: empError } = await supabase.from("employees").insert({
      user_id: authData.user.id,
      name: form.name,
      dob: form.dob,
      department_id: form.department_id,
    });

    if (empError) {
      setError(empError.message);
      setLoading(false);
      return;
    }

    navigate("/admin/employees");
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Add Employee</h1>

      {error && (
        <p className="mb-4 text-red-500 text-sm">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <Input
          label="Date of Birth"
          type="date"
          name="dob"
          value={form.dob}
          onChange={handleChange}
          required
        />

        <div>
          <label className="text-sm text-gray-600">Department</label>
          <select
            name="department_id"
            value={form.department_id}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 mt-1"
            required
          >
            <option value="">Select department</option>
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
          <button
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            Create
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
