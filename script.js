
const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Audio",
    price: 3499,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=75"
  },
  {
    id: 2,
    name: "Classic Wrist Watch",
    category: "Accessories",
    price: 2499,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=75"
  },
  {
    id: 3,
    name: "Running Sneakers",
    category: "Fashion",
    price: 2899,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=75"
  },
  {
    id: 4,
    name: "Digital Camera",
    category: "Tech",
    price: 15999,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=75"
  },
  {
    id: 5,
    name: "Travel Backpack",
    category: "Lifestyle",
    price: 2199,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=75"
  },
  {
    id: 6,
    name: "Bluetooth Speaker",
    category: "Audio",
    price: 1799,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=75"
  },
  {
    id: 7,
    name: "Fitness Smartwatch",
    category: "Tech",
    price: 2999,
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=500&q=75"
  },
  {
    id: 8,
    name: "Modern Sunglasses",
    category: "Accessories",
    price: 1299,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=75"
  }
];

const $ = (selector) => document.querySelector(selector);

const productGrid = $("#product-grid");
const searchInput = $("#search");
const categoryFilter = $("#category");
const sortFilter = $("#sort");
const cartPanel = $("#cart-panel");

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(price);

// Load saved cart safely.
function loadCart() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("shopsmart-cart") || "[]"
    );

    if (!Array.isArray(saved)) return [];

    return saved.filter(item =>
      products.some(product => product.id === item.id) &&
      Number.isInteger(item.qty) &&
      item.qty > 0 &&
      item.qty <= 999
    );
  } catch {
    return [];
  }
}

let cart = loadCart();

// Save cart to browser storage.
function saveCart() {
  try {
    localStorage.setItem("shopsmart-cart", JSON.stringify(cart));
  } catch {
    // Cart remains usable for the current session.
  }
}

// Render products.
function renderProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  let filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  switch (sortFilter.value) {
    case "low":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;

    case "high":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;

    case "name":
      filteredProducts.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      break;
  }

  productGrid.replaceChildren();

  filteredProducts.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    image.loading = "lazy";
    image.decoding = "async";

    const info = document.createElement("div");
    info.className = "product-info";

    const category = document.createElement("p");
    category.className = "product-category";
    category.textContent = product.category;

    const name = document.createElement("h3");
    name.textContent = product.name;

    const bottom = document.createElement("div");
    bottom.className = "product-bottom";

    const price = document.createElement("span");
    price.className = "product-price";
    price.textContent = formatPrice(product.price);

    const button = document.createElement("button");
    button.className = "add-button";
    button.type = "button";
    button.textContent = "+";
    button.setAttribute(
      "aria-label",
      `Add ${product.name} to cart`
    );

    button.addEventListener("click", () => addToCart(product.id));

    bottom.append(price, button);
    info.append(category, name, bottom);
    card.append(image, info);
    productGrid.append(card);
  });

  $("#result-count").textContent =
    `${filteredProducts.length} products found`;

  $("#empty-message").hidden = filteredProducts.length !== 0;
  productGrid.hidden = filteredProducts.length === 0;
}

// Add a product to the cart.
function addToCart(productId) {
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: productId, qty: 1 });
  }

  saveCart();
  renderCart();
}

// Change item quantity.
function changeQuantity(productId, amount) {
  cart = cart
    .map(item => item.id === productId
      ? { ...item, qty: item.qty + amount }
      : item)
    .filter(item => item.qty > 0);

  saveCart();
  renderCart();
}

// Remove a product.
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
}

// Render cart items and subtotal.
function renderCart() {
  const container = $("#cart-items");
  container.replaceChildren();

  const totalItems = cart.reduce(
    (sum, item) => sum + item.qty, 0
  );

  $("#cart-count").textContent = totalItems;

  let subtotal = 0;

  if (cart.length === 0) {
    const empty = document.createElement("p");
    empty.className = "cart-empty";
    empty.textContent = "Your cart is empty.";
    container.append(empty);
  }

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return;

    subtotal += product.price * item.qty;

    const row = document.createElement("div");
    row.className = "cart-item";

    const details = document.createElement("div");

    const name = document.createElement("h3");
    name.textContent = product.name;

    const price = document.createElement("p");
    price.textContent =
      `${formatPrice(product.price)} × ${item.qty}`;

    const controls = document.createElement("div");
    controls.className = "quantity-controls";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute("aria-label", "Decrease quantity");
    minus.addEventListener("click", () =>
      changeQuantity(product.id, -1)
    );

    const quantity = document.createElement("span");
    quantity.textContent = item.qty;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute("aria-label", "Increase quantity");
    plus.addEventListener("click", () =>
      changeQuantity(product.id, 1)
    );

    controls.append(minus, quantity, plus);

    const remove = document.createElement("button");
    remove.className = "remove-button";
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () =>
      removeFromCart(product.id)
    );

    details.append(name, price, controls, remove);
    row.append(details);
    container.append(row);
  });

  $("#cart-total").textContent = formatPrice(subtotal);
  $("#clear-cart").disabled = cart.length === 0;
  $("#checkout").disabled = cart.length === 0;
}

// Cart panel controls.
$("#cart-toggle").addEventListener("click", () => {
  cartPanel.hidden = false;
  $("#close-cart").focus();
});

$("#close-cart").addEventListener("click", () => {
  cartPanel.hidden = true;
  $("#cart-toggle").focus();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !cartPanel.hidden) {
    cartPanel.hidden = true;
    $("#cart-toggle").focus();
  }
});

$("#clear-cart").addEventListener("click", () => {
  cart = [];
  saveCart();
  renderCart();
});

$("#checkout").addEventListener("click", () => {
  alert("This is a demonstration project. No payment was processed.");
});

// Search, category filtering, and sorting.
searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);
sortFilter.addEventListener("change", renderProducts);

// Update footer year.
$("#year").textContent = new Date().getFullYear();

// Initialize application.
renderProducts();
renderCart();
