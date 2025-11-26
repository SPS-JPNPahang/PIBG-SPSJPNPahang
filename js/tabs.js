// tabs.js
// --------------------------------------------------
// Tukar tab antara Utama, Permohonan, Semakan, Pegawai, TP, dll.
// --------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const btns = document.querySelectorAll(".tab-btn");
    const tabs = document.querySelectorAll(".tab-content");
    
    function showTab(id) {
        // Hide all tabs
        tabs.forEach(t => t.classList.remove("active-tab"));
        
        // Remove active from all buttons
        btns.forEach(b => b.classList.remove("active"));
        
        // Show selected tab
        const selectedTab = document.getElementById("tab-" + id);
        if (selectedTab) {
            selectedTab.classList.add("active-tab");
        }
        
        // Mark button as active
        const activeBtn = document.querySelector(`.tab-btn[data-tab="${id}"]`);
        if (activeBtn) {
            activeBtn.classList.add("active");
        }
    }
    
    btns.forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.tab;
            showTab(id);
        });
    });
});
