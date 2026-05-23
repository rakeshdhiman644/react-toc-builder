import createDOMPurify from "dompurify";

/**
 * Create a single DOMPurify instance for browser usage.
 * During SSR (Next.js server render), return null safely.
 */
const DOMPurifyInstance =
  typeof window !== "undefined"
    ? createDOMPurify(window)
    : null;

/**
 * Safely sanitize HTML/SVG.
 * On server-side render, return original HTML to avoid hydration mismatch.
 */
function sanitize(html, options = {}) {
  if (!DOMPurifyInstance) {
    return html;
  }

  return DOMPurifyInstance.sanitize(html, options);
}

/**
 * Sanitizes SVG content safely.
 */
function sanitizeSvg(svgStr) {
  return sanitize(svgStr, {
    USE_PROFILES: { svg: true },
  });
}

/**
 * Escapes text for safe HTML attribute usage.
 */
function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Generate stable SEO-friendly heading IDs.
 */
function createHeadingId(text, index) {
  const safeText = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  return `rtb-${safeText || "heading"}-${index}`;
}

/**
 * Generates a Table of Contents (TOC) from HTML content.
 */
export function generateToc(contentHtml, positionAfter = 0, icon = null) {
  // Validate input
  if (typeof contentHtml !== "string") {
    console.warn(
      "[react-toc-builder] generateToc() expects a string."
    );

    return typeof contentHtml === "number"
      ? String(contentHtml)
      : "";
  }

  // Sanitize incoming HTML
  contentHtml = sanitize(contentHtml, {
    USE_PROFILES: { html: true },
  });

  /**
   * Default SVG icon
   */
  const defaultIcon = `
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `;

  /**
   * Safe icon handling
   */
  let iconHtml;

  if (!icon) {
    iconHtml = defaultIcon;
  } else if (
    typeof icon === "string" &&
    icon.trim().startsWith("<svg")
  ) {
    iconHtml = sanitizeSvg(icon);
  } else if (
    typeof icon === "string" &&
    (
      icon.startsWith("/") ||
      icon.startsWith("data:image/")
    )
  ) {
    iconHtml = `
      <img
        src="${escapeAttr(icon)}"
        alt="toggle-icon"
        width="18"
        height="18"
      />
    `;
  } else {
    iconHtml = defaultIcon;
  }

  /**
   * Styles
   */
  const styleBlock = `
<style data-rtb-style="1">
.rtb-toc {
  box-sizing: border-box;
  border: 1px solid #d1d5db;
  padding: 10px 15px;
  border-radius: 5px;
  display: inline-block;
  box-shadow:
    0 2px 8px rgba(0,0,0,.08),
    0 1px 2px rgba(0,0,0,.04);
  min-width: 240px;
  max-width: 440px;
  background: #fff;
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
  margin-bottom: 1rem;
}

.rtb-toc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.rtb-toc-header b {
  font-size: 0.92rem;
  font-weight: 700;
  color: #111827;
}

.rtb-toggle-btn {
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: #6b7280;
  transition: background .15s ease, color .15s ease;
}

.rtb-toggle-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.rtb-toggle-btn svg,
.rtb-toggle-btn img {
  display: block;
  transition: transform .25s ease;
  pointer-events: none;
}

.rtb-toggle-btn.rtb-open svg,
.rtb-toggle-btn.rtb-open img {
  transform: rotate(180deg);
}

.rtb-toc-list {
  display: none;
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  border-top: 1px solid #e5e7eb;
  padding-top: 10px;
}

.rtb-toc-list .rtb-toc-list {
  display: block;
  margin: 4px 0 0 14px;
  padding-left: 10px;
  border-left: 2px solid #e5e7eb;
  border-top: none;
}

.rtb-toc-item {
  list-style: none;
  line-height: 1.4;
}

.rtb-toc-item + .rtb-toc-item {
  margin-top: 2px;
}

.rtb-toc-item a {
  text-decoration: none;
  color: #374151;
  display: flex;
  align-items: baseline;
  padding: 4px 8px;
  border-radius: 6px;
  transition:
    background .12s ease,
    color .12s ease;
  font-size: .875rem;
}

.rtb-toc-item a:hover {
  color: #2563eb;
  background: #eff6ff;
}

.rtb-toc-item a.active {
  color: #1d4ed8;
  background: #dbeafe;
  font-weight: 600;
}

.rtb-toc-item.rtb-level-2 > a {
  font-size: .9rem;
  font-weight: 600;
  color: #1f2937;
}

.rtb-toc-number {
  display: inline-block;
  min-width: 1.6em;
  margin-right: 5px;
  font-weight: 500;
  color: #9ca3af;
  font-size: .82em;
}
</style>
`;

  /**
   * TOC Wrapper
   */
  let tocHtml = `
${styleBlock}

<div class="rtb-toc">
  <div class="rtb-toc-header">
    <b>Table of Contents</b>

    <button
      data-toc-toggle
      class="rtb-toggle-btn"
      aria-label="Toggle TOC"
    >
      ${iconHtml}
    </button>
  </div>

  <ul class="rtb-toc-list" style="display:none;">
`;

  /**
   * Extract headings
   */
  const headingRegex = /<h([2-6])[^>]*>(.*?)<\/h\1>/gis;

  let match;

  const headings = [];

  while ((match = headingRegex.exec(contentHtml)) !== null) {
    const level = parseInt(match[1]);

    const rawInner = sanitize(match[2], {
      USE_PROFILES: { html: true },
    });

    const text = rawInner
      .replace(/<[^>]+>/g, "")
      .trim();

    if (!text) continue;

    headings.push({
      level,
      text,
      rawInner,
      index: match.index,
      length: match[0].length,
    });
  }

  /**
   * Inject heading IDs
   */
  let contentWithIds = contentHtml;

  const headingNodes = [];

  [...headings]
    .reverse()
    .forEach((h, ri) => {
      const orderIndex =
        headings.length - 1 - ri;

      const id = createHeadingId(
        h.text,
        orderIndex
      );

      contentWithIds =
        contentWithIds.slice(0, h.index) +
        `<h${h.level} id="${id}">${h.rawInner}</h${h.level}>` +
        contentWithIds.slice(h.index + h.length);

      headingNodes.unshift({
        level: h.level,
        text: h.text,
        id,
        children: [],
      });
    });

  /**
   * Build heading tree
   */
  const root = {
    level: 0,
    children: [],
  };

  const stack = [root];

  headingNodes.forEach((heading) => {
    while (
      stack.length > 1 &&
      stack[stack.length - 1].level >= heading.level
    ) {
      stack.pop();
    }

    stack[stack.length - 1]
      .children
      .push(heading);

    stack.push(heading);
  });

  /**
   * Recursive TOC renderer
   */
  function renderList(items, prefix = "") {
    if (!items.length) return "";

    let html = "";

    items.forEach((item, index) => {
      const num = index + 1;

      const itemLabel = prefix
        ? `${prefix}.${num}`
        : `${num}`;

      const displayLabel = prefix
        ? itemLabel
        : `${itemLabel}.`;

      html += `
<li class="rtb-toc-item rtb-level-${item.level}">
  <a href="#${item.id}">
    <span class="rtb-toc-number">
      ${displayLabel}
    </span>

    ${escapeAttr(item.text)}
  </a>

  ${item.children.length
          ? `
      <ul class="rtb-toc-list">
        ${renderList(item.children, itemLabel)}
      </ul>
    `
          : ""
        }
</li>
`;
    });

    return html;
  }

  tocHtml += renderList(root.children);

  tocHtml += `
  </ul>
</div>
`;

  /**
   * Insert TOC after paragraph
   */
  if (positionAfter >= 0) {
    const paragraphRegex =
      /(<p[^>]*>.*?<\/p>)/gis;

    const paragraphs = [
      ...contentWithIds.matchAll(
        paragraphRegex
      ),
    ];

    if (paragraphs.length > positionAfter) {
      const target =
        paragraphs[positionAfter];

      const insertAt =
        target.index + target[0].length;

      contentWithIds =
        contentWithIds.slice(0, insertAt) +
        tocHtml +
        contentWithIds.slice(insertAt);
    } else {
      contentWithIds += tocHtml;
    }
  } else {
    contentWithIds =
      tocHtml + contentWithIds;
  }

  return contentWithIds;
}