import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}
