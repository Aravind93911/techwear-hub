// ======== LOCAL STORAGE CART SYSTEM ========

function getCart() {
  return JSON.parse(localStorage.getItem("cartItems")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cartItems", JSON.stringify(cart));
}

function addToCart(item) {
  let cart = getCart();
  cart.push(item);
  saveCart(cart);
  alert(`${item} added to cart!`);
}

function renderCart() {
  const cartList = document.getElementById("cartList");
  if (!cartList) return;
  const cart = getCart();
  cartList.innerHTML = "";
  if (cart.length === 0) {
    cartList.innerHTML = "<li>Your cart is empty.</li>";
  } else {
    cart.forEach((item, i) => {
      const li = document.createElement("li");
      li.textContent = item + " ";
      const btn = document.createElement("button");
      btn.textContent = "Remove";
      btn.onclick = () => removeFromCart(i);
      li.appendChild(btn);
      cartList.appendChild(li);
    });
  }
}

function removeFromCart(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function checkout() {
  let cart = getCart();
  if (cart.length === 0) return alert("Your cart is empty!");
  alert("Checkout successful for: " + cart.join(", "));
  localStorage.removeItem("cartItems");
  renderCart();
}

// ======== LOGIN SYSTEM ========

function userLogin(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  if (username && password) {
    localStorage.setItem("loggedUser", username);
    alert("Welcome, " + username + "!");
    window.location.href = "index.html";
  }
}

function updateNavbar() {
  const loginLink = document.getElementById("loginLink");
  if (!loginLink) return;
  const user = localStorage.getItem("loggedUser");
  if (user) loginLink.textContent = "Welcome, " + user;
}

document.addEventListener("DOMContentLoaded", () => {
  updateNavbar();
  renderCart();
});
