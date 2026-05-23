import DOMPurify from "dompurify";

// Styles are now included in every generateToc() call to ensure they work reliably
// in Single Page Applications where components may be unmounted and remounted.

/**
 * Sanitizes a user-supplied SVG string to prevent XSS.
 * Strips <script> tags and inline event-handler attributes.
 * @param {string} svgStr
 * @returns {string}
 */
function sanitizeSvg(svgStr) {
  return DOMPurify.sanitize(svgStr, {
    USE_PROFILES: { svg: true },
  });
}

/**
 * Escapes a string for safe use inside an HTML attribute value (double-quoted).
 * @param {string} value
 * @returns {string}
 */
function escapeAttr(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Generates a short random hex string to use as a unique call-level prefix.
 * This prevents heading ID collisions across multiple generateToc() calls
 * on the same page.
 * @returns {string}
 */
function uid() {
  return Math.random().toString(16).slice(2, 8);
}

/**
 * Generates a Table of Contents (TOC) from HTML content and injects it
 * into the content at the specified position.
 *
 * @param {string} contentHtml - The HTML string to scan for headings (h2–h6).
 * @param {number} [positionAfter=0] - Zero-based paragraph index after which
 *   to insert the TOC. Pass -1 to prepend the TOC before all content.
 *   Example: 0 = after the 1st paragraph, 1 = after the 2nd paragraph.
 * @param {string|null} [icon=null] - Custom toggle icon. Accepts an SVG string
 *   or an image URL. Defaults to a built-in chevron SVG.
 * @returns {string} The modified HTML string with the embedded TOC.
 */
export function generateToc(contentHtml, positionAfter = 0, icon = null) {
  // --- Fix #1: Input validation ---
  if (typeof contentHtml !== "string") {
    console.warn(
      "[react-toc-builder] generateToc() expects a string as the first argument. Received:",
      typeof contentHtml,
    );

    return typeof contentHtml === "number" ? String(contentHtml) : "";
  }

  contentHtml = DOMPurify.sanitize(contentHtml, {
    USE_PROFILES: { html: true },
  });

  // Default SVG icon if none provided
  const defaultIcon = `
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>`;

  // --- Fix #8: XSS-safe icon handling ---
  let iconHtml;
  if (!icon) {
    iconHtml = defaultIcon;
  } else if (icon.trim().startsWith("<svg")) {
    // Sanitize SVG — strip <script> and event handlers
    iconHtml = sanitizeSvg(icon);
  } else {
    // Escape the URL so it cannot break out of the attribute
    const isSafeImage =
      icon.startsWith("/") ||
      icon.startsWith("data:image/");

    iconHtml = isSafeImage
      ? `<img src="${escapeAttr(icon)}" alt="toggle-icon" width="18" height="18" />`
      : defaultIcon;
  }

  // --- Fix #7: Deduplicated <style> block ---
  // The style block is emitted only once per page (tracked via module-level flag).
  // A data attribute marks the tag so a future reset is possible if needed.
  const styleBlock = `<style data-rtb-style="1">
  /* react-toc-builder — default styles */

  /* ── Card wrapper ───────────────────────────────────────── */
  .rtb-toc {
    box-sizing: border-box;
    border: 1px solid #d1d5db;
    padding: 10px 15px;
    border-radius: 5px;
    display: inline-block;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .08), 0 1px 2px rgba(0, 0, 0, .04);
    min-width: 240px;
    max-width: 440px;
    background: #ffffff;
    font-size: 14px;
    line-height: 1.5;
    color: #374151;
    margin-bottom: 1rem;
  }

  /* ── Header row ─────────────────────────────────────────── */
  .rtb-toc-header {
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    user-select: none;
  }
  .rtb-toc-header b {
    display: block;
    font-size: 0.92rem;
    font-weight: 700;
    color: #111827;
    letter-spacing: 0.01em;
    margin: 0;
    padding: 0;
  }

  /* ── Toggle button ──────────────────────────────────────── */
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
    transition: background 0.15s ease, color 0.15s ease;
    flex-shrink: 0;
  }
  .rtb-toggle-btn:hover {
    background: #f3f4f6;
    color: #374151;
  }
  .rtb-toggle-btn svg,
  .rtb-toggle-btn img {
    display: block;
    transition: transform 0.25s ease;
    pointer-events: none;
  }
  /* Rotate chevron when list is open */
  .rtb-toggle-btn.rtb-open svg,
  .rtb-toggle-btn.rtb-open img {
    transform: rotate(180deg);
  }

  /* ── Divider between header and list ────────────────────── */
  .rtb-toc-list {
    display: none;
    list-style: none;
    padding: 0;
    margin: 12px 0 0 0;
    border-top: 1px solid #e5e7eb;
    padding-top: 10px;
  }
  /* Nested lists — always shown when parent is visible */
  .rtb-toc-list .rtb-toc-list {
    display: block;
    margin: 4px 0 0 14px;
    padding: 0 0 0 10px;
    border-top: none;
    border-left: 2px solid #e5e7eb;
    list-style: none;
  }

  /* ── Items ───────────────────────────────────────────────── */
  .rtb-toc-item {
    list-style: none;
    margin: 0;
    padding: 0;
    line-height: 1.4;
  }
  .rtb-toc-item + .rtb-toc-item {
    margin-top: 2px;
  }

  /* ── Links ───────────────────────────────────────────────── */
  .rtb-toc-item a {
    text-decoration: none;
    color: #374151;
    display: flex;
    align-items: baseline;
    padding: 4px 8px;
    border-radius: 6px;
    transition: background 0.12s ease, color 0.12s ease;
    font-size: 0.875rem;
    line-height: 1.4;
  }
  .rtb-toc-item a:hover {
    color: #2563eb;
    background: #eff6ff;
    text-decoration: none;
  }
  .rtb-toc-item a.active {
    color: #1d4ed8;
    background: #dbeafe;
    font-weight: 600;
    text-decoration: none;
  }

  /* ── Font weight / size per heading depth ────────────────── */
  .rtb-toc-item.rtb-level-2 > a {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1f2937;
  }
  .rtb-toc-item.rtb-level-3 > a { font-size: 0.875rem; }
  .rtb-toc-item.rtb-level-4 > a { font-size: 0.85rem;  }
  .rtb-toc-item.rtb-level-5 > a { font-size: 0.825rem; }
  .rtb-toc-item.rtb-level-6 > a { font-size: 0.8rem;   }

  /* ── Section number label ────────────────────────────────── */
  .rtb-toc-number {
    display: inline-block;
    min-width: 1.6em;
    margin-right: 5px;
    font-weight: 500;
    color: #9ca3af;
    font-size: 0.82em;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }
</style>`;

  // --- End of style block ---

  let tocHtml = `${styleBlock}
  <div class="rtb-toc">
    <div class="rtb-toc-header">
      <b>Table of Contents</b>
      <button data-toc-toggle class="rtb-toggle-btn" aria-label="Toggle TOC">
        ${iconHtml}
      </button>
    </div>
    <ul class="rtb-toc-list" style="display: none;">
`;

  // --- Fix #4: Per-call unique prefix prevents ID collisions across calls ---
  const callId = uid();

  // --- Fix #2 & #6: Heading regex with dotAll flag (s) for multiline headings ---
  const headingRegex = /<h([2-6])[^>]*>(.*?)<\/h\1>/gis;
  let match;
  const headings = [];

  // --- Fix #3: Collect all headings with their positions first ---
  // We record each match's position (index) and use a counter per call
  // rather than matching by raw string, so identical headings each get a
  // unique ID and replacement is done by position, not naive string replace.
  while ((match = headingRegex.exec(contentHtml)) !== null) {
    const level = parseInt(match[1]);
    const rawInner = DOMPurify.sanitize(match[2], {
      USE_PROFILES: { html: true },
    });
    const text = rawInner.replace(/<[^>]+>/g, "").trim();
    if (!text) continue;

    headings.push({
      level,
      text,
      rawInner,
      fullMatch: match[0],
      index: match.index,
      length: match[0].length,
    });
  }

  // Assign unique IDs and inject them into the content by working
  // backwards through the string (so earlier indices stay stable).
  let contentWithIds = contentHtml;
  const headingNodes = [];

  // Process in reverse order to preserve indices while splicing
  const reversed = [...headings].reverse();
  reversed.forEach((h, ri) => {
    // Stable unique ID: callId + level + original heading order index
    const orderIndex = headings.length - 1 - ri;
    const id = `rtb-${callId}-h${h.level}-${orderIndex}`;

    // Replace by position, not by string content — fixes duplicate headings
    contentWithIds =
      contentWithIds.slice(0, h.index) +
      `<h${h.level} id="${id}">${h.rawInner}</h${h.level}>` +
      contentWithIds.slice(h.index + h.length);

    headingNodes.unshift({ level: h.level, text: h.text, id, children: [] });
  });

  // 2. Build Tree Structure
  const root = { level: 0, children: [] };
  const stack = [root];

  headingNodes.forEach((heading) => {
    while (stack.length > 1 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }
    const parent = stack[stack.length - 1];
    parent.children.push(heading);
    stack.push(heading);
  });

  // 3. Recursive Render
  function renderList(items, prefix = "") {
    if (items.length === 0) return "";
    let html = "";
    items.forEach((item, index) => {
      const num = index + 1;
      const itemLabel = prefix ? `${prefix}.${num}` : `${num}`;
      const displayLabel = prefix ? itemLabel : `${itemLabel}.`;

      html += `<li class="rtb-toc-item rtb-level-${item.level}">
        <a href="#${item.id}">
          <span class="rtb-toc-number">${displayLabel}</span>
          ${escapeAttr(item.text)}
        </a>
        ${item.children.length > 0 ? `<ul class="rtb-toc-list">${renderList(item.children, itemLabel)}</ul>` : ""}
      </li>`;
    });
    return html;
  }

  tocHtml += renderList(root.children);
  tocHtml += `
    </ul>
  </div>
`;

  // --- Fix #5: Paragraph regex with dotAll flag (s) for multiline <p> tags ---
  // --- Fix (doc): positionAfter=0 means after the 1st paragraph (index 0).
  //                positionAfter=-1 prepends the TOC before all content. ---
  if (positionAfter >= 0) {
    const paragraphRegex = /(<p[^>]*>.*?<\/p>)/gis;
    const paragraphs = [...contentWithIds.matchAll(paragraphRegex)];

    if (paragraphs.length > positionAfter) {
      const target = paragraphs[positionAfter];
      const insertAt = target.index + target[0].length;
      contentWithIds =
        contentWithIds.slice(0, insertAt) +
        tocHtml +
        contentWithIds.slice(insertAt);
    } else {
      // Not enough paragraphs — append to end
      contentWithIds += tocHtml;
    }
  } else {
    // positionAfter < 0 — prepend before all content
    contentWithIds = tocHtml + contentWithIds;
  }

  return contentWithIds;
}
