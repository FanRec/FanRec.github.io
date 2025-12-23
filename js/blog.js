import markdownit from "https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm";
// 初始化 markdown-it 并配置 highlight.js
const mdIt = markdownit({
  html: true, // 允许源码中的 HTML 标签
  linkify: true, // 自动识别 URL
  typographer: true, // 优化排版
  highlight: function (str, lang) {
    const validLang =
      lang && window.hljs && window.hljs.getLanguage(lang) ? lang : "";
    const highlighted = validLang
      ? window.hljs.highlight(str, {
          language: validLang,
          ignoreIllegals: true,
        }).value
      : mdIt.utils.escapeHtml(str);

    return `<pre><code class="hljs" data-lang="${validLang}">${highlighted}</code></pre>`;
  },
});
/* --- Markdown-it 插件：识别 > [!TIP] / [!NOTE] / [!IMPORTANT] / [!WARNING] / [!CAUTION] --- */
function admonitionPlugin(md) {
  const RE = /^\[!(TIP|NOTE|IMPORTANT|WARNING|CAUTION)\]\s*/i;

  md.core.ruler.after("block", "admonition", function (state) {
    const tokens = state.tokens;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // 只处理 blockquote_open
      if (token.type !== "blockquote_open") continue;

      // 检查结构是否符合 blockquote -> paragraph -> inline
      const inlineToken = tokens[i + 2];
      if (!inlineToken || inlineToken.type !== "inline") continue;

      const match = inlineToken.content.match(RE);
      if (!match) continue;

      const type = match[1].toLowerCase(); // tip, note, etc.
      const titleText = match[1].toUpperCase();

      // 替换 blockquote 为 div.admonition.<type>
      token.tag = "div";
      token.attrSet("class", `admonition ${type}`);
      token.attrSet("data-type", type);

      // 找到结束标签 blockquote_close
      for (let j = i + 1; j < tokens.length; j++) {
        if (tokens[j].type === "blockquote_close") {
          tokens[j].tag = "div";
          break;
        }
      }

      // 清理开头的 [!TYPE]
      inlineToken.content = inlineToken.content.replace(RE, "").trim();

      // 在 blockquote_open 后插入标题 token
      const titleOpen = new state.Token("div_open", "div", 1);
      titleOpen.attrSet("class", "admonition-title");

      const titleInline = new state.Token("inline", "", 0);
      titleInline.content = titleText;
      titleInline.children = [];

      const titleClose = new state.Token("div_close", "div", -1);

      tokens.splice(i + 1, 0, titleOpen, titleInline, titleClose);
      i += 3; // 跳过刚插入的 token
    }
  });
}
function localImagePrefixPlugin(md, options = {}) {
  const prefix = options.prefix || "../assets/articles/markdown/";

  // 备份原来的渲染器
  const defaultRender =
    md.renderer.rules.image ||
    function (tokens, idx, opts, env, self) {
      return self.renderToken(tokens, idx, opts);
    };

  md.renderer.rules.image = function (tokens, idx, opts, env, self) {
    const token = tokens[idx];
    const srcIndex = token.attrIndex("src");

    if (srcIndex >= 0) {
      const src = token.attrs[srcIndex][1];

      // 只处理“相对路径”的图片（不以 http(s)://、//、data: 开头）
      const isRelative =
        src &&
        !/^(https?:)?\/\//i.test(src) &&
        !/^data:/i.test(src) &&
        !src.startsWith(prefix);

      if (isRelative) {
        token.attrs[srcIndex][1] = prefix + src;
      }
    }

    return defaultRender(tokens, idx, opts, env, self);
  };
}
// 注册插件
mdIt.use(admonitionPlugin);
mdIt.use(localImagePrefixPlugin, { prefix: "../assets/articles/markdown/" });

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

  // 仅在 URL 改变时更新链接
  if (styleLink.href !== url) {
    styleLink.href = url;
  }
}
function initCopyCodeButtons() {
  const blocks = document.querySelectorAll("pre > code.hljs");

  blocks.forEach((codeBlock) => {
    const pre = codeBlock.parentElement;
    if (pre.classList.contains("code-block-with-copy")) return; // 避免重复添加
    pre.classList.add("code-block-with-copy");

    // 创建按钮
    const button = document.createElement("button");
    button.className = "copy-code-btn";
    button.innerHTML = '<span class="copy-text">Copy</span>';

    // 点击复制逻辑
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

    // 插入按钮
    pre.style.position = "relative";
    pre.appendChild(button);
  });
}

