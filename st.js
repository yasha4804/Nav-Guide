
document.querySelectorAll("section").forEach(sec => {
  sec.addEventListener("click", () => {
    alert(`You opened: ${sec.querySelector("h2").innerText}`);
  });
});
