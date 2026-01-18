document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tag-cloud-item-button").forEach((btn) => {
    btn.addEventListener("click", () => {
      addTag(btn.dataset.tag);
    });
  });
});

function addTag(tag) {
  const input = document.getElementById("tags");
  if (!input) return;

  const existing = input.value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  console.log(tag);

  if (!existing.includes(tag)) {
    existing.push(tag);
    input.value = existing.join(", ");
  }
}

// Expose to global scope so onclick can find it
window.addTag = addTag;
