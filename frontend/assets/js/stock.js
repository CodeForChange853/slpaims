let products = [];

async function init() {
    products = await api.get("/products/") || [];
    const sel = document.getElementById("tx-product");
    sel.innerHTML = '<option value="">Select product…</option>' +
        products.map(p => `<option value="${p.id}">${p.name} (Qty: ${p.quantity})</option>`).join("");
    await loadHistory();
}

function updatePreview() {
    const type = document.getElementById("tx-type").value;
    const pid = parseInt(document.getElementById("tx-product").value);
    const qty = parseInt(document.getElementById("tx-qty").value) || 0;
    const preview = document.getElementById("tx-preview");

    if (!pid || !qty) { preview.classList.add("hidden"); return; }
    const p = products.find(x => x.id === pid);
    if (!p) { preview.classList.add("hidden"); return; }

    const after = type === "in" ? p.quantity + qty : p.quantity - qty;
    const color = after < 0 ? "text-red-600" : after < p.threshold ? "text-amber-600" : "text-green-700";
    preview.classList.remove("hidden");
    preview.innerHTML = `
    <strong>${type === "in" ? "📥 Stock In" : "📤 Stock Out"}</strong>: ${p.name}<br>
    Current: <strong>${p.quantity}</strong> → After: <strong class="${color}">${after}</strong>
    ${after < 0 ? '<br><span class="text-red-600 font-semibold">⚠️ Cannot exceed available stock!</span>' : ""}`;
}

async function submitTransaction() {
    const type = document.getElementById("tx-type").value;
    const pid = parseInt(document.getElementById("tx-product").value);
    const qty = parseInt(document.getElementById("tx-qty").value);
    const note = document.getElementById("tx-note").value.trim() || undefined;

    if (!pid) { showToast("Please select a product.", "error"); return; }
    if (!qty || qty <= 0) { showToast("Enter a valid quantity.", "error"); return; }

    try {
        const endpoint = type === "in" ? "/stock/in" : "/stock/out";
        await api.post(endpoint, { product_id: pid, quantity: qty, note });
        showToast(`${type === "in" ? "📥 Stock In" : "📤 Stock Out"}: ${qty} units recorded!`);
        document.getElementById("tx-qty").value = 1;
        document.getElementById("tx-note").value = "";
        document.getElementById("tx-preview").classList.add("hidden");
        await init();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function loadHistory() {
    const filter = document.getElementById("tx-filter").value;
    let url = "/stock/history?limit=100";
    if (filter) url += `&type=${filter}`;
    const txs = await api.get(url) || [];
    const tbody = document.getElementById("tx-table");
    tbody.innerHTML = txs.length ? txs.map(tx => `
    <tr class="border-b border-gray-50">
      <td class="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">${tx.created_at}</td>
      <td class="px-4 py-3 font-medium text-gray-700 max-w-[160px] truncate">${tx.product_name || "—"}</td>
      <td class="px-4 py-3">${tx.type === "in"
            ? '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">📥 In</span>'
            : '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">📤 Out</span>'}</td>
      <td class="px-4 py-3 font-semibold ${tx.type === "in" ? "text-green-600" : "text-red-600"}">${tx.type === "in" ? "+" : "-"}${tx.quantity}</td>
      <td class="px-4 py-3 font-semibold text-gray-800">${tx.stock_after}</td>
      <td class="px-4 py-3 text-xs text-gray-500 max-w-[140px] truncate">${tx.note || "—"}</td>
    </tr>`).join("")
        : `<tr><td colspan="6" class="px-6 py-10 text-center text-gray-400">No transactions recorded yet.</td></tr>`;
}

init();