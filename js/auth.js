/* =========================================================
   GATE O ID — Admin Auth (Client-side)
   ⚠️ Ini bukan security beneran. Buat demo aja.
   ========================================================= */

window.GPAuth = (function () {
    "use strict";

    const SESSION_KEY = window.GATEO_CONFIG.STORAGE_KEY_AUTH;

    /**
     * Cek apakah user udah login & session masih valid.
     */
    function isLoggedIn() {
        try {
            const raw = localStorage.getItem(SESSION_KEY);
            if (!raw) return false;

            const session = JSON.parse(raw);
            if (!session || !session.expiresAt) return false;

            // Cek expired
            if (Date.now() > session.expiresAt) {
                logout();
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }

    /**
     * Login dengan password.
     * ⚠️ Password di-hash sederhana aja buat demo.
     * Buat security serius, butuh backend auth.
     */
    function login(password) {
        if (!password) return false;

        // Simple comparison — bukan hash beneran
        // Kalau mau lebih aman, pakai SubtleCrypto (async)
        if (password !== window.GATEO_CONFIG.ADMIN_PASSWORD_HASH) {
            return false;
        }

        const session = {
            createdAt: Date.now(),
            expiresAt: Date.now() + (window.GATEO_CONFIG.SESSION_DURATION_MINUTES * 60 * 1000)
        };

        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Logout: hapus session.
     */
    function logout() {
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
            const session = {
                createdAt: Date.now(),
                expiresAt: Date.now() + (window.GATEO_CONFIG.SESSION_DURATION_MINUTES * 60 * 1000)
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        } catch {}
    }

    return {
        isLoggedIn,
        login,
        logout,
        extendSession
    };
})();
