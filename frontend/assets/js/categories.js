let editId = null;

async function loadCategories() {
    const cats = await api.get("/categories/") || [];
    const tbody = document.getElementById("cat-table");
    if (!cats.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-10 text-center text-gray-400">No categories yet.</td></tr>`;
        return;
    }
    tbody.innerHTML = cats.map((c, i) => `
    <tr class="border-b border-gray-50">
      <td class="px-6 py-3 text-gray-400 text-xs">${i + 1}</td>
      <td class="px-4 py-3 font-semibold text-gray-800">${c.name}</td>
      <td class="px-4 py-3 text-gray-500 text-sm max-w-xs">${c.description || "—"}</td>
      <td class="px-4 py-3"><span class="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">${c.product_count} products</span></td>
      <td class="px-4 py-3 text-center whitespace-nowrap">
        <button onclick="openModal(${c.id})" class="px-3 py-1.5 rounded-lg text-xs border border-amber-200 text-amber-600 hover:bg-amber-50 transition mr-1">✏️ Edit</button>
        <button onclick="deleteCategory(${c.id},'${c.name.replace(/'/g, "\\'")}')" class="px-3 py-1.5 rounded-lg text-xs border border-red-200 text-red-600 hover:bg-red-50 transition">🗑️</button>
      </td>
    </tr>`).join("");
}

function closeModal() {
    document.getElementById("cat-modal").classList.add("hidden");
    editId = null;
}

async function openModal(id = null) {
    editId = id;
    document.getElementById("modal-title").textContent = id ? "Edit Category" : "Add Category";
    document.getElementById("fc-name").value = "";
    document.getElementById("fc-desc").value = "";
    document.getElementById("err-name").classList.add("hidden");
    if (id) {
        const c = await api.get(`/categories/${id}`);
        document.getElementById("fc-name").value = c.name;
        document.getElementById("fc-desc").value = c.description || "";
    }
    document.getElementById("cat-modal").classList.remove("hidden");
}

async function saveCategory() {
    const name = document.getElementById("fc-name").value.trim();
    const description = document.getElementById("fc-desc").value.trim();
    const errEl = document.getElementById("err-name");
    if (!name) { errEl.textContent = "Name is required."; errEl.classList.remove("hidden"); return; }
    errEl.classList.add("hidden");
    try {
        if (editId) { await api.put(`/categories/${editId}`, { name, description }); showToast("Category updated!"); }
        else { await api.post("/categories/", { name, description }); showToast("Category added!"); }
        closeModal();
        await loadCategories();
    } catch (err) { showToast(err.message, "error"); }
}

async function deleteCategory(id, name) {
    confirmDialog("Delete Category", `Delete "${name}"?`, async () => {
        try { await api.delete(`/categories/${id}`); showToast("Category deleted.", "warning"); await loadCategories(); }
        catch (err) { showToast(err.message, "error"); }
    });
}

loadCategories();