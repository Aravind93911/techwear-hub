// js/main.js

// --- 1. PRODUCT DATABASE ---
const products = [
    {
        id: 1,
        name: "Smartwatch Pro",
        price: 199.00,
        image: "images/smartwatch.jpg", // Make sure you have this image
        desc: "OLED display, ECG monitoring, and 3-day battery life in a sleek aerospace aluminum body.",
        specs: ["Water Resistance: 50m", "Battery: 72 Hours", "Sensors: SpO2, Heart Rate", "Connectivity: BT 5.0"]
    },
    {
        id: 2,
        name: "Sonic Buds",
        price: 89.99,
        image: "images/earbuds.jpg",
        desc: "Active Noise Cancellation (ANC) with transparency mode and spatial audio support.",
        specs: ["Battery: 24 Hours (with case)", "Driver: 11mm Dynamic", "Resistance: IPX4", "Charging: Wireless"]
    },
    {
        id: 3,
        name: "Fitness Band X",
        price: 49.50,
        image: "images/fitness-tracker.jpg",
        desc: "Ultra-lightweight design. Tracks steps, sleep, and heart rate. Waterproof up to 50m.",
        specs: ["Weight: 15g", "Screen: AMOLED", "Modes: 30+ Sports", "Battery: 14 Days"]
    },
    // --- NEW PRODUCTS ---
    {
        id: 4,
        name: "VR Headset Horizon",
        price: 299.00,
        // Use a placeholder if you don't have the image yet
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

// --- 2. SHOP PAGE LOGIC (Auto-Generate Grid) ---
function loadShop() {
    const grid = document.getElementById('productGrid');
    if (!grid) return; // Stop if we aren't on the shop page

    grid.innerHTML = ''; // Clear loading text

    products.forEach(product => {
        const card = `
            <article class="product-card">
                <div class="image-wrapper">
                   <a href="product.html?id=${product.id}">
                       <img src="${product.image}" alt="${product.name}">
                   </a>
                </div>
                <div class="product-details">
                    <div class="product-title">${product.name}</div>
                    <span class="product-price">$${product.price.toFixed(2)}</span>
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
    // Get ID from URL (e.g., product.html?id=2)
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));

    // Find product in our "Database"
    const product = products.find(p => p.id === productId);

    if (product) {
        document.getElementById('detailImage').src = product.image;
        document.getElementById('detailName').innerText = product.name;
        document.getElementById('detailPrice').innerText = `$${product.price.toFixed(2)}`;
        document.getElementById('detailDesc').innerText = product.desc;
        
        // Update Buy Button
        document.getElementById('detailAddBtn').onclick = function() {
            addToCart(product.id);
        };

        // Fill Specs List
        const specsList = document.getElementById('detailSpecs');
        specsList.innerHTML = '';
        product.specs.forEach(spec => {
            specsList.innerHTML += `<li>${spec}</li>`;
        });
    } else {
        document.querySelector('main').innerHTML = "<h2>Product not found</h2>";
    }
}

// --- 4. CART SYSTEM (Updated to look up ID) ---
function addToCart(id) {
    let cart = JSON.parse(localStorage.getItem('techWearCart')) || [];
    
    // Find full details from our database using ID
    const product = products.find(p => p.id === id);
    
    if(product) {
        cart.push(product);
        localStorage.setItem('techWearCart', JSON.stringify(cart));
        alert(`${product.name} added to cart!`);
    }
}

// --- 5. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we are on
    if (document.getElementById('productGrid')) {
        loadShop();
    }
    if (document.getElementById('detailName')) {
        loadProductDetails();
    }
});
