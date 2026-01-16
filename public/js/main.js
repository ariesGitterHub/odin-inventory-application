document.querySelectorAll(".toggle-additional-data").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".card");
    const additionalData = card.querySelector(".additional-data");

    const isOpen = !additionalData.classList.toggle("hidden");

    card.classList.toggle("expanded", isOpen);
    btn.setAttribute("aria-expanded", isOpen);

    card.querySelector(".file-tab-text").textContent = isOpen
      ? "full view:"
      : "quick view:";
  });
});

// TOGGLE ALL ADDITIONAL DATA
// Existing individual toggle (for reference)
// document.querySelectorAll(".toggle-additional-data").forEach((btn) => { ... });

// New: toggle all additional-data
const toggleAllBtn = document.querySelector(".toggle-all-additional-data");

if (toggleAllBtn) {
  toggleAllBtn.addEventListener("click", () => {
    // Get all cards with additional-data
    const cards = document.querySelectorAll(".card");

    // Determine if we should open or close all based on first card's state
    // If the first card is hidden, we want to open all; otherwise, close all
    const firstCard = cards[0];
    const firstAdditionalData = firstCard.querySelector(".additional-data");
    const shouldOpenAll = firstAdditionalData.classList.contains("hidden");

    cards.forEach((card) => {
      const additionalData = card.querySelector(".additional-data");

      // Toggle hidden class based on shouldOpenAll
      if (shouldOpenAll) {
        additionalData.classList.remove("hidden");
      } else {
        additionalData.classList.add("hidden");
      }

      // Update card expanded state and button aria
      card.classList.toggle("expanded", shouldOpenAll);
      const toggleBtn = card.querySelector(".toggle-additional-data");
      if (toggleBtn) toggleBtn.setAttribute("aria-expanded", shouldOpenAll);

      // Update file-tab-text if exists
      const fileTabText = card.querySelector(".file-tab-text");
      if (fileTabText) {
        fileTabText.textContent = shouldOpenAll ? "full view:" : "quick view:";
      }
    });
  });
}


document.querySelectorAll(".size-unit-count").forEach((el) => {
  const unitCountMessage = el.querySelector(".unit-message");
  const unitCount = parseInt(el.textContent.trim(), 10);

  unitCountMessage.className = "unit-message"; // reset state

  if (unitCount === 0) {
    unitCountMessage.classList.add("status-review");
    unitCountMessage.textContent = "Review";
  } else if (unitCount > 0 && unitCount < 100) {
    unitCountMessage.classList.add("status-reorder");
    unitCountMessage.textContent = "Reorder";
  } else if (unitCount >= 100 && unitCount <= 150) {
    unitCountMessage.classList.add("status-low");
    unitCountMessage.textContent = "Low Stock";
  } else if (unitCount > 350) {
    unitCountMessage.classList.add("status-overstock");
    unitCountMessage.textContent = "Overstock";
  } else {
    unitCountMessage.textContent = "";
  }
});

document.querySelectorAll(".inventory-reorder").forEach((el) => {
  const message = el.querySelector(".unit-message");
  const reorderButton = el.querySelector(".reorder-button");

  reorderButton.className = "reorder-button"; // reset

  if (message.classList.contains("status-review")) {
    reorderButton.classList.add("action-initial");
    reorderButton.textContent = "Initial Order";
  } else if (message.classList.contains("status-reorder")) {
    reorderButton.classList.add("action-now");
    reorderButton.textContent = "Reorder Now";
  } else if (message.classList.contains("status-low")) {
    reorderButton.classList.add("action-soon");
    reorderButton.textContent = "Reorder Soon";
  } else {
    reorderButton.textContent = "Reorder";
  }
});

document.querySelectorAll(".toggle-inventory").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault(); // prevents form submit on button click
    const hiddenInventory = btn.nextElementSibling;
    if (!hiddenInventory) return;
    hiddenInventory.classList.toggle("hidden");
    const isOpen = !hiddenInventory.classList.contains("hidden");
    btn.style.backgroundColor = isOpen ? "var(--gold-lt)" : "var(--frog-white)";
  });
});

const searchContainer = document.querySelector(".search-container");

document.querySelectorAll(".toggle-search-container").forEach((btn) => {
  btn.addEventListener("click", () => {
    searchContainer.classList.toggle("hidden");
  });
});

const filterContainer = document.querySelector(".filter-container");

document.querySelectorAll(".toggle-filter-container").forEach((btn) => {
  btn.addEventListener("click", () => {
    filterContainer.classList.toggle("hidden");
  });
});

// =======================
// ADMIN MODAL CONTROLLER
// =======================

const adminModal = document.getElementById("adminModal");
let pendingForm = null;

if (adminModal) {
  const closeButton = adminModal.querySelector(".close-button");
  const adminForm = adminModal.querySelector("#adminLoginForm");
  const adminError = adminModal.querySelector("#adminError");

  window.openAdminModal = function () {
    adminModal.classList.remove("hidden");
  };

  function closeAdminModal() {
    adminModal.classList.add("hidden");
    if (adminError) adminError.textContent = "";
    adminForm.reset();
  }

  closeButton.addEventListener("click", closeAdminModal);

  window.addEventListener("click", (e) => {
    if (e.target === adminModal) {
      closeAdminModal();
    }
  });

  // Handle admin password submit
  adminForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = adminForm.querySelector("input[name='password']").value;

    const res = await fetch("/auth/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (res.ok) {
      closeAdminModal();
      if (pendingForm) pendingForm.submit();
    } else {
      adminError.textContent = "Incorrect admin password";
    }
  });
}


document.querySelectorAll(".delete-form-action").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    pendingForm = form;
    openAdminModal();
  });
});

