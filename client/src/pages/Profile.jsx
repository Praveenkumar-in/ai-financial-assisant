import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { PageHeader } from "../components/UI.jsx";

export default function Profile(){
 const {user}=useAuth();const [form,setForm]=useState({currentPassword:"",newPassword:""});const [message,setMessage]=useState("");
 async function save(e){e.preventDefault();try{await api.put("/auth/password",form);setMessage("Password changed successfully.");setForm({currentPassword:"",newPassword:""})}catch(e){setMessage(e.response?.data?.message||"Unable to change password.")}}
 return <><PageHeader title="Profile" subtitle="Manage your account and security."/><div className="row g-3"><div className="col-md-6"><div className="card"><div className="card-body"><h5>Account</h5><div className="mt-3"><div className="small text-secondary">Name</div><div className="fw-semibold">{user?.fullName}</div></div><div className="mt-3"><div className="small text-secondary">Email</div><div className="fw-semibold">{user?.email}</div></div></div></div></div><div className="col-md-6"><div className="card"><div className="card-body"><h5>Change password</h5>{message&&<div className="alert alert-info mt-3">{message}</div>}<form onSubmit={save} className="vstack gap-3 mt-3"><input className="form-control" type="password" placeholder="Current password" value={form.currentPassword} onChange={e=>setForm({...form,currentPassword:e.target.value})}/><input className="form-control" type="password" placeholder="New password" value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})}/><button className="btn btn-primary">Update password</button></form></div></div></div></div></>;
}
