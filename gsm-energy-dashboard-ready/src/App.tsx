
import React, { useEffect, useMemo, useState } from "react";

type Department = "รีด" | "ชุบ" | "พ่น";

type Row = {
  date: string;
  department: Department;
  kwh: number;
  production: number;
};

type MonthlyPoint = {
  month: string;
  department: Department;
  kwh: number;
  production: number;
  ratio: number;
};

type ApiRow = {
  date: string;
  department: string;
  kwh: string | number;
  production: string | number;
};

const API_URL = "https://script.google.com/macros/s/AKfycbw2sSM5uIH5R-M7c743z1DIGBMvx5Sp4Mj8EA0ItUc2PE3crPF4zJGnvBr6lmrJIjkcEA/exec";

const fallbackRows: Row[] = [
  { date: "2026-03-01", department: "รีด", kwh: 5200, production: 26000 },
  { date: "2026-03-01", department: "ชุบ", kwh: 3100, production: 12000 },
  { date: "2026-03-01", department: "พ่น", kwh: 2800, production: 15000 },
  { date: "2026-03-02", department: "รีด", kwh: 5100, production: 25900 },
  { date: "2026-03-02", department: "ชุบ", kwh: 3050, production: 12100 },
  { date: "2026-03-02", department: "พ่น", kwh: 2750, production: 14900 },
];

