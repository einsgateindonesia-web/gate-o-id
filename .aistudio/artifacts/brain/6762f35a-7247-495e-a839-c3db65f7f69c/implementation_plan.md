# GATE O ID — Apple Dark Clean UI Transformation Plan

Transformasi visual menyeluruh untuk GATE O ID menghadirkan estetika **Apple Dark Clean & Modern macOS UI** kelas dunia dengan nuansa Deep OLED Black, frosted glass (translucent backdrop blur), micro hairline borders, serta bento grid layout yang presisi, sambil **mempertahankan 100% fungsionalitas dan logika bawaan aplikasi**.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Seluruh logika data, filter, search debounce, click throttling, sesi autentikasi admin, backup/restore JSON, dan parser CSV spreadsheet dipertahankan sepenuhnya tanpa regresi. Semua perubahan murni pada lapisan presentasi (HTML struktur semantik, Tailwind styling, CSS glassmorphism token, dan rendering markup UI).

- **Gaya Visual (Terkonfirmasi)**: Deep OLED black (`#000000` / `#050508`) dengan subtle translucent frosted glass (`rgba(255, 255, 255, 0.04)`), ultra-fine hairline borders (`border-white/[0.08]`), dan aksen Apple Emerald / Mint glow yang terkontrol (`#30D158`).
- **Kartu Produk & Grid (Terkonfirmasi)**: Bento-style cards dengan sudut kurva presisi khas Apple (`rounded-2xl` / `rounded-3xl`), rasio gambar konsisten, micro-hover lifting ($2\text{px}$ `translate-y` dengan soft depth specular glow), dan zero-pill typography.
- **Admin Panel & Interaksi (Terkonfirmasi)**: Estetika macOS Dark Window bar, segmented controls monokrom, input fields dengan inset shadow halus & focused ring Apple style, modal dialog sheet modern, serta status toast floating pill yang refined.

---

## 1. Overview & Core Concept

- **Apa yang Dikerjakan**: Merombak tampilan publik (`index.html`), admin workspace (`admin.html`), komponen dinamis (`js/products.js`, `js/admin.js`, `js/toast.js`), dan styles (`css/styles.css`) menjadi antarmuka dark mode berstandar Apple Design Guidelines.
- **Target Pengguna**: Audiens yang mencari kurasi produk berkualitas tinggi dan admin yang mengelola katalog melalui antarmuka desktop/mobile yang mewah, responsif, dan bebas distorsi visual ("anti-slop").
- **Nilai Utama**: Mempertahankan seluruh keandalan sistem bawaan (offline-first via localStorage, import CSV/JSON, click tracking) dengan peningkatan drastis pada visual hierarchy, typography, spatial rhythm, dan kepuasan interaksi mikro.

---

## 2. User Experience & Visual Design

### A. Key User Flows

1. **Beranda Publik & Eksplorasi Produk**:
   - Header sticky ultra-tipis dengan backdrop filter blur 24px (`backdrop-blur-xl bg-black/60`).
   - Hero banner bergaya Apple Pro Announcement: headline minimalis seimbang (`text-wrap: balance`), kicker tipografi tipis, search bar dengan glass inset field dan ikon SF-style.
   - Segmented filter controls kategori horizontal dengan scrolling halus dan indikator kategori aktif tanpa badge tabrakan.
   - Bento product grid: kartu dengan rasio visual seimbang, foto produk dengan subtle frame border, nama produk clean, metadata kategori unboxed (`Kategori · Klik`), tombol CTA "Buka Produk" dengan ikon panah diagonal elegan, dan tombol Quick Share.
2. **Interaksi Live Search & Sorting**:
   - Respon instan debounced search dengan transition fade halus. Empty state minimalis dengan ikon mono halus dan panduan jelas.
3. **Admin Dashboard (macOS Native Feel)**:
   - Login Gate dengan kartu floating kaca buram di tengah layar, subtle glowing rim lighting, dan Apple-style form input.
   - Admin Bar atas dengan header bergaya macOS window toolbar.
   - Section Metrik Statistik: 4 kartu metrik bento dengan tipografi tabular (`font-mono tabular-nums`) dan label minimalis.
   - Section Form Input & Edit: field berpasangan rapi dengan border halus, tombol simpan aksen Apple Emerald, dan tombol batal.
   - Action Bar Backup/Restore/CSV: tombol utilitas segmented elegan bergaya macOS toolbar action buttons.
   - Daftar Produk Admin: list row clean dengan thumbnail rounded-xl, text truncation, metrik klik tabular, tombol edit dan delete dengan hover micro-states yang nyaman.
   - Modal Konfirmasi & Notifikasi Toast: floating modal blur dengan animasi scale-in 150ms dan toast alert dengan border kaca.

### B. Visual Identity & Theme Tokens

