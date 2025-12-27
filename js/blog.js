import mdIt from "./mdit.js";
import {
  unmountUtterances,
  mountUtterances,
  sendThemeToUtterances,
} from "./utteerances.js";
import {
  loadHighlightStyle,
  initCopyCodeButtons,
  createSvgIcon,
  formatPath,
} from "./utils.js";
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
    const theme = isLight ? "github-light" : "github-dark";
    sendThemeToUtterances(theme);
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

  /* 生成卡片 */
  function createArticleCard(articleData) {
    const card = document.createElement("a");
    card.addEventListener("click", (e) => {
      e.preventDefault();

      const newUrl = `?article=${encodeURIComponent(articleData.slug)}`;
      history.pushState({ article: articleData.slug }, "", newUrl);
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
  function getArticleFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("article");
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

      // displayAllArticles();
      setupEventListeners();
      initScrollToTop();

      const currentSlug = getArticleFromUrl();
      if (currentSlug) {
        const targetArticle = allArticlesData.find(
          (a) => a.slug === currentSlug
        );
        if (targetArticle) {
          displayArticle(targetArticle);
        } else {
          console.warn(`文章 ${currentSlug} 不存在`);
          displayAllArticles();
        }
      } else {
        displayAllArticles();
      }
    } catch (error) {
      console.error("加载文章数据失败:", error);
      articleListContainer.innerHTML =
        '<p style="color: red;">抱歉，文章列表加载失败。</p>';
    }
  }
  const mainArticleList = document.querySelector(".main-article-list");
  const mainArticleContent = document.querySelector(".main-article-content");
  const articleContent = document.getElementById("article-content");
  const articleTitle = document.getElementById("article-content-title");

  async function displayArticle(articleData) {
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

        generateTOC();

        mountUtterances({
          repo: "FanRec/FanRec.github.io",
          issueTerm: articleData.title,
        });
        mainArticleContent.classList.remove("hide");
        window.scrollTo(0, 0);
      }, 200);
    } catch (error) {
      console.error("加载文章失败:", error);
    }
  }
  const backToListBtn = document.getElementById("back-to-list-btn");
  if (backToListBtn) {
    backToListBtn.addEventListener("click", () => {
      history.pushState(null, "", location.pathname);
      mainArticleContent.classList.add("hide");
      setTimeout(() => {
        mainArticleContent.style.display = "none";
        mainArticleList.style.display = "flex";
        mainArticleList.classList.remove("hide");
        unmountUtterances();
      }, 200);
    });
  }
  window.addEventListener("popstate", (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get("article");

    if (slug) {
      const targetArticle = allArticlesData.find((a) => a.slug === slug);
      if (targetArticle) {
        displayArticle(targetArticle);
      }
    } else {
      mainArticleContent.classList.add("hide");
      setTimeout(() => {
        mainArticleContent.style.display = "none";
        mainArticleList.style.display = "flex";
        mainArticleList.classList.remove("hide");
        unmountUtterances();
      }, 200);
    }
  });

  loadArticles();
}
function initTOC() {
  const tocBtn = document.getElementById("toc-toggle-btn");
  const tocPanel = document.getElementById("toc-panel");
  const closeBtn = document.querySelector(".toc-close-btn");

  if (!tocBtn || !tocPanel) return;

  function toggleTOC() {
    tocPanel.classList.toggle("active");
  }

  tocBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleTOC();
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      tocPanel.classList.remove("active");
    });
  }

  document.addEventListener("click", (e) => {
    if (
      tocPanel.classList.contains("active") &&
      !tocPanel.contains(e.target) &&
      e.target !== tocBtn
    ) {
      tocPanel.classList.remove("active");
    }
  });
}

function generateTOC() {
  const articleContent = document.getElementById("article-content");
  const tocContent = document.getElementById("toc-content");

  if (!articleContent || !tocContent) return;

  tocContent.innerHTML = "";

  const headers = articleContent.querySelectorAll("h1, h2, h3, h4");

  if (headers.length === 0) {
    tocContent.innerHTML =
      '<div style="padding:16px;color:#999;font-size:13px">暂无目录</div>';
    return;
  }

  headers.forEach((header, index) => {
    if (!header.id) {
      header.id = `article-heading-${index}`;
    }

    const link = document.createElement("a");
    link.href = `#${header.id}`;
    link.className = `toc-link toc-${header.tagName.toLowerCase()}`;
    link.textContent = header.textContent;
    link.title = header.textContent;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById(header.id);
      if (target) {
        const navHeight = 60;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - navHeight - 20;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        if (window.innerWidth < 768) {
          document.getElementById("toc-panel").classList.remove("active");
        }
      }
    });

    tocContent.appendChild(link);
  });
}
async function loadConfig() {
  const pageIcon = document.getElementById("favicon");
  const navTitle = document.getElementById("navTitle");
  const bannerTitle = document.getElementById("bannerTitle");
  const profileCardAvatar = document.querySelector(
    ".profile-card .card-avatar"
  );
  const profileCardTitle = document.querySelector(".profile-card .card-title");
  const profileCardDesc = document.querySelector(
    ".profile-card .card-description"
  );

  try {
    const ConfigPath = "../config.json";

    const response = await fetch(ConfigPath);
    if (!response.ok) {
      throw new Error(`ERROR:状态码: ${response.status}`);
    }
    const config = await response.json();
    if (config.title) document.title = `${config.title} | Blog`;
    if (pageIcon && config.blog?.icon) {
      pageIcon.href = `${formatPath(config.blog.icon)}?v=1`;
    }
    if (navTitle && config.blog?.titleEng)
      navTitle.innerHTML = `<strong>${config.title}</strong>|${config.blog.titleEng}`;
    if (bannerTitle && config.blog?.pageHead?.content) {
      const pageHead = config.blog.pageHead;
      let content = "";
      if (pageHead.random) {
        //TODO:写完
      } else {
        content = pageHead.content[0];
      }
      if (pageHead.typed) {
        //TODO:写完
      }
      bannerTitle.innerHTML = content;
    }
    if (profileCardAvatar && config.masterInfo?.avatar) {
      profileCardAvatar.style.backgroundImage = `url(${formatPath(
        config.masterInfo.avatar
      )})`;
    }
    if (profileCardTitle && config.masterInfo?.name) {
      const name = config.masterInfo?.name;
      if (name.zh) profileCardTitle.innerHTML = name.zh;
    }
    if (profileCardDesc && config.masterInfo?.description) {
      profileCardDesc.innerHTML = config.masterInfo?.description;
    }
  } catch (error) {
    console.error("配置加载失败", error);
  }
}
async function init() {
  await loadConfig();
  articlesInit();
  initSettingsToggle();
  initTOC();
}
document.addEventListener("DOMContentLoaded", () => {
  init();
});
