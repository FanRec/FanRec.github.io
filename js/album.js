const IMAGE_CONFIG_DIR = "../json/album/imageConfig.json";
async function render() {
  const container = document.getElementById("waterfall-container");
  try {
    const response = await fetch(IMAGE_CONFIG_DIR);

    if (!response.ok) {
      console.error("数据加载失败");
      return;
    }

    const data = await response.json();
    container.innerHTML = data
      .map((item, index) => {
        const tagsArray = item.tags ? item.tags.split("/") : [];
        const tagsHtml = tagsArray
          .map((tag) => `<span class="tag">${tag}</span>`)
          .join("");
        const title = item.title ? item.title : `無題 #${index + 1}`;
        return `
    <div class="card">
                    <img class="card-img" 
                         src="${item.src}" 
                         alt="${title}"
                         loading="lazy"
                         >
                    <div class="card-content">
                        <div class="card-title">${title}</div>
                        <div class="card-desc">${item.desc}</div>
                        <div class="card-tags">
                            ${tagsHtml}
                        </div>
                    </div>
                </div>
            `;
      })
      .join("");
  } catch (e) {}
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggleBtn");
  const pureModeCheck = document.getElementById("pureModeCheck");
  toggleBtn.onclick = (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("active");
  };
  document.onclick = (e) => {
    if (!sidebar.contains(e.target)) sidebar.classList.remove("active");
  };
  function togglePureMode(checked) {
    document.body.classList.toggle("pure-mode", checked);
    saveSetting("pureMode", checked);
  }
  pureModeCheck.onchange = (e) => togglePureMode(e.target.checked);
  //恢复
  pureModeCheck.checked = localStorage.getItem("pureMode") === "true";
  togglePureMode(pureModeCheck.checked);
}
render();
