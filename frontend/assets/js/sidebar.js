/* assets/js/sidebar.js
   Call renderSidebar("products") from each page to inject the sidebar + topbar.
   The argument is the active nav key.
*/
function renderSidebar(activePage) {
    requireAuth();
    const user = getUser();

    const nav = [
        { key: "dashboard", label: "Dashboard", icon: "🏠", href: "dashboard.html" },
        { key: "products", label: "Products", icon: "📦", href: "products.html" },
        { key: "categories", label: "Categories", icon: "🏷️", href: "categories.html" },
        { key: "stock", label: "Stock In / Out", icon: "🔄", href: "stock.html" },
        { key: "alerts", label: "Low Stock Alerts", icon: "⚠️", href: "alerts.html", badge: true },
        { key: "inventory-report", label: "Inventory Report", icon: "📊", href: "reports.html?tab=inventory" },
        { key: "sales-report", label: "Sales Report", icon: "📈", href: "reports.html?tab=sales" },
    ];

    const sections = [
        { title: "Main Menu", keys: ["dashboard", "products", "categories"] },
        { title: "Inventory", keys: ["stock", "alerts"] },
        { title: "Reports", keys: ["inventory-report", "sales-report"] },
    ];

    const navHTML = sections.map(sec => {
        const items = nav.filter(n => sec.keys.includes(n.key)).map(n => `
      <a href="${n.href}" class="flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-150
        ${n.key === activePage ? "nav-active font-semibold" : "text-green-200 hover:bg-green-900 hover:text-white"}"
        id="nav-${n.key}">
        <span class="w-5 text-center">${n.icon}</span>
        <span>${n.label}</span>
        ${n.badge ? `<span id="sidebar-badge" class="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full hidden">0</span>` : ""}
      </a>`).join("");
        return `
      <div class="px-5 pt-5 pb-1 text-xs font-bold uppercase tracking-widest text-green-600 opacity-60">${sec.title}</div>
      ${items}`;
    }).join("");

    const sidebar = `
  <nav class="fixed left-0 top-0 bottom-0 w-64 flex flex-col z-40 no-print"
       style="background:#0c2210;border-right:1px solid #1a3a1a">
    <div class="px-5 py-6 border-b border-green-900">
      <div class="flex items-center gap-3 mb-1">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
             style="background:linear-gradient(135deg,#15803d,#22c55e)">🌾</div>
        <div>
          <div class="font-bold text-white text-sm leading-tight">SLPA-IMS</div>
          <div class="text-green-400 text-xs leading-tight">General Merchandise</div>
        </div>
      </div>
      <div class="mt-3 flex items-center gap-2 bg-green-950 rounded-lg px-3 py-2">
        <div class="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-xs font-bold text-amber-900 flex-shrink-0">
          ${user ? user.full_name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() : "AD"}
        </div>
        <div class="min-w-0">
          <div class="text-white text-xs font-semibold truncate">${user ? user.full_name : "Administrator"}</div>
          <div class="text-green-400 text-xs">${user ? user.role : "Admin"}</div>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto py-2">${navHTML}</div>

    <div class="px-4 py-4 border-t border-green-900">
      <button onclick="clearAuth()"
              class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-green-800 text-green-300 text-sm hover:bg-red-900 hover:border-red-700 hover:text-red-200 transition">
        🚪 Sign Out
      </button>
    </div>
  </nav>`;

    document.body.insertAdjacentHTML("afterbegin", sidebar);

    // Update low stock badge
    api.get("/products/low-stock").then(items => {
        const badge = document.getElementById("sidebar-badge");
        if (badge && items && items.length > 0) {
            badge.textContent = items.length;
            badge.classList.remove("hidden");
        }
    }).catch(() => { });
}

// Confirm modal HTML — injected once per page
function renderConfirmModal() {
    const html = `
  <div id="confirm-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center modal-backdrop bg-black bg-opacity-50">
    <div class="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
      <div class="text-4xl mb-3">🗑️</div>
      <h3 id="confirm-title" class="text-lg font-bold text-gray-800 mb-2">Confirm Delete</h3>
      <p id="confirm-msg" class="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
      <div class="flex gap-3 justify-center">
        <button id="confirm-cancel" class="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
        <button id="confirm-ok" class="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition">Delete</button>
      </div>
    </div>
  </div>`;
    document.body.insertAdjacentHTML("beforeend", html);
}