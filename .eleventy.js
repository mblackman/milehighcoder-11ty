const { format, formatISO, getYear } = require("date-fns");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginToc = require("eleventy-plugin-toc");
const { MD5 } = require("crypto-js");
const { URL } = require("url");
const { readFileSync } = require("fs");
const siteconfig = require("./content/_data/siteconfig.js");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const Image = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
    // Add global configs
    eleventyConfig.addGlobalData("rootURL", "https://www.milehighcoder.com");

    // Set Markdown library
    eleventyConfig.setLibrary(
        "md",
        markdownIt({
            html: true,
            xhtmlOut: true,
            linkify: true,
            typographer: true
        }).use(markdownItAnchor)
    );

    // Define passthrough for assets
    eleventyConfig.addPassthroughCopy("assets");

    // Add watch target for JS files (needed for JS bundling in dev mode)
    eleventyConfig.addWatchTarget("./assets/js/");
    // And to make this work we've to disable the .gitignore usage of eleventy.
    eleventyConfig.setUseGitIgnore(false);

    // Add 3rd party plugins
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginToc);

    // Define 11ty template formats
    eleventyConfig.setTemplateFormats([
        "njk",
        "md",
        "svg",
        "jpg",
        "css",
        "png"
    ]);

    // Generate excerpt from first paragraph
    eleventyConfig.addShortcode("excerpt", (article) =>
        extractExcerpt(article)
    );

    // Set absolute url
    eleventyConfig.addNunjucksFilter("absoluteUrl", (path) => {
        return new URL(path, siteconfig.url).toString();
    });

    // Extract reading time
    eleventyConfig.addNunjucksFilter("readingTime", (wordcount) => {
        let readingTime = Math.ceil(wordcount / 220);
        if (readingTime === 1) {
            return readingTime + " minute";
        }
        return readingTime + " minutes";
    });

    // Extract word count
    eleventyConfig.addNunjucksFilter("formatWords", (wordcount) => {
        return wordcount.toLocaleString("en");
    });

    // Returns CSS class for home page link
    eleventyConfig.addNunjucksFilter("isHomeLink", function (url, pattern) {
        return (pattern === "/" && url === "/") ||
            (pattern === "/" && url.startsWith("/about"))
            ? "active"
            : "";
    });

    // Returns CSS class for active page link
    eleventyConfig.addNunjucksFilter("isActiveLink", function (url, pattern) {
        return url.length > 1 && url.startsWith(pattern) ? "active" : "";
    });

    // Format dates for sitemap
    eleventyConfig.addNunjucksFilter("sitemapdate", function (date) {
        return format(date, "yyyy-MM-dd");
    });

    // Format dates for JSON-LD
    eleventyConfig.addNunjucksFilter("isodate", function (date) {
        return formatISO(date);
    });

    // Extracts the year from a post
    eleventyConfig.addNunjucksFilter("year", function (post) {
        if (post && post.date) {
            return getYear(post.date);
        }
        return "n/a";
    });

    // Extracts the day of a date
    eleventyConfig.addNunjucksFilter("day", function (date) {
        return format(date, "dd");
    });

    // Extracts the month of a date
    eleventyConfig.addNunjucksFilter("month", function (date) {
        return format(date, "MMM");
    });

    // Extracts readable date of a date
    eleventyConfig.addNunjucksFilter("readableDate", function (date) {
        return date instanceof Date ? format(date, "MMM dd, yyyy") : date;
    });

    eleventyConfig.addNunjucksFilter("techPill", function (name) {
        switch (name) {
            case "C#":
                return "#A279DD";
            case "Godot":
                return "#478CBF";
            case "Javascript":
                return "#F9DC5C";
            case "Unity":
                return "#E84855";
            case "Eleventy":
                return "#4C9F70";
            case "Nunjacks":
                return "#D7263D";
            case "HTML/CSS":
                return "#0CF574";
            case "Prototype":
                return "#15E6CD";
            default:
                return "#6f1b85";
        }
    });

    eleventyConfig.addNunjucksFilter("contrastColor", function (bgColor) {
        // Convert the background color to RGB
        const r = parseInt(bgColor.slice(1, 3), 16);
        const g = parseInt(bgColor.slice(3, 5), 16);
        const b = parseInt(bgColor.slice(5, 7), 16);

        // Calculate the perceived brightness of the color
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        // Return either black or white depending on the brightness
        return brightness > 128 ? "black" : "white";
    });

    eleventyConfig.addShortcode("image", async function (src, alt, sizes) {
        let metadata = await Image(src, {
            widths: [300, 600],
            formats: ["avif", "jpeg"]
        });

        let imageAttributes = {
            alt,
            sizes,
            loading: "lazy",
            decoding: "async"
        };

        // You bet we throw an error on a missing alt (alt="" works okay)
        return Image.generateHTML(metadata, imageAttributes);
    });

    // Add custom hash for cache busting
    const hashes = new Map();
    eleventyConfig.addNunjucksFilter("addHash", function (absolutePath) {
        const cached = hashes.get(absolutePath);
        if (cached) {
            return `${absolutePath}?hash=${cached}`;
        }
        const fileContent = readFileSync(`${process.cwd()}${absolutePath}`, {
            encoding: "utf-8"
        }).toString();
        const hash = MD5(fileContent.toString());
        hashes.set(absolutePath, hash);
        return `${absolutePath}?hash=${hash}`;
    });

    // Create custom collection for getting the newest 5 updates
    eleventyConfig.addCollection("recents", function (collectionApi) {
        return collectionApi
            .getAll()
            .filter((item) => item.data.tags && item.data.tags.includes("blog")) // Modify this filter condition
            .reverse()
            .slice(0, 5);
    });

    // Plugin for setting _blank and rel=noopener on external links in markdown content
    eleventyConfig.addPlugin(require("./_11ty/external-links.js"));

    // Plugin for minifying HTML
    eleventyConfig.addPlugin(require("./_11ty/html-minify.js"));

    eleventyConfig.addFilter("matches", function (arr = [], key = "", value) {
        return arr?.filter((item) => item.data[key] === value);
    });

    return {
        dir: {
            // Consolidating everything below the `content` folder
            input: "content"
        }
    };
};

// Taken from here => https://keepinguptodate.com/pages/2019/06/creating-blog-with-eleventy/
function extractExcerpt(article) {
    if (!Object.prototype.hasOwnProperty.call(article, "templateContent")) {
        console.warn(
            'Failed to extract excerpt: Document has no property "templateContent".'
        );
        return null;
    }

    const content = article.templateContent;

    const excerpt = content.slice(0, content.indexOf("\n"));

    return excerpt;
}
