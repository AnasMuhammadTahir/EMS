import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function Settings() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleChangePassword(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Re-authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (signInError) {
      setError("Old password is incorrect");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Password updated successfully");
      setOldPassword("");
      setNewPassword("");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Change Password</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {message && <p className="text-green-600 mb-4">{message}</p>}

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="text-sm text-gray-600">Old Password</label>
          <input
            type="password"
            className="w-full border rounded-lg px-4 py-2 mt-1"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">New Password</label>
          <input
            type="password"
            className="w-full border rounded-lg px-4 py-2 mt-1"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Change Password
        </button>
      </form>
    </div>
  );
}
