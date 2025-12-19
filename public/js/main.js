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
    card.querySelector(".additional-data").classList.toggle("hidden");
  });
});

