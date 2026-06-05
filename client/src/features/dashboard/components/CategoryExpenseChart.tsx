import { useMemo } from "react"
import {
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

type CategoryExpenseItem = {
  categoryId: string | null
  name: string
  color: string | null
  icon: string | null
  total: number
  transactionCount: number
}

type CategoryExpenseChartProps = {
  data?: CategoryExpenseItem[]
  dataKey?: keyof CategoryExpenseItem
}

// Fallback palette for categories that don't have a color set yet.
const FALLBACK_COLORS = [
  "#f59e0b",
  "#10b981",
  "#0ea5e9",
  "#8b5cf6",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#f43f5e",
]

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

const CategoryExpenseChart = ({
  data = [],
  dataKey = "total",
}: CategoryExpenseChartProps) => {
  // Bake `fill` into each entry so Pie reads colors per-slice without <Cell>.
  const coloredData = useMemo(
    () =>
      data.map((entry, i) => ({
        ...entry,
        fill: entry.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      })),
    [data],
  )

  if (coloredData.length === 0) {
    return (
      <div className="flex h-75 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 text-sm text-slate-500">
        No expenses yet for this period
      </div>
    )
  }

  return (
    <div className="h-full min-h-80 w-full max-w-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={coloredData}
            dataKey={dataKey}
            nameKey="name"
            innerRadius={60}
            outerRadius={110}
            paddingAngle={2}
          />
          <Tooltip
            formatter={(value) =>
              currencyFormatter.format(
                typeof value === "number" ? value : Number(value ?? 0),
              )
            }
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CategoryExpenseChart
