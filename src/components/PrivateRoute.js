// components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const cookies = document.cookie
    .split(";")
    .map(c => c.trim())
    .reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = value;
      return acc;
    }, {});

  const isLoggedIn = !!cookies.userId;

  return isLoggedIn ? children : <Navigate to="/" />;
}
