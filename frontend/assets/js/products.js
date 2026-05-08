let editId = null;
let categories = [];

async function init() {
    categories = await api.get("/categories/") || [];
    const sel = document.getElementById("cat-filter");
    categories.forEach(c => sel.insertAdjacentHTML("beforeend", `<option value="${c.id}">${c.name}</option>`));
    await loadProducts();
}

async function loadProducts() {
    const search = document.getElementById("search").value.trim();
    const catId = document.getElementById("cat-filter").value;
    let url = "/products/?";
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (catId) url += `category_id=${catId}`;

    const products = await api.get(url) || [];
    const tbody = document.getElementById("prod-table");
    if (!products.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-10 text-center text-gray-400">No products found.</td></tr>`;
        return;
    }
    tbody.innerHTML = products.map((p, i) => {
        const pct = Math.min(100, (p.quantity / Math.max(p.quantity, p.threshold * 2)) * 100);
        const barColor = p.quantity === 0 ? "#dc2626" : p.quantity < p.threshold ? "#f59e0b" : "#16a34a";
        return `<tr class="border-b border-gray-50">
      <td class="px-6 py-3 text-gray-400 text-xs">${i + 1}</td>
      <td class="px-4 py-3 font-medium text-gray-800 max-w-[180px]">${p.name}</td>
      <td class="px-4 py-3">
        <span class="px-2 py-0.5 text-xs rounded-full bg-stone-100 text-stone-600">${p.category_name || "—"}</span>
      </td>
      <td class="px-4 py-3 font-semibold text-green-700">${formatPHP(p.price)}</td>
      <td class="px-4 py-3">
        <div class="flex items-center gap-2 min-w-[100px]">
          <div class="stock-bar flex-1"><div class="stock-bar-fill" style="width:${pct}%;background:${barColor}"></div></div>
          <span class="text-xs text-gray-500">${p.quantity}/${p.threshold}</span>
        </div>
      </td>
      <td class="px-4 py-3">${statusBadge(p.status)}</td>
      <td class="px-4 py-3 text-center whitespace-nowrap">
        <button onclick="openModal(${p.id})" class="px-3 py-1.5 rounded-lg text-xs border border-amber-200 text-amber-600 hover:bg-amber-50 transition mr-1">✏️ Edit</button>
        <button onclick="deleteProduct(${p.id},'${p.name.replace(/'/g, "\\'")}')" class="px-3 py-1.5 rounded-lg text-xs border border-red-200 text-red-600 hover:bg-red-50 transition">🗑️</button>
      </td>
    </tr>`;
    }).join("");
}

function closeModal() {
    document.getElementById("prod-modal").classList.add("hidden");
    editId = null;
}

async function openModal(id = null) {
    editId = id;
    document.getElementById("modal-title").textContent = id ? "Edit Product" : "Add Product";
    const catSel = document.getElementById("f-cat");
    catSel.innerHTML = '<option value="">Select…</option>' + categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    ["f-name", "f-price", "f-qty", "f-desc"].forEach(f => document.getElementById(f).value = "");
    document.getElementById("f-threshold").value = "10";
    document.getElementById("f-cat").value = "";
    ["err-name", "err-price", "err-qty"].forEach(e => document.getElementById(e).classList.add("hidden"));

    if (id) {
        const p = await api.get(`/products/${id}`);
        document.getElementById("f-name").value = p.name;
        document.getElementById("f-cat").value = p.category_id || "";
        document.getElementById("f-price").value = p.price;
        document.getElementById("f-qty").value = p.quantity;
        document.getElementById("f-threshold").value = p.threshold;
        document.getElementById("f-desc").value = p.description || "";
    }
    document.getElementById("prod-modal").classList.remove("hidden");
}

async function saveProduct() {
    const name = document.getElementById("f-name").value.trim();
    const price = parseFloat(document.getElementById("f-price").value);
    const quantity = parseInt(document.getElementById("f-qty").value);
    const threshold = parseInt(document.getElementById("f-threshold").value) || 10;
    const category_id = parseInt(document.getElementById("f-cat").value) || null;
    const description = document.getElementById("f-desc").value.trim();

    let valid = true;
    function setErr(id, msg) {
        const el = document.getElementById(id);
        el.textContent = msg; el.classList.toggle("hidden", !msg);
        if (msg) valid = false;
    }
    setErr("err-name", !name ? "Name is required." : "");
    setErr("err-price", isNaN(price) || price < 0 ? "Enter a valid price." : "");
    setErr("err-qty", isNaN(quantity) || quantity < 0 ? "Enter a valid quantity." : "");
    if (!valid) return;

    const body = { name, price, quantity, threshold, category_id, description };
    try {
        if (editId) { await api.put(`/products/${editId}`, body); showToast("Product updated!"); }
        else { await api.post("/products/", body); showToast("Product added!"); }
        closeModal();
        await loadProducts();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function deleteProduct(id, name) {
    confirmDialog("Delete Product", `Delete "${name}"? This cannot be undone.`, async () => {
        try {
            await api.delete(`/products/${id}`);
            showToast("Product deleted.", "warning");
            await loadProducts();
        } catch (err) {
            showToast(err.message, "error");
        }
    });
}

init();