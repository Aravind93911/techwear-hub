// js/admin.js

// 1. LOGIN HANDLING
function adminLogin(event) {
    event.preventDefault();
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;

    // Hardcoded credentials for the demo
    if (user === 'admin' && pass === 'admin123') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'grid';
        startSimulation(); // Start the fake traffic logs
    } else {
        alert("ACCESS DENIED: Invalid Credentials");
    }
}

// 2. SIMULATION VARIABLES
let totalRequests = 0;
let blockedThreats = 0;

const safeQueries = [
    "/shop?product_id=12",
    "/search?q=smartwatch",
    "/login?user=guest",
    "/home",
    "/cart/add?item=watch"
];

const attackQueries = [
    "' OR 1=1 --",
    "UNION SELECT user, password FROM users",
    "DROP TABLE products;",
    "admin' --",
    "/shop?id=1 OR 1=1"
];

// 3. TRAFFIC GENERATOR
function generateRandomAttack() {
    // Force an attack immediately when button is clicked
    addLogRow(true);
}

function startSimulation() {
    // Automatically generate traffic every 2 seconds
    setInterval(() => {
        // 20% chance of attack, 80% chance of safe traffic
        const isAttack = Math.random() < 0.2; 
        addLogRow(isAttack);
    }, 2000);
}

function addLogRow(isAttack) {
    totalRequests++;
    
    // Choose random data
    const queryList = isAttack ? attackQueries : safeQueries;
    const query = queryList[Math.floor(Math.random() * queryList.length)];
    const ip = "192.168.1." + Math.floor(Math.random() * 255);
    const time = new Date().toLocaleTimeString();

    // Determine Result
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

    // Update Stats on Screen
    document.getElementById('totalReq').innerText = totalRequests;
    document.getElementById('blockedReq').innerText = blockedThreats;

    // Create Table Row
    const tableBody = document.getElementById('logBody');
    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
        <td style="color:#8b949e">${time}</td>
        <td>${ip}</td>
        <td style="font-family:monospace; color: ${isAttack ? '#ff7b72' : '#e6edf3'}">${query}</td>
        <td><span class="${cssClass}">${prediction}</span></td>
        <td>${action}</td>
    `;

    // Add to top of list
    tableBody.prepend(newRow);

    // Keep list short (remove old logs)
    if (tableBody.children.length > 10) {
        tableBody.removeChild(tableBody.lastChild);
    }
}
