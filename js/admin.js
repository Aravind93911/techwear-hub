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

function adminLogin(event) {
    event.preventDefault();
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;

    // Hardcoded check
    if (user === 'admin' && pass === 'admin123') {
        // SAVE SESSION TO BROWSER
        localStorage.setItem('adminSession', 'active');
        
        // Hide Login & Show Panel
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'grid';
        
        // Initialize Tools
        initLiveChart();
        initThreatChart();
        startSimulation(); 
    } else {
        alert("ACCESS DENIED");
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
        // 1. Check for real user attacks from Login Page
        let realAttacks = JSON.parse(localStorage.getItem('simulatedAttacks')) || [];
        
        if (realAttacks.length > 0) {
            const attack = realAttacks.shift(); 
            addCustomRow(attack.time, attack.ip, attack.query, true);
            localStorage.setItem('simulatedAttacks', JSON.stringify(realAttacks));
        } else {
            // 2. Random simulated traffic
            const isAttack = Math.random() < 0.2; 
            addLogRow(isAttack);
        }
    }, 1500);
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