- **Dominant Canvas (60%)**: `#000000` (Pure OLED Black) dan `#08080A` (Subtle Obsidian).
- **Structural Surfaces (30%)**:
  - Surface Card: `rgba(255, 255, 255, 0.03)` dengan border `rgba(255, 255, 255, 0.08)`.
  - Surface Hover: `rgba(255, 255, 255, 0.06)` dengan border `rgba(255, 255, 255, 0.16)`.
  - Glass Nav / Floating Bars: `rgba(0, 0, 0, 0.72)` dengan `backdrop-filter: blur(20px) saturate(180%)`.
- **Accent Budget (10%)**:
  - Apple Mint / Emerald (`#30D158` / `emerald-400`): aksen interaktif primer, active category marker, dan tombol submit.
  - Neutral Silver / Muted Titan (`#98989D` / `slate-400`): teks sekunder dan garis pemisah.
  - Warning / Danger: Apple Coral / Rose (`#FF453A`) untuk aksi hapus dan error boundary.
- **Typography**:
  - Display: `Inter` / `-apple-system, BlinkMacSystemFont, "SF Pro Display"` dengan letter-spacing rapat (`tracking-tight`), text-wrap balance, dan optical weight compensation untuk dark mode.
  - Body & Data: `Inter` / `SF Pro Text` dengan line-height 1.6 dan tabular numerals (`tabular-nums`) pada seluruh angka statistik.
- **Micro-Interactions**:
  - Transisi berdurasi 150ms–200ms dengan timing function `cubic-bezier(0.16, 1, 0.3, 1)`.
  - Hover lift $2\text{px}$ pada card bento tanpa layout shifting.

---

## 3. Key Product Decisions & Trade-Offs

- **Preservasi 100% Script & ID DOM**:
  - *Keputusan*: Mempertahankan seluruh ID elemen (`categoryContainer`, `productGrid`, `searchInput`, `sortSelect`, `loginForm`, `statsGrid`, `adminProductList`, `confirmModal`, dll.) dan nama fungsi internal (`GPProducts`, `GPStorage`, `GPAuth`, `GPUtils`, `GPToast`).
  - *Alasan*: Menjamin kompatibilitas mutlak, tidak ada logika klik, tracking, import CSV, atau session yang rusak.
- **Redesign Markup di dalam Renderer JS**:
  - *Keputusan*: Memperbarui template HTML string di dalam `js/products.js` dan `js/admin.js` agar menghasilkan struktur kartu Apple Bento dan list admin macOS yang baru, sambil mempertahankan seluruh event delegation selector (`.cat-btn`, `.product-link`, `.share-btn`, `[data-action="edit"]`, dsb.).
- **Zero Heavy Framework / Zero Build Step**:
  - *Keputusan*: Tetap menggunakan vanilla JavaScript dan Tailwind CSS utility-first yang disempurnakan dengan token CSS modern di `css/styles.css`.
  - *Alasan*: Menjaga performa ultra-ringan (skor Lighthouse 99-100), loading instan tanpa overhead runtime kompilasi.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GATE O ID — PRESENTATION                        │
├──────────────────────────────────┬─────────────────────────────────────┤
│      Beranda Publik              │        Admin Panel                  │
│  ┌────────────────────────────┐  │  ┌────────────────────────────────┐ │
│  │ Apple Glass Header (Nav)   │  │  │ macOS Toolbar & Status Bar     │ │
│  │ Pro Headline & Live Search │  │  │ Bento Stats Metrics (4 cols)   │ │
│  │ Segmented Category Rail    │  │  │ Glass Card Form (Add / Edit)   │ │
│  │ Apple Bento Grid (Cards)   │  │  │ Segmented Utility Tools (CSV)  │ │
│  │ Floating Toast Notification│  │  │ macOS Style Item Table/List    │ │
│  └────────────────────────────┘  │  │ Apple Sheet Confirm Modal      │ │
│                                  │  └────────────────────────────────┘ │
├──────────────────────────────────┴─────────────────────────────────────┤
│                      JAVASCRIPT CONTROLLERS (UNTOUCHED)                │
│   GPProducts (Render, Search, Filter) ◄─► GPStorage (LocalStorage)     │
│   GPAdmin (CRUD, CSV Parser, Export)  ◄─► GPAuth (Session Expiry)      │
│   GPUtils (Security XSS, Debounce)    ◄─► GPToast (Feedback UI)        │
└────────────────────────────────────────────────────────────────────────┘
```

### Rencana File yang Diperbarui:
1. `css/styles.css`: Definisi glassmorphism tokens, backdrop filters, Apple-style scrollbar, dan smooth transitions.
2. `index.html`: Tata letak header Apple, hero showcase, segmented category bar, dan bento container.
3. `admin.html`: macOS modern admin panel interface, refined login gate card, clean inputs, and modal dialog.
4. `js/products.js`: Template rendering kartu produk bergaya Apple bento (rasio gambar tajam, unboxed clean metadata, visual action button).
5. `js/admin.js`: Template rendering kartu statistik bento, baris daftar produk macOS, dan toast trigger.
