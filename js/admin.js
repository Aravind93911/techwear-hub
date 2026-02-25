// --- GLOBAL STATE ---
let totalRequests = 0;
let blockedThreats = 0;
let trafficChart;

// Initialize state from localStorage immediately
let isProtectionActive = localStorage.getItem('sqlProtectionState') === 'true';

document.addEventListener('DOMContentLoaded', () => {
    // Sync the UI switch with the saved state
    updateToggleUI(isProtectionActive);

    if (localStorage.getItem('adminSession') === 'active') {
        showDashboard();
    }
});

// --- TOGGLE FUNCTIONS ---
function toggleProtection() {
    const checkbox = document.getElementById('protectionToggle');
    isProtectionActive = checkbox.checked;
    
    // Save state to browser so it persists across page reloads
    localStorage.setItem('sqlProtectionState', isProtectionActive);
    updateToggleUI(isProtectionActive);
}

function updateToggleUI(isActive) {
    const label = document.getElementById('protectionLabel');
    const checkbox = document.getElementById('protectionToggle');
    
    if (label) {
        label.innerText = isActive ? "SQL PROTECTION: ON" : "SQL PROTECTION: OFF";
        label.style.color = isActive ? "#2ea043" : "#f85149";
    }
    if (checkbox) checkbox.checked = isActive;
}

// --- SECURITY ENGINE ---
function detectSQLi(query) {
    const q = query.toLowerCase();
    const patterns = [/\bunion\b.*\bselect\b/i, /--/, /1\s*=\s*1/, /admin'\s*--/];
    let score = patterns.some(p => p.test(q)) ? 0.6 : 0;
    
    const specialChars = (query.match(/['";\(\)\/\*]/g) || []).length;
    if (specialChars > 2) score += 0.3;

    return {
        isMalicious: score >= 0.5,
        confidence: Math.min(score * 100, 99.8).toFixed(1)
    };
}

// --- LOGIN LOGIC ---
function adminLogin(e) {
    e.preventDefault();
    const u = document.getElementById('adminUser').value;
    const p = document.getElementById('adminPass').value;

    // 1. Check if protection is ON
    if (isProtectionActive) {
        const analysis = detectSQLi(u + " " + p);
        if (analysis.isMalicious) {
            alert("🚨 SQL PROTECTION ACTIVE: Attack Blocked!");
            return; // Stops login
        }
    }

    // 2. Process Login (Allow bypass if protection is OFF)
    const isBypass = u.includes("' OR 1=1");
    if ((u === 'admin' && p === 'admin123') || isBypass) {
        localStorage.setItem('adminSession', 'active');
        showDashboard();
    } else {
        alert("❌ ACCESS DENIED: Invalid Credentials");
    }
}

// --- DASHBOARD FUNCTIONS ---
function showDashboard() {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'grid';
    initChart();
    startSimulation();
    loadUsers(); 
}

function adminLogout() {
    localStorage.removeItem('adminSession');
    window.location.reload();
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sidebar a').forEach(el => el.classList.remove('active'));

    const tab = document.getElementById('tab-' + tabName);
    const nav = document.getElementById('nav-' + tabName);
    if (tab) tab.classList.add('active');
    if (nav) nav.classList.add('active');
    if (tabName === 'users') loadUsers();
}

// ... Keep your existing initChart(), startSimulation(), loadUsers(), etc. ...