const departments: Department[] = ["รีด", "ชุบ", "พ่น"];
const targetReduction = 5;
const logoUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAACpCAYAAAA3sXgUAAAYdElEQVR42u3dW4yV9f3H8ec6g7M4DJmcMwtTLjJS8fJUaYWU2pNNNaYUUYgXFSqL8AJWkJaYpGiY2ouNL8rESxslpq1JVatFmkVC2iQ0bYkwJm0iIuQCCkqzIBwOB2Z2Zs65j+fM7P95Z6d17uwM7M7v83n3Xvfe+z3vM+fMzvM8d2bm0gghhBBCNAbX2QEIIYQQon2wACEkEKLNQ3mJ7ocQQgghxA1YgBBCCNHmoR5zdl4QuM4LiJi7V8/NSwghhBCiYViAEIII0eYhz8P9EkIIIcQJWIAQQgjR5qF3R7xzPvcQvvLKKzfccENPPvlkW7dutddee1mtWrX69et39NFHH3jggRUrVjA1NdW+fftWq1aNjIz0wAMPdPDgwVGjRm3fvn2lS5e+7bbbbr31Vq+99tqLL77YoEGD3H///Y0dO7asrCz37t2rVq2axYsXN2jQIH/84x/17NmzvLw8OTk5nTt3njNnTn379j3xxBOdO3cuKyurN954o7S0tPvvv7/HH388efLk119/PZMmTQoODl6xYkUf/OAHS5cu3bx58xYtWjRlyhQHDx5s0aJF69atc+PGjZYtW7Zx40aNGjV66KGHvv7663feeafNmzfXpk2bQ4cOdffdd9enTx+7du1q1KhRvXr1qlGjRuPHj3/qqadWrVrVgQMHdu/e3fbt29euXfvpp59u1KhRrVu37sEHH6x3795HHnmkbdu2v/3tb8uWLdO6devuueeea6+9tpUrV3b06NFbbrmls846q/Xr15eVlSUmJp577rnOnDnz4IMPtm3btlq1ah0/fnyFCxf2+OOP//Wvf/3oo4+2fPny9evXj4+P3/ve9w4dOtSkSZNq1aqVkpJi+fLl8+bNU6dOnf79+2fOnFm9evX69u1bW1t77LFHnTp16tq1a9q0adq0aXv37m3duvXAgQPt2rWrsrKy9u3bV65c2YoVK7788ssmTZr0pz/96SOPPFLXrl1nz57dunXrQYMGvfDCC7Nnz77iiisGDRpk8uTJd95558MPP9y0adPeeeedBx98sP79+4eGhq5atWrlypXr1q2TkpKqV69u8+bN+vfv39NPPz1jxozuueee0aNHd+zYMXPmzM2YMcO6deuSk5O7dOlScXFx8+bNq1evXlFRUcaOHVu7dm2HDh2yZ8+eN998c2vXrnX58uU///nP4+PjH3/88f79+4uJiYkTJ37xxRdTpkyprKzsa6+95lprrWXdunVbtmyRnp7e4MGD3/ve95o3b95Pf/rT6dOn9+23365bt26HDh1avnx5/fr1W7p0aYsWLWrcuHFLly5dsmRJX331VYMGDWrfvn2rVq2qX79+H374YbVr16727dtPnTo1f/78Fi1a9Mgjj2zYsGHlypWzZs2qW7duhw8ftrKy8oYbbqhTp05PPfVUe/fu7dq1q4ULF2rdunX8+PFvvvmmDz/8cPfddzdo0KDg4OBVq1bNmjVrx44dDQ0N3XPPPcePH3/zzTeHDh0aP358cXFxH3/88U8//XTq1Klp06Z17tw5e/bswYMHL1++vH379m3durWYmJjz58/ftWtXx44dO3DgwJAhQ6ZNm9a4cePq1at39uzZJk2aVLNmzSZNmtS7d+86deqUlpY2cuTI4uPjJk2a1L17d2PGjKldu3apUqU+9alPdffdd8+YMaN79+6NGjXKsmXLFi9eXJs2bcaOHduhQ4e4uLi1a9e2aNEiH3300eHDh9u8eXOHDh3y5ptv9u2336ampj799NPVq1fXvn37srKyNmzY0KpVq9q2bVurVq0++eSTVq1aVbNmzVtvvdWFCxfWrVvXtm3bTp06NXPmzCZOnNjPP//cP/7xj/Xr14+JiWnYsOGPP/7Y3//+96NHj27atGldu3bNnDmz7t27161bNw0bNhw4cKBz587NmjXLnDlzHn744TZt2jR8+PBrr72Wu7s7X3/99R07dqxfv37Dhw8fPXq0e/fuK1asWLx48bp165qcnKxPnz6rVq0aPnz4jh07pk6dWrVq1fz58z/66KP3339/3bp1GzdunPvvv79OnTo1aNCgAQMG2LNnT/PmzbN+/fqPP/7Y7NmzX3311TZt2vTQQw8NGjSowYMH9+zZM3PmzE6ePNm0aVNr1649++yzzZs3N2jQoEGDBvXbb7+9+eabf//739euXTvjxo27d+9euXJlAwcObNmyZX/605+Sk5M7cuSIWbNmZWVlffr0GT16dGNjY7/73e8mT57c4MGDNWvWLC0tTUpKqmfPnt27d9+0aVNt27YtMjKyVatWnTp16ssvv1y5cmWHDx9u2rRp7dq1U6ZM+ec//9m8efO6d+/e/v37Y2Nj3nzzzfj4+FOnTnXhwgX79u1bsmRJly5d8vT0bNmy5eabb77hhhuWL1+e9evXFxcX9+677956662IiAiRkZEtW7bMmTMnMTHx+uuv5+Hh0a9fv44dO6ampv71r39NmDChtLS0evXqHT16dP369Y8cOVJUVLRu3boBAwY8+OCDL7/8sj179qxbt+7pp59u06ZN06dP/9nPfla/fv2PP/7Y9u3bTz31VIKCgrVr1z7wwAOPPvpohw4d8uabbxYWFm7bti0rK+vnn39u3759NWrU6Pnnn8+bN6+WLVu2bt06PDx80qRJ7dq1c3Nzly5d2rBhQ0FBQePGjduwYUMHDx7s0aNH48aNq1mzZu3atS5fvjx48OAMGTJk06ZNQ4YMaezYsbVr1+7Zs6eBAwe2bNmylStXfvLJJ6+++urw4cPvvPNOs2bNKlq0qNWrV7dr167Jkyc3YMAAAwYMaNmypRUrVrz66qtNmzbNnDlz9OjR5s+fHzhwoPfee+/06dM3bdq0vLw8ixYtat++fS1atLhw4cL58+dnzpw5d+7cY4899tRTT73yyivNmzfPxx9//Ne//nX16tUNGTJk0qRJHTt2/POf/9y8efMWLVo0dOjQKVOm5OTkXH755W3atKl79+5Onz69e/fu1q5d28iRI/vwww+7du16/PHH69Spk4mJCUePHl2wYEGffvqpQYMGiYmJkydP7t69u23btuPGjWvYsOG9997LrFmz7rrrri5dujR58uSzZ8/eu3fv8uXL06VLF9dee23fvn1btmzJz89/8803y8rK+u9//3vfffc1f/78b7/9tn379r169Wrbtm3Onj3b9evXa9++fUFBQf/617+SkpJ69uxZ7dq1tWnTpmXLllm/fv0vv/yySZMmjRs3jr+/f1FRUcaPH9/JkyfHjx+/ffv2s2fP3rJlS6NGjWrcuHHz5s1btmwpLCwsKCho3rx5ixcv7tGjR926dS1YsKCEhITo6OhFixb95S9/qV27dmZmZm+99VYpKSnPP/98U6ZMGTRoUF5eXmZmZo4cOVK7du1mzJjRtm3bQYMG9enT58EHH+zTTz+9/PLL3nrrrWXLlrVu3bpOnTq1ZMmS4uPju3fvXq1atfLz85s7d26bNm0KCwvLly9fWlqaF154YcaMGZMmTSosLGzYsGHOnDljxozJzc09//zzmzdv7ty5c6tWrXr22Wc7duzYxYsXg4ODQ4cOjRw5MiMjw6xZsxYsWFBaWprdu3f39ttvly1bduzYseeee+7NN99s1KhRtWvXrlOnTocOHdq2bZvFixcPGDDA9u3bIyIi3n777cqVK3vppZfKysrKlStXr169ioqK0qZNO3z48IABA6ZOnTp69GiLFi1KSkoKCgq6d+/e5MmTixYtuvXWW3v66ad37Nhx5MiRe/fu9fDDDw8dOnTLli2dO3eOHj26Y8eO7du3l5aW9uGHH+bOndu+ffuPP/64P//5z8rLy0tKSj744IPWrl3r0KFD7du3f/311w0bNqzdu3dFRUUffvhh/fr1K1euHBoaevvtt7/wwgvDhg2rXr16ixYt8uSTT9avX7+QkJBnnnmm2bNn5+Tk3HDDDcHBwf/+97+PHj16y5YtERERAwYMyMrKSk1NnT59ev369fPmm2+uW7du27ZtRUVFrVu37rvvvtq2bZuYmBgAAABCCNHm/D/Dm0fWJEhGEQAAAABJRU5ErkJggg==";
const adminPassword = "goldstarmetal99";

