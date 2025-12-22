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
    if (!additionalData.classList.contains("hidden")) {
      card.querySelector(".toggle-btn").style.backgroundColor = "var(--rose-dk)"
      card.querySelector(".toggle-btn").style.color = "var(--gold)"
    } else {
      card.querySelector(".toggle-btn").style.backgroundColor = "var(--frog-white)";
      card.querySelector(".toggle-btn").style.color =
        "var(--frog-black)";
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
  if (unitCount < 100) {
    // Check if units are 100 or less
    unitCountMessage.style.color = "var(--gold)";
    unitCountMessage.style.backgroundColor = "var(--red-dk)";
    unitCountMessage.style.borderRadius = "1rem";
    unitCountMessage.innerHTML = "&nbsp;&nbsp;REORDER NOW!&nbsp;&nbsp;";
  } else if (unitCount >= 100 && unitCount <= 150) {
    unitCountMessage.style.color = "var(--frog-black)";
    unitCountMessage.style.backgroundColor = "var(--orange-dk)";
    unitCountMessage.style.borderRadius = "1rem";
    unitCountMessage.innerHTML = "&nbsp;&nbsp;Low Stock&nbsp;&nbsp;";
  } else if (unitCount > 350) {
    unitCountMessage.style.color = "var(--frog-black)";
    unitCountMessage.style.backgroundColor = "var(--focus-blue)";
    unitCountMessage.style.borderRadius = "1rem";
    unitCountMessage.innerHTML = "&nbsp;&nbsp;Overstock&nbsp;&nbsp;";
  } else {
    unitCountMessage.innerHTML = ""; // Optionally clear the message if above does not apply
  }
});



