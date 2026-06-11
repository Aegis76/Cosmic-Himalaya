// ─── UTILS & UI ───
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu");
  const navRight = document.querySelector(".nav-right");

  if (menuBtn && navRight) {
    menuBtn.addEventListener("click", () => {
      navRight.classList.toggle("active");
      // Change icon between hamburger and close
      menuBtn.textContent = navRight.classList.contains("active") ? "✕" : "☰";
    });

    // Close menu when clicking a link
    navRight.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navRight.classList.remove("active");
        menuBtn.textContent = "☰";
      });
    });
  }
});

// Custom Confirm Modal
function showConfirm(title, message, onConfirm) {
  const overlay = document.createElement("div");
  overlay.className = "confirm-overlay";
  
  const modalHTML = `
    <div class="confirm-modal">
      <div class="confirm-icon">🗑️</div>
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="confirm-btns">
        <button class="confirm-btn cancel" id="confirmCancel">Cancel</button>
        <button class="confirm-btn danger" id="confirmOk">Clear All</button>
      </div>
    </div>
  `;
  
  overlay.innerHTML = modalHTML;
  document.body.appendChild(overlay);
  
  // Force reflow for animation
  setTimeout(() => overlay.classList.add("open"), 10);
  
  const close = () => {
    overlay.classList.remove("open");
    setTimeout(() => overlay.remove(), 400);
  };
  
  overlay.querySelector("#confirmCancel").onclick = close;
  overlay.querySelector("#confirmOk").onclick = () => {
    onConfirm();
    close();
  };
  overlay.onclick = (e) => {
    if (e.target === overlay) close();
  };
}

