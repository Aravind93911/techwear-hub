// --- GLOBAL VARIABLES ---
let totalRequests = 0;
let blockedThreats = 0;
let trafficChart;
let threatPieChart;
// PERSISTENCE FIX: Load the protection state immediately
let isProtectionActive = localStorage.getItem('sqlProtectionState') === 'true';

const safeQueries = ["/shop?id=12", "/search?q=watch", "/login", "/home", "/cart"];
const attackQueries = ["' OR 1=1 --", "UNION SELECT user, pass", "DROP TABLE users;", "admin' --"];

// --- 1. SESSION & UI MANAGEMENT ---
document.addEventListener('DOMContentLoaded', () => {
    // Sync Toggle UI with saved state
    updateToggleUI(isProtectionActive);

    const isAdmin = localStorage.getItem('adminSession');
    if (isAdmin === 'active') {
        showDashboard();
    }
});

function toggleProtection() {
    const checkbox = document.getElementById('protectionToggle');
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
    if (checkbox) checkbox.checked = isActive;
}

function adminLogin(event) {
    event.preventDefault();
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;

    // PROTECTION CHECK: Only block if the toggle is ON
    if (isProtectionActive && (user.includes("'") || user.includes("--"))) {
        logAttackToStorage(user, "BLOCKED");
        alert("🚨 SQL PROTECTION ACTIVE: Attack Blocked!");
        return;
    }

    // BYPASS CHECK: Allow ' OR 1=1 -- if protection is OFF
    const isBypass = user.includes("' OR 1=1");
    if ((user === 'admin' && pass === 'admin123') || isBypass) {
        if (isBypass) logAttackToStorage(user, "ALLOWED (Vulnerable)");
        localStorage.setItem('adminSession', 'active');
        showDashboard();
    } else {
        alert("ACCESS DENIED");
    }
}

function showDashboard() {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'grid';
    initLiveChart();
    initThreatChart();
    startSimulation();
    loadUsers(); // Restores Mounika and Admin data
}

function adminLogout() {
    localStorage.removeItem('adminSession');
    window.location.reload();
}

// --- 2. LOGGING & SIMULATION ---
function logAttackToStorage(query, status) {
    const attack = { 
        time: new Date().toLocaleTimeString(), 
        ip: "192.168.1.105", 
        query: query, 
        status: status 
    };
    let logs = JSON.parse(localStorage.getItem('simulatedAttacks')) || [];
    logs.push(attack);
    localStorage.setItem('simulatedAttacks', JSON.stringify(logs));
}

function startSimulation() {
    setInterval(() => {
        let realAttacks = JSON.parse(localStorage.getItem('simulatedAttacks')) || [];
        
        if (realAttacks.length > 0) {
            const attack = realAttacks.shift(); 
            addLogEntry(attack.time, attack.ip, attack.query, attack.status);
            localStorage.setItem('simulatedAttacks', JSON.stringify(realAttacks));
            if (attack.status === "BLOCKED") blockedThreats++;
        } else {
            const isAttack = Math.random() < 0.2;
            const queryList = isAttack ? attackQueries : safeQueries;
            const query = queryList[Math.floor(Math.random() * queryList.length)];
            addLogEntry(new Date().toLocaleTimeString(), "192.168.1." + Math.floor(Math.random()*255), query, isAttack ? "BLOCKED" : "ALLOWED");
            if (isAttack) blockedThreats++;
        }
        totalRequests++;
        updateStats();
    }, 1500);
}

function addLogEntry(time, ip, query, status) {
    const statusColor = status.includes("BLOCKED") ? "#f85149" : "#2ea043";
    const row = `<tr><td>${time}</td><td>${ip}</td><td><code>${query}</code></td><td style="color:${statusColor}">${status}</td></tr>`;
    
    // Updates both tables at once
    const bodies = ['realtimeLogBody', 'logBody'];
    bodies.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.insertAdjacentHTML('afterbegin', row);
            if (el.children.length > 10) el.removeChild(el.lastChild);
        }
    });
}

function loadUsers() {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;
    // Restores your project-specific data
    tbody.innerHTML = `
        <tr><td>#100</td><td><strong>admin</strong></td><td>$2b$12$K9R...</td><td>System Admin</td><td><em>Protected</em></td></tr>
        <tr><td>#201</td><td><strong>mounika</strong></td><td>$2b$10$e9x...</td><td>Hyderabad, India</td><td><button class="outline" onclick="this.innerText='Blocked'">Block Access</button></td></tr>
    `;
}

function addNewData() {
    // 1. Get elements
    const queryInput = document.getElementById('newQuery');
    const labelSelect = document.getElementById('newLabel');
    const table = document.getElementById('mlTableBody');
    const countDisplay = document.getElementById('sampleCount');

    // 2. Validation
    if(!queryInput || queryInput.value.trim() === "") {
        alert("Please enter a query pattern.");
        return;
    }

    console.log("Adding new data point to ML model...");

    // 3. Determine Style based on classification
    const isAttack = labelSelect.value === "1";
    const typeText = isAttack ? "Attack" : "Normal";
    const labelText = isAttack ? "Malicious (1)" : "Safe (0)";
    const labelColor = isAttack ? "#f85149" : "#2ea043";

    // 4. Create and add the new row to the table
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${typeText}</td>
        <td style="font-family:monospace">${queryInput.value}</td>
        <td style="color:${labelColor}">${labelText}</td>
    `;
    
    // Prepend puts the new data at the top of the list
    if(table) {
        table.prepend(row);
    }

    // 5. Update the Training Sample Counter
    if(countDisplay) {
        let currentCount = parseInt(countDisplay.innerText.replace(/,/g, ''));
        countDisplay.innerText = (currentCount + 1).toLocaleString();
    }

    // 6. Reset the input field
    queryInput.value = "";
    alert("✅ Data added to training set. Retrain the model to apply changes.");
}
