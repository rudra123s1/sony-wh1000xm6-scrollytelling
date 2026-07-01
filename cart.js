// Sony WH-1000XM6 E-Commerce Cart Manager

// Define all functions as standard hoisted declarations
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('sony_xm6_cart')) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('sony_xm6_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(item) {
  const cart = getCart();
  // Check if duplicate item (same color + accessory package)
  const existingIndex = cart.findIndex(i => i.color === item.color && i.pkg === item.pkg);
  
  if (existingIndex > -1) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({
      title: item.title || 'Sony WH-1000XM6',
      price: item.price || 399.99,
      color: item.color || 'Matte Black',
      pkg: item.pkg || 'Standard',
      qty: 1,
      img: './ezgif-frame-001.jpg'
    });
  }
  
  saveCart(cart);
  openCart();
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

function changeQty(index, delta) {
  const cart = getCart();
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  saveCart(cart);
}

function openCart() {
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartDrawer) cartDrawer.classList.add('active');
  if (cartOverlay) cartOverlay.classList.add('active');
}

function closeCart() {
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartDrawer) cartDrawer.classList.remove('active');
  if (cartOverlay) cartOverlay.classList.remove('active');
}

function updateCartUI() {
  const cart = getCart();
  const cartBadge = document.getElementById('cartBadge');
  const cartItemsContainer = document.getElementById('cartItems');
  const cartSubtotal = document.getElementById('cartSubtotal');
  
  // Update navbar badge count
  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartBadge) {
    cartBadge.innerText = totalItemsCount;
    cartBadge.style.display = totalItemsCount > 0 ? 'flex' : 'none';
  }

  // Redraw Cart Items List
  if (!cartItemsContainer) return;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="cart-empty-msg">Your shopping bag is empty.</div>';
    if (cartSubtotal) cartSubtotal.innerText = '$0.00';
    return;
  }

  let itemsHtml = '';
  let subtotalVal = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    subtotalVal += itemTotal;
    
    // Determine CSS filter based on selected colorway
    let colorClass = 'tint-black';
    if (item.color === 'Platinum Silver') colorClass = 'tint-silver';
    if (item.color === 'Midnight Blue') colorClass = 'tint-blue';

    itemsHtml += `
      <div class="cart-item">
        <img class="cart-item-img ${colorClass}" src="${item.img}" alt="${item.title}">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-meta">${item.color} / ${item.pkg}</div>
          <div class="cart-item-bottom">
            <div class="cart-qty-ctrl">
              <button class="cart-qty-btn" onclick="changeQty(${index}, -1)">-</button>
              <div class="cart-qty-val">${item.qty}</div>
              <button class="cart-qty-btn" onclick="changeQty(${index}, 1)">+</button>
            </div>
            <div style="display: flex; align-items: center;">
              <span class="cart-item-price">$${itemTotal.toFixed(2)}</span>
              <button class="cart-item-remove" onclick="removeFromCart(${index})">Remove</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  cartItemsContainer.innerHTML = itemsHtml;
  if (cartSubtotal) cartSubtotal.innerText = `$${subtotalVal.toFixed(2)}`;
}

// Helper to dynamically inject HTML
function injectCartHTML() {
  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  overlay.id = 'cartOverlay';
  document.body.appendChild(overlay);

  const drawer = document.createElement('div');
  drawer.className = 'cart-drawer';
  drawer.id = 'cartDrawer';
  drawer.innerHTML = `
    <div class="cart-header">
      <h2>Your Shopping Bag</h2>
      <button class="cart-close-btn" id="cartCloseBtn">&times;</button>
    </div>
    <div class="cart-items" id="cartItems">
      <!-- Rendered dynamically -->
    </div>
    <div class="cart-footer">
      <div class="cart-summary-line">
        <span>Subtotal</span>
        <span id="cartSubtotal">$0.00</span>
      </div>
      <div class="cart-summary-line" style="font-size: 0.8rem; color: var(--text-muted);">
        <span>Shipping & Taxes</span>
        <span>Calculated at checkout</span>
      </div>
      <a href="./checkout.html" class="btn-primary cart-checkout-btn">Checkout Now</a>
    </div>
  `;
  document.body.appendChild(drawer);
}

// Expose functions globally to window
window.getCart = getCart;
window.saveCart = saveCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.changeQty = changeQty;
window.openCart = openCart;
window.closeCart = closeCart;
window.updateCartUI = updateCartUI;

// Listen for DOM load to initialize the drawer and bind events
document.addEventListener('DOMContentLoaded', () => {
  // Inject Cart Drawer and Backdrop if not present
  if (!document.getElementById('cartDrawer')) {
    injectCartHTML();
  }

  // Bind close buttons
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Bind Open Buttons (Navbar cart icon & CTAs)
  document.querySelectorAll('.nav-cart-btn, [href="#cart"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    });
  });

  // Initialize UI
  updateCartUI();
});