const baselineMap: Record<string, Record<Department, number>> = {
  "2026-01": { รีด: 0.65, ชุบ: 1.04, พ่น: 0.242 },
  "2026-02": { รีด: 0.64, ชุบ: 1.2, พ่น: 0.243 },
  "2026-03": { รีด: 0.67, ชุบ: 1.05, พ่น: 0.266 },
  "2026-04": { รีด: 0.68, ชุบ: 0.87, พ่น: 0.254 },
  "2026-05": { รีด: 0.67, ชุบ: 0.91, พ่น: 0.239 },
  "2026-06": { รีด: 0.61, ชุบ: 0.8, พ่น: 0.262 },
  "2026-07": { รีด: 0.63, ชุบ: 1.0, พ่น: 0.24 },
  "2026-08": { รีด: 0.75, ชุบ: 0.94, พ่น: 0.292 },
  "2026-09": { รีด: 0.68, ชุบ: 0.96, พ่น: 0.285 },
  "2026-10": { รีด: 0.62, ชุบ: 0.72, พ่น: 0.248 },
  "2026-11": { รีด: 0.75, ชุบ: 0.97, พ่น: 0.279 },
  "2026-12": { รีด: 0.7, ชุบ: 1.06, พ่น: 0.307 },
};

function formatMonth(dateStr: string) {
  return dateStr.slice(0, 7);
}

function formatThaiDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function monthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("th-TH", { month: "short", year: "2-digit" });
}

function kwhPerKg(row: Pick<Row, "kwh" | "production">) {
  return row.production > 0 ? row.kwh / row.production : 0;
}

