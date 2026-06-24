const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/assets");

  // Date filter
  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  // Sort products by order
  eleventyConfig.addFilter("sortByOrder", (arr) => {
    if (!arr) return [];
    return [...arr].sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });

  return {
    dir: {
      input: "src",
      output: "deploy",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
  };
};
