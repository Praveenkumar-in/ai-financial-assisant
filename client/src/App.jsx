import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Accounts from "./pages/Accounts.jsx";
import Budgets from "./pages/Budgets.jsx";
import Goals from "./pages/Goals.jsx";
import Assistant from "./pages/Assistant.jsx";
import Profile from "./pages/Profile.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

export default function App(){
 return <Routes>
   <Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
   <Route element={<ProtectedRoute/>}><Route element={<AppLayout/>}><Route path="/" element={<Dashboard/>}/><Route path="/transactions" element={<Transactions/>}/><Route path="/accounts" element={<Accounts/>}/><Route path="/budgets" element={<Budgets/>}/><Route path="/goals" element={<Goals/>}/><Route path="/assistant" element={<Assistant/>}/><Route path="/profile" element={<Profile/>}/></Route></Route>
   <Route path="*" element={<Navigate to="/" replace/>}/>
 </Routes>;
}
