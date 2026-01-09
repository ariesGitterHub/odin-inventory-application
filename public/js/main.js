// Place button functionality and any other JS here

// document.querySelectorAll("toggle-additional-data ").addEventListener("click", () => {
//   document.querySelectorAll(".additional-data").forEach((el) => {
//     el.classList.toggle("hidden");
//   });
// });

// document.querySelectorAll(".toggle-additional-data ").forEach((btn) => {
//   btn.addEventListener("click", () => {
//     const card = btn.closest(".quick-view-details-col");
//     const additionalData = card.querySelector(".additional-data");
//     additionalData.classList.toggle("hidden");
//   });
// });

document.querySelectorAll(".toggle-additional-data ").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".card");
    const additionalData = card.querySelector(".additional-data");
    additionalData.classList.toggle("hidden");
    // const fileTab = card.querySelector(".file-tab");
        if (!additionalData.classList.contains("hidden")) {
      card.querySelector(".toggle-additional-data ").style.backgroundColor = "var(--frog-dk)";
      card.querySelector(".toggle-additional-data ").style.color = "var(--gold)";
      card.querySelector(".col-row-adjustable").style.borderTopLeftRadius = "0.5rem";
      card.style.backgroundColor = "var(--rose-dk)";
      card.querySelector(".file-tab-text").innerHTML = "full view:&nbsp;";
    } else {
      card.querySelector(".toggle-additional-data ").style.backgroundColor = "var(--frog-white)";
      card.querySelector(".toggle-additional-data ").style.color =
        "var(--frog-black)";
              card.querySelector(
                ".col-row-adjustable"
              ).style.borderTopLeftRadius = "0rem";
      card.style.backgroundColor = "var(--frog-lt)";
      card.querySelector(".file-tab-text").innerHTML = "quick view:&nbsp;";
    }
  });
});

// document.querySelectorAll(".sizeUnitCount").forEach((el) => {
//   const unitCountMessage = el.querySelector(".quick-view-unit-message");
//   if (el.innerHTML > 100) {
//     unitCountMessage.innerHTML = "REORDER!!!"
//   }
// })

document.querySelectorAll(".size-unit-count").forEach((el) => {
  const unitCountMessage = el.querySelector(".unit-message");
  // Extract the numeric value from the .sizeUnitCount element's text content
  const unitCount = parseInt(el.textContent.trim(), 10); // Convert the string to a number
  if (unitCount === 0) {
    unitCountMessage.style.color = "var(--gold)";
    unitCountMessage.style.backgroundColor = "var(--frog-black)";
    unitCountMessage.style.borderRadius = "1rem";
    unitCountMessage.innerHTML = "&nbsp;&nbsp;Review&nbsp;&nbsp;";
  } else if (unitCount > 0 && unitCount < 100) {
    unitCountMessage.style.color = "var(--gold)";
    unitCountMessage.style.backgroundColor = "var(--red-dk)";
    unitCountMessage.style.borderRadius = "1rem";
    unitCountMessage.innerHTML = "&nbsp;&nbsp;Reorder&nbsp;&nbsp;";
  } else if (unitCount >= 100 && unitCount <= 150) {
    unitCountMessage.style.color = "var(--frog-black)";
    unitCountMessage.style.backgroundColor = "var(--orange-dk)";
    unitCountMessage.style.borderRadius = "1rem";
    unitCountMessage.innerHTML = "&nbsp;&nbsp;Low Stock&nbsp;&nbsp;";
  } else if (unitCount > 350) {
    unitCountMessage.style.color = "var(--white)";
    unitCountMessage.style.backgroundColor = "var(--blue-dk)";
    unitCountMessage.style.borderRadius = "1rem";
    unitCountMessage.innerHTML = "&nbsp;&nbsp;Overstock&nbsp;&nbsp;";
  } else {
    unitCountMessage.innerHTML = ""; // Optionally clear the message if above does not apply
  }
});

document.querySelectorAll(".inventory-reorder").forEach((el) => {
const message = el.querySelector(".unit-message");
const reorderButton = el.querySelector(".reorder-button");

if (message.innerHTML === "&nbsp;&nbsp;Review&nbsp;&nbsp;") {
  reorderButton.innerHTML = "Initial Order";
} else if (message.innerHTML === "&nbsp;&nbsp;Reorder&nbsp;&nbsp;") {
  reorderButton.style.backgroundColor = "var(--rose-lt)";
  reorderButton.innerHTML = "Reorder Now";
} else if (message.innerHTML === "&nbsp;&nbsp;Low Stock&nbsp;&nbsp;") {
  reorderButton.style.backgroundColor = "var(--gold-lt)";
  reorderButton.innerHTML = "Reorder Soon";
} else {
  reorderButton.innerHTML = "Reorder";
}
  
});

// document.querySelectorAll(".toggle-inv-btn").forEach((btn) => {
//   btn.addEventListener("click", () => {
//     const card = btn.closest(".update-item-details-col2");
//     const hiddenInventory = card.querySelector(".hidden-inventory");
//     hiddenInventory.classList.toggle("hidden");
//     // const fileTab = card.querySelector(".file-tab");
//     if (!hiddenInventory.classList.contains("hidden")) {
//       card.querySelector(".toggle-inv-btn").style.backgroundColor =
//         "var(--frog-dk)";
//       card.querySelector(".toggle-inv-btn").style.color = "var(--gold)";
//       card.style.backgroundColor = "var(--rose-dk)";
//     } else {
//       card.querySelector(".toggle-inv-btn").style.backgroundColor =
//         "var(--frog-white)";
//       card.querySelector(".toggle-inv-btn").style.color = "var(--frog-black)";
//       card.style.backgroundColor = "var(--frog-lt)";
//     }
//   });
// });

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


