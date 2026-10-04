/* =========================================================
   GATE O ID — Products Logic (Public Page)
   Apple Dark Clean Bento Layout & Interaction Engine
   ========================================================= */

window.GPProducts = (function () {
    "use strict";

    const state = {
        products: [],
        selectedCategory: window.GATEO_CONFIG.ALL_CATEGORY,
        searchQuery: "",
        sortOption: "newest"
    };

    /* ---------- Default sample data ---------- */
    const DEFAULT_PRODUCTS = [
        {
            id: "sample-1",
            title: "Mouse Wireless Ergonomis Silent Click",
            category: "Elektronik",
            image: "/src/assets/images/mouse_wireless_silent_1791083289266.jpg",
            link: "https://shopee.co.id",
            badge: "Hot Item",
            desc: "Presisi tinggi tanpa suara klik bising, kenyamanan maksimal untuk workstation modern.",
            clicks: 42
        },
        {
            id: "sample-2",
            title: "Mechanical Keyboard Pro Wireless 75%",
            category: "Elektronik",
            image: "/src/assets/images/keyboard_mechanical_pro_1791083334000.jpg",
            link: "https://tokopedia.com",
            badge: "Rekomendasi",
            desc: "Desain aluminium solid dengan low-latency Bluetooth & 2.4GHz, typing feel tak tertandingi.",
            clicks: 35
        },
        {
            id: "sample-3",
            title: "Botol Minum Stainless Steel 1 Liter Matte",
            category: "Gaya Hidup",
            image: "/src/assets/images/bottle_thermal_matte_1791083305805.jpg",
            link: "https://tokopedia.com",
            badge: "Promo",
            desc: "Isolasi termal ganda menjaga suhu dingin dan panas hingga 24 jam dengan material food grade.",
            clicks: 28
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

    /* ---------- Render kategori (Apple Segmented Style) ---------- */
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
                    class="cat-btn px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                        isActive
                            ? "bg-white text-black font-semibold shadow-sm scale-[1.02]"
                            : "text-neutral-400 hover:text-white hover:bg-white/[0.06]"
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

        const filtered = state.products.filter(p => {
            const matchesCategory = state.selectedCategory === window.GATEO_CONFIG.ALL_CATEGORY
                || p.category.toLowerCase() === cat;
            const matchesSearch = !q
                || p.title.toLowerCase().includes(q)
                || (p.desc && p.desc.toLowerCase().includes(q));
            return matchesCategory && matchesSearch;
        });

        // Sorting
        return filtered.sort((a, b) => {
            if (state.sortOption === "popular") {
                return (b.clicks || 0) - (a.clicks || 0);
            } else if (state.sortOption === "title-asc") {
                return a.title.localeCompare(b.title);
            } else {
                return 0; // newest: urutan penyimpanan default
            }
        });
    }

    /* ---------- Render Bento Grid Produk ---------- */
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
            const safeDesc = GPUtils.escapeHtml(p.desc || "Kurasi produk terpilih dengan spesifikasi dan ulasan terpercaya.");
            const safeCategory = GPUtils.escapeHtml(p.category);
            const safeBadge = GPUtils.escapeHtml(p.badge || "");
            const safeImg = GPUtils.safeUrl(p.image) || window.GATEO_CONFIG.DEFAULT_IMAGE;
            const safeLink = GPUtils.safeUrl(p.link);
            const safeId = GPUtils.escapeHtml(p.id);

            // Kalau link invalid, disable tombol
            const linkDisabled = !safeLink;

            return `
                <div class="apple-glass-card rounded-3xl overflow-hidden flex flex-col group relative">
                    <!-- Image Showcase -->
                    <div class="relative aspect-[16/10] bg-neutral-950 overflow-hidden border-b border-white/[0.06]">
                        <img src="${safeImg}" alt="${safeTitle}" loading="lazy" decoding="async"
                             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                             onerror="this.src='${window.GATEO_CONFIG.DEFAULT_IMAGE}'">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none"></div>

                        <!-- Apple Floating Badges -->
                        <div class="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                            ${safeBadge ? `
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-brand-400 border border-brand-500/30 shadow-sm flex items-center gap-1.5">
                                    <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                                    ${safeBadge}
                                </span>
                            ` : '<span></span>'}

                            <span class="px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/60 backdrop-blur-md text-neutral-300 border border-white/[0.1] shadow-sm">
                                ${safeCategory}
                            </span>
                        </div>
                    </div>

                    <!-- Card Body -->
                    <div class="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 class="font-semibold text-white text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-brand-400 transition-colors duration-200 tracking-tight leading-snug">
                                ${safeTitle}
                            </h3>
                            <p class="text-xs text-neutral-400 line-clamp-2 mb-5 leading-relaxed font-normal">
                                ${safeDesc}
                            </p>
                        </div>

                        <!-- Action Bar -->
                        <div class="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2.5">
                            ${linkDisabled
                                ? `<span class="flex-1 bg-white/[0.04] text-neutral-500 text-xs font-medium py-2.5 px-4 rounded-xl text-center cursor-not-allowed border border-white/[0.04]">Tautan Tidak Aktif</span>`
                                : `<a href="${safeLink}" target="_blank" rel="noopener noreferrer"
                                     data-track-id="${safeId}"
                                     class="product-link flex-1 bg-white text-black hover:bg-neutral-200 active:scale-[0.98] text-xs font-semibold py-2.5 px-4 rounded-xl text-center transition-all duration-200 shadow-sm flex items-center justify-center gap-2">
                                    <span>Buka Produk</span>
                                    <i class="fa-solid fa-arrow-up-right-from-square text-[10px] opacity-70"></i>
                                  </a>`
                            }
                            <button type="button"
                                    data-share-title="${safeTitle}"
                                    data-share-link="${safeLink}"
                                    class="share-btn p-2.5 bg-white/[0.05] hover:bg-white/[0.12] active:scale-[0.95] text-neutral-300 hover:text-white rounded-xl transition-all duration-200 border border-white/[0.08]"
                                    title="Bagikan" aria-label="Bagikan produk">
                                <i class="fa-solid fa-arrow-up-from-bracket text-xs"></i>
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
                GPToast.show("Tautan produk berhasil disalin!");
            }
        } catch (err) {
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
