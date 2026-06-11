// ─── TREK UTILS ───

// Render all treks in a grid (used in trek.html)
function renderAllTreks(gridId = "allTreksGrid") {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  grid.innerHTML = "";

  Object.keys(TREKS).forEach((key) => {
    const t = TREKS[key];
    const card = document.createElement("div");
    card.className = "trek-card reveal";
    card.setAttribute(
      "onclick",
      `window.location.href='view-trek.html?trek=${key}'`,
    );

    // Store full searchable text in data attribute
    const searchableText = (
      t.title +
      " " +
      t.region +
      " " +
      t.diff +
      " " +
      t.dur +
      " " +
      t.season
    ).toLowerCase();
    card.setAttribute("data-search", searchableText);

    card.innerHTML = `
      <div class="tk-img">
        <img src="${getImgUrl(t.img)}" alt="${t.title}">
        <div class="tk-loc">📍 ${t.region.split(",")[0]}</div>
      </div>
      <div class="tk-body">
        <div class="tk-title">${t.title}</div>
        <div class="tk-meta">
          <span>DURATION: <strong>${t.dur.toUpperCase()}</strong></span>
          <span>GRADE: <strong>${t.diff.toUpperCase()}</strong></span>
        </div>
        <button class="tk-btn">View Trek Details</button>
      </div>
    `;
    grid.appendChild(card);
  });

  if (typeof triggerReveal === "function") triggerReveal();
}

// Global filter function for trek listing
window.filterTreks = debounce(function () {
  const searchInput = document.getElementById("trekSearch");
  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
  
  const activeTabEl = document.querySelector(".ftab.active");
  const activeTab = activeTabEl ? activeTabEl.textContent.toLowerCase().trim() : "all treks";
  
  const cards = document.querySelectorAll(".trek-card");

  cards.forEach((card) => {
    const text = card.getAttribute("data-search");
    if (!text) return;

    const matchesSearch = !query || text.includes(query);
    let matchesTab = true;
    if (activeTab !== "all treks") {
      matchesTab = text.includes(activeTab);
    }

    card.style.display = matchesSearch && matchesTab ? "block" : "none";
  });
}, 250);

// ─── TREK DETAILS LOGIC ───
let currentCount = 1,
  currentPrice = 0;

