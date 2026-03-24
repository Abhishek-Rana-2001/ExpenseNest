import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Legend
  } from "recharts";
  
  const data = [
    { month: "Jan", income: 50000, expense: 32000, savings: 18000 },
    { month: "Feb", income: 48000, expense: 35000, savings: 13000 },
    { month: "Mar", income: 52000, expense: 30000, savings: 22000 },
  ];
  
  export default function DashboardChart() {
    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
  
          <XAxis dataKey="month" />
          <YAxis />
  
          <Tooltip />
          <Legend />
  
          <Bar dataKey="income" fill="#22c55e" />
          <Bar dataKey="expense" fill="#ef4444" />
          <Bar dataKey="savings" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    );
  }