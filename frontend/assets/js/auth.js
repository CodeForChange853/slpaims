document.addEventListener("DOMContentLoaded", function () {
    // Redirect if already logged in
    if (getToken()) {
        window.location.href = "dashboard.html";
        return;
    }

    document.getElementById("password").addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });
    document.getElementById("username").addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });
});

async function doLogin() {
    const btn = document.getElementById("login-btn");
    const errEl = document.getElementById("error-msg");
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !password) {
        errEl.textContent = "Please enter both username and password.";
        errEl.classList.remove("hidden");
        return;
    }

    btn.textContent = "Signing in…";
    btn.disabled = true;
    errEl.classList.add("hidden");

    try {
        const data = await api.post("/auth/login", { username, password });
        setToken(data.access_token);
        localStorage.setItem("slpa_user", JSON.stringify(data.user));
        window.location.href = "dashboard.html";
    } catch (err) {
        errEl.textContent = err.message || "Login failed. Check credentials.";
        errEl.classList.remove("hidden");
        btn.textContent = "Sign In to System";
        btn.disabled = false;
    }
}