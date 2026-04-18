const markdownIt = require("markdown-it");
const matter = require("gray-matter");
const fs = require("fs");

const md = markdownIt({ html: false, breaks: true, linkify: false });

module.exports = function(eleventyConfig) {
  // Markdown 렌더링 필터
  eleventyConfig.addFilter("markdownify", (str) => md.render(str || ""));

  // 법령 Markdown 파일 읽기 필터 (개별 법령 페이지용)
  eleventyConfig.addFilter("readLawFile", (absPath) => {
    try {
      const raw = fs.readFileSync(absPath, "utf-8");
      const parsed = matter(raw);
      return md.render(parsed.content || "");
    } catch (e) {
      return "<p>법령 파일을 읽을 수 없습니다.</p>";
    }
  });

  // 기존 HTML 파일을 passthrough로 처리 (템플릿으로 해석하지 않음)
  eleventyConfig.addPassthroughCopy("index.html");
  eleventyConfig.addPassthroughCopy("about.html");
  eleventyConfig.addPassthroughCopy("404.html");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("llms.txt");
  eleventyConfig.addPassthroughCopy("stats.json");
  eleventyConfig.addPassthroughCopy(".nojekyll");

  // CSS 및 이미지 뷰어 페이지
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy({ "images/index.html": "images/index.html" });

  // 샤딩된 데이터 파일 (public/data/ → _site/data/)
  eleventyConfig.addPassthroughCopy({ "public/data": "data" });

  // 로컬 이미지 서빙 (개발용 심링크)
  eleventyConfig.addPassthroughCopy({ "local-images": "local-images" });

  return {
    templateFormats: ["njk", "md"],
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
  };
};