function openTrek(key) {
  const t = TREKS[key];
  if (!t) return;

  const pageTrek = document.getElementById("page-trek");
  if (!pageTrek) {
    window.location.href = "view-trek.html?trek=" + key;
    return;
  }

  // Update Document Title
  document.title = t.title + " | COSMIC HIMALAYA";

  currentPrice = t.price;
  currentCount = 1;

  const setEl = (id, val, isHtml = false) => {
    const el = document.getElementById(id);
    if (el) {
      if (isHtml) el.innerHTML = val;
      else el.textContent = val;
    }
  };

  const heroImg = document.getElementById("tdHeroImg");
  if (heroImg) heroImg.src = getImgUrl(t.img);

  setEl("tdTitle", t.title);
  setEl("tdBreadName", t.title);
  setEl("tdAbout", t.about);
  setEl("tdAbout2", t.about);
  setEl("tdBestTime", t.bestTime);

  // highlights
  const hl = t.highlights
    .map(
      (x) =>
        `<div class="tdh-item"><span class="tdh-ico">${x.split(" ")[0]}</span><div class="tdh-txt">${x.split(" ").slice(1).join(" ")}</div></div>`,
    )
    .join("");
  setEl("tdHighlights", hl, true);
  setEl("tdHighlights2", hl, true);

  // info strip
  const infoStripHtml = `<div class="td-qi"><span class="qi-ico">⏱</span><div><div class="qi-label">Duration</div><div class="qi-val">${t.dur}</div></div></div><div class="td-qi"><span class="qi-ico">🏔</span><div><div class="qi-label">Max Altitude</div><div class="qi-val">${t.alt}</div></div></div><div class="td-qi"><span class="qi-ico">🥾</span><div><div class="qi-label">Difficulty</div><div class="qi-val">${t.diff}</div></div></div><div class="td-qi"><span class="qi-ico">📍</span><div><div class="qi-label">Start / End</div><div class="qi-val">${t.startEnd}</div></div></div><div class="td-qi"><span class="qi-ico">🌤</span><div><div class="qi-label">Best Season</div><div class="qi-val">${t.season}</div></div></div>`;
  setEl("tdInfoStrip", infoStripHtml, true);

  // itinerary
  const itinHtml = t.itinerary
    .map(
      (d) =>
        `<div class="itin-day"><div class="itin-head"><div class="itin-num">D${d.day}</div><div><div class="itin-title">${d.title}</div><div class="itin-sub">${d.sub}</div></div></div><div class="itin-body"><ul>${d.points.map((p) => `<li>${p}</li>`).join("")}</ul></div></div>`,
    )
    .join("");
  setEl("tdItinerary", itinHtml, true);

  // inc/exc
  const incExcHtml = `<div class="ie-box ie-inc"><h4>✅ Included</h4><ul class="ie-list">${t.includes.map((i) => `<li><span>✅</span>${i}</li>`).join("")}</ul></div><div class="ie-box ie-exc"><h4>❌ Not Included</h4><ul class="ie-list">${t.excludes.map((e) => `<li><span>❌</span>${e}</li>`).join("")}</ul></div>`;
  setEl("tdIncExc", incExcHtml, true);

  const carryHtml = t.carry
    .map(
      (c) =>
        `<div class="tdh-item"><span class="tdh-ico">${c.split(" ")[0]}</span><div class="tdh-txt">${c.split(" ").slice(1).join(" ")}</div></div>`,
    )
    .join("");
  setEl("tdCarry", carryHtml, true);
  setEl("tdCarry2", carryHtml, true);

  // photos
  const photosHtml = t.photos
    .map(
      (p) =>
        `<div class="photo-item" onclick="openLB2('${p}')"><img src="${getImgUrl(p)}" alt="Photo"></div>`,
    )
    .join("");
  setEl("tdPhotos", photosHtml, true);

  // videos & testimonials
  const vids = t.videos || [t.img];
  const vidHtml = vids
    .map(
      (vidId, i) =>
        `<div class="vt-card" onclick="playVideo('${vidId}')"><img src="${getImgUrl(t.photos[i % t.photos.length])}" alt="V"><div class="vt-overlay"></div><div class="yt-play">▶</div><div class="vt-info"><div class="vt-badge">TREK VIDEO</div><div class="vt-name-big">${t.title}</div></div></div>`,
    )
    .join("");
  setEl("tdVidGrid", vidHtml, true);

  const testiHtml = t.photos
    .slice(0, 3)
    .map(
      (p, i) =>
        `<div class="vt-card" onclick="showToast('▶ Playing testimonial...')"><img src="${getImgUrl(p)}" alt="T"><div class="vt-overlay"></div><div class="yt-play">▶</div><div class="vt-info"><div class="vt-badge">TREKKER TESTIMONIALS</div><div class="vt-name-big">${t.title}</div><div class="vt-name-tag">${["AARYA", "SHUBHAM", "DILRUBA"][i]}</div></div></div>`,
    )
    .join("");
  setEl("tdTestiGrid", testiHtml, true);

  // reviews
  const reviewsHtml = t.reviews
    .map(
      (r) =>
        `<div class="rev-item"><div class="ri-top"><div class="ri-user"><div class="ri-av">${r.e}</div><div><div class="ri-name">${r.name}</div><div class="ri-loc">${r.loc} · ${r.date}</div></div></div><div class="ri-stars">${"★".repeat(r.r)}</div></div><p class="ri-text">${r.text}</p></div>`,
    )
    .join("");
  setEl("tdRevList", reviewsHtml, true);

  // articles
  const articles = t.articles || [
    { title: "Complete Guide to " + t.title, date: "11 Apr 2026", img: t.photos[0] },
    { title: "What to Pack for " + t.title, date: "15 Apr 2026", img: t.photos[1 % t.photos.length] },
    { title: "Best Time to Visit " + t.title, date: "20 Apr 2026", img: t.photos[2 % t.photos.length] }
  ];
  const articlesHtml = articles
    .map(
      (a) =>
        `<div class="article-card"><div class="ac-img"><img src="${getImgUrl(a.img)}" alt="Article"></div><div class="ac-body"><div class="ac-date">${a.date}</div><div class="ac-title">${a.title}</div><div class="ac-line"></div></div></div>`,
    )
    .join("");
  setEl("tdArticles", articlesHtml, true);

  // faqs
  const faqsHtml = t.faqs
    .map(
      (f) =>
        `<div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)">${f.q} <span class="arr">▾</span></button><div class="faq-a">${f.a}</div></div>`,
    )
    .join("");
  setEl("tdFaqs", faqsHtml, true);

  // booking
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const upcomingDates = t.dates.filter((d) => {
    const dateObj = new Date(d);
    return dateObj >= now;
  });

  const datesHtml =
    upcomingDates.length > 0
      ? upcomingDates.map((d) => `<option>${d}</option>`).join("")
      : `<option disabled selected>No upcoming dates available</option>`;
  setEl("tdDates", datesHtml, true);

  if (upcomingDates.length === 0) {
    const bookBtn = document.querySelector(".td-book-btn");
    if (bookBtn) {
      bookBtn.disabled = true;
      bookBtn.style.opacity = "0.5";
      bookBtn.style.cursor = "not-allowed";
      bookBtn.textContent = "NOT AVAILABLE";
    }
  } else {
    const bookBtn = document.querySelector(".td-book-btn");
    if (bookBtn) {
      bookBtn.disabled = false;
      bookBtn.style.opacity = "1";
      bookBtn.style.cursor = "pointer";
      bookBtn.textContent = "BOOK NOW";
    }
  }

  setEl("tdPriceOld", t.priceOld);
  updateTotal();

  // reset tabs
  document
    .querySelectorAll(".td-t")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".td-panel")
    .forEach((p) => p.classList.remove("active"));

  const firstTab = document.querySelector(".td-t");
  if (firstTab) firstTab.classList.add("active");
  const overviewPanel = document.getElementById("panel-overview");
  if (overviewPanel) overviewPanel.classList.add("active");

  showPage("trek");
}

