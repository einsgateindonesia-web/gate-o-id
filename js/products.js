/* =========================================================
   GATE O ID — Products Logic (Public Page)
   ========================================================= */

window.GPProducts = (function () {
    "use strict";

    const state = {
        products: [],
        selectedCategory: window.GATEO_CONFIG.ALL_CATEGORY,
        searchQuery: ""
    };

    /* ---------- Default sample data ---------- */
    const DEFAULT_PRODUCTS = [
        {
            id: "sample-1",
            title: "Mouse Wireless Ergonomis Silent Click",
            category: "Elektronik",
            image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60",
            link: "https://shopee.co.id",
            badge: "Hot Item",
            desc: "Nyaman digunakan seharian tanpa suara klik yang mengganggu.",
            clicks: 12
        },
        {
            id: "sample-2",
            title: "Botol Minum Stainless Steel 1 Liter",
            category: "Gaya Hidup",
            image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60",
            link: "https://tokopedia.com",
            badge: "Rekomendasi",
            desc: "Menjaga suhu dingin dan panas hingga 12 jam.",
            clicks: 8
        }
    ];

    /* ---------- Load products ---------- */
    function init() {
        state.products = GPStorage.load(DEFAULT_PRODUCTS);
        // Simpan ke localStorage kalau baru pertama kali
        if (state.products.length > 0 && !localStorage.getItem(window.GATEO_CONFIG.STORAGE_KEY_PRODUCTS)) {
            GPStorage.save(state.products);
        }
        renderCategories();
        renderGrid();
    }

    /* ---------- Render kategori ---------- */
    function renderCategories() {
        const container = document.getElementById("categoryContainer");
        if (!container) return;

        // Unique case-insensitive
        const categories = [
            window.GATEO_CONFIG.ALL_CATEGORY,
            ...GPUtils.uniqueCaseInsensitive(state.products.map(p => p.category).filter(Boolean))
        ];

        container.innerHTML = categories.map(cat => {
            const isActive = state.selectedCategory === cat;
            const safeCat = GPUtils.escapeHtml(cat);
            return `
                <button
                    type="button"
                    data-category="${safeCat}"
                    class="cat-btn px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                        isActive
                            ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20"
                            : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                    }"
                    aria-pressed="${isActive}">
                    ${safeCat}
                </button>
            `;
        }).join("");
    }

    /* ---------- Filter ---------- */
    function getFiltered() {
        const q = state.searchQuery.toLowerCase().trim();
        const cat = state.selectedCategory.toLowerCase();

        return state.products.filter(p => {
            const matchesCategory = state.selectedCategory === window.GATEO_CONFIG.ALL_CATEGORY
                || p.category.toLowerCase() === cat;
            const matchesSearch = !q
                || p.title.toLowerCase().includes(q)
                || (p.desc && p.desc.toLowerCase().includes(q));
            return matchesCategory && matchesSearch;
        });
    }

    /* ---------- Render grid produk ---------- */
    function renderGrid() {
        const grid = document.getElementById("productGrid");
        const emptyState = document.getElementById("emptyState");
        if (!grid || !emptyState) return;

        const filtered = getFiltered();

        if (filtered.length === 0) {
            grid.innerHTML = "";
            emptyState.classList.remove("hidden");
            return;
        }

        emptyState.classList.add("hidden");

        grid.innerHTML = filtered.map(p => {
            const safeTitle = GPUtils.escapeHtml(p.title);
            const safeDesc = GPUtils.escapeHtml(p.desc || "Tidak ada deskripsi.");
            const safeCategory = GPUtils.escapeHtml(p.category);
            const safeBadge = GPUtils.escapeHtml(p.badge || "");
            const safeImg = GPUtils.safeUrl(p.image) || window.GATEO_CONFIG.DEFAULT_IMAGE;
            const safeLink = GPUtils.safeUrl(p.link);
            const safeId = GPUtils.escapeHtml(p.id);

            // Kalau link invalid, disable tombol
            const linkDisabled = !safeLink;

            return `
                <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 flex flex-col group">
                    <div class="relative h-48 bg-slate-950 overflow-hidden">
                        <img src="${safeImg}" alt="${safeTitle}" loading="lazy" decoding="async"
                             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                             onerror="this.src='${window.GATEO_CONFIG.DEFAULT_IMAGE}'">
                        <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>

                        ${safeBadge ? `
                            <span class="absolute top-3 left-3 bg-brand-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                ${safeBadge}
                            </span>
                        ` : ""}

                        <span class="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-slate-300 text-[10px] font-medium px-2.5 py-1 rounded-full border border-slate-700/50">
                            ${safeCategory}
                        </span>
                    </div>

                    <div class="p-5 flex-1 flex flex-col">
                        <h3 class="font-semibold text-slate-100 text-base mb-1 line-clamp-2 group-hover:text-brand-500 transition-colors">
                            ${safeTitle}
                        </h3>
                        <p class="text-xs text-slate-400 mb-4 line-clamp-2 flex-1">${safeDesc}</p>

                        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                            ${linkDisabled
                                ? `<span class="flex-1 bg-slate-800 text-slate-500 text-xs font-semibold py-2.5 px-4 rounded-xl text-center cursor-not-allowed">Link Invalid</span>`
                                : `<a href="${safeLink}" target="_blank" rel="noopener noreferrer"
                                     data-track-id="${safeId}"
                                     class="product-link flex-1 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl text-center transition shadow-lg shadow-brand-600/10 flex items-center justify-center gap-2">
                                    <span>Cek Produk</span>
                                    <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                                  </a>`
                            }
                            <button type="button"
                                    data-share-title="${safeTitle}"
                                    data-share-link="${safeLink}"
                                    class="share-btn p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
                                    title="Bagikan" aria-label="Bagikan produk">
                                <i class="fa-solid fa-share-nodes text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }

    /* ---------- Track click ---------- */
    const trackClick = GPUtils.throttle(function (id) {
        const idx = state.products.findIndex(p => p.id === id);
        if (idx === -1) return;
        state.products[idx].clicks = (state.products[idx].clicks || 0) + 1;
        GPStorage.save(state.products);
    }, window.GATEO_CONFIG.CLICK_THROTTLE_MS);

    /* ---------- Share ---------- */
    async function shareProduct(title, link) {
        if (!link) {
            GPToast.show("Link produk tidak valid", "error");
            return;
        }
        try {
            if (navigator.share) {
                await navigator.share({
                    title: title,
                    text: `Cek produk rekomendasi ini di GATE O ID: ${title}`,
                    url: link
                });
            } else {
                await navigator.clipboard.writeText(link);
                GPToast.show("Link produk berhasil disalin!");
            }
        } catch (err) {
            // User cancel share — diem aja
            if (err.name !== "AbortError") {
                console.warn("Share error:", err);
            }
        }
    }

    /* ---------- Public API ---------- */
    return {
        init,
        state,
        renderCategories,
        renderGrid,
        trackClick,
        shareProduct,
        getFiltered
    };
})();
