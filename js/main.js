/* =========================================================
   GATE O ID — Main Entry Point (Public Page)
   ========================================================= */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {
        // Set tahun di footer
        const yearEl = document.getElementById("year");
        if (yearEl) yearEl.textContent = new Date().getFullYear();

        // Init products
        GPProducts.init();

        // ---------- Event: Search (debounced) ----------
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
            const onSearch = GPUtils.debounce((value) => {
                GPProducts.state.searchQuery = value;
                GPProducts.renderGrid();
            }, window.GATEO_CONFIG.SEARCH_DEBOUNCE_MS);

            searchInput.addEventListener("input", (e) => onSearch(e.target.value));
        }

        // ---------- Event: Sort select ----------
        const sortSelect = document.getElementById("sortSelect");
        if (sortSelect) {
            sortSelect.addEventListener("change", (e) => {
                GPProducts.state.sortOption = e.target.value;
                GPProducts.renderGrid();
            });
        }

        // ---------- Event: Category (delegation) ----------
        const categoryContainer = document.getElementById("categoryContainer");
        if (categoryContainer) {
            categoryContainer.addEventListener("click", (e) => {
                const btn = e.target.closest(".cat-btn");
                if (!btn) return;

                GPProducts.state.selectedCategory = btn.dataset.category;
                GPProducts.renderCategories();
                GPProducts.renderGrid();
            });
        }

        // ---------- Event: Product grid (delegation untuk link & share) ----------
        const grid = document.getElementById("productGrid");
        if (grid) {
            grid.addEventListener("click", (e) => {
                // Track click
                const link = e.target.closest(".product-link");
                if (link) {
                    const id = link.dataset.trackId;
                    if (id) GPProducts.trackClick(id);
                    return;
                }

                // Share button
                const shareBtn = e.target.closest(".share-btn");
                if (shareBtn) {
                    e.preventDefault();
                    const title = shareBtn.dataset.shareTitle;
                    const link = shareBtn.dataset.shareLink;
                    GPProducts.shareProduct(title, link);
                }
            });
        }
    });

    // ---------- Global error handler ----------
    window.addEventListener("error", (e) => {
        console.error("Global error:", e.error);
    });

    window.addEventListener("unhandledrejection", (e) => {
        console.error("Unhandled promise:", e.reason);
    });
})();
