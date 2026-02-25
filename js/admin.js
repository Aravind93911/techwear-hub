// js/admin.js

// --- GLOBAL VARIABLES ---
let totalRequests = 0;
let blockedThreats = 0;
let trafficChart;
let threatPieChart;

const safeQueries = ["/shop?id=12", "/search?q=watch", "/login", "/home", "/cart"];
const attackQueries = ["' OR 1=1 --", "UNION SELECT user, pass", "DROP TABLE users;", "admin' --"];

// --- 1. SESSION MANAGEMENT (THE FIX) ---
document.addEventListener('DOMContentLoaded', () => {
    // Check if admin is ALREADY logged in
    const isAdmin = localStorage.getItem('adminSession');
    
    if (isAdmin === 'active') {
        // Skip login screen
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'grid';
        
        // Start tools immediately
        initLiveChart();
        initThreatChart();
        startSimulation();
    }
});

function adminLogin(e) {
    e.preventDefault();
    const u = document.getElementById('adminUser').value;
    const p = document.getElementById('adminPass').value;

    // 1. Check for SQL Injection first
    const analysis = detectSQLi(u + " " + p); 

    if (analysis.isMalicious) {
        // 2. Create an attack record
        const attackEvent = {
            time: new Date().toLocaleTimeString(),
            ip: "Your Local IP", // In a real app, this would be the user's IP
            query: u,
            type: "SQL Injection Attempt",
            target: "/admin-login",
            confidence: analysis.confidence + "%"
        };

        // 3. Save to localStorage so the Dashboard can see it
        let logs = JSON.parse(localStorage.getItem('simulatedAttacks')) || [];
        logs.push(attackEvent);
        localStorage.setItem('simulatedAttacks', JSON.stringify(logs));

        alert("🚨 SECURITY ALERT: Malicious activity detected and logged.");
        return; // Stop the login process
    }

    // 4. Normal login check
    if (u === 'admin' && p === 'admin123') {
        localStorage.setItem('adminSession', 'active');
        showDashboard();
    } else {
        alert("❌ ACCESS DENIED");
    }
}

function adminLogout() {
    // Clear session
    localStorage.removeItem('adminSession');
    window.location.href = 'index.html'; // Kick back to home
}

// --- 2. TAB SWITCHING ---
function switchTab(tabName) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(div => div.classList.remove('active'));
    
    const links = document.querySelectorAll('.sidebar a');
    links.forEach(a => a.classList.remove('active'));

    const tabElement = document.getElementById('tab-' + tabName);
    const navElement = document.getElementById('nav-' + tabName);
    
    // Safety check in case elements don't exist
    if(tabElement) tabElement.classList.add('active');
    if(navElement) navElement.classList.add('active');
}

// --- 3. CHARTS & SIMULATION ---

function initLiveChart() {
    const canvas = document.getElementById('trafficChart');
    if(!canvas) return; // Stop if chart element is missing

    const ctx = canvas.getContext('2d');
    trafficChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Safe', borderColor: '#2ea043', data: [], tension: 0.4
            }, {
                label: 'Attack', borderColor: '#c62828', data: [], tension: 0.1
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { x: { display: false }, y: { beginAtZero: true } },
            animation: { duration: 0 }
        }
    });
}

function initThreatChart() {
    const canvas = document.getElementById('threatPieChart');
    if(!canvas) return;

    const ctx = canvas.getContext('2d');
    threatPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['SQL Injection', 'XSS', 'Brute Force'],
            datasets: [{
                data: [65, 20, 15],
                backgroundColor: ['#c62828', '#f1c40f', '#e67e22'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'right', labels: { color: 'white' } } } }
    });
}

function startSimulation() {
    setInterval(() => {
        // Check if there are any new attacks saved in localStorage from the login page
        let realAttacks = JSON.parse(localStorage.getItem('simulatedAttacks')) || [];
        
        if (realAttacks.length > 0) {
            const attack = realAttacks.shift(); // Get the oldest attack
            
            // Add it to the UI
            addRealtimeLog(
                attack.time, 
                attack.ip, 
                attack.type, 
                attack.query, 
                attack.confidence, 
                "BLOCKED"
            );

            // Update stats
            blockedThreats++;
            totalRequests++;
            updateStats();

            // Save the remaining attacks back to storage
            localStorage.setItem('simulatedAttacks', JSON.stringify(realAttacks));
        } else {
            // ... (Your existing random simulation code) ...
            totalRequests += Math.floor(Math.random() * 2);
            updateStats();
        }
    }, 1500);
}

// Helper to update the numbers on the screen
function updateStats() {
    document.getElementById('totalReq').innerText = totalRequests;
    document.getElementById('blockedReq').innerText = blockedThreats;
}

