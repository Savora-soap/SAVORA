
// cart.js - simple cart using localStorage
const CART_KEY = 'savora_cart_v1';

function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(item) {
  const cart = getCart();
  // item: {id, name, variant, price, qty, img}
  // If same product+variant exists, increase qty
  const exist = cart.find(p => p.id===item.id && p.variant===item.variant);
  if (exist) {
    exist.qty += item.qty;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  alert(item.qty + ' × ' + item.name + ' ('+item.variant+') added to cart');
}

function updateCartCount() {
  const c = getCart().reduce((s,p)=>s+p.qty,0);
  const el = document.getElementById('cart-count');
  if (el) el.textContent = c;
}

function renderCartPage() {
  const cart = getCart();
  const list = document.getElementById('cart-items');
  if (!list) return;
  list.innerHTML = '';
  if (cart.length===0) {
    list.innerHTML = '<p>Your cart is empty.</p>';
    document.getElementById('checkout-btn').style.display = 'none';
    return;
  }
  document.getElementById('checkout-btn').style.display = 'inline-block';
  let total = 0;
  cart.forEach((p, idx) => {
    total += p.price * p.qty;
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div style="flex:1">
        <strong>${p.name}</strong><br>
        <span class="small">Variant: ${p.variant}</span><br>
        <span class="small">Price: $${p.price.toFixed(2)} × ${p.qty}</span>
      </div>
      <div>
        <button onclick="changeQty(${idx}, -1)">-</button>
        <button onclick="changeQty(${idx}, 1)">+</button>
        <br><button onclick="removeItem(${idx})" style="margin-top:6px;">Remove</button>
      </div>
    `;
    list.appendChild(item);
  });
  document.getElementById('cart-total').textContent = '$' + total.toFixed(2);
}

function changeQty(index, delta) {
  const cart = getCart();
  cart[index].qty = Math.max(1, cart[index].qty + delta);
  saveCart(cart);
  renderCartPage();
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index,1);
  saveCart(cart);
  renderCartPage();
}

function goToCheckout() {
  // store cart snapshot for checkout
  const cart = getCart();
  if (cart.length===0) { alert('Cart is empty'); return; }
  // save in localStorage to be read on checkout
  localStorage.setItem('savora_checkout_cart', JSON.stringify(cart));
  window.location.href = 'checkout.html';
}

function populateCheckoutForm() {
  const raw = localStorage.getItem('savora_checkout_cart');
  const el = document.getElementById('order_details');
  if (!el) return;
  if (!raw) {
    el.value = 'Cart is empty';
    return;
  }
  const cart = JSON.parse(raw);
  let summary = '';
  cart.forEach(p=>{
    summary += `${p.name} (${p.variant}) — $${p.price.toFixed(2)} x ${p.qty}\n`;
  });
  const total = cart.reduce((s,p)=>s + p.price*p.qty, 0);
  summary += '\nTotal: $' + total.toFixed(2);
  el.value = summary;
}

// when product page loads, update cart count
document.addEventListener('DOMContentLoaded', updateCartCount);
