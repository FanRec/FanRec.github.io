function renderTechStack() {
  const techStacks = document.querySelectorAll(".tech-stack");

  techStacks.forEach((techStack) => {
    const randomRotate = (Math.random() * 10 - 5).toFixed(2);

    const randomScale = (Math.random() * 0.1 + 0.95).toFixed(2);

    techStack.style.transform = `rotate(${randomRotate}deg) scale(${randomScale})`;
  });
}
window.addEventListener("DOMContentLoaded", () => {
  renderTechStack();
});
