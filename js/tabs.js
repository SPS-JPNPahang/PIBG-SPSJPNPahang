// tabs.js
// --------------------------------------------------
// Tukar tab antara Utama, Permohonan, Semakan, Pegawai, TP, dll.
// --------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {

    const btns = document.querySelectorAll(".tab-btn");
    const tabs = document.querySelectorAll(".tab-content");

    function showTab(id) {
        tabs.forEach(t => t.classList.remove("active-tab"));
        document.getElementById("tab-" + id).classList.add("active-tab");
    }

    btns.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.tab;
            showTab(id);
        });
    });

});
