// Place button functionality and any other JS here

document.getElementById("toggle-btn").addEventListener("click", () => {
  document.querySelectorAll(".additional-data").forEach((el) => {
    el.classList.toggle("hidden");
  });
});