function reductionPercent(baseline: number, actual: number) {
  return baseline > 0 ? ((baseline - actual) / baseline) * 100 : 0;
}

function getTone(department: Department) {
  if (department === "รีด") return "#dc2626";
  if (department === "พ่น") return "#2563eb";
  return "#eab308";
}

function getSvgY(value: number, min: number, max: number) {
  return 220 - ((value - min) / (max - min || 1)) * 196;
}

function getSvgX(index: number, count: number) {
  return 36 + (index * (524 - 36)) / Math.max(count - 1, 1);
}

function buildPolyline(values: number[], min: number, max: number) {
  return values
    .map((value, i) => `${getSvgX(i, values.length)},${getSvgY(value, min, max)}`)
    .join(" ");
}

function isDepartment(value: string): value is Department {
  return departments.includes(value as Department);
}

function normalizeRow(row: ApiRow): Row | null {
  if (!row?.date || !isDepartment(String(row.department))) return null;
  const kwh = Number(row.kwh);
  const production = Number(row.production);
  if (!Number.isFinite(kwh) || !Number.isFinite(production)) return null;
  return {
    date: String(row.date).slice(0, 10),
    department: row.department as Department,
    kwh,
    production,
  };
}

console.assert(formatMonth("2026-03-15") === "2026-03", "formatMonth should return YYYY-MM");
console.assert(kwhPerKg({ kwh: 10, production: 5 }) === 2, "kwhPerKg should divide kWh by production");
console.assert(Math.round(reductionPercent(0.67, 0.63) * 100) / 100 === 5.97, "reductionPercent should calculate baseline reduction");
console.assert(normalizeRow({ date: "2026-03-01", department: "รีด", kwh: "100", production: "200" })?.department === "รีด", "normalizeRow should parse API row");

