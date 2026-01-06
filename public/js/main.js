// Place button functionality and any other JS here

// document.querySelectorAll("toggle-btn").addEventListener("click", () => {
//   document.querySelectorAll(".additional-data").forEach((el) => {
//     el.classList.toggle("hidden");
//   });
// });

// document.querySelectorAll(".toggle-btn").forEach((btn) => {
//   btn.addEventListener("click", () => {
//     const card = btn.closest(".quick-view-details-col");
//     const additionalData = card.querySelector(".additional-data");
//     additionalData.classList.toggle("hidden");
//   });
// });

document.querySelectorAll(".toggle-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".quick-view");
    const additionalData = card.querySelector(".additional-data");
    additionalData.classList.toggle("hidden");
    // const fileTab = card.querySelector(".file-tab");
        if (!additionalData.classList.contains("hidden")) {
      card.querySelector(".toggle-btn").style.backgroundColor = "var(--frog-dk)";
      card.querySelector(".toggle-btn").style.color = "var(--gold)";
      card.querySelector(".quick-view-details-adjustable").style.borderTopLeftRadius = "0.5rem";
      card.style.backgroundColor = "var(--rose-dk)";
      card.querySelector(".file-tab-text").innerHTML = "full view:&nbsp;";
    } else {
      card.querySelector(".toggle-btn").style.backgroundColor = "var(--frog-white)";
      card.querySelector(".toggle-btn").style.color =
        "var(--frog-black)";
              card.querySelector(
                ".quick-view-details-adjustable"
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

document.querySelectorAll(".sizeUnitCount").forEach((el) => {
  const unitCountMessage = el.querySelector(".quick-view-unit-message");
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

document.querySelectorAll(".variant-reorder").forEach((el) => {
const message = el.querySelector(".quick-view-unit-message");
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

