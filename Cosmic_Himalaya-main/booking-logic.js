// CONFIG: Set your WhatsApp number here (with country code, no + or spaces)
const WHATSAPP_NUMBER = "919259269317";

let rentalBasePrice = 0;
let bookingType = "trek";

window.onload = () => {
  // 1. Parse URL parameters
  const params = new URLSearchParams(window.location.search);
  bookingType = params.get("type") || "trek";

  if (bookingType === "rental") {
    initRentalMode(params);
  } else {
    initTrekMode(params);
  }
};

function initTrekMode(params) {
  const trekKey = params.get("trek");
  const date = params.get("date");
  const count = parseInt(params.get("count")) || 1;

  // Fetch trek data from global TREKS object (loaded via treks-data.js)
  if (typeof TREKS === "undefined") {
    console.error("TREKS data not loaded");
    return;
  }

  const t = TREKS[trekKey];
  if (!t) {
    alert("Invalid Trek Selection. Redirecting...");
    window.location.href = "trek.html";
    return;
  }

  // Render the summary
  renderTrekSummary(t, date, count);

  // Setup form submission
  setupForm({
    title: t.title,
    date: date,
    count: count,
  });
}

function initRentalMode(params) {
  const itemId = params.get("id");
  const itemName = params.get("name");
  rentalBasePrice = parseInt(params.get("price")) || 0;

  // Update UI for rental
  document.querySelector(".booking-main h2").textContent =
    "Customer Information";
  document.getElementById("rentalFields").style.display = "block";

  // Set default pickup date to today
  const today = new Date().toISOString().split("T")[0];
  const dateInput = document.getElementById("bkPickupDate");
  if (dateInput) {
    dateInput.value = today;
    dateInput.setAttribute("min", today);
  }

  // Render initial summary
  renderRentalSummary(itemName, 1);

  // Setup form submission
  setupForm({
    title: itemName,
    isRental: true,
  });
}

function updateRentalPrice() {
  const params = new URLSearchParams(window.location.search);
  const itemName = params.get("name");
  const duration = document.getElementById("bkDuration").value || 1;
  renderRentalSummary(itemName, duration);
}

function renderTrekSummary(t, date, count) {
  const subtotal = t.price * count;
  const gst = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + gst;

  const summaryHtml = `
        <div class="summary-item">
            <span class="summary-label">Selected Trek</span>
            <span class="summary-val">${t.title}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Departure Date</span>
            <span class="summary-val">${date}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">No. of Trekkers</span>
            <span class="summary-val">${count}</span>
        </div>
        <div class="td-line"></div>
        <div class="summary-item">
            <span class="summary-label">Subtotal</span>
            <span class="summary-val">₹${subtotal.toLocaleString("en-IN")}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">GST (5%)</span>
            <span class="summary-val">₹${gst.toLocaleString("en-IN")}</span>
        </div>
    `;

  const summaryEl = document.getElementById("bkSummary");
  if (summaryEl) summaryEl.innerHTML = summaryHtml;

  const totalEl = document.getElementById("bkTotalFinal");
  if (totalEl) totalEl.textContent = "₹" + total.toLocaleString("en-IN");
}

function renderRentalSummary(itemName, duration) {
  const subtotal = rentalBasePrice * duration;
  const gst = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + gst;

  const summaryHtml = `
        <div class="summary-item">
            <span class="summary-label">Item</span>
            <span class="summary-val">${itemName}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Duration</span>
            <span class="summary-val">${duration} Days</span>
        </div>
        <div class="td-line"></div>
        <div class="summary-item">
            <span class="summary-label">Subtotal</span>
            <span class="summary-val">₹${subtotal.toLocaleString("en-IN")}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">GST (5%)</span>
            <span class="summary-val">₹${gst.toLocaleString("en-IN")}</span>
        </div>
    `;

  const summaryEl = document.getElementById("bkSummary");
  if (summaryEl) summaryEl.innerHTML = summaryHtml;

  const totalEl = document.getElementById("bkTotalFinal");
  if (totalEl) totalEl.textContent = "₹" + total.toLocaleString("en-IN");
}

function setupForm(data) {
  const form = document.getElementById("bookingForm");
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();

      // 1. Collect User Data
      const name = document.getElementById("bkName").value;
      const email = document.getElementById("bkEmail").value;
      const phone = document.getElementById("bkPhone").value;
      const total = document.getElementById("bkTotalFinal").textContent;

      // 2. Construct WhatsApp Message
      let message = "";
      if (data.isRental) {
        const pickupDate = document.getElementById("bkPickupDate").value;
        const duration = document.getElementById("bkDuration").value;
        message =
          `*NEW GEAR RENTAL* 🧥\n\n` +
          `*Customer Details:* \n` +
          `• Name: ${name}\n` +
          `• Email: ${email}\n` +
          `• Phone: ${phone}\n\n` +
          `*Rental Details:* \n` +
          `• Item: ${data.title}\n` +
          `• Pickup Date: ${pickupDate}\n` +
          `• Duration: ${duration} Days\n` +
          `• Total Amount: ${total}\n\n` +
          `_Request generated via COSMIC HIMALAYA Website_`;
      } else {
        message =
          `*NEW TREK BOOKING* 🏔\n\n` +
          `*Trekker Details:* \n` +
          `• Name: ${name}\n` +
          `• Email: ${email}\n` +
          `• Phone: ${phone}\n\n` +
          `*Booking Details:* \n` +
          `• Trek: ${data.title}\n` +
          `• Date: ${data.date}\n` +
          `• Count: ${data.count}\n` +
          `• Total Amount: ${total}\n\n` +
          `_Request generated via COSMIC HIMALAYA Website_`;
      }

      // 3. UI Feedback
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = "REDIRECTING TO WHATSAPP...";

      if (typeof showToast === "function") {
        showToast(`🚀 Opening WhatsApp for ${name}...`);
      }

      // 4. Redirect to WhatsApp
      const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;

      setTimeout(() => {
        window.open(waUrl, "_blank");
        // Reset button and redirect home
        btn.textContent = "BOOKING SENT ✅";
        setTimeout(() => (window.location.href = "index.html"), 1000);
      }, 1500);
    };
  }
}
