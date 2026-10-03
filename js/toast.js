/* =========================================================
   GATE O ID — Toast Notification
   ========================================================= */

window.GPToast = (function () {
    "use strict";

    let timer = null;

    /**
     * Show toast notification.
     * @param {string} message
     * @param {"success"|"error"|"warning"} type
     */
    function show(message, type = "success") {
        const toast = document.getElementById("toast");
        const msg = document.getElementById("toastMessage");
        if (!toast || !msg) return;

        msg.textContent = message;
        toast.classList.remove("error", "warning");
        if (type === "error") toast.classList.add("error");
        if (type === "warning") toast.classList.add("warning");

        // Ganti icon sesuai type
        const icon = toast.querySelector("i");
        if (icon) {
            icon.className = type === "error"
                ? "fa-solid fa-circle-xmark text-rose-500 text-lg"
                : type === "warning"
                    ? "fa-solid fa-triangle-exclamation text-amber-500 text-lg"
                    : "fa-solid fa-circle-check text-brand-500 text-lg";
        }

        toast.classList.add("show");
        clearTimeout(timer);
        timer = setTimeout(() => toast.classList.remove("show"), 3000);
    }

    return { show };
})();

// Alias biar gampang dipanggil
window.showToast = window.GPToast.show;
