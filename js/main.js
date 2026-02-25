// js/main.js
console.log("Main.js is LOADED successfully");
alert("System Ready - JS Connected");
// --- 1. PRODUCT DATABASE ---
const products = [
    {
        id: 1,
        name: "Smartwatch Pro",
        price: 199.00,
        // CHANGED: Using online URL so it works immediately
        image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80",
        desc: "OLED display, ECG monitoring, and 3-day battery life in a sleek aerospace aluminum body.",
        specs: ["Water Resistance: 50m", "Battery: 72 Hours", "Sensors: SpO2, Heart Rate", "Connectivity: BT 5.0"]
    },
    {
        id: 2,
        name: "Sonic Buds",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
        desc: "Active Noise Cancellation (ANC) with transparency mode and spatial audio support.",
        specs: ["Battery: 24 Hours (with case)", "Driver: 11mm Dynamic", "Resistance: IPX4", "Charging: Wireless"]
    },
    {
        id: 3,
        name: "Fitness Band X",
        price: 49.50,
        image: "https://images.unsplash.com/photo-1557935728-95d66cb15197?auto=format&fit=crop&w=600&q=80",
        desc: "Ultra-lightweight design. Tracks steps, sleep, and heart rate. Waterproof up to 50m.",
        specs: ["Weight: 15g", "Screen: AMOLED", "Modes: 30+ Sports", "Battery: 14 Days"]
    },
    {
        id: 4,
        name: "VR Headset Horizon",
        price: 299.00,
        image: "https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?auto=format&fit=crop&w=600&q=80",
        desc: "Immersive 4K virtual reality experience with 110-degree field of view.",
        specs: ["Resolution: 4K", "Refresh Rate: 90Hz", "Tracking: 6DoF", "Controllers: Included"]
    },
    {
        id: 5,
        name: "Pro Gaming Mouse",
        price: 59.99,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80",
        desc: "High-precision 25K sensor with customizable RGB lighting and programmable buttons.",
        specs: ["DPI: 25,000", "Buttons: 8 Programmable", "Weight: 63g", "Connection: 2.4GHz Wireless"]
    },
    {
        id: 6,
        name: "Mech Keyboard K1",
        price: 129.00,
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80",
        desc: "Tactile mechanical switches with aircraft-grade aluminum frame.",
        specs: ["Switches: Cherry MX Blue", "Backlight: RGB per-key", "Layout: TKL (87 Keys)", "Cable: Detachable USB-C"]
    }
];

// --- 2. SHOP PAGE LOGIC ---
function loadShop() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    grid.innerHTML = '';

    products.forEach(product => {
        const card = `
            <article class="product-card">
                <div class="image-wrapper">
                   <a href="product.html?id=${product.id}">
                       <img src="${product.image}" alt="${product.name}">
                   </a>
                </div>
                <div class="product-details">
                    <div class="product-title" style="font-size:1.2rem; font-weight:bold; margin-bottom:0.5rem;">${product.name}</div>
                    <span class="product-price" style="color:#00bcd4; font-size:1.1rem;">$${product.price.toFixed(2)}</span>
                    <div class="grid" style="gap:10px; margin-top:1rem;">
                        <a href="product.html?id=${product.id}" role="button" class="outline" style="font-size:0.8rem">View Details</a>
                        <button onclick="addToCart(${product.id})" style="font-size:0.8rem">Add to Cart</button>
                    </div>
                </div>
            </article>
        `;
        grid.innerHTML += card;
    });
}

// --- 3. PRODUCT DETAIL PAGE LOGIC ---
function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));
    const product = products.find(p => p.id === productId);

    if (product) {
        document.getElementById('detailImage').src = product.image;
        document.getElementById('detailName').innerText = product.name;
        document.getElementById('detailPrice').innerText = `$${product.price.toFixed(2)}`;
        document.getElementById('detailDesc').innerText = product.desc;
        
        document.getElementById('detailAddBtn').onclick = function() {
            addToCart(product.id);
        };

        const specsList = document.getElementById('detailSpecs');
        specsList.innerHTML = '';
        product.specs.forEach(spec => {
            specsList.innerHTML += `<li>${spec}</li>`;
        });
    } else {
        document.querySelector('main').innerHTML = "<h2>Product not found</h2>";
    }
}

