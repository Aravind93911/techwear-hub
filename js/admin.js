// ===============================
// ADMIN DASHBOARD CONTROLLER
// ===============================

// ---------- GLOBAL STATE ----------
let totalRequests = 0;
let blockedThreats = 0;
let trafficChart = null;
let isProtectionActive = false;

const safeQueries = ["/shop?id=12", "/search?q=watch", "/login", "/home"];
const attackQueries = ["' OR 1=1 --", "UNION SELECT user, pass", "DROP TABLE users;", "admin' --"];

// ===============================
// INITIALIZATION
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    // Restore SQL Protection State
    isProtectionActive = localStorage.getItem("sqlProtectionState") === "true";
    updateToggleUI(isProtectionActive);

    // Attach Listeners
    document.getElementById("protectionToggle")
        ?.addEventListener("change", toggleProtection);

    document.getElementById("adminLoginForm")
        ?.addEventListener("submit", adminLogin);

    // Restore Session
    if (localStorage.getItem("adminSession") === "active") {
        showDashboard();
    }
});

// ===============================
// AUTH SYSTEM
// ===============================

function adminLogin(e) {
    e.preventDefault();

    const username = document.getElementById("adminUser").value;
    const password = document.getElementById("adminPass").value;

    if (isProtectionActive) {
        const result = detectSQLi(username + " " + password);

        if (result.isMalicious) {
            logAttack(username, "BLOCKED", result.confidence);
            alert("🚨 SQL PROTECTION ACTIVE: Attack Blocked!");
            return;
        }
    }

    const bypass = username.includes("' OR 1=1");

    if ((username === "admin" && password === "admin123") || bypass) {

        if (bypass && !isProtectionActive) {
            logAttack(username, "ALLOWED (Vulnerable)", "0%");
        }

        localStorage.setItem("adminSession", "active");
        showDashboard();
    } else {
        alert("❌ ACCESS DENIED");
    }
}

function adminLogout() {
    localStorage.removeItem("adminSession");
    location.reload();
}

function showDashboard() {
    document.getElementById("login-overlay").style.display = "none";
    document.getElementById("adminPanel").style.display = "grid";

    initLiveChart();
    startSimulation();
}

// ===============================
// SQL PROTECTION TOGGLE
// ===============================

function toggleProtection(e) {
    isProtectionActive = e.target.checked;
    localStorage.setItem("sqlProtectionState", isProtectionActive);
    updateToggleUI(isProtectionActive);
}

function updateToggleUI(active) {
    const label = document.getElementById("protectionLabel");
    const checkbox = document.getElementById("protectionToggle");

    if (!label || !checkbox) return;

    checkbox.checked = active;

    label.innerText = active
        ? "SQL PROTECTION: ON"
        : "SQL PROTECTION: OFF";

    label.style.color = active ? "#2ea043" : "#f85149";
}

// ===============================
// TAB SWITCHING
// ===============================

function switchTab(tab) {
    document.querySelectorAll(".tab-content")
        .forEach(el => el.classList.remove("active"));

    document.querySelectorAll(".sidebar a")
        .forEach(el => el.classList.remove("active"));

    document.getElementById("tab-" + tab)?.classList.add("active");
    document.getElementById("nav-" + tab)?.classList.add("active");
}

// ===============================
// CHART SYSTEM
// ===============================

function initLiveChart() {
    const canvas = document.getElementById("trafficChart");
    if (!canvas) return;

    trafficChart = new Chart(canvas.getContext("2d"), {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Safe",
                    borderColor: "#2ea043",
                    data: [],
                    tension: 0.4
                },
                {
                    label: "Attack",
                    borderColor: "#c62828",
                    data: [],
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 }
        }
    });
}

function updateChart(time, isAttack) {
    if (!trafficChart) return;

    trafficChart.data.labels.push(time);
    trafficChart.data.datasets[0].data.push(isAttack ? 0 : 1);
    trafficChart.data.datasets[1].data.push(isAttack ? 1 : 0);

    if (trafficChart.data.labels.length > 15) {
        trafficChart.data.labels.shift();
        trafficChart.data.datasets.forEach(d => d.data.shift());
    }

    trafficChart.update();
}

// ===============================
// TRAFFIC SIMULATION
// ===============================

function startSimulation() {
    setInterval(() => {

        const isAttack = Math.random() > 0.7;
        const query = isAttack
            ? attackQueries[Math.floor(Math.random() * attackQueries.length)]
            : safeQueries[Math.floor(Math.random() * safeQueries.length)];

        const ip = "192.168.1." + Math.floor(Math.random() * 255);
        const time = new Date().toLocaleTimeString();

        totalRequests++;
        if (isAttack) blockedThreats++;

        updateStats();
        addRealtimeLog(time, ip, query, isAttack);
        updateChart(time, isAttack);

    }, 1500);
}

// ===============================
// LOGGING SYSTEM
// ===============================

function updateStats() {
    document.getElementById("totalReq").innerText = totalRequests;
    document.getElementById("blockedReq").innerText = blockedThreats;
}

function addRealtimeLog(time, ip, query, isAttack) {
    const tbody = document.getElementById("realtimeLogBody");
    if (!tbody) return;

    const status = isAttack ? "BLOCKED" : "ALLOWED";
    const color = isAttack ? "#f85149" : "#2ea043";

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${time}</td>
        <td>${ip}</td>
        <td style="font-family:monospace">${query}</td>
        <td style="color:${color};font-weight:bold">${status}</td>
    `;

    tbody.prepend(row);
    if (tbody.children.length > 15)
        tbody.removeChild(tbody.lastChild);
}

// ===============================
// SQL INJECTION DETECTION ENGINE
// ===============================

function detectSQLi(query) {
    let score = 0;
    const q = query.toLowerCase();

    const patterns = [
        /\bunion\b.*\bselect\b/,
        /\bdrop\b.*\btable\b/,
        /--/,
        /1\s*=\s*1/,
        /admin'\s*--/
    ];

    patterns.forEach(p => {
        if (p.test(q)) score += 0.6;
    });

    const specialChars = (query.match(/['";]/g) || []).length;
    if (specialChars > 2) score += 0.3;

    return {
        isMalicious: score >= 0.5,
        confidence: Math.min(score * 100, 99).toFixed(1)
    };
}

function logAttack(query, status, confidence) {
    console.log("Attack:", query, status, confidence);
}
