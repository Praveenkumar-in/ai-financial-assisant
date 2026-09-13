import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loader"><div className="spinner-border" /></div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
