/* =========================================================
   GATE O ID — Admin Panel Logic
   macOS Window Inspector & Catalog Management
   ========================================================= */

(function () {
    "use strict";

    const state = {
        products: [],
        editingId: null
    };

    const els = {};

    function cacheEls() {
        els.loginGate = document.getElementById("loginGate");
        els.loginForm = document.getElementById("loginForm");
        els.loginPassword = document.getElementById("loginPassword");
        els.loginError = document.getElementById("loginError");
        els.adminApp = document.getElementById("adminApp");
        els.logoutBtn = document.getElementById("logoutBtn");

        els.statsGrid = document.getElementById("statsGrid");
        els.form = document.getElementById("productForm");
        els.formTitle = document.getElementById("formTitle");
        els.productId = document.getElementById("productId");
        els.prodTitle = document.getElementById("prodTitle");
        els.prodCategory = document.getElementById("prodCategory");
        els.prodImage = document.getElementById("prodImage");
        els.prodLink = document.getElementById("prodLink");
        els.prodBadge = document.getElementById("prodBadge");
        els.prodDesc = document.getElementById("prodDesc");
        els.cancelFormBtn = document.getElementById("cancelFormBtn");
        els.categoryOptions = document.getElementById("categoryOptions");

        els.exportBtn = document.getElementById("exportBtn");
        els.importFile = document.getElementById("importFile");
        els.resetBtn = document.getElementById("resetBtn");

        els.adminProductList = document.getElementById("adminProductList");
        els.productCount = document.getElementById("productCount");

        els.confirmModal = document.getElementById("confirmModal");
        els.confirmTitle = document.getElementById("confirmTitle");
        els.confirmMessage = document.getElementById("confirmMessage");
        els.confirmOk = document.getElementById("confirmOk");
        els.confirmCancel = document.getElementById("confirmCancel");
    }

    /* =========================================================
       Confirm Dialog (macOS sheet style)
       ========================================================= */
    let confirmResolver = null;

    function showConfirm(title, message) {
        return new Promise((resolve) => {
            confirmResolver = resolve;
            els.confirmTitle.textContent = title;
            els.confirmMessage.textContent = message;
            els.confirmModal.classList.remove("hidden");
        });
    }

    function closeConfirm(result) {
        els.confirmModal.classList.add("hidden");
        if (confirmResolver) {
            confirmResolver(result);
            confirmResolver = null;
        }
    }

    /* =========================================================
       Login Flow
       ========================================================= */
    function showApp() {
        els.loginGate.classList.add("hidden");
        els.adminApp.classList.remove("hidden");
        loadAndRender();
    }

    function showLogin() {
        els.adminApp.classList.add("hidden");
        els.loginGate.classList.remove("hidden");
        els.loginPassword.value = "";
        els.loginError.classList.add("hidden");
    }

    function handleLogin(e) {
        e.preventDefault();
        const pass = els.loginPassword.value;

        if (GPAuth.login(pass)) {
            els.loginError.classList.add("hidden");
            showApp();
            GPToast.show("Autentikasi admin berhasil");
        } else {
            els.loginError.textContent = "Kata sandi salah. Silakan coba lagi.";
            els.loginError.classList.remove("hidden");
            els.loginPassword.value = "";
            els.loginPassword.focus();
        }
    }

    function handleLogout() {
        GPAuth.logout();
        showLogin();
        GPToast.show("Sesi admin telah diakhiri");
    }

    /* =========================================================
       Load & Render
       ========================================================= */
    function loadAndRender() {
        state.products = GPStorage.load([]);
        renderStats();
        renderCategoryOptions();
        renderProductList();
    }

    function renderStats() {
        if (!els.statsGrid) return;

        const totalClicks = state.products.reduce((sum, p) => sum + (p.clicks || 0), 0);
        const totalCategories = new Set(state.products.map(p => p.category)).size;

        const stats = [
            { icon: "fa-box-archive", label: "Total Produk", value: GPUtils.formatNumber(state.products.length), color: "text-brand-400" },
            { icon: "fa-arrow-pointer", label: "Total Klik", value: GPUtils.formatNumber(totalClicks), color: "text-blue-400" },
            { icon: "fa-layer-group", label: "Kategori", value: GPUtils.formatNumber(totalCategories), color: "text-amber-400" },
            { icon: "fa-fire", label: "Produk Populer", value: state.products.length ? GPUtils.escapeHtml(
                state.products.reduce((max, p) => (p.clicks || 0) > (max.clicks || 0) ? p : max, state.products[0]).title
              ).slice(0, 18) : "-", color: "text-rose-400" }
        ];

        els.statsGrid.innerHTML = stats.map(s => `
            <div class="apple-glass rounded-2xl p-4 sm:p-5 border border-white/[0.08] relative overflow-hidden group">
                <div class="flex items-center justify-between mb-2 sm:mb-3">
                    <span class="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">${s.label}</span>
                    <div class="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[10px] ${s.color}">
                        <i class="fa-solid ${s.icon}"></i>
                    </div>
                </div>
                <p class="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white truncate tracking-tight">${s.value}</p>
            </div>
        `).join("");
    }

    function renderCategoryOptions() {
        if (!els.categoryOptions) return;
        const cats = GPUtils.uniqueCaseInsensitive(
            state.products.map(p => p.category).filter(Boolean)
        );
        els.categoryOptions.innerHTML = cats.map(c =>
            `<option value="${GPUtils.escapeHtml(c)}"></option>`
        ).join("");
    }

    function renderProductList() {
        if (!els.adminProductList) return;

        els.productCount.textContent = `${state.products.length} produk`;

        if (state.products.length === 0) {
            els.adminProductList.innerHTML = `
                <div class="text-center py-12 text-neutral-500 text-xs">
                    <div class="w-12 h-12 mx-auto rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-neutral-400 mb-3">
                        <i class="fa-solid fa-box-open text-base opacity-60"></i>
                    </div>
                    <p class="font-medium text-neutral-300">Belum ada produk di katalog</p>
                    <p class="text-[11px] text-neutral-400 mt-1">Tambahkan produk pertama menggunakan formulir di atas.</p>
                </div>
            `;
            return;
        }

        els.adminProductList.innerHTML = state.products.map(p => {
            const safeTitle = GPUtils.escapeHtml(p.title);
            const safeCat = GPUtils.escapeHtml(p.category);
            const safeImg = GPUtils.safeUrl(p.image) || window.GATEO_CONFIG.DEFAULT_IMAGE;
            const safeId = GPUtils.escapeHtml(p.id);

            return `
                <div class="apple-glass-card p-3 sm:p-3.5 rounded-2xl flex items-center justify-between gap-3 border border-white/[0.06] hover:border-white/[0.14] transition-all duration-200">
                    <div class="flex items-center gap-3.5 overflow-hidden">
                        <div class="w-11 h-11 rounded-xl bg-neutral-900 border border-white/[0.08] overflow-hidden flex-shrink-0">
                            <img src="${safeImg}" loading="lazy" alt=""
                                 class="w-full h-full object-cover"
                                 onerror="this.src='${window.GATEO_CONFIG.DEFAULT_IMAGE}'">
                        </div>
                        <div class="truncate">
                            <h4 class="text-xs font-semibold text-white truncate tracking-tight">${safeTitle}</h4>
                            <div class="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                                <span>${safeCat}</span>
                                <span class="text-neutral-600">&middot;</span>
                                <span class="text-brand-400 font-mono tabular-nums font-medium">${GPUtils.formatNumber(p.clicks || 0)} Klik</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-1 flex-shrink-0">
                        <button type="button" data-action="edit" data-id="${safeId}"
                                class="p-2 text-neutral-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition" title="Edit">
                            <i class="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button type="button" data-action="delete" data-id="${safeId}"
                                class="p-2 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition" title="Hapus">
                            <i class="fa-solid fa-trash text-xs"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }

    /* =========================================================
       Form: Add / Edit
       ========================================================= */
    function resetForm() {
        els.form.reset();
        els.productId.value = "";
        state.editingId = null;
        els.formTitle.textContent = "Tambah Produk Baru";
    }

    function startEdit(id) {
        const p = state.products.find(x => x.id === id);
        if (!p) return;

        state.editingId = id;
        els.productId.value = p.id;
        els.prodTitle.value = p.title;
        els.prodCategory.value = p.category;
        els.prodImage.value = p.image || "";
        els.prodLink.value = p.link;
        els.prodBadge.value = p.badge || "";
        els.prodDesc.value = p.desc || "";

        els.formTitle.textContent = "Edit Produk";
        els.prodTitle.focus();
        els.form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function handleSave(e) {
        e.preventDefault();

        const data = {
            title: els.prodTitle.value.trim(),
            category: els.prodCategory.value.trim(),
            image: els.prodImage.value.trim(),
            link: els.prodLink.value.trim(),
            badge: els.prodBadge.value,
            desc: els.prodDesc.value.trim()
        };

        // Validasi
        if (!data.title) {
            GPToast.show("Nama produk wajib diisi", "error");
            return;
        }
        if (!data.category) {
            GPToast.show("Kategori wajib diisi", "error");
            return;
        }
        if (!GPUtils.safeUrl(data.link)) {
            GPToast.show("Link afiliasi harus URL http/https yang valid", "error");
            return;
        }

        const editingId = els.productId.value;

        if (editingId) {
            // Edit
            const idx = state.products.findIndex(p => p.id === editingId);
            if (idx !== -1) {
                state.products[idx] = {
                    ...state.products[idx],
                    ...data,
                    clicks: state.products[idx].clicks || 0
                };
                GPToast.show("Produk berhasil diperbarui!");
            }
        } else {
            // Create
            state.products.unshift({
                id: GPUtils.uniqueId(),
                ...data,
                clicks: 0
            });
            GPToast.show("Produk baru berhasil ditambahkan!");
        }

        GPStorage.save(state.products);
        resetForm();
        renderStats();
        renderCategoryOptions();
        renderProductList();
    }

    async function handleDelete(id) {
        const p = state.products.find(x => x.id === id);
        if (!p) return;

        const ok = await showConfirm(
            "Hapus Produk?",
            `"${GPUtils.truncate(p.title, 60)}" akan dihapus secara permanen.`
        );
        if (!ok) return;

        state.products = state.products.filter(x => x.id !== id);
        GPStorage.save(state.products);
        renderStats();
        renderCategoryOptions();
        renderProductList();
        GPToast.show("Produk berhasil dihapus!");
    }

    /* =========================================================
       Export / Import / Reset
       ========================================================= */
    function handleExport() {
        if (state.products.length === 0) {
            GPToast.show("Belum ada produk untuk diekspor", "warning");
            return;
        }
        GPStorage.exportToFile(state.products);
        GPToast.show("File backup JSON berhasil diunduh!");
    }

    async function handleCsvImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        document.body.style.cursor = "wait";
        const text = await file.text();
        document.body.style.cursor = "default";
        e.target.value = "";

        try {
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
            if (lines.length < 2) {
                GPToast.show("Format CSV kosong atau tidak valid", "error");
                return;
            }

            function parseCsvLine(line) {
                const result = [];
                let current = "";
                let inQuotes = false;
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        result.push(current.trim());
                        current = "";
                    } else {
                        current += char;
                    }
                }
                result.push(current.trim());
                return result.map(val => val.replace(/^["']|["']$/g, "").trim());
            }

            const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase());
            const getIndex = (names) => {
                for (const name of names) {
                    const idx = headers.indexOf(name);
                    if (idx !== -1) return idx;
                }
                return -1;
            };

            const idxTitle = getIndex(["title", "nama", "nama produk", "product"]);
            const idxCat = getIndex(["category", "kategori"]);
            const idxImg = getIndex(["image", "gambar", "img", "photo"]);
            const idxLink = getIndex(["link", "url", "affiliate", "affiliate link"]);
            const idxBadge = getIndex(["badge"]);
            const idxDesc = getIndex(["desc", "description", "deskripsi"]);

            if (idxTitle === -1 || idxLink === -1) {
                GPToast.show("CSV wajib memiliki kolom 'title' dan 'link'", "error");
                return;
            }

            const newProducts = [];
            for (let i = 1; i < lines.length; i++) {
                const cols = parseCsvLine(lines[i]);
                const title = cols[idxTitle] || "";
                const link = cols[idxLink] || "";
                if (!title || !link) continue;

                newProducts.push({
                    id: "csv-" + Math.random().toString(36).substring(2, 9),
                    title: title,
                    category: idxCat !== -1 && cols[idxCat] ? cols[idxCat] : "Umum",
                    image: idxImg !== -1 ? cols[idxImg] : "",
                    link: link,
                    badge: idxBadge !== -1 ? cols[idxBadge] : "",
                    desc: idxDesc !== -1 ? cols[idxDesc] : "",
                    clicks: 0
                });
            }

            if (newProducts.length === 0) {
                GPToast.show("Tidak ada produk valid ditemukan di file CSV", "error");
                return;
            }

            const ok = await showConfirm(
                "Impor Data CSV?",
                `Ditemukan ${newProducts.length} produk dari CSV. Ganti seluruh daftar produk dengan data ini?`
            );

            if (!ok) {
                GPToast.show("Impor CSV dibatalkan", "warning");
                return;
            }

            state.products = newProducts;
            GPStorage.save(state.products);
            renderStats();
            renderCategoryOptions();
            renderProductList();
            GPToast.show(`${newProducts.length} produk berhasil diimpor dari CSV!`);
        } catch (err) {
            console.error("CSV parse error:", err);
            GPToast.show("Gagal memproses file CSV", "error");
        }
    }

    async function handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        document.body.style.cursor = "wait";
        GPToast.show("Memproses berkas JSON...");

        const result = await GPStorage.importFromFile(file);

        document.body.style.cursor = "default";
        e.target.value = "";

        if (!result.success) {
            GPToast.show(result.error, "error");
            return;
        }

        const ok = await showConfirm(
            "Impor Backup JSON?",
            `Tindakan ini akan menggantikan ${state.products.length} produk saat ini dengan ${result.products.length} produk dari cadangan. Lanjutkan?`
        );

        if (!ok) {
            GPToast.show("Impor dibatalkan", "warning");
            return;
        }

        state.products = result.products;
        GPStorage.save(state.products);
        renderStats();
        renderCategoryOptions();
        renderProductList();
        GPToast.show(`${result.products.length} produk berhasil dipulihkan!`);
    }

    async function handleReset() {
        const ok = await showConfirm(
            "Reset Semua Data?",
            "Semua katalog produk akan dihapus dan tidak dapat dikembalikan. Yakin?"
        );
        if (!ok) return;

        GPStorage.clear();
        state.products = [];
        renderStats();
        renderCategoryOptions();
        renderProductList();
        GPToast.show("Semua data berhasil direset");
    }

    /* =========================================================
       Init
       ========================================================= */
    function init() {
        cacheEls();

        // Auto-login kalau session masih valid
        if (GPAuth.isLoggedIn()) {
            showApp();
        } else {
            showLogin();
        }

        // Login form
        els.loginForm?.addEventListener("submit", handleLogin);
        els.logoutBtn?.addEventListener("click", handleLogout);

        // Product form
        els.form?.addEventListener("submit", handleSave);
        els.cancelFormBtn?.addEventListener("click", resetForm);

        // Product list (delegation)
        els.adminProductList?.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-action]");
            if (!btn) return;
            const action = btn.dataset.action;
            const id = btn.dataset.id;
            if (action === "edit") startEdit(id);
            if (action === "delete") handleDelete(id);
        });

        // Backup / restore
        els.exportBtn?.addEventListener("click", handleExport);
        els.importFile?.addEventListener("change", handleImport);
        document.getElementById("importCsvFile")?.addEventListener("change", handleCsvImport);
        els.resetBtn?.addEventListener("click", handleReset);

        // Confirm modal
        els.confirmOk?.addEventListener("click", () => closeConfirm(true));
        els.confirmCancel?.addEventListener("click", () => closeConfirm(false));
        els.confirmModal?.addEventListener("click", (e) => {
            if (e.target === els.confirmModal) closeConfirm(false);
        });

        // Escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                if (!els.confirmModal.classList.contains("hidden")) {
                    closeConfirm(false);
                }
            }
        });

        // Extend session tiap aktivitas
        ["click", "keydown"].forEach(evt => {
            document.addEventListener(evt, () => GPAuth.extendSession(), { passive: true });
        });
    }

    document.addEventListener("DOMContentLoaded", init);

    // Global error
    window.addEventListener("error", (e) => console.error("Global:", e.error));
    window.addEventListener("unhandledrejection", (e) => console.error("Unhandled:", e.reason));
})();
