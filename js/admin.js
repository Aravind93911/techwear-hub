// js/admin.js

// --- GLOBAL VARIABLES ---
let totalRequests = 0;
let blockedThreats = 0;
let trafficChart; // Variable to hold our chart instance

// Data Lists
const safeQueries = [
    "/shop?product_id=12", "/search?q=smartwatch", "/login?user=guest", "/home", "/cart/add?item=watch"
];
const attackQueries = [
    "' OR 1=1 --", "UNION SELECT user, password", "DROP TABLE products;", "admin' --", "/shop?id=1 OR 1=1"
];

// --- 1. LOGIN HANDLING ---
function adminLogin(event) {
    event.preventDefault();
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;

    if (user === 'admin' && pass === 'admin123') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'grid';
        
        // Initialize the Chart and Start Traffic
        initChart();
        startSimulation(); 
    } else {
        alert("ACCESS DENIED: Invalid Credentials");
    }
}

// --- 2. CHART CONFIGURATION ---
function initChart() {
    const ctx = document.getElementById('trafficChart').getContext('2d');
    
    trafficChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Time labels will be added dynamically
            datasets: [{
                label: 'Safe Traffic',
                borderColor: '#2ea043', // Green
                backgroundColor: 'rgba(46, 160, 67, 0.1)',
                data: [],
                tension: 0.4,
                fill: true
            },
            {
                label: 'SQL Injection Attacks',
                borderColor: '#c62828', // Red
                backgroundColor: 'rgba(198, 40, 40, 0.2)',
                data: [],
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: 'white' } }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#30363d' },
                    ticks: { color: '#8b949e' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#8b949e' }
                }
            },
            animation: {
                duration: 500 // Smooth animation
            }
        }
    });
}

// --- 3. TRAFFIC SIMULATION ---

function startSimulation() {
    // Generate traffic every 1.5 seconds
    setInterval(() => {
        // 20% chance of attack
        const isAttack = Math.random() < 0.2; 
        addLogRow(isAttack);
    }, 1500);
}

function generateRandomAttack() {
    addLogRow(true); // Force an attack
}

function addLogRow(isAttack) {
    totalRequests++;
    
    // 1. Generate Fake Data
    const queryList = isAttack ? attackQueries : safeQueries;
    const query = queryList[Math.floor(Math.random() * queryList.length)];
    const ip = "192.168.1." + Math.floor(Math.random() * 255);
    const now = new Date();
    const timeString = now.toLocaleTimeString();

    // 2. Logic for Prediction
    let prediction = "";
    let action = "";
    let cssClass = "";

    if (isAttack) {
        blockedThreats++;
        prediction = "MALICIOUS (99%)";
        action = "BLOCKED";
        cssClass = "badge-danger";
    } else {
        prediction = "SAFE (98%)";
        action = "ALLOWED";
        cssClass = "badge-safe";
    }

    // 3. Update Stats Text
    document.getElementById('totalReq').innerText = totalRequests;
    document.getElementById('blockedReq').innerText = blockedThreats;

    // 4. Update Logs Table
    const tableBody = document.getElementById('logBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td style="color:#8b949e">${timeString}</td>
        <td>${ip}</td>
        <td style="font-family:monospace; color: ${isAttack ? '#ff7b72' : '#e6edf3'}">${query}</td>
        <td><span class="${cssClass}">${prediction}</span></td>
        <td>${action}</td>
    `;
    tableBody.prepend(newRow);
    if (tableBody.children.length > 8) tableBody.removeChild(tableBody.lastChild);

    // 5. UPDATE CHART
    if (trafficChart) {
        const timeLabel = now.getSeconds() + 's';
        
        // Add new label
        trafficChart.data.labels.push(timeLabel);
        
        // Add data points: 1 if present, 0 if not (just for visual spiking)
        if (isAttack) {
            trafficChart.data.datasets[0].data.push(0); // Safe line drops
            trafficChart.data.datasets[1].data.push(1); // Attack line spikes
        } else {
            trafficChart.data.datasets[0].data.push(1); // Safe line up
            trafficChart.data.datasets[1].data.push(0); // Attack line flat
        }

        // Keep chart clean (only show last 10 points)
        if (trafficChart.data.labels.length > 10) {
            trafficChart.data.labels.shift();
            trafficChart.data.datasets[0].data.shift();
            trafficChart.data.datasets[1].data.shift();
        }

        trafficChart.update();
    }
}
