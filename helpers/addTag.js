function addTag(tag) {
  const input = document.getElementById("tags");
  const existing = input.value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!existing.includes(tag)) {
    existing.push(tag);
    input.value = existing.join(", ");
  }
}

module.exports = { addTag };