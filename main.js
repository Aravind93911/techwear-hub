let cart = [];

function addToCart(item) {
  cart.push(item);
  alert(item + " added to cart!");
  updateCartList();
}

function updateCartList() {
  const list = document.getElementById('cartList');
  list.innerHTML = '';
  cart.forEach(i => {
    const li = document.createElement('li');
    li.textContent = i;
    list.appendChild(li);
  });
}

function proceedToPayment() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  alert('Payment simulated for: ' + cart.join(', '));
}
