/* =========================================================
   GATE O ID — Admin Panel Logic
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
       Confirm Dialog (custom, bukan window.confirm)
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
            GPToast.show("Login berhasil");
        } else {
            els.loginError.textContent = "Password salah. Coba lagi.";
            els.loginError.classList.remove("hidden");
            els.loginPassword.value = "";
            els.loginPassword.focus();
        }
    }

    function handleLogout() {
        GPAuth.logout();
        showLogin();
        GPToast.show("Berhasil logout");
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
            { icon: "fa-box", label: "Total Produk", value: GPUtils.formatNumber(state.products.length), color: "text-brand-500" },
            { icon: "fa-hand-pointer", label: "Total Klik", value: GPUtils.formatNumber(totalClicks), color: "text-blue-400" },
            { icon: "fa-tags", label: "Kategori", value: GPUtils.formatNumber(totalCategories), color: "text-amber-400" },
            { icon: "fa-fire", label: "Produk Populer", value: state.products.length ? GPUtils.escapeHtml(
                state.products.reduce((max, p) => (p.clicks || 0) > (max.clicks || 0) ? p : max, state.products[0]).title
              ).slice(0, 20) : "-", color: "text-rose-400" }
        ];

        els.statsGrid.innerHTML = stats.map(s => `
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div class="flex items-center gap-2 mb-2">
                    <i class="fa-solid ${s.icon} ${s.color} text-xs"></i>
                    <span class="text-[10px] uppercase tracking-wider text-slate-500 font-medium">${s.label}</span>
                </div>
                <p class="text-lg font-bold text-white truncate">${s.value}</p>
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
                <div class="text-center py-8 text-slate-500 text-sm">
                    <i class="fa-solid fa-inbox text-2xl mb-2 opacity-50"></i>
                    <p>Belum ada produk. Tambahin yang pertama!</p>
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
                <div class="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <img src="${safeImg}" loading="lazy" alt=""
                             class="w-10 h-10 object-cover rounded-lg bg-slate-900 flex-shrink-0"
                             onerror="this.src='${window.GATEO_CONFIG.DEFAULT_IMAGE}'">
                        <div class="truncate">
                            <h4 class="text-xs font-medium text-slate-200 truncate">${safeTitle}</h4>
                            <div class="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                <span>${safeCat}</span>
                                <span>•</span>
                                <span class="text-brand-500">${GPUtils.formatNumber(p.clicks || 0)} Klik</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-1 flex-shrink-0">
                        <button type="button" data-action="edit" data-id="${safeId}"
                                class="p-1.5 text-slate-400 hover:text-amber-400 transition" title="Edit">
                            <i class="fa-solid fa-pen-to-square text-xs"></i>
                        </button>
                        <button type="button" data-action="delete" data-id="${safeId}"
                                class="p-1.5 text-slate-400 hover:text-rose-500 transition" title="Hapus">
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
            `"${GPUtils.truncate(p.title, 60)}" bakal dihapus permanen.`
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
            GPToast.show("Belum ada produk buat di-export", "warning");
            return;
        }
        GPStorage.exportToFile(state.products);
        GPToast.show("Backup berhasil di-download!");
    }

    async function handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        document.body.style.cursor = "wait";
        GPToast.show("Memproses import...");

        const result = await GPStorage.importFromFile(file);

        document.body.style.cursor = "default";
        e.target.value = "";

        if (!result.success) {
            GPToast.show(result.error, "error");
            return;
        }

        const ok = await showConfirm(
            "Import Data?",
            `Ini bakal GANTI ${state.products.length} produk sekarang dengan ${result.products.length} produk dari file. Lanjut?`
        );

        if (!ok) {
            GPToast.show("Import dibatalkan", "warning");
            return;
        }

        state.products = result.products;
        GPStorage.save(state.products);
        renderStats();
        renderCategoryOptions();
        renderProductList();
        GPToast.show(`${result.products.length} produk berhasil di-import!`);
    }

    async function handleReset() {
        const ok = await showConfirm(
            "Reset Semua Data?",
            "Semua produk bakal dihapus dan nggak bisa dikembalikan. Yakin?"
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
