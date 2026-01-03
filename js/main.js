// js/main.js

// --- 1. CART SYSTEM ---

function addToCart(productName, price) {
    // Get existing cart or create empty one
    let cart = JSON.parse(localStorage.getItem('techWearCart')) || [];
    
    // Add new item
    let product = {
        name: productName,
        price: price,
        id: Date.now() // Unique ID
    };
    
    cart.push(product);
    
    // Save back to browser storage
    localStorage.setItem('techWearCart', JSON.stringify(cart));
    
    // Visual feedback
    alert(productName + " added to your cart!");
}

// --- 2. LOGIN SYSTEM ---

function userLogin(event) {
    event.preventDefault(); // Stop page from reloading
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput.value) {
        // Save user to storage
        localStorage.setItem('currentUser', usernameInput.value);
        
        // Redirect to the new Profile page
        window.location.href = 'profile.html'; 
    } else {
        alert("Please enter a username");
    }
}

function userLogout() {
    // Clear user data
    localStorage.removeItem('currentUser');
    // Redirect to home
    window.location.href = 'index.html';
}

// --- 3. NAVIGATION MANAGER (Runs on every page load) ---

document.addEventListener('DOMContentLoaded', () => {
    
    // A. Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    const loginLink = document.getElementById('loginLink');

    if (currentUser && loginLink) {
        // User IS logged in: Change "Login" button to "Profile"
        loginLink.textContent = 'Profile';
        loginLink.href = 'profile.html';
    }

    // B. If we are on the Login page but already logged in, kick user to Profile
    if (window.location.pathname.includes('login.html') && currentUser) {
        window.location.href = 'profile.html';
    }
});
