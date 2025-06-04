import { useState } from "react";
import { useNavigate } from "react-router-dom";

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export default function Login() {
  const [form, setForm] = useState({ mobile: "", password: "" });
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBlur = e => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  // Validation rules
  const isEmpty = field => !form[field]?.trim();
  const isMobileValid = mobile => /^\d{10}$/.test(mobile);

  const getFieldName = field =>
    ({
      mobile: "Mobile number",
      password: "Password",
    }[field] || "This field");

  const getError = field => {
    if (!touched[field]) return "";

    if (isEmpty(field)) return `${getFieldName(field)} is required`;

    if (field === "mobile" && !isMobileValid(form.mobile)) {
      return "Invalid Mobile Number";
    }


    return "";
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");

    const fields = ["mobile", "password"];
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
      const res = await fetch("http://localhost:8081/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let friendlyMessage = "Login failed. Please try again.";
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            friendlyMessage = errorJson.error;
          }
        } catch {}
        throw new Error(friendlyMessage);
      }

      const user = await res.json();

      // Set userId cookie for 7 days
      setCookie("userId", user.id, 7);
      localStorage.setItem("user", JSON.stringify(user));

      setMessage("✅ Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1000);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-6 text-green-700">Login</h2>
  
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
        <div>
          <input
            type="text"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Mobile"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {getError("mobile") && (
            <p className="text-sm text-red-500 mt-1">{getError("mobile")}</p>
          )}
        </div>
  
        <div>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Password"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {getError("password") && (
            <p className="text-sm text-red-500 mt-1">{getError("password")}</p>
          )}
        </div>
  
        <button
          type="submit"
          className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 transition"
        >
          Login
        </button>
      </form>
  
      {/* Footer Links */}
      <div className="mt-6 text-sm text-center text-gray-600">
        <p className="mb-2">
          New to Haritham?{" "}
          <a href="/register" className="text-green-700 font-medium hover:underline">
            Register here
          </a>
        </p>
        <p>
          <a href="/forgot-password" className="text-green-700 hover:underline">
            Forgot password?
          </a>
        </p>
      </div>
    </div>
  );
  
}
