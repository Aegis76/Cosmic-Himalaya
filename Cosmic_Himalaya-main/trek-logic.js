// ─── TREK UTILS ───

// Splits a "carry"/"highlight" string into an icon + text pair.
function splitIconText(str, fallbackIcon = "•") {
  const parts = str.trim().split(" ");
  const first = parts[0];
  const isEmoji = /\p{Extended_Pictographic}/u.test(first);
  return isEmoji
    ? { icon: first, text: parts.slice(1).join(" ") }
    : { icon: fallbackIcon, text: str };
}

// ─── DEBOUNCE ───
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ─── TOAST ───
function showToast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  const msgEl = document.getElementById("toastMsg");
  if (msgEl) msgEl.textContent = msg;
  el.classList.add("open");
  clearTimeout(el._hide);
  el._hide = setTimeout(() => el.classList.remove("open"), 3000);
}

// ─── LIGHTBOX ───
function openLB2(src) {
  const lb = document.getElementById("lb");
  const img = document.getElementById("lbImg");
  if (!lb || !img) return;
  img.src = src;
  lb.classList.add("open");
}

// ─── VIDEO PLAYER ───
function playVideo(id) {
  // If it's a YouTube ID, open in a lightbox or show toast
  showToast("▶ Playing video... (Youtube ID: " + id + ")");
}

// ─── FAQ TOGGLE ───
function toggleFaq(btn) {
  const item = btn.closest(".faq-item");
  if (item) item.classList.toggle("open");
}

// ─── BUILD ALTITUDE SVG ───
function buildAltitudeSVG(itin) {
  const W = 900,
    H = 230,
    padL = 44,
    padR = 20,
    padT = 22,
    padB = 34;
  const alts = itin.map(d => d.alt);
  const maxA = Math.max(...alts),
    minA = Math.min(...alts);
  const niceMax = Math.ceil(maxA / 1000) * 1000;
  const niceMin = Math.floor(minA / 1000) * 1000;
  const plotW = W - padL - padR,
    plotH = H - padT - padB;
  const x = i => padL + (plotW * i) / (itin.length - 1);
  const y = a => padT + plotH * (1 - (a - niceMin) / (niceMax - niceMin));

  let grid = "";
  for (let a = niceMin; a <= niceMax; a += 1000) {
    grid += `<line class="alt-grid-line" x1="${padL}" y1="${y(a).toFixed(1)}" x2="${W - padR}" y2="${y(a).toFixed(1)}"/>`;
    grid += `<text class="alt-grid-label" x="6" y="${(y(a) + 3).toFixed(1)}">${(a / 1000).toFixed(0)}k</text>`;
  }

  const linePts = itin.map((d, i) => `${x(i).toFixed(1)},${y(d.alt).toFixed(1)}`).join(" ");
  const areaPts = `${padL},${(H - padB).toFixed(1)} ${linePts} ${(W - padR).toFixed(1)},${(H - padB).toFixed(1)}`;

  const peakIdx = alts.indexOf(maxA);
  let dots = "",
    labels = "";
  itin.forEach((d, i) => {
    const isPeak = i === peakIdx;
    dots += `<circle class="alt-dot${isPeak ? " peak" : ""}" data-day="${d.day}" cx="${x(i).toFixed(1)}" cy="${y(d.alt).toFixed(1)}" r="${isPeak ? 6 : 4.5}">
      <title>Day ${d.day} · ${d.title} · sleep ${d.alt.toLocaleString("en-IN")} m</title></circle>`;
    if (i % 2 === 0 || isPeak) {
      labels += `<text class="alt-daylabel" x="${x(i).toFixed(1)}" y="${H - 12}">D${d.day}</text>`;
    }
  });

  return `<svg class="alt-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Altitude profile of the trek by day">
    <defs><linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e3cd94" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#e3cd94" stop-opacity="0.02"/>
    </linearGradient></defs>
    ${grid}
    <polygon class="alt-area" points="${areaPts}"/>
    <polyline class="alt-line" points="${linePts}"/>
    ${dots}${labels}
  </svg>`;
}

