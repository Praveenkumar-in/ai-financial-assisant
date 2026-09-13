import { useEffect, useState } from "react";
import { api, unwrap } from "../services/api.js";
import { PageHeader, StatCard, Loading, money } from "../components/UI.jsx";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

export default function Dashboard(){
  const [data,setData]=useState(null); const [cash,setCash]=useState([]); const [cats,setCats]=useState([]); const [error,setError]=useState("");
  useEffect(()=>{Promise.all([api.get("/dashboard/summary"),api.get("/dashboard/cash-flow?months=6"),api.get("/dashboard/categories")]).then(([a,b,c])=>{setData(unwrap(a));setCash(unwrap(b));setCats(unwrap(c));}).catch(e=>setError(e.response?.data?.message||"Unable to load dashboard"));},[]);
  if(error)return <div className="alert alert-danger">{error}</div>; if(!data)return <Loading/>;
  const insights=[data.topCategory?`${data.topCategory.category} is your highest expense category this month.`:"No expense category data yet.", data.monthlySavings>=0?`You are on track to save ${money(data.monthlySavings)} this month.`:"Your expenses currently exceed income; review your largest discretionary categories.",data.savingsPercentage>20?"Your savings rate is above 20% this month.":"Consider reviewing your budget to improve your savings rate."];
  return <><PageHeader title="Financial overview" subtitle="A live view of your money, spending and goals." action={<a className="btn btn-primary" href="/assistant">Ask FinanceAI</a>}/>
    <div className="row g-3 mb-4">
      <div className="col-12 col-md-6 col-xl-3"><StatCard label="Total balance" value={money(data.totalBalance)} meta={`${data.connectedAccounts} connected accounts`} tone="primary"/></div>
      <div className="col-12 col-md-6 col-xl-3"><StatCard label="Monthly income" value={money(data.monthlyIncome)} /></div>
      <div className="col-12 col-md-6 col-xl-3"><StatCard label="Monthly expenses" value={money(data.monthlyExpenses)} /></div>
      <div className="col-12 col-md-6 col-xl-3"><StatCard label="Monthly savings" value={money(data.monthlySavings)} meta={`${data.savingsPercentage.toFixed(1)}% savings rate`} tone={data.monthlySavings>=0?"success":"danger"}/></div>
    </div>
    <div className="row g-3">
      <div className="col-12 col-xl-8"><div className="card chart-card"><div className="card-body"><div className="section-title">Monthly cash flow</div><div className="chart-wrap"><ResponsiveContainer><LineChart data={cash}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis/><Tooltip formatter={v=>money(v)}/><Legend/><Line type="monotone" dataKey="income" strokeWidth={3} name="Income"/><Line type="monotone" dataKey="expenses" strokeWidth={3} name="Expenses"/></LineChart></ResponsiveContainer></div></div></div></div>
      <div className="col-12 col-xl-4"><div className="card chart-card"><div className="card-body"><div className="section-title">Expense categories</div><div className="chart-wrap"><ResponsiveContainer><PieChart><Pie data={cats} dataKey="amount" nameKey="category" innerRadius={55} outerRadius={90}>{cats.map((_,i)=><Cell key={i} fill={`hsl(${i*37+190} 65% 55%)`}/>)}</Pie><Tooltip formatter={v=>money(v)}/></PieChart></ResponsiveContainer></div></div></div></div>
      <div className="col-12 col-xl-8"><div className="card chart-card"><div className="card-body"><div className="section-title">Spending trend</div><div className="chart-wrap"><ResponsiveContainer><BarChart data={cash}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis/><Tooltip formatter={v=>money(v)}/><Bar dataKey="expenses" name="Expenses" fill="#5b6cff" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></div></div></div>
      <div className="col-12 col-xl-4"><div className="card h-100"><div className="card-body"><div className="section-title mb-3">AI insights</div>{insights.map((x,i)=><div className="insight" key={i}><span className="insight-dot"/><span>{x}</span></div>)}<a className="btn btn-outline-primary w-100 mt-3" href="/assistant">Explore with AI</a></div></div></div>
    </div>
    <div className="row g-3 mt-1"><div className="col-md-6"><div className="card p-3"><div className="d-flex justify-content-between"><span>Active budgets</span><strong>{data.activeBudgets}</strong></div></div></div><div className="col-md-6"><div className="card p-3"><div className="d-flex justify-content-between"><span>Active goals</span><strong>{data.activeGoals}</strong></div></div></div></div>
  </>;
}
