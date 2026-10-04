/* =========================================================
   GATE O ID — Admin Auth (API-backed)
   ========================================================= */

window.GPAuth = (function () {
    "use strict";

    const SESSION_KEY = window.GATEO_CONFIG.STORAGE_KEY_AUTH;
    let cachedPassword = null;

    /**
     * Cek apakah user udah login & session masih valid.
     */
    function isLoggedIn() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (!raw) return false;

            const session = JSON.parse(raw);
            if (!session || !session.expiresAt || !session.password) return false;

            // Cek expired
            if (Date.now() > session.expiresAt) {
                logout();
                return false;
            }

            cachedPassword = session.password;
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get active admin password for API requests.
     */
    function getPassword() {
        if (cachedPassword) return cachedPassword;
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (raw) {
                const session = JSON.parse(raw);
                if (session && session.password) {
                    cachedPassword = session.password;
                    return cachedPassword;
                }
            }
        } catch {}
        return "";
    }

    /**
     * Login dengan password via API.
     */
    async function login(password) {
        if (!password) return false;

        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password })
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                return false;
            }

            cachedPassword = password;
            const session = {
                password: password,
                createdAt: Date.now(),
                expiresAt: Date.now() + (window.GATEO_CONFIG.SESSION_DURATION_MINUTES * 60 * 1000)
            };

            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            return true;
        } catch (e) {
            console.error("Login error:", e);
            return false;
        }
    }

    /**
     * Logout: hapus session.
     */
    function logout() {
        cachedPassword = null;
        try {
            localStorage.removeItem(SESSION_KEY);
        } catch {}
    }

    /**
     * Extend session (refresh expiry).
     */
    function extendSession() {
        if (!isLoggedIn()) return;
        try {
            const currentPass = getPassword();
            const session = {
                password: currentPass,
                createdAt: Date.now(),
                expiresAt: Date.now() + (window.GATEO_CONFIG.SESSION_DURATION_MINUTES * 60 * 1000)
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        } catch {}
    }

    return {
        isLoggedIn,
        getPassword,
        login,
        logout,
        extendSession
    };
})();
