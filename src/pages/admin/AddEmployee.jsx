import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AddEmployee() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    date_of_birth: "", // Use date_of_birth (not dob)
    department_id: "",
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    supabase
      .from("departments")
      .select("id, name")
      .order("name")
      .then(({ data }) => setDepartments(data || []));
  }, []);

  const validateForm = () => {
    const errors = {};
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    if (!form.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!form.date_of_birth) {
      errors.date_of_birth = "Date of birth is required";
    }
    
    if (!form.department_id) {
      errors.department = "Please select a department";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: ""
      });
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      // 1️⃣ Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            role: 'employee'
          }
        }
      });

      if (authError) {
        console.error("Auth Error:", authError);
        
        if (authError.message.includes("already registered")) {
          setError("This email is already registered.");
        } else if (authError.message.includes("password")) {
          setError("Password must be at least 6 characters.");
        } else {
          setError(`Signup failed: ${authError.message}`);
        }
        setLoading(false);
        return;
      }

      // 2️⃣ Create profile in profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id, // profiles.id should match auth user id
          name: form.name,
          role: 'employee' // Set role as employee
        });

      if (profileError) {
        console.error("Profile Error:", profileError);
        // Don't fail here, just log it
      }

      // 3️⃣ Create employee record
      // Generate a simple employee ID
      const empId = `EMP${Date.now().toString().slice(-6)}`;
      
      const { error: empError } = await supabase
        .from("employees")
        .insert({
          user_id: authData.user.id, // Link to auth user
          name: form.name,
          date_of_birth: form.date_of_birth, // Use date_of_birth (not dob)
          department_id: form.department_id,
          emp_id: empId, // Add the employee ID
          // salary can be added later or set a default
          // created_at will auto-generate
        });

      if (empError) {
        console.error("Employee Error:", empError);
        
        // Try to clean up if employee creation fails
        try {
          // Delete from profiles if it was created
          await supabase
            .from("profiles")
            .delete()
            .eq("id", authData.user.id);
            
          // Delete auth user
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupErr) {
          console.error("Cleanup error:", cleanupErr);
        }
        
        setError(`Failed to create employee: ${empError.message}`);
        setLoading(false);
        return;
      }

      // Success!
      navigate("/admin/employees");
      
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Add Employee</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={validationErrors.name}
          required
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          error={validationErrors.email}
          required
        />

        <Input
          label="Password (min. 6 characters)"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          error={validationErrors.password}
          required
        />

        {/* Changed from "dob" to "date_of_birth" */}
        <Input
          label="Date of Birth"
          type="date"
          name="date_of_birth"
          value={form.date_of_birth}
          onChange={handleChange}
          error={validationErrors.date_of_birth}
          required
        />

        <div>
          <label className="text-sm text-gray-600">Department</label>
          <select
            name="department_id"
            value={form.department_id}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 mt-1 ${validationErrors.department ? 'border-red-500' : ''}`}
            required
          >
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          {validationErrors.department && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.department}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/admin/employees")}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, error, ...props }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        {...props}
        className={`w-full border rounded-lg px-4 py-2 mt-1 ${error ? 'border-red-500' : ''}`}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}