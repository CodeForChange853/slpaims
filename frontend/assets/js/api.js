
const _host = window.location.hostname || "localhost";
const BASE_URL = `http://${_host}:8000/api`;

function getToken() {
    return localStorage.getItem("slpa_token");
}

function setToken(token) {
    localStorage.setItem("slpa_token", token);
}

function clearAuth() {
    localStorage.removeItem("slpa_token");
    localStorage.removeItem("slpa_user");
    window.location.href = "index.html";
}

function getUser() {
    const u = localStorage.getItem("slpa_user");
    return u ? JSON.parse(u) : null;
}

async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const response = await fetch(BASE_URL + path, { ...options, headers });

    if (response.status === 401) {
        clearAuth();
        return null;
    }

    if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(err.detail || "Request failed");
    }

    if (response.status === 204) return null;
    return response.json();
}

// Shorthand helpers
const api = {
    get: (path) => apiFetch(path),
    post: (path, body) => apiFetch(path, { method: "POST", body: JSON.stringify(body) }),
    put: (path, body) => apiFetch(path, { method: "PUT", body: JSON.stringify(body) }),
    delete: (path) => apiFetch(path, { method: "DELETE" }),
};

// Require login on every protected page
function requireAuth() {
    if (!getToken()) {
        window.location.href = "index.html";
    }
}

// Format helpers
function formatPHP(value) {
    return "₱" + Number(value).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format an ISO datetime string (e.g. "2026-05-07T14:32:00+00:00") into
// a readable local date-time such as "May 7, 2026, 2:32 PM".
function formatDateTime(isoString) {
    if (!isoString) return "—";
    const d = new Date(isoString);
    if (isNaN(d)) return isoString;   // fall back to raw value if unparseable
    return d.toLocaleString("en-PH", {
        year: "numeric", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true
    });
}

function statusBadge(status) {
    const map = {
        in_stock: '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">In Stock</span>',
        low_stock: '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">Low Stock</span>',
        out_of_stock: '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">Out of Stock</span>',
    };
    return map[status] || "";
}

function showToast(msg, type = "success") {
    const colors = { success: "bg-green-600", error: "bg-red-600", warning: "bg-amber-500" };
    const icons = { success: "✅", error: "❌", warning: "⚠️" };
    const el = document.createElement("div");
    el.className = `fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-xl ${colors[type]} transition-all duration-300`;
    el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; setTimeout(() => el.remove(), 300); }, 3000);
}

function confirmDialog(title, msg, onConfirm) {
    document.getElementById("confirm-title").textContent = title;
    document.getElementById("confirm-msg").textContent = msg;
    document.getElementById("confirm-modal").classList.remove("hidden");
    document.getElementById("confirm-ok").onclick = () => {
        document.getElementById("confirm-modal").classList.add("hidden");
        onConfirm();
    };
    document.getElementById("confirm-cancel").onclick = () => {
        document.getElementById("confirm-modal").classList.add("hidden");
    };
}
