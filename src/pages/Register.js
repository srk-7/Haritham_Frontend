import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    empId: "",
    name: "",
    mobile: "",
    password: "",
  });

  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBlur = e => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  // Validation functions
  const isEmpty = field => !form[field]?.trim();
  const isMobileValid = mobile => /^\d{10}$/.test(mobile);
  const isPasswordStrong = password =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/.test(password);

  const getError = field => {
    if (!touched[field]) return "";

    if (isEmpty(field)) return `${getFieldName(field)} is required`;

    if (field === "mobile" && !isMobileValid(form.mobile)) {
      return "Mobile number must be exactly 10 digits";
    }

    if (field === "password" && !isPasswordStrong(form.password)) {
      return "Password must be 8+ characters and include uppercase, lowercase, number, and symbol";
    }

    return "";
  };

  const getFieldName = field =>
    ({
      empId: "Employee ID",
      name: "Name",
      mobile: "Mobile number",
      password: "Password",
    }[field] || "This field");

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");

    const fields = ["empId", "name", "mobile", "password"];
    const newTouched = {};
    let hasError = false;

    fields.forEach(field => {
      newTouched[field] = true;
      if (getError(field)) hasError = true;
    });

    if (hasError) {
      setTouched(newTouched);
      setMessage("Please fix the errors in the form.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8081/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let friendlyMessage = "Registration failed. Please try again.";
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.includes("already registered")) {
            friendlyMessage = "This mobile number is already registered. Please login or use a different number.";
          } else if (errorJson.error) {
            friendlyMessage = errorJson.error;
          }
        } catch {}
        throw new Error(friendlyMessage);
      }

      setMessage("✅ Registration successful! Redirecting to login...");
      setForm({ empId: "", name: "", mobile: "", password: "" });
      setTouched({});
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-6 text-green-700">Register</h2>

      {message && (
        <p
          className={`mb-4 text-sm ${
            message.includes("successful") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {["empId", "name", "mobile", "password"].map(field => (
          <div key={field}>
            <input
              type={field === "password" ? "password" : "text"}
              name={field}
              value={form[field]}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={getFieldName(field)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            {getError(field) && (
              <p className="text-sm text-red-500 mt-1">{getError(field)}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}
