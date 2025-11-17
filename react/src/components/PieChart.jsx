import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function PieAnswerChart({ data }) {
  const chartData = data.answers.map((item) => ({
    name: item.answer,
    value: item.count,
  }));

  const colors = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#3b82f6"];

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          >
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={colors[idx % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