// ─── CART UI INJECTION ───
function injectCartUI() {
  if (document.getElementById("cartSidebar")) return;

  const cartHTML = `
    <div id="cartOverlay" class="cart-overlay" onclick="toggleCart()"></div>
    <div id="cartSidebar" class="cart-sidebar">
      <div class="cart-header">
        <h3>Your Cart</h3>
        <div style="display: flex; align-items: center; gap: 10px">
          <button class="cart-clear" onclick="clearCart()" style="background: none; border: none; color: var(--red); font-size: 12px; font-weight: 700; cursor: pointer; text-transform: uppercase;">Clear All</button>
          <button class="cart-close" onclick="toggleCart()">✕</button>
        </div>
      </div>
      <div id="cartItems" class="cart-items"></div>
      <div class="cart-footer">
        <div class="cart-summary">
          <div class="cs-row"><span>Subtotal</span><span id="cartSubtotal">₹0</span></div>
          <div class="cs-row"><span>GST (5%)</span><span id="cartGst">₹0</span></div>
          <div class="cs-total"><span>Total</span><span id="cartTotal">₹0</span></div>
        </div>
        <button class="cart-checkout-btn" onclick="checkoutCart()">Proceed to Checkout</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', cartHTML);
}
// ─── WHATSAPP FLOATING BUTTON ───
function injectWhatsAppUI() {
  if (document.getElementById("waFloating")) return;

  const WHATSAPP_NUMBER = "919259269317";
  const waHTML = `
    <a href="trek.html" 
       class="book-now-floating" 
       id="bookNowFloating">
      Book Now
    </a>
    <a href="https://wa.me/${WHATSAPP_NUMBER}" 
       id="waFloating" 
       class="wa-floating" 
       target="_blank" 
       rel="noopener noreferrer"
       aria-label="Chat on WhatsApp">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    </a>
  `;
  document.body.insertAdjacentHTML('beforeend', waHTML);
}
injectWhatsAppUI();
injectCartUI();

// ─── GLOBAL SEARCH ───
const navSearchInput = document.querySelector(".nav-search-wrap input");
if (navSearchInput) {
  const searchContainer = document.querySelector(".nav-search-wrap");

  // Inject results dropdown
  const resultsDropdown = document.createElement("div");
  resultsDropdown.className = "search-dropdown";
  searchContainer.appendChild(resultsDropdown);

  let selectedIndex = -1;

  const handleSearchInput = debounce((e) => {
    const query = e.target.value.toLowerCase().trim();
    resultsDropdown.innerHTML = "";
    selectedIndex = -1;

    if (!query) {
      resultsDropdown.classList.remove("show");
      return;
    }

    // Filter TREKS data
    const matches = Object.entries(TREKS).filter(([key, t]) => {
      return (
        t.title.toLowerCase().includes(query) ||
        t.region.toLowerCase().includes(query) ||
        (t.season && t.season.toLowerCase().includes(query))
      );
    });

    if (matches.length > 0) {
      matches.slice(0, 6).forEach(([key, t], idx) => {
        const item = document.createElement("div");
        item.className = "search-item";
        item.dataset.key = key;
        item.innerHTML = `
          <img src="${getImgUrl(t.img)}" alt="${t.title}" class="search-item-img">
          <div class="search-item-info">
            <div class="search-item-title">${t.title}</div>
            <div class="search-item-meta">
              <span>📍 ${t.region.split(",")[0]}</span>
              <span class="dot">•</span>
              <span>⏱ ${t.dur}</span>
            </div>
          </div>
        `;
        item.addEventListener("click", () => {
          window.location.href = `view-trek.html?trek=${key}`;
        });
        resultsDropdown.appendChild(item);
      });
    } else {
      resultsDropdown.innerHTML = `<div class="search-item-no-results">
        <div class="no-res-ico">🏔️</div>
        <div class="no-res-txt">No treks found for "${query}"</div>
        <small>Try searching for "Everest", "Bali" or "Kedar"</small>
      </div>`;
    }

    resultsDropdown.classList.add("show");
  }, 250);

  navSearchInput.addEventListener("input", handleSearchInput);

  // Keyboard behavior
  navSearchInput.addEventListener("keydown", (e) => {
    const items = resultsDropdown.querySelectorAll(".search-item");
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % items.length;
      updateSelection(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      updateSelection(items);
    } else if (e.key === "Enter") {
      if (selectedIndex > -1 && items[selectedIndex]) {
        e.preventDefault();
        items[selectedIndex].click();
      } else {
        const query = navSearchInput.value.trim();
        if (!query) return;
        
        const mainSearch = document.getElementById("trekSearch");
        if (mainSearch && typeof filterTreks === "function") {
          mainSearch.value = query;
          filterTreks();
          resultsDropdown.classList.remove("show");
        } else {
          window.location.href = `trek.html?q=${encodeURIComponent(query)}`;
        }
      }
    } else if (e.key === "Escape") {
      resultsDropdown.classList.remove("show");
      navSearchInput.blur();
    }
  });

  function updateSelection(items) {
    items.forEach((item, idx) => {
      item.classList.toggle("selected", idx === selectedIndex);
      if (idx === selectedIndex) {
        item.scrollIntoView({ block: "nearest" });
      }
    });
  }

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (!searchContainer.contains(e.target)) {
      resultsDropdown.classList.remove("show");
    }
  });
}

// Mobile Search Handler
function handleMobileSearch(e) {
  if (e.key === "Enter") {
    const query = e.target.value.trim();
    if (query) {
      window.location.href = `trek.html?q=${encodeURIComponent(query)}`;
    }
  }
}

// ─── HERO SLIDER ───
const heroSlides = [
  {
    title: "There are moments<br>you <em>can't explain</em>",
    sub: 'Standing in the Himalayas, feeling completely alive — this is one of them. Trek for <a href="#">FREE</a> as our Ambassador.',
  },
  {
    title: "Be more than a trekker,<br>Become a <em>Trek Ambassador</em>",
    sub: 'Inspire others, build your story, and unlock opportunities to trek in the Himalayas — for <a href="#" style="color:#3b82f6;font-weight:700">FREE</a>.',
  },
  {
    title: "Adventures that<br><em>change your life</em>",
    sub: "Over 500,000 trekkers have trusted us. Join COSMIC HIMALAYA family and experience the Himalayas safely.",
  },
];
let hs = 0;

/*
function changeHeroSlide(d) {
  const slides = document.querySelectorAll(".hero-slide");
  if (!slides.length) return;

  slides.forEach((s) => s.classList.remove("active"));
  hs = (hs + d + heroSlides.length) % heroSlides.length;
  slides[hs].classList.add("active");

  const title = document.getElementById("heroTitle");
  const sub = document.getElementById("heroSubtitle");
  if (title) title.innerHTML = heroSlides[hs].title;
  if (sub) sub.innerHTML = heroSlides[hs].sub;

  buildHeroDots();
}

function buildHeroDots() {
  const el = document.getElementById("heroDots");
  if (!el) return;

  el.innerHTML = "";
  heroSlides.forEach((_, i) => {
    const d = document.createElement("button");
    d.className = "hdot" + (i === hs ? " active" : "");
    d.onclick = () => {
      hs = i - 1;
      changeHeroSlide(1);
    };
    el.appendChild(d);
  });
}
if (document.getElementById("heroDots")) {
  buildHeroDots();
  setInterval(() => changeHeroSlide(1), 6000);
}
*/

// ─── TREK CARDS SLIDER ───
function getCardWidth() {
  const slider = document.getElementById("treksSlider");
  if (!slider) return 0;
  const cards = slider.querySelectorAll(".trek-card");
  if (!cards.length) return 0;
  const card = cards[0];
  const style = window.getComputedStyle(slider);
  const gap = parseInt(style.gap) || 20;
  return card.offsetWidth + gap;
}

function slideTreks(direction) {
  const sliderWrap = document.querySelector(".treks-slider-wrap");
  if (!sliderWrap) return;
  const moveAmount = getCardWidth();
  sliderWrap.scrollBy({ left: direction * moveAmount, behavior: "smooth" });
}

// ─── UI COMPONENTS ───
function toggleFaq(btn) {
  const item = btn.parentElement;
  const isOpen = item.classList.contains("open");

  // Close all other items in the same group
  const group = item.parentElement;
  group.querySelectorAll(".faq-item").forEach((i) => {
    if (i !== item) i.classList.remove("open");
  });

  item.classList.toggle("open");
}

function switchFaqTab(id, btn) {
  document
    .querySelectorAll(".faq-tab")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".faq-group")
    .forEach((g) => g.classList.remove("active"));

  btn.classList.add("active");
  const group = document.getElementById("faq-" + id);
  if (group) group.classList.add("active");
}

function setFTab(btn) {
  document
    .querySelectorAll(".ftab")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  if (typeof filterTreks === "function") filterTreks();
}

function setTrustTab(id, btn) {
  document
    .querySelectorAll(".tr-tab")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".trust-panel")
    .forEach((p) => p.classList.remove("active"));
  btn.classList.add("active");
  const panel = document.getElementById("tp-" + id);
  if (panel) panel.classList.add("active");
}

// ─── LIGHTBOX ───
function openLB2(src) {
  const lb = document.getElementById("lb");
  const lbImg = document.getElementById("lbImg");
  if (lb && lbImg) {
    lbImg.src = getImgUrl(src);
    lb.classList.add("open");
  }
}
function closeLB() {
  const lb = document.getElementById("lb");
  if (lb) lb.classList.remove("open");
}
const lb = document.getElementById("lb");
if (lb) lb.addEventListener("click", closeLB);

// ─── TOAST ───
let tt;
function showToast(msg) {
  clearTimeout(tt);
  const toastMsg = document.getElementById("toastMsg");
  const toast = document.getElementById("toast");
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.classList.add("show");
  tt = setTimeout(() => toast.classList.remove("show"), 3500);
}

// ─── VIDEO PLAYER ───
window.playVideo = function(videoId) {
  console.log("Playing video:", videoId);
  const overlay = document.createElement("div");
  overlay.className = "video-overlay";
  
  const modalHTML = `
    <div class="video-modal">
      <button class="video-close" id="videoClose">✕</button>
      <div class="video-container">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    </div>
  `;
  
  overlay.innerHTML = modalHTML;
  document.body.appendChild(overlay);
  
  // Force reflow
  setTimeout(() => overlay.classList.add("open"), 10);
  
  const close = () => {
    overlay.classList.remove("open");
    setTimeout(() => overlay.remove(), 400);
  };
  
  overlay.querySelector("#videoClose").onclick = close;
  overlay.onclick = (e) => {
    if (e.target === overlay) close();
  };
};

// ─── REVEAL ───
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        // Find visible elements to apply sequential delay
        const delay = (document.querySelectorAll(".reveal.visible").length % 4) * 0.08;
        e.target.style.transitionDelay = delay + "s";
        e.target.classList.add("visible");
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
);

function triggerReveal() {
  document.querySelectorAll(".reveal").forEach((el) => {
    if (!el.classList.contains("visible")) {
      revealObserver.observe(el);
    }
  });
}
triggerReveal();

// ─── NAVIGATION ───
function showPage(n) {
  const page = document.getElementById("page-" + n);
  if (!page) return;

  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  page.classList.add("active");
  window.scrollTo(0, 0);
  setTimeout(triggerReveal, 80);
  closeMega();

  const ds = document.getElementById("departSticky");
  if (ds) {
    if (n !== "trek") ds.classList.remove("show");
    else ds.classList.add("show");
  }
}

function toggleMega() {
  const m = document.getElementById("megaMenu");
  const o = document.getElementById("megaOv");
  if (m) m.classList.toggle("open");
  if (o) o.classList.toggle("open");
}
function closeMega() {
  const m = document.getElementById("megaMenu");
  const o = document.getElementById("megaOv");
  if (m) m.classList.remove("open");
  if (o) o.classList.remove("open");
}

// ─── STORE ───
function filterStore(cat, btn) {
  document
    .querySelectorAll(".s-ftab")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  document.querySelectorAll("#storeGrid .prod-card").forEach((c) => {
    c.style.display = cat === "all" || c.dataset.cat === cat ? "block" : "none";
  });
}

// Cart State
let cartData = JSON.parse(localStorage.getItem("tmv_cart")) || [];

function saveCart() {
  localStorage.setItem("tmv_cart", JSON.stringify(cartData));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (badge) {
    const totalItems = cartData.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? "flex" : "none";
  }
}
updateCartBadge();

function toggleCart() {
  const sidebar = document.getElementById("cartSidebar");
  const overlay = document.getElementById("cartOverlay");
  if (!sidebar || !overlay) return;

  sidebar.classList.toggle("open");
  overlay.classList.toggle("open");

  if (sidebar.classList.contains("open")) {
    renderCart();
  }
}

function renderCart() {
  const container = document.getElementById("cartItems");
  if (!container) return;

  if (cartData.length === 0) {
    container.innerHTML =
      '<div style="text-align:center; padding: 40px 0; color: var(--muted);">Your cart is empty</div>';
    updateTotals(0);
    return;
  }

  let html = "";
  let subtotal = 0;

  cartData.forEach((item, index) => {
    subtotal += item.price * item.qty;
    html += `
      <div class="cart-item" style="display: flex; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
        <img src="${item.img}" style="width: 70px; height: 70px; object-fit: cover; border-radius: 8px;">
        <div style="flex: 1;">
          <div style="font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase;">${item.cat}</div>
          <div style="font-size: 14px; font-weight: 700; color: var(--navy); margin-bottom: 5px;">${item.name}</div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="display: flex; align-items: center; border: 1px solid #ddd; border-radius: 4px;">
              <button onclick="changeQty(${index}, -1)" style="padding: 2px 8px; border: none; background: none;">-</button>
              <span style="font-size: 13px; font-weight: 600; min-width: 20px; text-align: center;">${item.qty}</span>
              <button onclick="changeQty(${index}, 1)" style="padding: 2px 8px; border: none; background: none;">+</button>
            </div>
            <div style="font-size: 14px; font-weight: 800; color: var(--navy);">₹${(item.price * item.qty).toLocaleString("en-IN")}</div>
            <button onclick="removeCartItem(${index})" style="margin-left: auto; background: none; border: none; color: var(--red); font-size: 16px;">🗑</button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  updateTotals(subtotal);
}

