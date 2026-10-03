/* =========================================================
   GATE O ID — Utils
   Helper functions yang dipakai di banyak tempat.
   ========================================================= */

window.GPUtils = (function () {
    "use strict";

    /**
     * Escape HTML entities biar aman dari XSS.
     * Semua string dari user HARUS di-escape sebelum masuk innerHTML.
     */
    function escapeHtml(str) {
        if (str == null) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Validasi & sanitize URL. Cuma izinin http / https.
     * Blokir javascript:, data:, file:, dll.
     */
    function safeUrl(url) {
        if (!url || typeof url !== "string") return "";
        try {
            const u = new URL(url.trim());
            if (u.protocol !== "http:" && u.protocol !== "https:") return "";
            return u.href;
        } catch {
            return "";
        }
    }

    /**
     * Debounce: tunda eksekusi sampe user berhenti ngetik.
     */
    function debounce(fn, delay) {
        let timer = null;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    /**
     * Throttle: batasi frekuensi eksekusi.
     */
    function throttle(fn, delay) {
        let last = 0;
        return function (...args) {
            const now = Date.now();
            if (now - last < delay) return;
            last = now;
            fn.apply(this, args);
        };
    }

    /**
     * Bikin ID unik (timestamp + random).
     */
    function uniqueId() {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }

    /**
     * Format angka dengan pemisah ribuan Indonesia.
     */
    function formatNumber(num) {
        return new Intl.NumberFormat("id-ID").format(num || 0);
    }

    /**
     * Truncate string.
     */
    function truncate(str, max) {
        if (!str) return "";
        return str.length > max ? str.slice(0, max - 1) + "…" : str;
    }

    /**
     * Case-insensitive unique array.
     */
    function uniqueCaseInsensitive(arr) {
        const seen = new Map();
        arr.forEach(item => {
            const key = String(item).toLowerCase();
            if (!seen.has(key)) seen.set(key, item);
        });
        return [...seen.values()];
    }

    /**
     * Bikin slug dari string.
     */
    function slugify(str) {
        return String(str)
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    // Public API
    return {
        escapeHtml,
        safeUrl,
        debounce,
        throttle,
        uniqueId,
        formatNumber,
        truncate,
        uniqueCaseInsensitive,
        slugify
    };
})();
