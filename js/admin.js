// js/admin.js

// --- GLOBAL VARIABLES ---
let totalRequests = 0;
let blockedThreats = 0;
let trafficChart;
let threatPieChart; // New chart for the Analysis tab

const safeQueries = ["/shop?id=12", "/search?q=watch", "/login", "/home", "/cart"];
const attackQueries = ["' OR 1=1 --", "UNION SELECT user, pass", "DROP TABLE users;", "admin' --"];

// --- 1. LOGIN HANDLING ---
function adminLogin(event) {
    event.preventDefault();
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;

    if (user === 'admin' && pass === 'admin123') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'grid';
        
        // Initialize Charts and Traffic
        initLiveChart();
        initThreatChart(); // Load the second chart
        startSimulation(); 
    } else {
        alert("ACCESS DENIED");
    }
}

// --- 2. TAB SWITCHING LOGIC (Makes the sidebar work) ---
function switchTab(tabName) {
    // 1. Hide all tab contents
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(div => div.classList.remove('active'));
    
    // 2. Deactivate all sidebar links
    const links = document.querySelectorAll('.sidebar a');
    links.forEach(a => a.classList.remove('active'));

    // 3. Show specific tab and activate link
    document.getElementById('tab-' + tabName).classList.add('active');
    document.getElementById('nav-' + tabName).classList.add('active');
}

// --- 3. CHART CONFIGURATION ---

// Main Line Chart (Live Monitor)
function initLiveChart() {
    const ctx = document.getElementById('trafficChart').getContext('2d');
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
            animation: { duration: 0 } // Disable animation for performance
        }
    });
}

// Pie Chart (Threat Analysis Tab)
function initThreatChart() {
    const ctx = document.getElementById('threatPieChart').getContext('2d');
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

// --- 4. TRAFFIC SIMULATION ---
// js/admin.js - Update this function

function startSimulation() {
    setInterval(() => {
        // 1. CHECK FOR REAL ATTACKS FROM LOGIN PAGE
        let realAttacks = JSON.parse(localStorage.getItem('simulatedAttacks')) || [];
        
        if (realAttacks.length > 0) {
            // Found a "real" attack from the user!
            const attack = realAttacks.shift(); // Get the oldest one
            
            // Add to the admin table
            addCustomRow(attack.time, attack.ip, attack.query, true);
            
            // Save the empty list back to storage
            localStorage.setItem('simulatedAttacks', JSON.stringify(realAttacks));
        } 
        else {
            // 2. IF NO REAL ATTACK, GENERATE RANDOM TRAFFIC (To keep the chart moving)
            const isAttack = Math.random() < 0.1; // 10% chance of random attack
            addLogRow(isAttack);
        }
    }, 1500);
}

// Helper function to add the specific row from the login page
function addCustomRow(time, ip, query, isAttack) {
    totalRequests++;
    if(isAttack) blockedThreats++;

    // Update Stats
    document.getElementById('totalReq').innerText = totalRequests;
    document.getElementById('blockedReq').innerText = blockedThreats;

    // Update Table
    const tableBody = document.getElementById('logBody');
    const newRow = document.createElement('tr');
    
    // Highlight the query in RED if it's an attack
    const cssClass = "color:#f85149; font-weight:bold";
    const action = "BLOCKED (Firewall)";

    newRow.innerHTML = `
        <td>${time}</td>
        <td>${ip}</td>
        <td style="font-family:monospace; color:#ff7b72">${query}</td>
        <td style="${cssClass}">CRITICAL THREAT</td>
        <td>${action}</td>
    `;
    
    tableBody.prepend(newRow);
    if (tableBody.children.length > 8) tableBody.removeChild(tableBody.lastChild);

    // Update Chart (Force a spike)
    if (trafficChart) {
        trafficChart.data.labels.push(time);
        trafficChart.data.datasets[0].data.push(0); // Safe drops
        trafficChart.data.datasets[1].data.push(1); // Attack spikes
        
        if (trafficChart.data.labels.length > 15) {
            trafficChart.data.labels.shift();
            trafficChart.data.datasets[0].data.shift();
            trafficChart.data.datasets[1].data.shift();
        }
        trafficChart.update();
    }
}

function generateRandomAttack() { addLogRow(true); }

function addLogRow(isAttack) {
    totalRequests++;
    
    // Generate Fake Data
    const queryList = isAttack ? attackQueries : safeQueries;
    const query = queryList[Math.floor(Math.random() * queryList.length)];
    const ip = "192.168.1." + Math.floor(Math.random() * 255);
    const time = new Date().toLocaleTimeString();
    
    let prediction = isAttack ? "MALICIOUS" : "SAFE";
    let cssClass = isAttack ? "color:#f85149; font-weight:bold" : "color:#2ea043";

    if (isAttack) blockedThreats++;

    // Update Stats
    document.getElementById('totalReq').innerText = totalRequests;
    document.getElementById('blockedReq').innerText = blockedThreats;

    // Update Table
    const tableBody = document.getElementById('logBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `<td>${time}</td><td>${ip}</td><td style="font-family:monospace">${query}</td><td style="${cssClass}">${prediction}</td><td>${isAttack ? 'BLOCKED' : 'ALLOWED'}</td>`;
    tableBody.prepend(newRow);
    if (tableBody.children.length > 8) tableBody.removeChild(tableBody.lastChild);

    // Update Chart
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