function initSettingsToggle() {
  const toggles = [
    {
      btn: document.getElementById("theme-toggle-button"),
      menu: document.getElementById("theme-menu"),
    },
    {
      btn: document.getElementById("bg-toggle-button"),
      menu: document.getElementById("bg-menu"),
    },
    {
      btn: document.getElementById("light-toggle-button"),
      menu: document.getElementById("light-menu"),
    },
  ];
  // 主题色 切换
  const slider = document.getElementById("hue-slider");
  const valueInput = document.getElementById("hue-value");
  const resetColorBtn = document.getElementById("reset-color-btn");
  // 壁纸 模式切换
  const bannerBg = document.getElementById("banner-bg");
  const fullScreenBg = document.getElementById("full-screen-bg");
  const solidColorBg = document.getElementById("solid-color-bg");
  // 白昼/黑夜 模式切换
  const lightMode = document.getElementById("light-mode");
  const darkMode = document.getElementById("dark-mode");
  const systemMode = document.getElementById("system-mode");

  const body = document.body;
  const root = document.documentElement;

  toggles.forEach((toggle) => {
    const btn = toggle.btn;
    const menu = toggle.menu;
    if (!btn || !menu) return;
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      menu.classList.toggle("is-active");
      toggles.forEach((otherToggle) => {
        if (otherToggle !== toggle) {
          otherToggle.menu.classList.remove("is-active");
        }
      });
    });
  });

  document.addEventListener("click", (event) => {
    const isClickInside = toggles.some(
      (toggle) =>
        toggle.btn.contains(event.target) || toggle.menu.contains(event.target)
    );
    if (!isClickInside) {
      toggles.forEach((toggle) => {
        toggle.menu.classList.remove("is-active");
      });
    }
  });
  // 主题色 切换
  function upateThemeColor(hue) {
    let validHue = Math.min(Math.max(0, parseInt(hue)), 360);
    if (isNaN(validHue)) {
      validHue = 207;
    }
    root.style.setProperty("--hue", validHue);
    const loaderFrame = document.getElementById("global-loader-iframe");
    if (loaderFrame) {
      loaderFrame.style.setProperty("--hue", validHue);
      try {
        if (loaderFrame.contentWindow && loaderFrame.contentWindow.document) {
          const innerRoot = loaderFrame.contentWindow.document.documentElement;
          innerRoot.style.setProperty("--hue", validHue);
        }
      } catch (e) {
        console.warn("无法穿透修改 iframe 内部颜色:", e);
      }
    }
    slider.value = validHue;
    valueInput.value = validHue;
    saveSetting("hue", validHue);
  }
  slider.addEventListener("input", (event) => {
    upateThemeColor(event.target.value);
  });
  valueInput.addEventListener("input", (event) => {
    upateThemeColor(event.target.value);
  });
  resetColorBtn.addEventListener("click", (event) => {
    upateThemeColor(207);
  });
  // 壁纸 模式切换
  function activeBgMenu(menu) {
    if (fullScreenBg && fullScreenBg.classList.contains("is-active"))
      fullScreenBg.classList.remove("is-active");
    if (solidColorBg && solidColorBg.classList.contains("is-active"))
      solidColorBg.classList.remove("is-active");
    if (bannerBg && bannerBg.classList.contains("is-active"))
      bannerBg.classList.remove("is-active");
    if (menu && !menu.classList.contains("is-active"))
      menu.classList.add("is-active");
  }
  function setBgMode(mode) {
    if (!body || !root) return;
    if (body.classList.contains("bg-mode-banner")) {
      body.classList.remove("bg-mode-banner");
    }
    if (body.classList.contains("bg-mode-fullscreen")) {
      body.classList.remove("bg-mode-fullscreen");
    }
    if (body.classList.contains("bg-mode-solid")) {
      body.classList.remove("bg-mode-solid");
    }
    const navHeightStr =
      getComputedStyle(root).getPropertyValue("--nav-height");
    const navHeightVal = parseInt(navHeightStr, 10) + 45;
    if (mode === "banner") {
      body.classList.add("bg-mode-banner");
      root.style.setProperty("--overlap-distance", "65px");
    } else if (mode === "fullscreen") {
      body.classList.add("bg-mode-fullscreen");
      if (!isNaN(navHeightVal)) {
        root.style.setProperty("--overlap-distance", -navHeightVal + "px"); // " -60px"
      }
    } else if (mode === "solid") {
      body.classList.add("bg-mode-solid");
      if (!isNaN(navHeightVal)) {
        root.style.setProperty("--overlap-distance", -navHeightVal + "px"); // " -60px"
      }
    }
  }
  bannerBg.addEventListener("click", (event) => {
    event.stopPropagation();
    activeBgMenu(bannerBg);
    setBgMode("banner");
    saveSetting("bg-mode", "banner");
  });
  fullScreenBg.addEventListener("click", (event) => {
    event.stopPropagation();
    activeBgMenu(fullScreenBg);
    setBgMode("fullscreen");
    saveSetting("bg-mode", "fullscreen");
  });
  solidColorBg.addEventListener("click", (event) => {
    event.stopPropagation();
    activeBgMenu(solidColorBg);
    setBgMode("solid");
    saveSetting("bg-mode", "solid");
  });
  // 白昼/黑夜 模式切换
  function activeLightMenu(menu) {
    if (lightMode && lightMode.classList.contains("is-active"))
      lightMode.classList.remove("is-active");
    if (darkMode && darkMode.classList.contains("is-active"))
      darkMode.classList.remove("is-active");
    if (systemMode && systemMode.classList.contains("is-active"))
      systemMode.classList.remove("is-active");
    if (menu && !menu.classList.contains("is-active"))
      menu.classList.add("is-active");
  }
  function setLightMode(isLight) {
    if (isLight) {
      if (body && body.classList.contains("night-mode")) {
        body.classList.remove("night-mode");
      }
      loadHighlightStyle(false);
    } else {
      if (body && !body.classList.contains("night-mode")) {
        body.classList.add("night-mode");
      }
      loadHighlightStyle(true);
    }
  }
  lightMode.addEventListener("click", (event) => {
    event.stopPropagation();
    activeLightMenu(lightMode);

    setLightMode(true);
    saveSetting("light-mode", "light");
  });
  darkMode.addEventListener("click", (event) => {
    event.stopPropagation();
    activeLightMenu(darkMode);

    setLightMode(false);
    saveSetting("light-mode", "dark");
  });
  systemMode.addEventListener("click", (event) => {
    event.stopPropagation();
    activeLightMenu(systemMode);
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setLightMode(false);
    } else {
      setLightMode(true);
    }
    saveSetting("light-mode", "system");
  });

  // 恢复样式
  const savedHue = loadSetting("hue", 207);
  const savedBgMode = loadSetting("bg-mode", "banner");
  const savedLightMode = loadSetting("light-mode", "dark");
  upateThemeColor(savedHue);
  if (savedBgMode === "banner") {
    activeBgMenu(bannerBg);
    setBgMode("banner");
  } else if (savedBgMode === "fullscreen") {
    activeBgMenu(fullScreenBg);
    setBgMode("fullscreen");
  } else if (savedBgMode === "solid") {
    activeBgMenu(solidColorBg);
    setBgMode("solid");
  }
  if (savedLightMode === "light") {
    activeLightMenu(lightMode);
    setLightMode(true);
  } else if (savedLightMode === "dark") {
    activeLightMenu(darkMode);
    setLightMode(false);
  } else if (savedLightMode === "system") {
    activeLightMenu(systemMode);
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setLightMode(false);
    } else {
      setLightMode(true);
    }
  }
  // 初始修改高亮配色
  loadHighlightStyle(body.classList.contains("night-mode"));
}
function initScrollToTop() {
  const scrollToTopBtn = document.getElementById("scroll-to-top-btn");

  const articleList = document.querySelector(".main-article-list");
  if (!scrollToTopBtn || !articleList) {
    console.error("找不到回到顶部按钮或文章列表元素。");
    return;
  }
  const firstArticleCard = articleList.firstElementChild;
  const mainArticleContent = document.querySelector(".main-article-content");
  if (firstArticleCard == null) return;
  window.addEventListener("scroll", () => {
    let shouldShowButton = true;
    if (!articleList.classList.contains("hide")) {
      const rect = firstArticleCard.getBoundingClientRect();
      shouldShowButton = rect.bottom <= 0;
    } else {
      const rect = mainArticleContent.getBoundingClientRect();
      shouldShowButton = rect.top <= 0;
    }
    if (shouldShowButton) {
      scrollToTopBtn.classList.add("show");
    } else {
      scrollToTopBtn.classList.remove("show");
    }
  });
  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}
