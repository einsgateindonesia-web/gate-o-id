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
    DEFAULT_IMAGE: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 250' width='100%25' height='100%25'%3E%3Crect width='400' height='250' fill='%230a0a0c'/%3E%3Ccircle cx='200' cy='110' r='36' fill='%2317171c' stroke='%2326262e' stroke-width='2'/%3E%3Cpath d='M188 122l8-10 6 7 10-13 14 16H174z' fill='%2330D158' opacity='0.7'/%3E%3Ccircle cx='188' cy='98' r='4' fill='%2330D158'/%3E%3Ctext x='200' y='170' font-size='12' font-family='-apple-system, sans-serif' font-weight='500' fill='%23737373' text-anchor='middle'%3EGATE O ID &bull; Curated Item%3C/text%3E%3C/svg%3E",
    
    // Admin
    // Catatan: client-side session demo hash
    ADMIN_PASSWORD_HASH: "gateo2025",
    
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