function updateTotals(subtotal) {
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;
  document.getElementById("cartSubtotal").textContent =
    "₹" + subtotal.toLocaleString("en-IN");
  document.getElementById("cartGst").textContent =
    "₹" + gst.toLocaleString("en-IN");
  document.getElementById("cartTotal").textContent =
    "₹" + total.toLocaleString("en-IN");
}

function changeQty(index, delta) {
  cartData[index].qty += delta;
  if (cartData[index].qty < 1) {
    removeCartItem(index);
  } else {
    saveCart();
    renderCart();
  }
}

function removeCartItem(index) {
  cartData.splice(index, 1);
  saveCart();
  renderCart();
}

function clearCart() {
  if (cartData.length === 0) return;
  showConfirm(
    "Clear Cart?",
    "Are you sure you want to remove all items from your cart? This action cannot be undone.",
    () => {
      cartData = [];
      saveCart();
      renderCart();
      showToast("🛒 Cart cleared");
    }
  );
}

function addCart(btn) {
  const card = btn.closest(".prod-card");
  const name = card.querySelector(".p-name").textContent;
  const priceText = card.querySelector(".p-now").textContent;
  const price = parseInt(priceText.replace(/[^0-9]/g, ""));
  const img = card.querySelector(".p-img img").src;
  const cat = card.querySelector(".p-cat").textContent;

  const existing = cartData.find((item) => item.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cartData.push({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      price,
      img,
      cat,
      qty: 1,
    });
  }

  saveCart();
  showToast("🛒 Added: " + name.substring(0, 30) + "...");
}

