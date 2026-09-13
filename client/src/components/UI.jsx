export function PageHeader({ title, subtitle, action }) {
  return <div className="d-flex justify-content-between align-items-start gap-3 mb-4"><div><h1 className="page-title">{title}</h1>{subtitle && <p className="text-secondary mb-0">{subtitle}</p>}</div>{action}</div>;
}
export function StatCard({ label, value, meta, tone = "default" }) {
  return <div className={`card stat-card h-100 stat-${tone}`}><div className="card-body"><div className="stat-label">{label}</div><div className="stat-value">{value}</div>{meta && <div className="small text-secondary mt-2">{meta}</div>}</div></div>;
}
export function Loading() { return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>; }
export function Empty({ title, text }) { return <div className="empty-state text-center py-5"><div className="empty-icon">○</div><h5>{title}</h5><p className="text-secondary mb-0">{text}</p></div>; }
export function ErrorAlert({ error }) { return error ? <div className="alert alert-danger">{error.response?.data?.message || error.message || "Something went wrong."}</div> : null; }
export const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
