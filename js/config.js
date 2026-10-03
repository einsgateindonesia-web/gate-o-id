/* =========================================================
   GATE O ID — Config
   Semua constant & konfigurasi terpusat di sini.
   ========================================================= */

window.GATEO_CONFIG = {
    // Storage keys
    STORAGE_KEY_PRODUCTS: "gateo_products_v2",
    STORAGE_KEY_AUTH: "gateo_admin_session",
    
    // UI constants
    ALL_CATEGORY: "Semua",
    DEFAULT_IMAGE: "https://via.placeholder.com/400x300/1e293b/64748b?text=No+Image",
    
    // Admin
    // ⚠️ PENTING: Ganti password ini sebelum deploy!
    // Catatan: ini bukan security beneran — client-side.
    // Buat security serius, butuh backend auth.
    ADMIN_PASSWORD_HASH: "gateo2025", // Ganti dengan password lu
    
    // Session (dalam menit)
    SESSION_DURATION_MINUTES: 60,
    
    // Limits
    MAX_TITLE_LENGTH: 120,
    MAX_DESC_LENGTH: 200,
    MAX_CATEGORY_LENGTH: 40,
    
    // Search debounce (ms)
    SEARCH_DEBOUNCE_MS: 180,
    
    // Click throttle (ms)
    CLICK_THROTTLE_MS: 2000
};
