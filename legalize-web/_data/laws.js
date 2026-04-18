/**
 * Eleventy global data: loads law metadata from legalize-kr repository.
 * Returns an array of law objects for use in templates.
 */
const path = require("path");
const fs = require("fs");

// legalize-kr is a sibling directory of legalize-web
const LEGALIZE_KR_ROOT = path.resolve(__dirname, "../../legalize-kr");
const METADATA_PATH = path.join(LEGALIZE_KR_ROOT, "metadata.json");

module.exports = function () {
  if (!fs.existsSync(METADATA_PATH)) {
    console.warn("[laws.js] metadata.json not found at:", METADATA_PATH);
    return [];
  }

  const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, "utf-8"));

  return Object.entries(metadata).map(([mst, data]) => {
    // Normalize Windows backslash path separators
    const relPath = data.path.replace(/\\/g, "/");
    const dirName = relPath.split("/")[1]; // e.g. "민법"
    const fileName = relPath.split("/")[2]; // e.g. "법률.md"
    const fileBase = fileName ? fileName.replace(".md", "") : "";

    return {
      mst,
      title: data["제목"] || "",
      lawType: data["법령구분"] || "",
      lawTypeCode: data["법령구분코드"] || "",
      ministry: Array.isArray(data["소관부처"])
        ? data["소관부처"]
        : [data["소관부처"]].filter(Boolean),
      promulgatedAt: data["공포일자"] || "",
      enforcedAt: data["시행일자"] || "",
      status: data["상태"] || "",
      path: relPath,
      dirName,
      fileBase,
      githubUrl: `https://github.com/legalize-kr/legalize-kr/blob/main/${relPath}`,
      lawGoKrUrl: data["출처"] || "",
      absPath: path.join(LEGALIZE_KR_ROOT, relPath),
    };
  });
};
