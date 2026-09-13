import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth(); const nav = useNavigate();
  const [form, setForm] = useState({ email: "demo@financeai.com", password: "Demo@12345" });
  const [error, setError] = useState("");
  async function submit(e) { e.preventDefault(); setError(""); try { await login(form.email, form.password); nav("/"); } catch (e) { setError(e.response?.data?.message || "Login failed"); } }
  return <AuthPage title="Welcome back" subtitle="Sign in to see your financial picture.">
    {error && <div className="alert alert-danger">{error}</div>}
    <form onSubmit={submit} className="vstack gap-3">
      <label>Email<input className="form-control form-control-lg" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></label>
      <label>Password<input className="form-control form-control-lg" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></label>
      <button className="btn btn-primary btn-lg">Sign in</button>
    </form>
    <p className="text-center mt-4 mb-0">New here? <Link to="/register">Create an account</Link></p>
  </AuthPage>;
}
function AuthPage({title, subtitle, children}) { return <div className="auth-page"><div className="auth-brand"><span className="brand-mark">F</span> FinanceAI</div><div className="auth-card"><h1>{title}</h1><p className="text-secondary">{subtitle}</p>{children}</div></div>; }