// ─── RENDER ALL TREKS ───
function renderAllTreks(gridId = "allTreksGrid") {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = "";
  Object.keys(TREKS).forEach((key) => {
    const t = TREKS[key];
    const card = document.createElement("div");
    card.className = "trek-card reveal";
    card.setAttribute("onclick", `window.location.href='view-trek.html?trek=${key}'`);
    const searchableText = (t.title + " " + t.region + " " + t.diff + " " + t.dur + " " + t.season).toLowerCase();
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

// ─── GLOBAL FILTER ───
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

// ─── ITINERARY BUILDER ───
function buildItinerary(t) {
  const itin = t.itinerary;
  const quickHtml = itin.map(d => `
    <div class="itin-quick-item">
      <div class="iq-day">Day ${d.day}</div>
      <div class="iq-heading">${d.title}</div>
      <div class="iq-stats">
        <span class="iq-alt">⛰ ${d.sub}</span>
        ${d.time ? `<span class="iq-time">⏱ ${d.time}</span>` : ''}
        ${d.rest ? '<span class="iq-rest">REST DAY</span>' : ''}
      </div>
    </div>
  `).join('');

  const detailedHtml = itin.map(d => `
    <div class="itin-detailed-item">
      <div class="id-head">
        <span class="id-day">Day ${d.day}</span>
        <span class="id-title">${d.title}</span>
      </div>
      <div class="id-body">
        <div class="id-stats">
          <span>⛰ ${d.sub}</span>
          ${d.time ? `<span>⏱ ${d.time}</span>` : ''}
          ${d.rest ? '<span class="id-rest">REST DAY</span>' : ''}
        </div>
        <ul class="id-points">${d.points.map(p => `<li>${p}</li>`).join('')}</ul>
      </div>
    </div>
  `).join('');

  const graphHtml = `
    <div class="altitude-card" style="margin-top:0;">
      ${buildAltitudeSVG(itin)}
    </div>
  `;

  return `
    <div class="itinerary-tabs">
      <div class="itinerary-tab-buttons">
        <button class="itab active" data-view="quick">Quick</button>
        <button class="itab" data-view="detailed">Detailed</button>
        <button class="itab" data-view="graph">Trek Graph</button>
      </div>
      <div class="itinerary-panels">
        <div class="itinerary-panel active" id="itinerary-quick">${quickHtml}</div>
        <div class="itinerary-panel" id="itinerary-detailed">${detailedHtml}</div>
        <div class="itinerary-panel" id="itinerary-graph">${graphHtml}</div>
      </div>
    </div>
  `;
}

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

  document.title = t.title + " | COSMIC HIMALAYA";
  currentPrice = t.price || 8500;
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
  const hl = t.highlights.map(x => {
    const { icon, text } = splitIconText(x);
    return `<div class="tdh-item"><span class="tdh-ico">${icon}</span><div class="tdh-txt">${text}</div></div>`;
  }).join("");
  setEl("tdHighlights", hl, true);
  setEl("tdHighlights2", hl, true);

  // info strip
  const infoStripHtml = `
    <div class="td-qi"><span class="qi-ico">⏱</span><div><div class="qi-label">Duration</div><div class="qi-val">${t.dur}</div></div></div>
    <div class="td-qi"><span class="qi-ico">🏔</span><div><div class="qi-label">Max Altitude</div><div class="qi-val">${t.alt}</div></div></div>
    <div class="td-qi"><span class="qi-ico">🥾</span><div><div class="qi-label">Difficulty</div><div class="qi-val">${t.diff}</div></div></div>
    <div class="td-qi"><span class="qi-ico">📍</span><div><div class="qi-label">Start / End</div><div class="qi-val">${t.startEnd}</div></div></div>
    <div class="td-qi"><span class="qi-ico">🌤</span><div><div class="qi-label">Best Season</div><div class="qi-val">${t.season}</div></div></div>
  `;
  setEl("tdInfoStrip", infoStripHtml, true);

  // itinerary
  const itinHtml = buildItinerary(t);
  setEl("tdItinerary", itinHtml, true);

  // itinerary tab switching
  const itabContainer = document.querySelector('.itinerary-tab-buttons');
  if (itabContainer) {
    itabContainer.addEventListener('click', function(e) {
      const btn = e.target.closest('.itab');
      if (!btn) return;
      this.querySelectorAll('.itab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      document.querySelectorAll('.itinerary-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('itinerary-' + view);
      if (panel) panel.classList.add('active');
    });
  }

  // inc/exc
  const incExcHtml = `
    <div class="ie-box ie-inc"><h4>✅ Included</h4><ul class="ie-list">${t.includes.map(i => `<li><span>✅</span>${i}</li>`).join("")}</ul></div>
    <div class="ie-box ie-exc"><h4>❌ Not Included</h4><ul class="ie-list">${t.excludes.map(e => `<li><span>❌</span>${e}</li>`).join("")}</ul></div>
  `;
  setEl("tdIncExc", incExcHtml, true);

  const carryHtml = t.carry.map(c => {
    const { icon, text } = splitIconText(c, "🎒");
    return `<div class="tdh-item"><span class="tdh-ico">${icon}</span><div class="tdh-txt">${text}</div></div>`;
  }).join("");
  setEl("tdCarry", carryHtml, true);
  setEl("tdCarry2", carryHtml, true);

  // photos
  const photosHtml = t.photos.map(p =>
    `<div class="photo-item" onclick="openLB2('${p}')"><img src="${getImgUrl(p)}" alt="Photo"></div>`
  ).join("");
  setEl("tdPhotos", photosHtml, true);

  // videos & testimonials
  const vids = t.videos || [t.img];
  const vidHtml = vids.map((vidId, i) =>
    `<div class="vt-card" onclick="playVideo('${vidId}')"><img src="${getImgUrl(t.photos[i % t.photos.length])}" alt="V"><div class="vt-overlay"></div><div class="yt-play">▶</div><div class="vt-info"><div class="vt-badge">TREK VIDEO</div><div class="vt-name-big">${t.title}</div></div></div>`
  ).join("");
  setEl("tdVidGrid", vidHtml, true);

  const testiHtml = t.photos.slice(0, 3).map((p, i) =>
    `<div class="vt-card" onclick="showToast('▶ Playing testimonial...')"><img src="${getImgUrl(p)}" alt="T"><div class="vt-overlay"></div><div class="yt-play">▶</div><div class="vt-info"><div class="vt-badge">TREKKER TESTIMONIALS</div><div class="vt-name-big">${t.title}</div><div class="vt-name-tag">${["AARYA", "SHUBHAM", "DILRUBA"][i]}</div></div></div>`
  ).join("");
  setEl("tdTestiGrid", testiHtml, true);

  // reviews
  const reviewsHtml = t.reviews.map(r =>
    `<div class="rev-item"><div class="ri-top"><div class="ri-user"><div class="ri-av">${r.e}</div><div><div class="ri-name">${r.name}</div><div class="ri-loc">${r.loc} · ${r.date}</div></div></div><div class="ri-stars">${"★".repeat(r.r)}</div></div><p class="ri-text">${r.text}</p></div>`
  ).join("");
  setEl("tdRevList", reviewsHtml, true);

  // ─── ARTICLES (UPDATED – supports blog url) ───
  const articles = t.articles || [
    { title: "Complete Guide to " + t.title, date: "11 Apr 2026", img: t.photos[0] },
    { title: "What to Pack for " + t.title, date: "15 Apr 2026", img: t.photos[1 % t.photos.length] },
    { title: "Best Time to Visit " + t.title, date: "20 Apr 2026", img: t.photos[2 % t.photos.length] }
  ];

  const articlesHtml = articles.map(a => {
    const inner = `
      <div class="ac-img"><img src="${getImgUrl(a.img)}" alt="Article"></div>
      <div class="ac-body">
        <div class="ac-date">${a.date}</div>
        <div class="ac-title">${a.title}</div>
        <div class="ac-line"></div>
      </div>
    `;

    if (a.url) {
      // Blog / external link
      return `<a href="${a.url}" target="_blank" rel="noopener noreferrer" class="article-card article-card-link" style="text-decoration:none; color:inherit; display:block;">
        ${inner}
      </a>`;
    } else {
      // Regular article card (no link)
      return `<div class="article-card">${inner}</div>`;
    }
  }).join("");

  setEl("tdArticles", articlesHtml, true);

  // faqs
  const faqsHtml = t.faqs.map(f =>
    `<div class="faq-item"><button class="faq-q" onclick="toggleFaq(this)">${f.q} <span class="arr">▾</span></button><div class="faq-a">${f.a}</div></div>`
  ).join("");
  setEl("tdFaqs", faqsHtml, true);

  // booking dates
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const upcomingDates = t.dates.filter(d => new Date(d) >= now);
  const datesHtml = upcomingDates.length > 0
    ? upcomingDates.map(d => `<option>${d}</option>`).join("")
    : `<option disabled selected>No upcoming dates available</option>`;
  setEl("tdDates", datesHtml, true);

  const bookBtn = document.querySelector(".td-book-btn");
  if (bookBtn) {
    if (upcomingDates.length === 0) {
      bookBtn.disabled = true;
      bookBtn.style.opacity = "0.5";
      bookBtn.style.cursor = "not-allowed";
      bookBtn.textContent = "NOT AVAILABLE";
    } else {
      bookBtn.disabled = false;
      bookBtn.style.opacity = "1";
      bookBtn.style.cursor = "pointer";
      bookBtn.textContent = "BOOK NOW";
    }
  }

  setEl("tdPriceOld", t.priceOld || "₹" + (t.price * 1.2).toLocaleString());
  updateTotal();

  // reset tabs
  document.querySelectorAll(".td-t").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".td-panel").forEach(p => p.classList.remove("active"));
  const firstTab = document.querySelector(".td-t");
  if (firstTab) firstTab.classList.add("active");
  const overviewPanel = document.getElementById("panel-overview");
  if (overviewPanel) overviewPanel.classList.add("active");

  // Show page (if showPage exists, otherwise just scroll)
  if (typeof showPage === "function") showPage("trek");
  else window.scrollTo(0, 0);
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
  const display = document.getElementById("tdTotalDisplay");
  if (display) {
    display.textContent = el ? el.textContent : "₹" + (currentPrice * currentCount).toLocaleString("en-IN");
  }
}

function switchTdTab(id, btn) {
  document.querySelectorAll(".td-t").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".td-panel").forEach(p => p.classList.remove("active"));
  btn.classList.add("active");
  const panel = document.getElementById("panel-" + id);
  if (panel) panel.classList.add("active");
  const container = btn.parentElement;
  if (container && container.classList.contains('td-tabs')) {
    const scrollLeft = btn.offsetLeft - (container.offsetWidth / 2) + (btn.offsetWidth / 2);
    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }
}

function redirectToBooking() {
  const urlParams = new URLSearchParams(window.location.search);
  const trekKey = urlParams.get("trek");
  const selectedDate = document.getElementById("tdDates")?.value || "";
  const trekkerCount = document.getElementById("tdCount")?.textContent || "1";
  if (!trekKey) {
    if (typeof showToast === 'function') showToast("❌ Error: Trek not found");
    else alert("❌ Error: Trek not found");
    return;
  }
  const bookingUrl = `booking.html?type=trek&trek=${trekKey}&date=${encodeURIComponent(selectedDate)}&count=${trekkerCount}`;
  window.location.href = bookingUrl;
}