function changeCount(d) {
  currentCount = Math.max(1, Math.min(20, currentCount + d));
  const el = document.getElementById("tdCount");
  if (el) el.textContent = currentCount;
  updateTotal();
}

function updateTotal() {
  const el = document.getElementById("tdTotal");
  if (el) {
    el.textContent = "₹" + (currentPrice * currentCount).toLocaleString("en-IN");
  }
}

function switchTdTab(id, btn) {
  document
    .querySelectorAll(".td-t")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".td-panel")
    .forEach((p) => p.classList.remove("active"));
  btn.classList.add("active");
  const panel = document.getElementById("panel-" + id);
  if (panel) panel.classList.add("active");

  // Improved scroll logic: only scroll the tab container horizontally
  const container = btn.parentElement;
  if (container && container.classList.contains('td-tabs')) {
    const scrollLeft = btn.offsetLeft - (container.offsetWidth / 2) + (btn.offsetWidth / 2);
    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
  }
}

function redirectToBooking() {
  const urlParams = new URLSearchParams(window.location.search);
  const trekKey = urlParams.get("trek");
  
  const selectedDate = document.getElementById("tdDates").value;
  const trekkerCount = document.getElementById("tdCount").textContent;
  
  if (!trekKey) {
    if (typeof showToast === 'function') showToast("❌ Error: Trek not found");
    else alert("❌ Error: Trek not found");
    return;
  }
  
  const bookingUrl = `booking.html?type=trek&trek=${trekKey}&date=${encodeURIComponent(selectedDate)}&count=${trekkerCount}`;
  window.location.href = bookingUrl;
}
