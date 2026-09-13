import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth(); const nav = useNavigate();
  const [form, setForm] = useState({ fullName:"", email:"", password:"", confirmPassword:"" }); const [error,setError]=useState("");
  async function submit(e){e.preventDefault();setError("");try{await register(form);nav("/");}catch(e){setError(e.response?.data?.message||"Registration failed");}}
  return <div className="auth-page"><div className="auth-brand"><span className="brand-mark">F</span> FinanceAI</div><div className="auth-card"><h1>Create your account</h1><p className="text-secondary">Start building a clearer financial future.</p>{error&&<div className="alert alert-danger">{error}</div>}<form onSubmit={submit} className="vstack gap-3">
    <label>Full name<input className="form-control" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} required /></label>
    <label>Email<input className="form-control" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></label>
    <label>Password<input className="form-control" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /><small className="text-secondary">8+ characters with upper/lowercase and a number.</small></label>
    <label>Confirm password<input className="form-control" type="password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} required /></label>
    <button className="btn btn-primary">Create account</button>
  </form><p className="text-center mt-4 mb-0">Already registered? <Link to="/login">Sign in</Link></p></div></div>;
}
