/**
 * 加载代码高亮样式
 * @param {boolean} isNightMode - 是否为夜间模式
 */
function loadHighlightStyle(isNightMode) {
  const styleId = "hljs-theme";
  let styleLink = document.getElementById(styleId);

  const lightUrl =
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-light.min.css";
  const darkUrl =
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css";

  const url = isNightMode ? darkUrl : lightUrl;

  if (!styleLink) {
    styleLink = document.createElement("link");
    styleLink.id = styleId;
    styleLink.rel = "stylesheet";
    document.head.appendChild(styleLink);
  }

  if (styleLink.href !== url) {
    styleLink.href = url;
  }
}
/**
 * 初始化复制代码按钮
 */
function initCopyCodeButtons() {
  const blocks = document.querySelectorAll("pre > code.hljs");

  blocks.forEach((codeBlock) => {
    const pre = codeBlock.parentElement;
    if (pre.classList.contains("code-block-with-copy")) return;
    pre.classList.add("code-block-with-copy");

    const button = document.createElement("button");
    button.className = "copy-code-btn";
    button.innerHTML = '<span class="copy-text">Copy</span>';

    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(codeBlock.innerText);
        button.classList.add("copied");
        button.querySelector(".copy-text").textContent = "Copied!";
        setTimeout(() => {
          button.classList.remove("copied");
          button.querySelector(".copy-text").textContent = "Copy";
        }, 1500);
      } catch (err) {
        console.error("复制失败:", err);
      }
    });

    pre.style.position = "relative";
    pre.appendChild(button);
  });
}

/**
 * 创建 SVG 图标
 * @param {string} pId1 - 第一个 path 的 d 属性值
 * @param {string} [pId2] - 第二个 path 的 d 属性值
 * @param {string} [pId3] - 第三个 path 的 d 属性值
 * @param {string} [fill1='#ffffff'] - 第一个 path 的 fill 颜色
 * @param {string} [fill2='#111111'] - 第二个 path 的 fill 颜色
 * @param {string} [fill3='#ffffff'] - 第三个 path 的 fill 颜色
 * @returns {SVGElement} - 生成的 SVG 元素
 */
function createSvgIcon(
  pId1,
  pId2,
  pId3,
  fill1 = "#ffffff",
  fill2 = "#ffffff",
  fill3 = "#ffffff"
) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "icon");
  svg.setAttribute("viewBox", "0 0 1024 1024");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path1.setAttribute("d", pId1);
  path1.setAttribute("fill", fill1);

  svg.appendChild(path1);

  if (pId2) {
    const path2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    path2.setAttribute("d", pId2);
    path2.setAttribute("fill", fill2);
    svg.appendChild(path2);
  }

  if (pId3) {
    const path3 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    path3.setAttribute("d", pId3);
    path3.setAttribute("fill", fill3);
    svg.appendChild(path3);
  }

  return svg;
}
export { loadHighlightStyle, initCopyCodeButtons, createSvgIcon };
