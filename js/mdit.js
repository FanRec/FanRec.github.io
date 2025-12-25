import markdownit from "https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm";
const mdIt = markdownit({
  html: true,
  linkify: true,
  typographer: true,
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
/* 识别 > [!TIP] / [!NOTE] / [!IMPORTANT] / [!WARNING] / [!CAUTION] */
function admonitionPlugin(md) {
  const RE = /^\[!(TIP|NOTE|IMPORTANT|WARNING|CAUTION)\]\s*/i;

  md.core.ruler.after("block", "admonition", function (state) {
    const tokens = state.tokens;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type !== "blockquote_open") continue;
      const inlineToken = tokens[i + 2];
      if (!inlineToken || inlineToken.type !== "inline") continue;

      const match = inlineToken.content.match(RE);
      if (!match) continue;

      const type = match[1].toLowerCase();
      const titleText = match[1].toUpperCase();

      token.tag = "div";
      token.attrSet("class", `admonition ${type}`);
      token.attrSet("data-type", type);

      for (let j = i + 1; j < tokens.length; j++) {
        if (tokens[j].type === "blockquote_close") {
          tokens[j].tag = "div";
          break;
        }
      }
      inlineToken.content = inlineToken.content.replace(RE, "").trim();

      const titleOpen = new state.Token("div_open", "div", 1);
      titleOpen.attrSet("class", "admonition-title");

      const titleInline = new state.Token("inline", "", 0);
      titleInline.content = titleText;
      titleInline.children = [];

      const titleClose = new state.Token("div_close", "div", -1);

      tokens.splice(i + 1, 0, titleOpen, titleInline, titleClose);
      i += 3;
    }
  });
}
function localImagePrefixPlugin(md, options = {}) {
  const prefix = options.prefix || "../assets/articles/markdown/";

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

export default mdIt;
