import { formatPath } from "./utils.js";
function renderTechStack() {
  const techStacks = document.querySelectorAll(".tech-stack");

  techStacks.forEach((techStack) => {
    const randomRotate = (Math.random() * 10 - 5).toFixed(2);

    const randomScale = (Math.random() * 0.1 + 0.95).toFixed(2);

    techStack.style.transform = `rotate(${randomRotate}deg) scale(${randomScale})`;
  });
}
function createSocialLinkCard(socialType, link) {
  const card = document.createElement("a");
  card.className = "link-card";
  card.href = link ? link : "#";
  card.target = "_blank";
  card.title = socialType ? socialType : "?";
  let icon = "";
  switch (socialType.toLowerCase()) {
    case "email":
      icon = "../assets/img/svg/icon/email.svg";
      break;
    case "qq":
      icon = "../assets/img/svg/icon/qq.svg";
      break;
    case "x":
      icon = "../assets/img/svg/icon/X.svg";
      break;
    case "github":
      icon = "../assets/img/svg/icon/github-fill.svg";
      break;
    case "bilibili":
      icon = "../assets/img/svg/icon/bilibili.svg";
      break;
    case "telegram":
      icon = "../assets/img/svg/icon/telegram.svg";
      break;
  }
  card.innerHTML = `
  <img class="icon" src="${icon}" />
  <h2>${socialType}</h2>
  `;
  return card;
}
function createFriendLinkCard(friendLink = {}) {
  const card = document.createElement("a");
  card.className = "friend-card";
  card.href = friendLink.link ? friendLink.link : "#";
  card.target = "_blank";
  card.title = friendLink.desc ? friendLink.desc : "友人のサイト";
  card.innerHTML = `<div class="left">
                <div class="avatar-container">
                  <img
                    class="avatar"
                    alt="Avatar"
                    src=${
                      friendLink.avatar ? formatPath(friendLink.avatar) : ""
                    }
                  />
                </div>
              </div>
              <div class="right">
                <h2 class="page-title">${
                  friendLink.siteName ? friendLink.siteName : "友人の站点"
                }</h2>
                <span class="page-owner">${
                  friendLink.ownerName ? friendLink.ownerName : "未知"
                }</span>
              </div>`;
  return card;
}
async function loadConfig() {
  const sideName = document.querySelector(".navigation .side-name");
  const headerAvatar = document.querySelector(".home-header .avatar");
  const headerTitle = document.getElementById("headerTitle");
  const headerSubTitle = document.getElementById("headerSubTitle");
  const headerNameZh = document.getElementById("name-zh");
  const headerNameEn = document.getElementById("name-en");
  const headerNameJa = document.getElementById("name-ja");
  const aboutMePostergirl = document.querySelector(".postergirl");
  const aboutMeContainer = document.querySelector(".about-container");
  const worksCardContainer = document.querySelector(
    ".works-wrapper .cards-container"
  );
  const techStackWrapper = document.querySelector(".tech-stack-wrapper");
  const friendsWrapper = document.querySelector(".friends-wrapper");
  const getTouchMeLinkWrapper = document.querySelector(
    ".getTouch-links-wrapper"
  );
  try {
    const ConfigPath = "../config.json";

    const response = await fetch(ConfigPath);
    if (!response.ok) {
      throw new Error(`ERROR:状态码: ${response.status}`);
    }
    const config = await response.json();

    if (config.title) document.title = `${config.title} | Home`;
    if (sideName) sideName.innerHTML = `${config.title}`;
    if (headerAvatar && config.masterInfo?.avatar) {
      headerAvatar.src = formatPath(config.masterInfo.avatar);
    }
    if (headerTitle && config.mainTitle) {
      headerTitle.innerHTML = `${config.mainTitle}`;
    }
    if (headerSubTitle && config.subTitle) {
      headerSubTitle.innerHTML = `${config.subTitle}`;
    }
    if (config.masterInfo?.name) {
      const name = config.masterInfo.name;
      if (name.zh) headerNameZh.innerHTML = `${name.zh}`;
      if (name.en) headerNameEn.innerHTML = `${name.en}`;
      if (name.ja) headerNameJa.innerHTML = `${name.ja}`;
    }
    if (aboutMeContainer && config.masterInfo?.aboutMe) {
      aboutMeContainer.innerHTML = "";
      const aboutMe = config.masterInfo.aboutMe;
      const postergirl = aboutMe.postergirl;
      const paragraphs = aboutMe.paragraphs;
      if (!paragraphs || !postergirl) return;
      aboutMePostergirl.src = postergirl;
      paragraphs.forEach((paragraph) => {
        const p = document.createElement("p");
        p.innerHTML = paragraph;
        aboutMeContainer.appendChild(p);
      });
    }
    if (worksCardContainer && config.masterInfo?.works) {
      worksCardContainer.innerHTML = "";
      const works = config.masterInfo.works;
      works.forEach((work) => {
        const card = document.createElement("div");
        card.className = "work-card";
        card.innerHTML = `
                <img class="img" src=${work.img ? formatPath(work.img) : ""} />
                <div class="texts">
                  <div class="content">
                    <h1 class="title">${work.title ? work.title : "作品"}</h1>
                    <span class="description"
                      >${work.desc ? work.desc : "作品の説明"}</span
                    >
                  </div>
                </div>`;
        worksCardContainer.appendChild(card);
      });
    }
    if (techStackWrapper && config.masterInfo?.techStack) {
      techStackWrapper.innerHTML = "";
      const techStacks = config.masterInfo.techStack;
      techStacks.forEach((techStack) => {
        const ts = document.createElement("span");
        ts.className = "tech-stack";
        ts.innerHTML = `${techStack}`;
        techStackWrapper.appendChild(ts);
      });
    }
    if (friendsWrapper && config.masterInfo?.friendLink) {
      const friendLinks = config.masterInfo.friendLink;
      friendsWrapper.innerHTML = "";
      friendLinks.forEach((link) => {
        friendsWrapper.appendChild(createFriendLinkCard(link));
      });
    }
    if (getTouchMeLinkWrapper && config.masterInfo?.socialLink) {
      const socialLinks = config.masterInfo.socialLink;
      const enableList = socialLinks.enable;
      const links = socialLinks.link;
      getTouchMeLinkWrapper.innerHTML = "";
      if (!enableList || !links) return;
      enableList.forEach((socialType) => {
        const link = links[socialType.toLowerCase()];
        getTouchMeLinkWrapper.appendChild(
          createSocialLinkCard(socialType, link)
        );
      });
    }
  } catch (error) {
    console.error("配置加载失败", error);
  }
}
async function init() {
  await loadConfig();
  renderTechStack();
}
window.addEventListener("DOMContentLoaded", () => {
  init();
});