// --- 4. CART SYSTEM ---
function addToCart(id) {
    let cart = JSON.parse(localStorage.getItem('techWearCart')) || [];
    const product = products.find(p => p.id === id);
    
    if(product) {
        cart.push(product);
        localStorage.setItem('techWearCart', JSON.stringify(cart));
        alert(`${product.name} added to cart!`);
    }
}

// --- 5. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('productGrid')) {
        loadShop();
    }
    if (document.getElementById('detailName')) {
        loadProductDetails();
    }
    // Profile Logic Check
    const user = localStorage.getItem('currentUser');
    if(user && document.getElementById('loginLink')) {
        const link = document.getElementById('loginLink');
        link.textContent = 'Profile';
        link.href = 'profile.html';
    }
});
// js/main.js - Update this function

// js/main.js

function userLogin(event) {
    event.preventDefault(); 
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const userVal = usernameInput.value;
    const passVal = passwordInput.value;

    console.log("Checking credentials for:", userVal); // Debugging line

    // --- 1. ROBUST SQL INJECTION DETECTION ---
    // Convert inputs to UpperCase to ensure 'or' matches 'OR'
    const cleanUser = userVal.toUpperCase();
    const cleanPass = passVal.toUpperCase();

    const sqlPatterns = [
        "' OR '1'='1", 
        "' OR 1=1", 
        "OR 1=1", 
        "UNION SELECT", 
        "DROP TABLE", 
        "--", 
        "ADMIN' --"
    ];
    
    // Check if input contains any pattern
    const isAttack = sqlPatterns.some(pattern => 
        cleanUser.includes(pattern) || cleanPass.includes(pattern)
    );

    if (isAttack) {
        console.log("Attack Detected!"); // Debugging line
        alert("⚠️ SECURITY ALERT: SQL Injection Attempt Detected!\nRequest has been blocked and logged.");
        
        // Save to Admin Log
        let attackLogs = JSON.parse(localStorage.getItem('simulatedAttacks')) || [];
        attackLogs.push({
            time: new Date().toLocaleTimeString(),
            ip: "192.168.1.105 (User IP)",
            query: userVal, // Save the exact text typed
            type: "SQL Injection"
        });
        localStorage.setItem('simulatedAttacks', JSON.stringify(attackLogs));
        
        return; // STOP HERE. Do not log them in.
    }

    // --- 2. NORMAL LOGIN ---
    if (userVal) {
        localStorage.setItem('currentUser', userVal);
        window.location.href = 'profile.html'; 
    } else {
        alert("Please enter a username");
    }
}

    // --- 2. NORMAL LOGIN LOGIC ---
    if (userVal) {
        localStorage.setItem('currentUser', userVal);
        window.location.href = 'profile.html'; 
    } else {
        alert("Please enter a username");
    }
}
// Add/Check this at the bottom of js/main.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. USER SESSION CHECK ---
    const currentUser = localStorage.getItem('currentUser');
    const loginLink = document.getElementById('loginLink');

    // If user is logged in...
    if (currentUser) {
        
        // Update the "Login" button to say "Profile"
        if (loginLink) {
            loginLink.textContent = 'Profile';
            loginLink.href = 'profile.html';
        }

        // If they try to visit the Login page, force them to Profile
        // (Prevents logging in twice)
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'profile.html';
        }
    }

    // ... Rest of your load functions (loadShop, loadProductDetails) ...
});
// js/main.js

function userLogin(event) {
    // 1. STOP THE REFRESH (Most Important Line)
    event.preventDefault(); 
    console.log("Submit button clicked - Default prevented");

    // 2. Get Values
    const usernameInput = document.getElementById('username');
    const userVal = usernameInput.value;
    
    // 3. Simple Alert Test
    alert("You clicked login! typed: " + userVal);

    // 4. SQL Check logic (Simplified)
    if (userVal.includes("'") || userVal.includes("OR")) {
        alert("⚠️ SQL INJECTION DETECTED!");
        return;
    }

    // 5. Normal Redirect
    window.location.href = "profile.html";
}
