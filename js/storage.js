/* =========================================================
   GATE O ID — Storage (API / Netlify Database Backend)
   ========================================================= */

window.GPStorage = (function () {
    "use strict";

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
     * Load products from API backend.
     */
    async function load(defaultProducts = []) {
        try {
            const res = await fetch("/api/products");
            if (!res.ok) throw new Error("Gagal mengambil data dari server");
            const data = await res.json();
            if (!Array.isArray(data)) return [...defaultProducts];

            const normalized = data.map(normalizeProduct).filter(Boolean);
            return normalized.length > 0 ? normalized : [...defaultProducts];
        } catch (e) {
            console.error("Load error from API:", e);
            return [...defaultProducts];
        }
    }

    /**
     * Save/Create or Update product via API.
     */
    async function saveProduct(product, password) {
        try {
            const isUpdate = Boolean(product.id && product._isExisting);
            const method = isUpdate ? "PUT" : "POST";
            const res = await fetch("/api/products", {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Password": password
                },
                body: JSON.stringify(product)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal menyimpan");
            return true;
        } catch (e) {
            console.error("Save product error:", e);
            window.GPToast?.show(e.message || "Gagal menyimpan ke server", "error");
            return false;
        }
    }

    /**
     * Save all products (batch import / replace).
     */
    async function saveAll(products, password) {
        try {
            const normalized = products.map(normalizeProduct).filter(Boolean);
            const res = await fetch("/api/products", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Password": password
                },
                body: JSON.stringify({ products: normalized })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal menyimpan batch");
            return true;
        } catch (e) {
            console.error("Save all error:", e);
            window.GPToast?.show(e.message || "Gagal menyimpan ke server", "error");
            return false;
        }
    }

    /**
     * Delete product by ID.
     */
    async function remove(id, password) {
        try {
            const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
                method: "DELETE",
                headers: {
                    "X-Admin-Password": password
                }
            });
            if (!res.ok) throw new Error("Gagal menghapus produk");
            return true;
        } catch (e) {
            console.error("Delete error:", e);
            return false;
        }
    }

    /**
     * Clear all products.
     */
    async function clearAll(password) {
        try {
            const res = await fetch("/api/products?all=true", {
                method: "DELETE",
                headers: {
                    "X-Admin-Password": password
                }
            });
            if (!res.ok) throw new Error("Gagal mereset data");
            return true;
        } catch (e) {
            console.error("Clear error:", e);
            return false;
        }
    }

    /**
     * Increment click count on server.
     */
    async function incrementClick(id) {
        try {
            await fetch("/api/click", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
        } catch (e) {
            console.error("Click track error:", e);
        }
    }

    /**
     * Export to file JSON.
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
     * Import from file JSON.
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
        saveProduct,
        saveAll,
        remove,
        clearAll,
        incrementClick,
        exportToFile,
        importFromFile,
        normalizeProduct
    };
})();
