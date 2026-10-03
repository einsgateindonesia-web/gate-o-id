/* =========================================================
   GATE O ID — Storage
   Wrapper buat localStorage dengan validasi & normalisasi.
   ========================================================= */

window.GPStorage = (function () {
    "use strict";

    const KEY = window.GATEO_CONFIG.STORAGE_KEY_PRODUCTS;

    /**
     * Normalisasi produk: pastiin semua field ada dengan tipe yang bener.
     * Ini penting biar import JSON yang jelek nggak ngerusak app.
     */
    function normalizeProduct(p) {
        if (!p || typeof p !== "object") return null;
        if (!p.title || !p.link) return null;

        return {
            id: String(p.id || GPUtils.uniqueId()),
            title: String(p.title).trim().slice(0, window.GATEO_CONFIG.MAX_TITLE_LENGTH),
            category: String(p.category || "Lainnya").trim().slice(0, window.GATEO_CONFIG.MAX_CATEGORY_LENGTH) || "Lainnya",
            image: String(p.image || "").trim(),
            link: String(p.link).trim(),
            badge: String(p.badge || "").trim(),
            desc: String(p.desc || "").trim().slice(0, window.GATEO_CONFIG.MAX_DESC_LENGTH),
            clicks: Math.max(0, Number(p.clicks) || 0)
        };
    }

    /**
     * Load products dari localStorage.
     * Kalau kosong / corrupt, return default.
     */
    function load(defaultProducts = []) {
        try {
            const raw = localStorage.getItem(KEY);
            if (!raw) return [...defaultProducts];

            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) throw new Error("Bukan array");

            const normalized = parsed
                .map(normalizeProduct)
                .filter(Boolean); // buang yang null

            // Kalau semua item invalid, fallback ke default
            if (normalized.length === 0 && parsed.length > 0) {
                console.warn("Semua produk invalid, fallback ke default");
                return [...defaultProducts];
            }

            return normalized;
        } catch (e) {
            console.error("Load error:", e);
            return [...defaultProducts];
        }
    }

    /**
     * Save products ke localStorage.
     */
    function save(products) {
        try {
            localStorage.setItem(KEY, JSON.stringify(products));
            return true;
        } catch (e) {
            console.error("Save error:", e);
            // Bisa jadi quota exceeded
            if (e.name === "QuotaExceededError") {
                window.GPToast.show("Penyimpanan penuh. Hapus produk lama dulu.", "error");
            }
            return false;
        }
    }

    /**
     * Clear semua data.
     */
    function clear() {
        try {
            localStorage.removeItem(KEY);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Export ke file JSON.
     */
    function exportToFile(products) {
        const data = JSON.stringify(products, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `gateo-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    /**
     * Import dari file JSON.
     * Return Promise<{success, products?, error?}>
     */
    function importFromFile(file) {
        return new Promise((resolve) => {
            if (!file) {
                resolve({ success: false, error: "File nggak ada" });
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const parsed = JSON.parse(e.target.result);

                    if (!Array.isArray(parsed)) {
                        resolve({ success: false, error: "File harus berisi array produk." });
                        return;
                    }

                    const normalized = parsed
                        .map(normalizeProduct)
                        .filter(Boolean);

                    if (normalized.length === 0) {
                        resolve({ success: false, error: "Nggak ada produk valid di file ini." });
                        return;
                    }

                    resolve({ success: true, products: normalized });
                } catch (err) {
                    resolve({ success: false, error: "Gagal baca file JSON: " + err.message });
                }
            };

            reader.onerror = () => {
                resolve({ success: false, error: "Gagal baca file" });
            };

            reader.readAsText(file);
        });
    }

    return {
        load,
        save,
        clear,
        exportToFile,
        importFromFile,
        normalizeProduct
    };
})();
