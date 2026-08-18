import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios.js";
import { formatPound } from "../utils/currency.js";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function Metric({ label, value }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-navy mt-1">{value}</p>
    </div>
  );
}

function LineGraph({ data, title, subtitle, colorClass = "#0ea5a8", valueKey = "revenue" }) {
  const points = useMemo(() => {
    if (!data.length) return "";
    const width = 720;
    const height = 220;
    const padding = 28;
    const values = data.map((item) => Number(item[valueKey] || 0));
    const maxValue = Math.max(1, ...values);
    const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

    return data
      .map((item, index) => {
        const x = padding + index * stepX;
        const y = height - padding - (Number(item[valueKey] || 0) / maxValue) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");
  }, [data, valueKey]);

  const labels = data.map((item) => new Date(item.day).toLocaleDateString(undefined, { month: "short", day: "numeric" }));

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 720 220" className="w-full min-w-[620px] h-auto" role="img" aria-label={title}>
          {[0, 1, 2, 3, 4].map((tick) => {
            const y = 28 + tick * 41;
            return <line key={tick} x1="28" y1={y} x2="692" y2={y} stroke="#e5e7eb" strokeWidth="1" />;
          })}
          {points && <polyline fill="none" stroke={colorClass} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={points} />}
          {data.map((item, index) => {
            const width = 720;
            const height = 220;
            const padding = 28;
            const values = data.map((entry) => Number(entry[valueKey] || 0));
            const maxValue = Math.max(1, ...values);
            const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
            const x = padding + index * stepX;
            const y = height - padding - (Number(item[valueKey] || 0) / maxValue) * (height - padding * 2);
            return (
              <g key={item.day}>
                <circle cx={x} cy={y} r="4" fill={colorClass} />
                <title>{`${labels[index]}: ${valueKey === "revenue" ? formatPound(item[valueKey]) : item[valueKey]}`}</title>
              </g>
            );
          })}
          {data.map((item, index) => {
            const width = 720;
            const padding = 28;
            const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
            const x = padding + index * stepX;
            return (
              <text key={`${item.day}-label`} x={x} y="208" fontSize="10" fill="#6b7280" textAnchor="middle">
                {labels[index]}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function AdminSales() {
  const [sales, setSales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reportRef = useRef(null);

  useEffect(() => {
    api
      .get("/admin/sales")
      .then(({ data }) => setSales(data))
      .catch((err) => setError(err.response?.data?.message || "Could not load sales data."))
      .finally(() => setLoading(false));
  }, []);

  const paymentRows = useMemo(() => sales?.paymentBreakdown || [], [sales]);
  const dailyRevenue = useMemo(() => sales?.dailyRevenue || [], [sales]);
  const monthlySoldItems = useMemo(() => sales?.monthlySoldItems || [], [sales]);
  const recentOrders = useMemo(() => sales?.recentOrders || [], [sales]);

  const monthlyCalendar = useMemo(() => {
    const years = new Map();
    monthlySoldItems.forEach((row) => {
      const year = String(row.year);
      if (!years.has(year)) {
        years.set(year, Array.from({ length: 12 }, (_, index) => ({
          monthNumber: index + 1,
          month: monthNames[index],
          quantity: 0,
          revenue: 0,
        })));
      }
      const months = years.get(year);
      const monthIndex = Number(row.month_number || row.month) - 1;
      if (months[monthIndex]) {
        months[monthIndex] = {
          ...months[monthIndex],
          quantity: Number(row.quantity || 0),
          revenue: Number(row.revenue || 0),
        };
      }
    });
    return Array.from(years.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [monthlySoldItems]);

  const downloadPdf = () => {
    window.print();
  };

  if (loading) return <div className="text-gray-500">Loading sales report…</div>;
  if (error) return <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>;

  return (
    <div className="space-y-6 print-report" ref={reportRef}>
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold">Sales report</h1>
          <p className="text-sm text-gray-500">Revenue trends, sold items, and payment method breakdown.</p>
        </div>
        <button onClick={downloadPdf} className="btn-primary text-sm">
          Download PDF
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Metric label="Revenue" value={formatPound(sales.totalRevenue)} />
        <Metric label="Paid revenue" value={formatPound(sales.paidRevenue)} />
        <Metric label="Sold items" value={sales.totalSoldItems} />
        <Metric label="Paid orders" value={sales.paidOrders} />
      </div>

      <div className="grid xl:grid-cols-[1.35fr_0.9fr] gap-6 items-start">
        <div className="space-y-6">
          <LineGraph
            data={dailyRevenue}
            title="Daily revenue trend"
            subtitle="Last 14 days. Hover points in the SVG for exact values, then print or save as PDF."
            valueKey="revenue"
            colorClass="#0ea5a8"
          />
          <LineGraph
            data={dailyRevenue}
            title="Daily order volume"
            subtitle="Daily order count for the same 14-day window."
            valueKey="order_count"
            colorClass="#f59e0b"
          />
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="font-semibold mb-4">Payment methods</h2>
            <div className="space-y-3">
              {paymentRows.map((row) => (
                <div key={row.payment_method} className="flex justify-between text-sm border-b pb-2 last:border-b-0 last:pb-0">
                  <span className="capitalize">{row.payment_method.replace(/_/g, " ")}</span>
                  <span className="font-medium">
                    {formatPound(row.revenue)} · {row.count} orders
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold mb-4">Top sold items</h2>
            <div className="space-y-3">
              {sales.topProducts.map((item) => (
                <div key={item.product_id} className="flex justify-between gap-4 text-sm border-b pb-2 last:border-b-0 last:pb-0">
                  <div>
                    <p className="font-medium line-clamp-1">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.quantity} sold</p>
                  </div>
                  <span className="font-medium">{formatPound(item.revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold mb-4">Recent orders</h2>
            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-gray-500">No completed orders yet.</p>
              ) : (
                recentOrders.map((order) => {
                  const date = new Date(order.created_at);
                  return (
                    <div key={order.id} className="rounded-lg border p-3 bg-gray-50/70">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-navy">Order #{order.id}</p>
                          <p className="text-xs text-gray-500">{order.full_name || order.username}</p>
                        </div>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${order.status === "delivered" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>
                          <p className="text-gray-400">Date</p>
                          <p className="font-medium">{date.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Day</p>
                          <p className="font-medium">{date.toLocaleDateString(undefined, { weekday: "long" })}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Month</p>
                          <p className="font-medium">{date.toLocaleDateString(undefined, { month: "long" })}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Payment</p>
                          <p className="font-medium capitalize">{(order.payment_method || "unknown").replace(/_/g, " ")}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        <span>{formatPound(order.total)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-semibold">Sold items calendar</h2>
            <p className="text-xs text-gray-500 mt-1">Monthly sold-item totals grouped by year and month.</p>
          </div>
          <div className="text-xs text-gray-500 text-right">
            <p>Each cell shows sold quantity and revenue.</p>
            <p className="print:hidden">Use the print button above to save this report as PDF.</p>
          </div>
        </div>

        {monthlyCalendar.length === 0 ? (
          <p className="text-sm text-gray-500">No sold item history yet.</p>
        ) : (
          <div className="space-y-6">
            {monthlyCalendar.map(([year, months]) => {
              const maxQuantity = Math.max(1, ...months.map((item) => item.quantity));
              return (
                <section key={year} className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-navy">{year}</h3>
                    <span className="text-xs text-gray-500">Calendar view</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {months.map((item) => {
                      const intensity = item.quantity === 0 ? 0 : Math.min(0.15 + (item.quantity / maxQuantity) * 0.75, 0.9);
                      const backgroundColor = item.quantity === 0 ? "#f9fafb" : `rgba(14, 165, 168, ${intensity})`;
                      return (
                        <div
                          key={`${year}-${item.month}`}
                          className="rounded-lg border p-3 min-h-[92px] flex flex-col justify-between"
                          style={{ backgroundColor }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-gray-800">{item.month}</span>
                            <span className="text-[11px] text-gray-500">{item.quantity} sold</span>
                          </div>
                          <div className="mt-2">
                            <p className="text-lg font-bold text-navy">{item.quantity}</p>
                            <p className="text-xs text-gray-600">{formatPound(item.revenue)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <div className="hidden print:block text-xs text-gray-500">
        Generated from the Kartly admin sales report.
      </div>
    </div>
  );
}