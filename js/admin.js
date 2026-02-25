// --- GLOBAL VARIABLES & STATE ---
let totalRequests = 0;
let blockedThreats = 0;
let trafficChart;
let threatPieChart;
// Read directly from storage to ensure it matches the toggle across page reloads
let isProtectionActive = localStorage.getItem('sqlProtectionState') === 'true';

const safeQueries = ["/shop?id=12", "/search?q=watch", "/login", "/home", "/cart"];
const attackQueries = ["' OR 1=1 --", "UNION SELECT user, pass", "DROP TABLE users;", "admin' --"];

// --- 1. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Sync UI with the saved state from localStorage
    updateToggleUI(isProtectionActive);

    // Check if admin is ALREADY logged in
    if (localStorage.getItem('adminSession') === 'active') {
        if(document.getElementById('login-overlay')) 
            document.getElementById('login-overlay').style.display = 'none';
        if(document.getElementById('adminPanel')) 
            document.getElementById('adminPanel').style.display = 'grid';
        
        initLiveChart();
        initThreatChart();
        startSimulation();
    }
});

// --- 2. TOGGLE & UI FUNCTIONS ---
function toggleProtection() {
    const checkbox = document.getElementById('protectionToggle');
    if (!checkbox) return;

    isProtectionActive = checkbox.checked;
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
    if (checkbox) {
        checkbox.checked = isActive;
    }
}

// --- 3. LOGIN & SECURITY LOGIC ---
function detectSQLi(query) {
    let score = 0;
    const q = query.toLowerCase();
    const patterns = [/\bunion\b.*\bselect\b/i, /\bdrop\b.*\btable\b/i, /--/, /1\s*=\s*1/, /admin'\s*--/];

    patterns.forEach(p => { if (p.test(q)) score += 0.6; });
    const specialChars = (query.match(/['";\(\)\/\*]/g) || []).length;
    if (specialChars > 2) score += 0.3;

    return {
        isMalicious: score >= 0.5,
        confidence: Math.min(score * 100, 99.8).toFixed(1)
    };
}

function adminLogin(e) {
    e.preventDefault();
    const u = document.getElementById('adminUser').value;
    const p = document.getElementById('adminPass').value;

    // Check if protection is active before allowing login
    if (isProtectionActive) {
        const analysis = detectSQLi(u + " " + p);
        if (analysis.isMalicious) {
            logAttackToStorage(u, "BLOCKED", analysis.confidence);
            alert("🚨 SQL PROTECTION ACTIVE: Attack Blocked!");
            return;
        }
    }

    const isBypass = u.includes("' OR 1=1");
    if ((u === 'admin' && p === 'admin123') || isBypass) {
        if (isBypass) {
            logAttackToStorage(u, "ALLOWED (Vulnerable)", "0%");
        }
        localStorage.setItem('adminSession', 'active');
        window.location.reload(); // Reload to trigger dashboard view
    } else {
        alert("❌ ACCESS DENIED: Invalid Credentials");
    }
}

function logAttackToStorage(query, status, confidence) {
    const attackEvent = {
        time: new Date().toLocaleTimeString(),
        ip: "192.168.1.105",
        query: query,
        type: "SQL Injection",
        confidence: confidence,
        status: status
    };
    let logs = JSON.parse(localStorage.getItem('simulatedAttacks')) || [];
    logs.push(attackEvent);
    localStorage.setItem('simulatedAttacks', JSON.stringify(logs));
}

function adminLogout() {
    localStorage.removeItem('adminSession');
    window.location.href = 'index.html';
}

// --- 4. DASHBOARD UTILITIES ---
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(div => div.classList.remove('active'));
    document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));

    const tab = document.getElementById('tab-' + tabName);
    const nav = document.getElementById('nav-' + tabName);
    if(tab) tab.classList.add('active');
    if(nav) nav.classList.add('active');
}

function updateStats() {
    if(document.getElementById('totalReq')) document.getElementById('totalReq').innerText = totalRequests;
    if(document.getElementById('blockedReq')) document.getElementById('blockedReq').innerText = blockedThreats;
}

// --- 5. LOGGING & SIMULATION ---
function addRealtimeLog(time, ip, type, query, confidence, status) {
    const liveBody = document.getElementById('realtimeLogBody'); 
    const logTabBody = document.getElementById('logBody');        
    const statusColor = (status === "BLOCKED" || status === "CRITICAL") ? "#f85149" : "#2ea043";

    const rowHTML = `
        <td>${time}</td>
        <td>${ip}</td>
        <td style="font-family:monospace">${query}</td>
        <td style="color:${statusColor}">${status === "BLOCKED" ? "CRITICAL" : "LOW"}</td>
        <td>${status}</td>
    `;

    if (liveBody) {
        const row = document.createElement('tr');
        row.innerHTML = rowHTML;
        liveBody.prepend(row);
        if (liveBody.children.length > 8) liveBody.removeChild(liveBody.lastChild);
    }

    if (logTabBody) {
        const row = document.createElement('tr');
        row.innerHTML = rowHTML;
        logTabBody.prepend(row);
    }
    updateChart(time, status === "BLOCKED");
}

function startSimulation() {
    setInterval(() => {
        let realAttacks = JSON.parse(localStorage.getItem('simulatedAttacks')) || [];
        if (realAttacks.length > 0) {
            const attack = realAttacks.shift(); 
            addRealtimeLog(attack.time, attack.ip, attack.type, attack.query, attack.confidence, attack.status === "BLOCKED" ? "BLOCKED" : "ALLOWED");
            if(attack.status === "BLOCKED") blockedThreats++;
            totalRequests++;
            updateStats();
            localStorage.setItem('simulatedAttacks', JSON.stringify(realAttacks));
        } else {
            totalRequests += Math.floor(Math.random() * 2);
            updateStats();
        }
    }, 1500);
}

// --- 6. CHARTS ---
function initLiveChart() {
    const canvas = document.getElementById('trafficChart');
    if(!canvas) return;
    trafficChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Safe', borderColor: '#2ea043', data: [] }, { label: 'Attack', borderColor: '#c62828', data: [] }] },
        options: { responsive: true, maintainAspectRatio: false, animation: { duration: 0 } }
    });
}

function initThreatChart() {
    const canvas = document.getElementById('threatPieChart');
    if(!canvas) return;
    threatPieChart = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: { labels: ['SQLi', 'XSS', 'Brute Force'], datasets: [{ data: [65, 20, 15], backgroundColor: ['#c62828', '#f1c40f', '#e67e22'] }] },
        options: { responsive: true }
    });
}

function updateChart(time, isAttack) {
    if (trafficChart) {
        trafficChart.data.labels.push(time);
        trafficChart.data.datasets[0].data.push(isAttack ? 0 : 1);
        trafficChart.data.datasets[1].data.push(isAttack ? 1 : 0);
        if (trafficChart.data.labels.length > 15) {
            trafficChart.data.labels.shift();
            trafficChart.data.datasets.forEach(d => d.data.shift());
        }
        trafficChart.update();
    }
}