function addRentalToCart(id, name, price) {
  const existing = cartData.find((item) => item.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cartData.push({
      id: id,
      name: name,
      price: price,
      img: "https://images.unsplash.com/photo-1526630571694-85474d284f18?w=200&q=80", // Generic rental/gear placeholder
      cat: "Rental",
      qty: 1,
    });
  }

  saveCart();
  showToast("🛒 Added Rental: " + name);
}

function checkoutCart() {
  if (cartData.length === 0) return;

  let message = "*NEW STORE ORDER* 🎒\n\n*Items:*\n";
  let subtotal = 0;

  cartData.forEach((item) => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    message += `• ${item.name} (x${item.qty}) - ₹${itemTotal.toLocaleString("en-IN")}\n`;
  });

  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  message += `\n*Subtotal:* ₹${subtotal.toLocaleString("en-IN")}`;
  message += `\n*GST (5%):* ₹${gst.toLocaleString("en-IN")}`;
  message += `\n*Total Amount:* ₹${total.toLocaleString("en-IN")}`;
  message += `\n\n_Generated via COSMIC HIMALAYA Store_`;

  const WHATSAPP_NUMBER = "919259269317";
  const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(
    message,
  )}`;

  window.open(waUrl, "_blank");
}
function toggleWish(btn) {
  btn.textContent = btn.textContent === "🤍" ? "❤️" : "🤍";
}

// ─── CAMP ENROLLMENT ───
const enrollForm = document.getElementById("enrollForm");
if (enrollForm) {
  enrollForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("regBtn");
    const thankYou = document.getElementById("thankYouMsg");
    const originalText = btn.textContent;

    btn.disabled = true;
    btn.textContent = "Registering...";

    try {
      const response = await fetch(enrollForm.action, {
        method: "POST",
        body: new FormData(enrollForm),
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        enrollForm.style.display = "none";
        thankYou.style.display = "block";
        showToast("✅ Registration successful!");
      } else {
        const data = await response.json();
        showToast(
          "⚠️ Error: " +
            (data.errors ? data.errors[0].message : "Something went wrong."),
        );
        btn.disabled = false;
        btn.textContent = originalText;
      }
    } catch (err) {
      showToast("⚠️ Network error. Please try again later.");
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

function enrollProgram(prog) {
  const sel = document.getElementById("regProgram");
  if (sel) sel.value = prog;

  const enrollSec = document.getElementById("enroll");
  if (enrollSec) {
    enrollSec.scrollIntoView({ behavior: "smooth" });
  }
}

function redirectToRental(id, name, price) {
  const url = `booking.html?type=rental&id=${id}&name=${encodeURIComponent(name)}&price=${price}`;
  window.location.href = url;
}

// ─── STORE RENDERING ───
function renderStoreProducts() {
  const grid = document.getElementById("storeGrid");
  if (!grid || typeof GEAR_PRODUCTS === "undefined") return;

  grid.innerHTML = GEAR_PRODUCTS.map(p => `
    <div class="prod-card reveal" data-cat="${p.category}">
      <div class="p-badge ${p.badgeClass || 'pb-hot'}">RENTAL</div>
      <div class="p-img">
        <img src="${p.image}" alt="${p.title}">
        <button class="wish-btn" onclick="event.stopPropagation(); toggleWish(this)">🤍</button>
      </div>
      <div class="p-body">
        <div class="p-cat">${p.category}</div>
        <div class="p-name">${p.title}</div>
        <div class="p-rating">
          <span class="p-stars">★★★★★</span>
          <span>(${p.rating})</span>
        </div>
        <div class="p-price">
          <span class="p-now">₹${p.price.toLocaleString("en-IN")} / day</span>
          ${p.oldPrice ? `<span class="p-old">₹${p.oldPrice.toLocaleString("en-IN")}</span>` : ''}
        </div>
        <button class="p-add" onclick="event.stopPropagation(); addCart(this)">Add to Cart</button>
      </div>
    </div>
  `).join('');
  
  if (typeof triggerReveal === "function") triggerReveal();
}

// Initialize Store
if (document.getElementById("storeGrid")) {
  renderStoreProducts();
}

// ========== MOBILE MENU TOGGLE ==========
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu");
  const navRight = document.querySelector(".nav-right");

  if (menuBtn && navRight) {
    menuBtn.addEventListener("click", () => {
      navRight.classList.toggle("active");
      // Change button icon: ☰ (hamburger) or ✕ (close)
      menuBtn.textContent = navRight.classList.contains("active") ? "✕" : "☰";
    });

    // Close menu when a link is clicked
    navRight.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navRight.classList.remove("active");
        menuBtn.textContent = "☰";
      });
    });
  }
});