function articlesInit() {
  const ARTICLE_DATA_URL = "../json/articles/articles.json";

  // 文章卡片生成
  const articleListContainer = document.querySelector(".main-article-list");
  // 侧边栏信息生成
  const categoryListContainer = document.querySelector(".category-list");
  const tagCloudContainer = document.querySelector(".tag-cloud");
  // 文章搜索过滤
  const searchInput = document.getElementById("search-input");

  if (!categoryListContainer || !tagCloudContainer) {
    console.error("未找到 .category-list 或 .tag-cloud 容器");
  }
  // 存储原始文章数据对象
  let allArticlesData = [];
  let allArticleCards = [];
  if (!articleListContainer) {
    console.error("未找到 .main-article-list 容器");
    return;
  }

  const dateIconPath =
    "M917.333333 426.666667H106.666667v469.333333l477.738666 0.021334L917.333333 895.957333V426.666667z m0-64V170.666667C917.333333 170.666667 746.666667 170.666667 746.666667 170.666667V106.666667h170.666666A64 64 0 0 1 981.333333 170.666667v725.333333A64 64 0 0 1 917.333333 960H106.666667A64 64 0 0 1 42.666667 896V170.666667C42.666667 137.408 70.330667 106.666667 106.666667 106.666667H256v64l-149.333333 0.042667V362.666667h810.666666zM277.333333 64h64v213.333333h-64V64z m384 0h64v213.333333h-64V64zM362.666667 106.666667h341.333333v64H362.666667V106.666667z";
  const categoryIconPath1 =
    "M917.333333 0v774.592H247.082667c-42.218667 0-76.693333 32.149333-79.018667 71.637333l-0.149333 4.266667v35.626667c0 40 33.066667 73.557333 74.666666 75.818666l4.501334 0.128H917.333333V1024H247.082667C171.818667 1024 109.610667 965.12 106.773333 891.413333L106.666667 886.122667V173.504C106.666667 79.701333 183.253333 3.2 277.717333 0.106667L283.690667 0H917.333333z m-64 65.365333H285.504c-61.568 0-111.936 47.786667-114.709333 106.602667L170.666667 177.024 170.666667 740.757333l1.386666-0.917333a139.328 139.328 0 0 1 71.829334-23.104l5.333333-0.085333L853.333333 716.586667V65.365333z";
  const categoryIconPath2 =
    "M298.666667 43.584v718.976H234.666667V43.584h64zM917.333333 849.706667v65.365333H234.666667V849.706667h682.666666z";
  const tagIconPath1 =
    "M128 341.333333m42.666667 0l682.666666 0q42.666667 0 42.666667 42.666667l0 0q0 42.666667-42.666667 42.666667l-682.666666 0q-42.666667 0-42.666667-42.666667l0 0q0-42.666667 42.666667-42.666667Z";
  const tagIconPath2 =
    "M422.613333 85.333333H426.666667a38.613333 38.613333 0 0 1 38.4 42.453334L387.84 900.266667a42.666667 42.666667 0 0 1-42.453333 38.4H341.333333a38.613333 38.613333 0 0 1-38.4-42.453334L380.16 123.733333a42.666667 42.666667 0 0 1 42.453333-38.4zM678.613333 85.333333H682.666667a38.613333 38.613333 0 0 1 38.4 42.453334L643.84 900.266667a42.666667 42.666667 0 0 1-42.453333 38.4H597.333333a38.613333 38.613333 0 0 1-38.4-42.453334L636.16 123.733333a42.666667 42.666667 0 0 1 42.453333-38.4z";
  const tagIconPath3 =
    "M128 597.333333m42.666667 0l682.666666 0q42.666667 0 42.666667 42.666667l0 0q0 42.666667-42.666667 42.666667l-682.666666 0q-42.666667 0-42.666667-42.666667l0 0q0-42.666667 42.666667-42.666667Z";

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

    const path1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
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

  /* 生成卡片 */
  function createArticleCard(articleData) {
    const card = document.createElement("a");
    card.addEventListener("click", (e) => {
      e.preventDefault();
      displayArticle(articleData);
    });
    const flag = (articleData.flag || "none").toLowerCase();
    card.setAttribute("data-category", articleData.category || "未分类");
    card.setAttribute("data-tags", (articleData.tag || "").toLowerCase());
    card.setAttribute("data-flag", flag);
    card.classList.add("article-card", "flag", "filterable");

    const cardInfo = document.createElement("div");
    cardInfo.setAttribute("class", "card-info");

    if (flag === "top") {
      card.classList.add("pinned");
    }

    const articleTitle = document.createElement("h2");
    articleTitle.setAttribute("class", "article-title");
    articleTitle.textContent = articleData.title;

    if (flag === "top") {
      const pinBadge = document.createElement("span");
      pinBadge.className = "pin-badge";
      pinBadge.textContent = "置顶";
      articleTitle.appendChild(pinBadge);
    }

    const articleMeta = document.createElement("div");
    articleMeta.setAttribute("class", "article-meta");

    // 日期
    articleMeta.appendChild(createSvgIcon(dateIconPath, null, null, "#ffffff"));
    const dateSpan = document.createElement("span");
    dateSpan.textContent = articleData.date || "xxxx-xx-xx";
    articleMeta.appendChild(dateSpan);

    // 分类
    articleMeta.appendChild(
      createSvgIcon(
        categoryIconPath1,
        categoryIconPath2,
        null,
        "#111111",
        "#111111"
      )
    );
    const categorySpan = document.createElement("span");
    categorySpan.textContent = `# ${articleData.category || "未分类"}`;
    articleMeta.appendChild(categorySpan);

    // 标签
    articleMeta.appendChild(
      createSvgIcon(
        tagIconPath1,
        tagIconPath2,
        tagIconPath3,
        "#ffffff",
        "#ffffff",
        "#ffffff"
      )
    );
    const tagsSpan = document.createElement("span");
    tagsSpan.setAttribute("class", "tags");

    const tags = articleData.tag ? articleData.tag.split("/") : [];
    tags.forEach((tag, index) => {
      const tagItemSpan = document.createElement("span");
      tagItemSpan.textContent = tag.trim();
      tagsSpan.appendChild(tagItemSpan);

      if (index < tags.length - 1) {
        const separatorSpan = document.createElement("span");
        separatorSpan.textContent = "/";
        tagsSpan.appendChild(separatorSpan);
      }
    });
    articleMeta.appendChild(tagsSpan);

    // 文章摘要
    const excerpt = document.createElement("p");
    excerpt.setAttribute("class", "article-excerpt");
    excerpt.textContent = `${
      articleData.excerpt || `了解更多关于 ${articleData.title} 的信息...`
    }`;

    // 文章统计
    const articleStats = document.createElement("div");
    articleStats.setAttribute("class", "article-stats");
    articleStats.innerHTML = `<span>${
      articleData.words || "xxx"
    } words</span> <span>|</span> <span>${
      articleData.readingTime || "x"
    } minutes</span>`;

    const cardArrow = document.createElement("div");
    cardArrow.setAttribute("class", "card-arrow");
    cardArrow.textContent = ">";

    cardInfo.appendChild(articleTitle);
    cardInfo.appendChild(articleMeta);
    cardInfo.appendChild(excerpt);
    cardInfo.appendChild(articleStats);

    card.appendChild(cardInfo);
    card.appendChild(cardArrow);

    return card;
  }
  /* 填充侧边栏(分类和标签) */
  function populateSidebar(categoryCounts, uniqueTags) {
    if (!categoryListContainer || !tagCloudContainer) return;

    function setActive(element) {
      const parent = element.parentElement;
      parent.querySelectorAll("li, a").forEach((el) => {
        el.classList.remove("active-filter");
      });
      element.classList.add("active-filter");
    }

    categoryListContainer.innerHTML = "";
    const totalArticlesCount = allArticleCards.length;

    const allLi = document.createElement("li");
    allLi.innerHTML = `
        <span>ALL</span>
        <span class="badge">${totalArticlesCount}</span>
        `;
    allLi.classList.add("active-filter");
    allLi.addEventListener("click", (e) => {
      displayAllArticles();
      setActive(e.currentTarget);
    });
    categoryListContainer.appendChild(allLi);

    for (const category in categoryCounts) {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${category}</span>
        <span class="badge">${categoryCounts[category]}</span>
        `;
      li.addEventListener("click", (e) => {
        filterArticlesByCategory(category);
        setActive(e.currentTarget);
        tagCloudContainer
          .querySelectorAll("a")
          .forEach((a) => a.classList.remove("active-filter"));
      });
      categoryListContainer.appendChild(li);
    }

    tagCloudContainer.innerHTML = "";
    uniqueTags.forEach((tag) => {
      const a = document.createElement("a");
      a.setAttribute("href", `#`);
      a.textContent = tag;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        filterArticlesByTag(tag);
        setActive(e.currentTarget);
        categoryListContainer
          .querySelectorAll("li")
          .forEach((li) => li.classList.remove("active-filter"));
      });
      tagCloudContainer.appendChild(a);
    });
  }
  /**
   * 显示所有文章卡片
   */
  function displayAllArticles() {
    allArticleCards.forEach((card) => {
      card.style.display = "flex";
    });
    history.pushState(null, "", location.pathname);
  }

  /**
   * 根据分类筛选文章
   */
  function filterArticlesByCategory(category) {
    const filter = category.trim();

    allArticleCards.forEach((card) => {
      const cardCategory = card.getAttribute("data-category");

      if (cardCategory === filter) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
    history.pushState(null, "", `?category=${encodeURIComponent(filter)}`);
  }

  /**
   * 根据标签筛选文章
   */
  function filterArticlesByTag(tag) {
    const filter = tag.trim().toLowerCase();

    allArticleCards.forEach((card) => {
      const cardTags = card.getAttribute("data-tags");
      if (
        cardTags &&
        cardTags
          .split("/")
          .map((t) => t.trim())
          .includes(filter)
      ) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });

    history.pushState(null, "", `?tag=${encodeURIComponent(filter)}`);
  }
  /**
   * 根据关键词筛选文章
   */
  function filterArticlesBySearch(query) {
    const filterQuery = query.trim().toLowerCase();

    if (filterQuery === "") {
      allArticleCards.forEach((card) => (card.style.display = "flex"));
      return;
    }

    console.log(`按搜索关键词筛选: ${filterQuery}`);

    allArticleCards.forEach((card) => {
      const title =
        card.querySelector(".article-title")?.textContent.toLowerCase() || "";
      const excerpt =
        card.querySelector(".article-excerpt")?.textContent.toLowerCase() || "";

      const category = card.getAttribute("data-category")?.toLowerCase() || "";
      const tags = card.getAttribute("data-tags") || "";

      if (
        title.includes(filterQuery) ||
        excerpt.includes(filterQuery) ||
        category.includes(filterQuery) ||
        tags.includes(filterQuery)
      ) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  }
  function setupEventListeners() {
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        filterArticlesBySearch(e.target.value);
      });
    }
  }
  // 加载文章数据并生成卡片
  async function loadArticles() {
    try {
      const response = await fetch(ARTICLE_DATA_URL);

      if (!response.ok) {
        throw new Error(`ERROR:状态码: ${response.status}`);
      }

      const articleDatas = await response.json();
      articleListContainer.innerHTML = "";

      const categoryCounts = {};
      const uniqueTags = new Set();

      allArticlesData = [];
      allArticleCards = [];

      articleDatas.forEach((articleData) => {
        if (!articleData.flag) articleData.flag = "none";
      });
      articleDatas.forEach((a) => {
        if (!a.slug) a.slug = generateSlug(a);
      });

      //排序 置顶 > date倒序
      articleDatas.sort((a, b) => {
        const flagA = a.flag.toLowerCase();
        const flagB = b.flag.toLowerCase();
        if (flagA === "top" && flagB !== "top") return -1;
        if (flagB === "top" && flagA !== "top") return 1;
        const da = a.date ? Date.parse(a.date) : 0;
        const db = b.date ? Date.parse(b.date) : 0;
        return db - da;
      });
      const frag = document.createDocumentFragment(); // 优化性能

      for (let articleData of articleDatas) {
        allArticlesData.push(articleData);

        const newCard = createArticleCard(articleData);
        // articleListContainer.appendChild(newCard);

        frag.appendChild(newCard);
        allArticleCards.push(newCard);
        // 统计分类和标签
        const category = articleData.category || "未分类";
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        if (articleData.tag) {
          const tags = articleData.tag.split("/").map((t) => t.trim());
          tags.forEach((tag) => uniqueTags.add(tag));
        }
      }
      articleListContainer.appendChild(frag);
      // 填充侧边栏
      if (categoryListContainer && tagCloudContainer) {
        populateSidebar(categoryCounts, uniqueTags);
      }
      /* 滚动显示 */
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          } else {
            entry.target.classList.remove("active");
          }
        });
      });
      const hiddenElements = document.querySelectorAll(".flag");
      hiddenElements.forEach((el) => observer.observe(el));

      displayAllArticles();
      setupEventListeners();
      initScrollToTop();
    } catch (error) {
      console.error("加载文章数据失败:", error);
      articleListContainer.innerHTML =
        '<p style="color: red;">抱歉，文章列表加载失败。</p>';
    }
    restoreFrom404Redirect();
  }
  const mainArticleList = document.querySelector(".main-article-list");
  const mainArticleContent = document.querySelector(".main-article-content");
  const articleContent = document.getElementById("article-content");
  const articleTitle = document.getElementById("article-content-title");
  //生成Slug
  function generateSlug(articleData) {
    let base =
      articleData.slug ||
      articleData.filePath ||
      articleData.title ||
      "article";
    base = base.replace(/\.[^/.]+$/, "");
    base = base.replace(/\\/g, "/").split("/").pop();
    base = base
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "");
    return base || "article";
  }
  //卸载Utterances
  function unmountUtterances() {
    const container = document.getElementById("utterances-container");
    if (!container) return;
    container.innerHTML = "";
    const oldIframe = container.querySelector("iframe");
    if (oldIframe) oldIframe.remove();
  }
  //挂载Utterances
  function mountUtterances(opts = {}) {
    const container = document.getElementById("utterances-container");
    if (!container) return;
    const repo = opts.repo || "yourname/your-repo";
    const issueTerm = opts.issueTerm || "pathname";
    const theme =
      opts.theme ||
      (document.body.classList.contains("night-mode")
        ? "github-dark"
        : "github-light");
    unmountUtterances();
    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("repo", repo);
    script.setAttribute("issue-term", issueTerm);
    script.setAttribute("theme", theme);
    container.appendChild(script);
  }
  async function displayArticle(articleData, options = {}) {
    const pushHistory = options.pushHistory !== false;
    try {
      const FilePath = `../assets/articles/markdown/${articleData.filePath}`;

      const response = await fetch(FilePath);
      if (!response.ok) {
        throw new Error(`ERROR:状态码: ${response.status}`);
      }
      const md = await response.text();
      const html = mdIt.render(md);
      if (!html) throw new Error("解析失败");
      // const safeHtml = window.DOMPurify ? DOMPurify.sanitize(html) : html;

      if (
        !(
          mainArticleList &&
          mainArticleContent &&
          articleContent &&
          articleTitle
        )
      )
        return;
      mainArticleList.classList.add("hide");
      mainArticleContent.style.display = "flex";
      setTimeout(() => {
        mainArticleList.style.display = "none";
        articleTitle.textContent = articleData.title;
        articleContent.innerHTML = html;
        initCopyCodeButtons();

        if (pushHistory) {
          const slug = articleData.slug || generateSlug(articleData);
          window.__prevPathBeforeArticle =
            window.location.pathname +
            window.location.search +
            window.location.hash;
          history.pushState(
            { view: "article", slug },
            articleData.title,
            `/article/${encodeURIComponent(slug)}`
          );
        }

        mountUtterances({
          repo: "FanRec/FanRec.github.io",
          issueTerm: "pathname",
        });

        mainArticleContent.classList.remove("hide");
      }, 200);
    } catch (error) {
      console.error("加载文章失败:", error);
    }
  }
  function restoreFrom404Redirect() {
    if (!location.hash || location.hash.length <= 1) return;
    const raw = location.hash.slice(1);
    let decoded;
    try {
      decoded = decodeURIComponent(raw);
    } catch (e) {
      console.warn("restoreFrom404Redirect decode failed", e);
      return;
    }
    if (!decoded || !decoded.startsWith("/")) return;

    console.log("[restoreFrom404Redirect] decoded =", decoded);

    try {
      const fake = new URL("https://example.com" + decoded);
      const pathname = fake.pathname; // /article/Prim-Kruskal
      const search = fake.search; // ?utterances=xxxx
      const match = pathname.match(/^\/article\/(.+)$/);

      if (match) {
        const slug = decodeURIComponent(match[1]);
        const article =
          allArticlesData &&
          allArticlesData.find((a) => (a.slug || generateSlug(a)) === slug);
        if (article) {
          // 🚫 不再跳回 /html/blog.html，只更新当前状态
          history.replaceState(
            { view: "article", slug },
            article.title,
            "#article/" + encodeURIComponent(slug)
          );

          // 加载文章内容
          displayArticle(article, { pushHistory: false });

          // 如果原始请求中带有 ?utterances=xxx，则重新挂载评论（用 url 模式）
          if (search && search.length > 1) {
            console.log(
              "[restoreFrom404Redirect] detected utterances query, remounting..."
            );
            setTimeout(() => {
              unmountUtterances();
              mountUtterances({
                repo: "FanRec/FanRec.github.io",
                issueTerm: "url", // 包含完整 query/hash
              });
            }, 300);
          }
          return;
        }
      }
    } catch (e) {
      console.warn("restoreFrom404Redirect parse error", e);
    }

    console.log("[restoreFrom404Redirect] no article found, stay on page");
  }

  const backToListBtn = document.getElementById("back-to-list-btn");
  if (backToListBtn) {
    backToListBtn.addEventListener("click", () => {
      const prev = window.__prevPathBeforeArticle || "/";
      history.pushState({ view: "list" }, "", prev);
      mainArticleContent.classList.add("hide");
      setTimeout(() => {
        mainArticleContent.style.display = "none";
        mainArticleList.style.display = "flex";
        mainArticleList.classList.remove("hide");
        unmountUtterances();
      }, 200);
    });
  }
  window.addEventListener("popstate", (e) => {
    const state = e.state;
    if (state && state.view === "article" && state.slug) {
      const article = allArticlesData.find((a) => a.slug === state.slug);
      if (article) {
        displayArticle(article, { pushHistory: false });
        return;
      }
    }
    mainArticleContent.classList.add("hide");
    setTimeout(() => {
      mainArticleContent.style.display = "none";
      mainArticleList.style.display = "flex";
      mainArticleList.classList.remove("hide");
      unmountUtterances();
    }, 200);
  });
  loadArticles();
}

document.addEventListener("DOMContentLoaded", () => {
  articlesInit();
  initSettingsToggle();
});
