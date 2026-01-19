import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";

export default function EmployeeSalary() {
  const { id: employeeId } = useParams();
  const navigate = useNavigate();

  const [salaryId, setSalaryId] = useState(null);
  const [salary, setSalary] = useState("");
  const [allowance, setAllowance] = useState("");
  const [deduction, setDeduction] = useState("");
  const [status, setStatus] = useState("unpaid");
  const [payDate, setPayDate] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSalary();
  }, []);

  async function fetchSalary() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("salaries")
      .select("*")
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      setError(error.message);
    } else if (data && data.length > 0) {
      const s = data[0];
      setSalaryId(s.id);
      setSalary(s.salary ?? "");
      setAllowance(s.allowance ?? "");
      setDeduction(s.deduction ?? "");
      setStatus(s.status ?? "unpaid");
      setPayDate(s.pay_date);
    }

    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const total =
      Number(salary || 0) +
      Number(allowance || 0) -
      Number(deduction || 0);

    if (salaryId) {
      const { error } = await supabase
        .from("salaries")
        .update({
          salary,
          allowance,
          deduction,
          total,
        })
        .eq("id", salaryId);

      if (error) {
        setError(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("salaries").insert({
        employee_id: employeeId,
        salary,
        allowance,
        deduction,
        total,
        status: "unpaid",
      });

      if (error) {
        setError(error.message);
        return;
      }
    }

    navigate("/admin/employees");
  }

  async function markAsPaid() {
    if (!salaryId) return;

    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("salaries")
      .update({
        status: "paid",
        pay_date: today,
      })
      .eq("id", salaryId);

    if (error) {
      setError(error.message);
      return;
    }

    setStatus("paid");
    setPayDate(today);
  }

  if (loading) return <p className="mt-10 text-center">Loading...</p>;

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Manage Salary
      </h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          placeholder="Base Salary"
          className="w-full border rounded-lg px-4 py-2"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Allowance"
          className="w-full border rounded-lg px-4 py-2"
          value={allowance}
          onChange={(e) => setAllowance(e.target.value)}
        />

        <input
          type="number"
          placeholder="Deduction"
          className="w-full border rounded-lg px-4 py-2"
          value={deduction}
          onChange={(e) => setDeduction(e.target.value)}
        />

        <div className="flex justify-between items-center pt-4">
          <span className="text-sm text-gray-600">Status</span>

          {status === "paid" ? (
            <button
              type="button"
              disabled
              className="bg-green-600 text-white px-4 py-1 rounded opacity-70 cursor-not-allowed"
            >
              Paid
            </button>
          ) : (
            <button
              type="button"
              onClick={markAsPaid}
              className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Unpaid
            </button>
          )}
        </div>

        {payDate && (
          <p className="text-sm text-gray-500">Paid on: {payDate}</p>
        )}

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate("/admin/employees")}
            className="text-gray-600 hover:underline"
          >
            ← Back
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Save Salary
          </button>
        </div>
      </form>
    </div>
  );
}