function generateRandomAttack() { addLogRow(true); }

function addCustomRow(time, ip, query, isAttack) {
    // Logic for real attacks (from login page)
    totalRequests++;
    if(isAttack) blockedThreats++;
    updateStats();
    updateLogTable(time, ip, query, "CRITICAL THREAT", "BLOCKED (Firewall)", "color:#ff7b72");
    updateChart(time, isAttack);
}

function addLogRow(isAttack) {
    // Logic for random simulated attacks
    totalRequests++;
    if (isAttack) blockedThreats++;

    const queryList = isAttack ? attackQueries : safeQueries;
    const query = queryList[Math.floor(Math.random() * queryList.length)];
    const ip = "192.168.1." + Math.floor(Math.random() * 255);
    const time = new Date().toLocaleTimeString();
    
    const prediction = isAttack ? "MALICIOUS" : "SAFE";
    const cssClass = isAttack ? "color:#f85149; font-weight:bold" : "color:#2ea043";
    
    updateStats();
    updateLogTable(time, ip, query, prediction, isAttack ? 'BLOCKED' : 'ALLOWED', cssClass);
    updateChart(time, isAttack);
}

// Helpers
function updateStats() {
    if(document.getElementById('totalReq')) document.getElementById('totalReq').innerText = totalRequests;
    if(document.getElementById('blockedReq')) document.getElementById('blockedReq').innerText = blockedThreats;
}

function updateLogTable(time, ip, query, pred, action, css) {
    const tableBody = document.getElementById('logBody');
    if(!tableBody) return;

    const newRow = document.createElement('tr');
    newRow.innerHTML = `<td>${time}</td><td>${ip}</td><td style="font-family:monospace">${query}</td><td style="${css}">${pred}</td><td>${action}</td>`;
    tableBody.prepend(newRow);
    if (tableBody.children.length > 8) tableBody.removeChild(tableBody.lastChild);
}

function updateChart(time, isAttack) {
    if (trafficChart) {
        trafficChart.data.labels.push(time);
        trafficChart.data.datasets[0].data.push(isAttack ? 0 : 1);
        trafficChart.data.datasets[1].data.push(isAttack ? 1 : 0);
        
        if (trafficChart.data.labels.length > 15) {
            trafficChart.data.labels.shift();
            trafficChart.data.datasets[0].data.shift();
            trafficChart.data.datasets[1].data.shift();
        }
        trafficChart.update();
    }
}
// --- 4. THE ML BRAIN (SQLi Detection) ---
function detectSQLi(query) {
    let score = 0;
    const q = query.toLowerCase();

    // Pattern matching for common SQLi keywords
    const patterns = [
        /\bunion\b.*\bselect\b/i, 
        /\bdrop\b.*\btable\b/i,
        /--/, 
        /1\s*=\s*1/,
        /admin'\s*--/
    ];

    patterns.forEach(p => { if (p.test(q)) score += 0.6; });

    // Detection of special character density (e.g., lots of quotes)
    const specialChars = (query.match(/['";\(\)\/\*]/g) || []).length;
    if (specialChars > 2) score += 0.3;

    return {
        isMalicious: score >= 0.5,
        confidence: Math.min(score * 100, 99.8).toFixed(1)
    };
}

// --- 5. LOGGING ENGINE (Populates both tables) ---
function addRealtimeLog(time, ip, type, query, confidence, status) {
    const liveBody = document.getElementById('realtimeLogBody'); // Dashboard Table
    const logTabBody = document.getElementById('logBody');        // Security Logs Tab Table
    
    const statusColor = status === "BLOCKED" ? "#f85149" : "#2ea043";

    // 1. Update the Dashboard Table (Real-time Stream)
    if (liveBody) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${time}</td>
            <td><code>${ip}</code></td>
            <td>${type}</td>
            <td><code>${query}</code></td>
            <td>${confidence}</td>
            <td style="color: ${statusColor}; font-weight: bold;">${status}</td>
        `;
        liveBody.prepend(row);
        if (liveBody.children.length > 10) liveBody.removeChild(liveBody.lastChild);
    }

    // 2. Update the dedicated "Security Logs" Tab Table
    if (logTabBody) {
        const logRow = document.createElement('tr');
        logRow.innerHTML = `
            <td>${time}</td>
            <td>${ip}</td>
            <td style="font-family:monospace">${query}</td>
            <td style="color:${statusColor}">${status === "BLOCKED" ? "CRITICAL" : "LOW"}</td>
            <td>${status}</td>
        `;
        logTabBody.prepend(logRow);
        if (logTabBody.children.length > 20) logTabBody.removeChild(logTabBody.lastChild);
    }

    // 3. Update the Line Chart
    updateChart(time, status === "BLOCKED");
}
