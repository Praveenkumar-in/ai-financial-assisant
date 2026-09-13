import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  ["/", "Dashboard"], ["/transactions", "Transactions"], ["/accounts", "Accounts"],
  ["/budgets", "Budgets"], ["/goals", "Goals"], ["/assistant", "AI Assistant"], ["/profile", "Profile"]
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">F</span><span>FinanceAI</span></div>
        <div className="tagline">Your intelligent personal finance companion.</div>
        <nav className="nav flex-column gap-1 mt-4">
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"} className={({isActive}) => `nav-link ${isActive ? "active" : ""}`}>{label}</NavLink>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="small text-secondary mb-2">Signed in as</div>
          <div className="fw-semibold text-white">{user?.fullName}</div>
          <button className="btn btn-outline-light btn-sm mt-3 w-100" onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="mobile-header d-lg-none">
          <div className="brand"><span className="brand-mark">F</span> FinanceAI</div>
          <button className="btn btn-sm btn-outline-secondary" data-bs-toggle="offcanvas" data-bs-target="#mobileNav">Menu</button>
        </header>
        <div className="container-fluid p-3 p-lg-4"><Outlet /></div>
      </main>
      <div className="offcanvas offcanvas-start" tabIndex="-1" id="mobileNav">
        <div className="offcanvas-header"><h5>FinanceAI</h5><button className="btn-close" data-bs-dismiss="offcanvas" /></div>
        <div className="offcanvas-body">
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"} className="nav-link py-2">{label}</NavLink>)}
        </div>
      </div>
    </div>
  );
}
