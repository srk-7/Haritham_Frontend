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
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary-700">
            Create Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Join our sustainable community
          </p>
        </div>

        {message && (
          <div
            className={`rounded-md p-4 ${
              message.includes("successful")
                ? "bg-primary-50 text-primary-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <p className="text-sm">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {["empId", "name", "mobile", "password"].map(field => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-secondary-700">
                  {getFieldName(field)}
                </label>
                <input
                  id={field}
                  type={field === "password" ? "password" : "text"}
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={`Enter your ${getFieldName(field).toLowerCase()}`}
                  className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                {getError(field) && (
                  <p className="mt-1 text-sm text-red-600">{getError(field)}</p>
                )}
              </div>
            ))}
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create Account
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-secondary-600">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
