import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

    const fields = ["mobile", "password"];
    const newTouched = {};
    let hasError = false;

    fields.forEach(field => {
      newTouched[field] = true;
      if (getError(field)) hasError = true;
    });

    if (hasError) {
      setTouched(newTouched);
      toast.error("Please fix the errors in the form.");
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

      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1000);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary-700">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Sign in to your Haritham account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-secondary-700">
                Mobile Number
              </label>
              <input
                id="mobile"
                type="text"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your mobile number"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {getError("mobile") && (
                <p className="mt-1 text-sm text-red-600">{getError("mobile")}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                className="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {getError("password") && (
                <p className="mt-1 text-sm text-red-600">{getError("password")}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-secondary-500">Or</span>
            </div>
          </div>

          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-secondary-600">
              New to Haritham?{" "}
              <a href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Create an account
              </a>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
