let barChart = null, pieChart = null, lineChart = null;

function switchTab(tab) {
    const isInv = tab === "inventory";
    document.getElementById("pane-inventory").classList.toggle("hidden", !isInv);
    document.getElementById("pane-sales").classList.toggle("hidden", isInv);
    document.getElementById("tab-inv").className = `px-4 py-1.5 rounded-md text-sm font-medium transition ${isInv ? "bg-white shadow text-green-700" : "text-gray-500 hover:text-gray-700"}`;
    document.getElementById("tab-sales").className = `px-4 py-1.5 rounded-md text-sm font-medium transition ${!isInv ? "bg-white shadow text-green-700" : "text-gray-500 hover:text-gray-700"}`;
    document.getElementById("page-title").textContent = isInv ? "Inventory Report" : "Sales Report";
    document.getElementById("page-sub").textContent = isInv ? "Current stock levels & valuation" : "Sales transactions & revenue";
    history.replaceState(null, "", `?tab=${tab}`);
    if (isInv) loadInventory(); else loadSales();
}

function summaryCard(label, value, sub) {
    return `<div class="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-5">
    <div class="text-xs text-gray-400 uppercase tracking-wide mb-2">${label}</div>
    <div class="text-2xl font-bold text-gray-800">${value}</div>
    <div class="text-xs text-gray-400 mt-1">${sub}</div>
  </div>`;
}

async function loadInventory() {
    let data;
    try {
        data = await api.get("/reports/inventory");
    } catch (err) {
        showToast("Failed to load inventory report: " + err.message, "error");
        return;
    }
    if (!data) return;

    document.getElementById("inv-summary").innerHTML =
        summaryCard("Total SKUs", data.items.length, "Products in catalog") +
        summaryCard("Total Units", data.items.reduce((s, p) => s + p.quantity, 0).toLocaleString(), "Across all products") +
        summaryCard("Inventory Value", formatPHP(data.items.reduce((s, p) => s + p.total_value, 0)), "Current total valuation");

    const sorted = [...data.items].sort((a, b) => b.quantity - a.quantity).slice(0, 10);
    if (barChart) barChart.destroy();
    barChart = new Chart(document.getElementById("chart-bar"), {
        type: "bar",
        data: {
            labels: sorted.map(p => p.name.substring(0, 18)), datasets: [{
                label: "Units", data: sorted.map(p => p.quantity),
                backgroundColor: sorted.map(p => p.quantity < p.threshold ? "#fbbf24" : "#16a34a"), borderRadius: 6
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: { x: { ticks: { font: { size: 10 } } }, y: { beginAtZero: true } }
        }
    });

    const cats = data.by_category.filter(c => c.total_value > 0);
    if (pieChart) pieChart.destroy();
    pieChart = new Chart(document.getElementById("chart-pie"), {
        type: "pie",
        data: {
            labels: cats.map(c => c.category.split("&")[0].trim()),
            datasets: [{ data: cats.map(c => c.total_value), backgroundColor: ["#16a34a", "#f59e0b", "#2563eb", "#dc2626", "#7c3aed"], borderWidth: 2, borderColor: "#fff" }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, plugins: {
                legend: { position: "bottom", labels: { font: { size: 10 }, padding: 8 } },
                tooltip: { callbacks: { label: ctx => ` ${formatPHP(ctx.raw)}` } }
            }
        }
    });

    document.getElementById("inv-table").innerHTML = data.items.map((p, i) => `
    <tr class="border-b border-gray-50">
      <td class="px-6 py-3 text-xs text-gray-400">${i + 1}</td>
      <td class="px-4 py-3 font-medium text-gray-800">${p.name}</td>
      <td class="px-4 py-3"><span class="px-2 py-0.5 text-xs rounded-full bg-stone-100 text-stone-600">${p.category}</span></td>
      <td class="px-4 py-3 text-right text-green-700 font-semibold">${formatPHP(p.price)}</td>
      <td class="px-4 py-3 text-right font-semibold">${p.quantity}</td>
      <td class="px-4 py-3 text-right font-semibold">${formatPHP(p.total_value)}</td>
      <td class="px-4 py-3">${statusBadge(p.status)}</td>
    </tr>`).join("");
}

async function loadSales() {
    let data;
    try {
        data = await api.get("/reports/sales");
    } catch (err) {
        showToast("Failed to load sales report: " + err.message, "error");
        return;
    }
    if (!data) return;

    document.getElementById("sales-summary").innerHTML =
        summaryCard("Transactions", data.total_transactions, "Stock-out records") +
        summaryCard("Units Sold", data.total_units_sold.toLocaleString(), "Total units moved out") +
        summaryCard("Est. Revenue", formatPHP(data.total_revenue), "Based on current unit price");

    // Build 7-day revenue chart.
    // Backend date format is "YYYY-MM-DD HH:MM" so startsWith("YYYY-MM-DD") is safe.
    const days = []; const rev = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        days.push(d.toLocaleDateString("en-PH", { month: "short", day: "numeric" }));
        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        rev.push(data.transactions.filter(t => t.date.startsWith(ds)).reduce((s, t) => s + t.revenue, 0));
    }
    if (lineChart) lineChart.destroy();
    lineChart = new Chart(document.getElementById("chart-line"), {
        type: "line",
        data: {
            labels: days, datasets: [{
                label: "Revenue", data: rev, borderColor: "#16a34a", backgroundColor: "rgba(22,163,74,.08)", borderWidth: 2.5,
                pointBackgroundColor: "#16a34a", pointRadius: 4, fill: true, tension: 0.4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => ` ${formatPHP(ctx.raw)}` } }
            },
            scales: { x: { ticks: { font: { size: 11 } } }, y: { beginAtZero: true, ticks: { font: { size: 11 }, callback: v => "₱" + Number(v).toLocaleString() } } }
        }
    });

    // Sales transaction table
    document.getElementById("sales-table").innerHTML = data.transactions.length
        ? data.transactions.map((t, i) => `
      <tr class="border-b border-gray-50">
        <td class="px-6 py-3 text-xs text-gray-400">${i + 1}</td>
        <td class="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">${t.date}</td>
        <td class="px-4 py-3 font-medium text-gray-800">${t.product_name}</td>
        <td class="px-4 py-3 text-right font-semibold">${t.quantity}</td>
        <td class="px-4 py-3 text-right">${formatPHP(t.unit_price)}</td>
        <td class="px-4 py-3 text-right font-bold text-green-700">${formatPHP(t.revenue)}</td>
        <td class="px-4 py-3 text-xs text-gray-400 max-w-[120px] truncate">${t.note || "—"}</td>
      </tr>`).join("")
        : `<tr><td colspan="7" class="px-6 py-10 text-center text-gray-400">No sales recorded yet.</td></tr>`;
}

// urlParams and activeTab are already declared in reports.html (before this
// script is loaded), so just call switchTab directly — no re-declaration needed.
switchTab(urlParams.get("tab") || "inventory");