export default function EnergyMonitoringApp() {
  const [rows, setRows] = useState<Row[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");
  const [logoError, setLogoError] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    department: "รีด" as Department,
    kwh: "",
    production: "",
  });

  const loadRows = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
      const data: ApiRow[] = await res.json();
      const parsed = Array.isArray(data) ? (data.map(normalizeRow).filter(Boolean) as Row[]) : [];
      setRows(parsed.length > 0 ? parsed : fallbackRows);
    } catch (error) {
      setRows(fallbackRows);
      setLoadError("โหลดข้อมูลจาก Google Sheet ไม่สำเร็จ กำลังแสดงข้อมูลตัวอย่าง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, []);

  const months = useMemo(() => {
    return [...new Set(rows.map((row) => formatMonth(row.date)))].sort();
  }, [rows]);

  const monthlyData = useMemo<MonthlyPoint[]>(() => {
    const grouped: Record<string, Omit<MonthlyPoint, "ratio">> = {};

    rows.forEach((row) => {
      const month = formatMonth(row.date);
      const key = `${month}_${row.department}`;
      if (!grouped[key]) {
        grouped[key] = { month, department: row.department, kwh: 0, production: 0 };
      }
      grouped[key].kwh += Number(row.kwh);
      grouped[key].production += Number(row.production);
    });

    return Object.values(grouped)
      .map((item) => ({
        ...item,
        ratio: item.production > 0 ? item.kwh / item.production : 0,
      }))
      .sort((a, b) => `${a.month}${a.department}`.localeCompare(`${b.month}${b.department}`));
  }, [rows]);

  const latestMonth = months[months.length - 1];

  const deptSummary = useMemo(() => {
    return departments
      .map((dept) => {
        const deptRows = rows.filter((row) => row.department === dept);
        const totalKwh = deptRows.reduce((sum, row) => sum + Number(row.kwh), 0);
        const totalProduction = deptRows.reduce((sum, row) => sum + Number(row.production), 0);
        const ratio = totalProduction > 0 ? totalKwh / totalProduction : 0;
        const baseline = latestMonth && baselineMap[latestMonth] ? baselineMap[latestMonth][dept] : ratio;
        const reductionPct = reductionPercent(baseline, ratio);
        const onTarget = reductionPct >= targetReduction;

        return {
          department: dept,
          totalKwh,
          totalProduction,
          ratio,
          baseline,
          reductionPct,
          onTarget,
        };
      })
      .sort((a, b) => b.reductionPct - a.reductionPct);
  }, [rows, latestMonth]);

  const totalKwh = deptSummary.reduce((sum, item) => sum + item.totalKwh, 0);
  const totalProduction = deptSummary.reduce((sum, item) => sum + item.totalProduction, 0);
  const avgRatio = totalProduction > 0 ? totalKwh / totalProduction : 0;
  const avgBaseline = deptSummary.reduce((sum, item) => sum + item.baseline, 0) / Math.max(deptSummary.length, 1);
  const avgReduction = reductionPercent(avgBaseline, avgRatio);
  const alertDepartments = deptSummary.filter((item) => !item.onTarget);

  const trendSeries = useMemo(() => {
    return departments.map((dept) => {
      const actualValues = months.map((month) => {
        const found = monthlyData.find((item) => item.month === month && item.department === dept);
        return found ? found.ratio : 0;
      });
      const baselineValues = months.map((month) => baselineMap[month]?.[dept] ?? 0);
      return { department: dept, actualValues, baselineValues };
    });
  }, [monthlyData, months]);

  const ratioValues = trendSeries.flatMap((series) => [...series.actualValues, ...series.baselineValues]);
  const trendMin = Math.min(...ratioValues, 0);
  const trendMax = Math.max(...ratioValues, 1);

  const latestRows = [...rows].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 9);

  const handleLogin = () => {
    if (password === adminPassword) {
      setIsAdmin(true);
      setLoginError("");
      setPassword("");
    } else {
      setLoginError("รหัสผ่านไม่ถูกต้อง");
    }
  };

  const handleAddRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.department || !form.kwh || !form.production) return;

    setSubmitStatus("กำลังบันทึกข้อมูล...");
    try {
      const payload = {
        date: form.date,
        department: form.department,
        kwh: Number(form.kwh),
        production: Number(form.production),
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("บันทึกข้อมูลไม่สำเร็จ");

      setForm((prev) => ({ ...prev, kwh: "", production: "" }));
      setSubmitStatus("บันทึกข้อมูลเรียบร้อยแล้ว");
      await loadRows();
    } catch (error) {
      setSubmitStatus("บันทึกข้อมูลไม่สำเร็จ กรุณาตรวจสอบ API หรือสิทธิ์การเข้าถึง");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              {!logoError ? (
                <img
                  src={logoUrl}
                  alt="Company Logo"
                  onError={() => setLogoError(true)}
                  className="h-16 w-auto rounded-xl border border-slate-200 bg-white object-contain p-2 mb-3"
                />
              ) : (
                <div className="h-16 w-fit min-w-56 rounded-xl border border-slate-200 bg-white flex items-center justify-center px-4 mb-3 text-slate-700 font-semibold">
                  GOLD STAR METAL CO., LTD.
                </div>
              )}
              <p className="text-sm font-medium text-slate-500">Smart Energy Optimization System by BI</p>
              <h1 className="text-3xl font-bold tracking-tight">Energy Monitoring Web Dashboard</h1>
              <p className="text-slate-600 mt-2">
                แสดงผล 3 แผนก: รีด, ชุบ, พ่น โดยผู้ใช้งานทั่วไปเข้าดูกราฟได้ทันที และให้สิทธิ์กรอกข้อมูลเฉพาะผู้ดูแล
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-100 rounded-2xl px-4 py-3">
                <div className="text-slate-500">Viewer Access</div>
                <div className="font-semibold">เปิดดูได้ทันที</div>
              </div>
              <div className="bg-slate-100 rounded-2xl px-4 py-3">
                <div className="text-slate-500">Data Entry</div>
                <div className="font-semibold">เฉพาะคุณเท่านั้น</div>
              </div>
            </div>
          </div>
          {loadError ? <p className="mt-4 text-sm text-amber-700">{loadError}</p> : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5">
            <div className="text-sm text-slate-500">Average kWh/kg</div>
            <div className="text-3xl font-bold mt-2">{loading ? "..." : avgRatio.toFixed(3)}</div>
            <div className={`text-sm mt-2 font-medium ${avgReduction >= targetReduction ? "text-green-600" : "text-red-600"}`}>
              ลดลง {avgReduction.toFixed(1)}% | Target {targetReduction}%
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5">
            <div className="text-sm text-slate-500">Total Energy</div>
            <div className="text-3xl font-bold mt-2">{loading ? "..." : totalKwh.toLocaleString()}</div>
            <div className="text-sm text-slate-600 mt-2">kWh สะสม</div>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5">
            <div className="text-sm text-slate-500">Total Production</div>
            <div className="text-3xl font-bold mt-2">{loading ? "..." : totalProduction.toLocaleString()}</div>
            <div className="text-sm text-slate-600 mt-2">kg สะสม</div>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5">
            <div className="text-sm text-slate-500">Alert Departments</div>
            <div className={`text-3xl font-bold mt-2 ${alertDepartments.length > 0 ? "text-red-600" : "text-green-600"}`}>
              {loading ? "..." : alertDepartments.length}
            </div>
            <div className="text-sm text-slate-600 mt-2">แผนกที่ยังไม่ถึงเป้า 5%</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div>
                <h2 className="text-xl font-semibold">Monthly Trend (kWh/kg)</h2>
                <p className="text-sm text-slate-500">กราฟแนวโน้มรายเดือนของทั้ง 3 แผนก</p>
              </div>
              <div className="flex gap-2 text-xs flex-wrap">
                <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">รีด</span>
                <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">ชุบ</span>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">พ่น</span>
                <span className="px-3 py-1 rounded-full bg-slate-100">เส้นทึบ = Actual</span>
                <span className="px-3 py-1 rounded-full bg-slate-100">เส้นประ = Baseline 2568</span>
              </div>
            </div>

            <svg viewBox="0 0 560 260" className="w-full h-72">
              <line x1="36" y1="220" x2="524" y2="220" stroke="currentColor" className="text-slate-200" strokeWidth="2" />
              <line x1="36" y1="24" x2="36" y2="220" stroke="currentColor" className="text-slate-200" strokeWidth="2" />

              {[0, 1, 2, 3].map((i) => {
                const y = 220 - (i * 196) / 3;
                return (
                  <line
                    key={i}
                    x1="36"
                    y1={y}
                    x2="524"
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-100"
                    strokeWidth="1"
                  />
                );
              })}

              {trendSeries.map((series) => {
                const tone = getTone(series.department);
                const actualPts = buildPolyline(series.actualValues, trendMin, trendMax);
                const baselinePts = buildPolyline(series.baselineValues, trendMin, trendMax);

                return (
                  <g key={series.department}>
                    <polyline fill="none" stroke={tone} opacity="0.35" strokeWidth="2" strokeDasharray="6 4" points={baselinePts} />
                    <polyline fill="none" stroke={tone} strokeWidth="4" points={actualPts} />
                    {series.actualValues.map((value, i) => (
                      <circle
                        key={`${series.department}-${i}`}
                        cx={getSvgX(i, series.actualValues.length)}
                        cy={getSvgY(value, trendMin, trendMax)}
                        r="4"
                        fill={tone}
                      />
                    ))}
                  </g>
                );
              })}

              {months.map((month, i) => (
                <text key={month} x={getSvgX(i, months.length)} y="244" textAnchor="middle" className="fill-slate-500 text-xs">
                  {monthLabel(month)}
                </text>
              ))}
            </svg>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Admin Data Entry</h2>
              <p className="text-sm text-slate-500 mt-1">ผู้เข้าชมทั่วไปจะเห็นเฉพาะกราฟ ส่วนการกรอกข้อมูลเปิดให้เฉพาะคุณ</p>
            </div>

            {!isAdmin ? (
              <div className="space-y-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ใส่รหัสผ่านเพื่อกรอกข้อมูล"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
                />
                <button onClick={handleLogin} className="w-full rounded-2xl bg-slate-800 text-white px-4 py-3 font-medium">
                  เข้าสู่โหมดกรอกข้อมูล
                </button>
                {loginError ? <p className="text-sm text-red-600">{loginError}</p> : null}
              </div>
            ) : (
              <form onSubmit={handleAddRow} className="space-y-3">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
                />
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value as Department })}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={form.kwh}
                  onChange={(e) => setForm({ ...form, kwh: e.target.value })}
                  placeholder="ปริมาณการใช้ไฟฟ้า (kWh)"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
                />
                <input
                  type="number"
                  value={form.production}
                  onChange={(e) => setForm({ ...form, production: e.target.value })}
                  placeholder="ปริมาณผลผลิต (kg)"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
                />
                <button type="submit" className="w-full rounded-2xl bg-slate-800 text-white px-4 py-3 font-medium">
                  บันทึกข้อมูลรายวัน
                </button>
                {submitStatus ? <p className="text-sm text-slate-600">{submitStatus}</p> : null}
              </form>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Ranking by Reduction</h2>
                <p className="text-sm text-slate-500">จัดอันดับแผนกตาม % การลดพลังงาน</p>
              </div>
            </div>
            <div className="space-y-3">
              {deptSummary.map((row, index) => (
                <div key={row.department} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-500">อันดับ {index + 1}</div>
                      <div className="font-semibold text-lg">{row.department}</div>
                    </div>
                    <div className={`text-lg font-bold ${row.onTarget ? "text-green-600" : "text-red-600"}`}>{row.reductionPct.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Alert Panel</h2>
                <p className="text-sm text-slate-500">แจ้งเตือนแผนกที่ยังไม่ถึงเป้าหมาย</p>
              </div>
            </div>
            <div className="space-y-3">
              {alertDepartments.length === 0 ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700 font-medium">ทุกแผนกถึงเป้าหมายแล้ว</div>
              ) : (
                alertDepartments.map((row) => (
                  <div key={row.department} className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-red-700">{row.department}</div>
                        <div className="text-sm text-red-600">ลดได้ {row.reductionPct.toFixed(1)}% | เป้าหมาย {targetReduction}%</div>
                      </div>
                      <div className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700">Alert</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Department Summary</h2>
                <p className="text-sm text-slate-500">สรุปพลังงานและผลผลิตของแต่ละแผนก</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-3 pr-4">แผนก</th>
                    <th className="py-3 pr-4">kWh</th>
                    <th className="py-3 pr-4">kg</th>
                    <th className="py-3 pr-4">Baseline</th>
                    <th className="py-3 pr-4">kWh/kg</th>
                    <th className="py-3 pr-4">% ลดลง</th>
                    <th className="py-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deptSummary.map((row) => (
                    <tr key={row.department} className="border-b border-slate-100">
                      <td className="py-4 pr-4 font-medium">{row.department}</td>
                      <td className="py-4 pr-4">{row.totalKwh.toLocaleString()}</td>
                      <td className="py-4 pr-4">{row.totalProduction.toLocaleString()}</td>
                      <td className="py-4 pr-4">{row.baseline.toFixed(3)}</td>
                      <td className="py-4 pr-4">{row.ratio.toFixed(3)}</td>
                      <td className={`py-4 pr-4 font-medium ${row.onTarget ? "text-green-600" : "text-red-600"}`}>{row.reductionPct.toFixed(1)}%</td>
                      <td className="py-4 pr-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${row.onTarget ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {row.onTarget ? "On Target" : "Alert"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Recent Daily Records</h2>
              <p className="text-sm text-slate-500">รายการข้อมูลรายวันที่กรอกล่าสุด</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-3 pr-4">วันที่</th>
                  <th className="py-3 pr-4">แผนก</th>
                  <th className="py-3 pr-4">kWh</th>
                  <th className="py-3 pr-4">kg</th>
                  <th className="py-3 pr-4">kWh/kg</th>
                </tr>
              </thead>
              <tbody>
                {latestRows.map((row, idx) => (
                  <tr key={`${row.date}-${row.department}-${idx}`} className="border-b border-slate-100">
                    <td className="py-4 pr-4">{formatThaiDate(row.date)}</td>
                    <td className="py-4 pr-4 font-medium">{row.department}</td>
                    <td className="py-4 pr-4">{Number(row.kwh).toLocaleString()}</td>
                    <td className="py-4 pr-4">{Number(row.production).toLocaleString()}</td>
                    <td className="py-4 pr-4">{kwhPerKg(row).toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
