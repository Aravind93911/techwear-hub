let totalRequests = 0;
let blockedThreats = 0;
let chart;
let protectionEnabled = false;

document.addEventListener("DOMContentLoaded", () => {
   const toggle = document.getElementById("protectionToggle");
const label = document.getElementById("protectionLabel");

toggle.checked = savedState;
label.textContent = savedState
    ? "SQL PROTECTION: ON"
    : "SQL PROTECTION: OFF";

protectionEnabled = savedState;

    if (localStorage.getItem("adminSession") === "active") {
        openDashboard();
    }

    document.getElementById("loginForm")
        .addEventListener("submit", login);

    document.querySelectorAll(".sidebar nav a")
        .forEach(link => link.addEventListener("click", switchTab));

    document.getElementById("logoutBtn")
        .addEventListener("click", logout);

    document.getElementById("protectionToggle")
        .addEventListener("change", toggleProtection);

    document.getElementById("trainBtn")
        .addEventListener("click", trainModel);
});

function login(e) {
    e.preventDefault();
    const u = adminUser.value;
    const p = adminPass.value;

    if (u === "admin" && p === "admin123") {
        localStorage.setItem("adminSession", "active");
        openDashboard();
    } else {
        alert("Invalid credentials");
    }
}

function openDashboard() {
    login-overlay.style.display = "none";
    adminPanel.classList.remove("hidden");
    initChart();
    startSimulation();
    loadUsers();
}

function logout() {
    localStorage.removeItem("adminSession");
    location.reload();
}

function switchTab(e) {
    document.querySelectorAll(".sidebar nav a")
        .forEach(a => a.classList.remove("active"));
    e.target.classList.add("active");

    document.querySelectorAll(".tab")
        .forEach(tab => tab.classList.remove("active"));
    document.getElementById(e.target.dataset.tab)
        .classList.add("active");
}

function toggleProtection(e) {
    protectionEnabled = e.target.checked;

    localStorage.setItem("sqlProtectionState", protectionEnabled);

    protectionLabel.textContent =
        protectionEnabled ? "SQL PROTECTION: ON" : "SQL PROTECTION: OFF";
}

function initChart() {
    chart = new Chart(trafficChart, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Traffic",
                borderColor: "#2ea043",
                data: []
            }]
        },
        options: { animation: false }
    });
}
function startSimulation() {

    setInterval(() => {

        let logs = JSON.parse(localStorage.getItem("simulatedAttacks")) || [];

        if (logs.length > 0) {
            const attack = logs.shift();

            totalRequests++;
            if (attack.status === "BLOCKED") blockedThreats++;

            updateStats();

            addRow("realtimeLog",
                attack.time,
                attack.ip,
                attack.query,
                attack.status === "BLOCKED"
            );

            addRow("logTable",
                attack.time,
                attack.ip,
                attack.query,
                attack.status === "BLOCKED"
            );

            localStorage.setItem("simulatedAttacks", JSON.stringify(logs));
        }

    }, 1000);
}
function addRow(tableId, time, ip, query, attack) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${time}</td>
        <td>${ip}</td>
        <td>${query}</td>
        <td style="color:${attack ? "#f85149" : "#2ea043"}">
            ${attack ? "BLOCKED" : "ALLOWED"}
        </td>
    `;
    document.getElementById(tableId).prepend(row);
}

function loadUsers() {
    const users = [
        { id: 1, name: "admin", status: "Active" },
        { id: 2, name: "demoUser", status: "Active" },
        { id: 3, name: "unknown", status: "Suspicious" }
    ];

    users.forEach(u => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${u.status}</td>
        `;
        userTable.appendChild(row);
    });
}

function trainModel() {
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
        } else {
            width++;
            progressBar.style.width = width + "%";
        }
    }, 30);
}
