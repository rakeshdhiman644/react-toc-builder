"use client";
'use strict';

var React = require('react');

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray(r);
}
function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

// Styles are now included in every generateToc() call to ensure they work reliably
// in Single Page Applications where components may be unmounted and remounted.

/**
 * Sanitizes a user-supplied SVG string to prevent XSS.
 * Strips <script> tags and inline event-handler attributes.
 * @param {string} svgStr
 * @returns {string}
 */
function sanitizeSvg(svgStr) {
  return svgStr.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\s(on\w+)=["'][^"']*["']/gi, "").replace(/\s(on\w+)=[^\s>]*/gi, "");
}

/**
 * Escapes a string for safe use inside an HTML attribute value (double-quoted).
 * @param {string} value
 * @returns {string}
 */
function escapeAttr(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
function generateToc(contentHtml) {
  var positionAfter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var icon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  // --- Fix #1: Input validation ---
  if (typeof contentHtml !== "string") {
    console.warn("[react-toc-builder] generateToc() expects a string as the first argument. Received:", _typeof(contentHtml));
    return typeof contentHtml === "number" ? String(contentHtml) : "";
  }

  // Default SVG icon if none provided
  var defaultIcon = "\n<svg\n  width=\"18\"\n  height=\"18\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"2\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\">\n  <polyline points=\"6 9 12 15 18 9\"></polyline>\n</svg>";

  // --- Fix #8: XSS-safe icon handling ---
  var iconHtml;
  if (!icon) {
    iconHtml = defaultIcon;
  } else if (icon.trim().startsWith("<svg")) {
    // Sanitize SVG — strip <script> and event handlers
    iconHtml = sanitizeSvg(icon);
  } else {
    // Escape the URL so it cannot break out of the attribute
    iconHtml = "<img src=\"".concat(escapeAttr(icon), "\" alt=\"toggle-icon\" width=\"18\" height=\"18\" />");
  }

  // --- Fix #7: Deduplicated <style> block ---
  // The style block is emitted only once per page (tracked via module-level flag).
  // A data attribute marks the tag so a future reset is possible if needed.
  var styleBlock = "<style data-rtb-style=\"1\">\n  /* react-toc-builder \u2014 default styles */\n\n  /* \u2500\u2500 Card wrapper \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  .rtb-toc {\n    box-sizing: border-box;\n    border: 1px solid #d1d5db;\n    padding: 10px 15px;\n    border-radius: 5px;\n    display: inline-block;\n    box-shadow: 0 2px 8px rgba(0, 0, 0, .08), 0 1px 2px rgba(0, 0, 0, .04);\n    min-width: 240px;\n    max-width: 440px;\n    background: #ffffff;\n    font-size: 14px;\n    line-height: 1.5;\n    color: #374151;\n    margin-bottom: 1rem;\n  }\n\n  /* \u2500\u2500 Header row \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  .rtb-toc-header {\n    margin: 0;\n    padding: 0;\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 10px;\n    user-select: none;\n  }\n  .rtb-toc-header b {\n    display: block;\n    font-size: 0.92rem;\n    font-weight: 700;\n    color: #111827;\n    letter-spacing: 0.01em;\n    margin: 0;\n    padding: 0;\n  }\n\n  /* \u2500\u2500 Toggle button \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  .rtb-toggle-btn {\n    all: unset;\n    cursor: pointer;\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    width: 28px;\n    height: 28px;\n    border-radius: 6px;\n    color: #6b7280;\n    transition: background 0.15s ease, color 0.15s ease;\n    flex-shrink: 0;\n  }\n  .rtb-toggle-btn:hover {\n    background: #f3f4f6;\n    color: #374151;\n  }\n  .rtb-toggle-btn svg,\n  .rtb-toggle-btn img {\n    display: block;\n    transition: transform 0.25s ease;\n    pointer-events: none;\n  }\n  /* Rotate chevron when list is open */\n  .rtb-toggle-btn.rtb-open svg,\n  .rtb-toggle-btn.rtb-open img {\n    transform: rotate(180deg);\n  }\n\n  /* \u2500\u2500 Divider between header and list \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  .rtb-toc-list {\n    display: none;\n    list-style: none;\n    padding: 0;\n    margin: 12px 0 0 0;\n    border-top: 1px solid #e5e7eb;\n    padding-top: 10px;\n  }\n  /* Nested lists \u2014 always shown when parent is visible */\n  .rtb-toc-list .rtb-toc-list {\n    display: block;\n    margin: 4px 0 0 14px;\n    padding: 0 0 0 10px;\n    border-top: none;\n    border-left: 2px solid #e5e7eb;\n    list-style: none;\n  }\n\n  /* \u2500\u2500 Items \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  .rtb-toc-item {\n    list-style: none;\n    margin: 0;\n    padding: 0;\n    line-height: 1.4;\n  }\n  .rtb-toc-item + .rtb-toc-item {\n    margin-top: 2px;\n  }\n\n  /* \u2500\u2500 Links \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  .rtb-toc-item a {\n    text-decoration: none;\n    color: #374151;\n    display: flex;\n    align-items: baseline;\n    padding: 4px 8px;\n    border-radius: 6px;\n    transition: background 0.12s ease, color 0.12s ease;\n    font-size: 0.875rem;\n    line-height: 1.4;\n  }\n  .rtb-toc-item a:hover {\n    color: #2563eb;\n    background: #eff6ff;\n    text-decoration: none;\n  }\n  .rtb-toc-item a.active {\n    color: #1d4ed8;\n    background: #dbeafe;\n    font-weight: 600;\n    text-decoration: none;\n  }\n\n  /* \u2500\u2500 Font weight / size per heading depth \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  .rtb-toc-item.rtb-level-2 > a {\n    font-size: 0.9rem;\n    font-weight: 600;\n    color: #1f2937;\n  }\n  .rtb-toc-item.rtb-level-3 > a { font-size: 0.875rem; }\n  .rtb-toc-item.rtb-level-4 > a { font-size: 0.85rem;  }\n  .rtb-toc-item.rtb-level-5 > a { font-size: 0.825rem; }\n  .rtb-toc-item.rtb-level-6 > a { font-size: 0.8rem;   }\n\n  /* \u2500\u2500 Section number label \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n  .rtb-toc-number {\n    display: inline-block;\n    min-width: 1.6em;\n    margin-right: 5px;\n    font-weight: 500;\n    color: #9ca3af;\n    font-size: 0.82em;\n    font-variant-numeric: tabular-nums;\n    flex-shrink: 0;\n  }\n</style>";

  // --- End of style block ---

  var tocHtml = "".concat(styleBlock, "\n  <div class=\"rtb-toc\">\n    <div class=\"rtb-toc-header\">\n      <b>Table of Contents</b>\n      <button data-toc-toggle class=\"rtb-toggle-btn\" aria-label=\"Toggle TOC\">\n        ").concat(iconHtml, "\n      </button>\n    </div>\n    <ul class=\"rtb-toc-list\" style=\"display: none;\">\n");

  // --- Fix #4: Per-call unique prefix prevents ID collisions across calls ---
  var callId = uid();

  // --- Fix #2 & #6: Heading regex with dotAll flag (s) for multiline headings ---
  var headingRegex = /<h([2-6])[^>]*>([^]*?)<\/h\1>/gi;
  var match;
  var headings = [];

  // --- Fix #3: Collect all headings with their positions first ---
  // We record each match's position (index) and use a counter per call
  // rather than matching by raw string, so identical headings each get a
  // unique ID and replacement is done by position, not naive string replace.
  while ((match = headingRegex.exec(contentHtml)) !== null) {
    var level = parseInt(match[1]);
    var rawInner = match[2];
    var text = rawInner.replace(/<[^>]+>/g, "").trim();
    if (!text) continue;
    headings.push({
      level: level,
      text: text,
      rawInner: rawInner,
      fullMatch: match[0],
      index: match.index,
      length: match[0].length
    });
  }

  // Assign unique IDs and inject them into the content by working
  // backwards through the string (so earlier indices stay stable).
  var contentWithIds = contentHtml;
  var headingNodes = [];

  // Process in reverse order to preserve indices while splicing
  var reversed = [].concat(headings).reverse();
  reversed.forEach(function (h, ri) {
    // Stable unique ID: callId + level + original heading order index
    var orderIndex = headings.length - 1 - ri;
    var id = "rtb-".concat(callId, "-h").concat(h.level, "-").concat(orderIndex);

    // Replace by position, not by string content — fixes duplicate headings
    contentWithIds = contentWithIds.slice(0, h.index) + "<h".concat(h.level, " id=\"").concat(id, "\">").concat(h.rawInner, "</h").concat(h.level, ">") + contentWithIds.slice(h.index + h.length);
    headingNodes.unshift({
      level: h.level,
      text: h.text,
      id: id,
      children: []
    });
  });

  // 2. Build Tree Structure
  var root = {
    level: 0,
    children: []
  };
  var stack = [root];
  headingNodes.forEach(function (heading) {
    while (stack.length > 1 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }
    var parent = stack[stack.length - 1];
    parent.children.push(heading);
    stack.push(heading);
  });

  // 3. Recursive Render
  function renderList(items) {
    var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    if (items.length === 0) return "";
    var html = "";
    items.forEach(function (item, index) {
      var num = index + 1;
      var itemLabel = prefix ? "".concat(prefix, ".").concat(num) : "".concat(num);
      var displayLabel = prefix ? itemLabel : "".concat(itemLabel, ".");
      html += "<li class=\"rtb-toc-item rtb-level-".concat(item.level, "\">\n        <a href=\"#").concat(item.id, "\">\n          <span class=\"rtb-toc-number\">").concat(displayLabel, "</span>").concat(item.text, "\n        </a>\n        ").concat(item.children.length > 0 ? "<ul class=\"rtb-toc-list\">".concat(renderList(item.children, itemLabel), "</ul>") : "", "\n      </li>");
    });
    return html;
  }
  tocHtml += renderList(root.children);
  tocHtml += "\n    </ul>\n  </div>\n";

  // --- Fix #5: Paragraph regex with dotAll flag (s) for multiline <p> tags ---
  // --- Fix (doc): positionAfter=0 means after the 1st paragraph (index 0).
  //                positionAfter=-1 prepends the TOC before all content. ---
  if (positionAfter >= 0) {
    var paragraphRegex = /(<p[^>]*>[^]*?<\/p>)/gi;
    var paragraphs = _toConsumableArray(contentWithIds.matchAll(paragraphRegex));
    if (paragraphs.length > positionAfter) {
      var target = paragraphs[positionAfter];
      var insertAt = target.index + target[0].length;
      contentWithIds = contentWithIds.slice(0, insertAt) + tocHtml + contentWithIds.slice(insertAt);
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

/**
 * Renders HTML content (including an embedded TOC generated by generateToc)
 * and wires up the collapsible toggle behaviour.
 *
 * @param {{ html: string }} props
 */
var TocWrapper = function TocWrapper(_ref) {
  var html = _ref.html;
  // Fix #9: Use a ref to scope DOM queries to THIS wrapper's subtree.
  // This means multiple <TocWrapper> instances on the same page each
  // control their own toggle independently.
  var wrapperRef = React.useRef(null);

  // Fix #10: Include `html` in the dependency array so the effect re-runs
  // (and re-attaches the listener) whenever the content changes.
  React.useEffect(function () {
    var container = wrapperRef.current;
    if (!container) return;
    var btn = container.querySelector(".rtb-toggle-btn");
    var list = container.querySelector(".rtb-toc-list");
    if (!btn || !list) return;
    var toggle = function toggle() {
      var isVisible = list.style.display === "block";
      list.style.display = isVisible ? "none" : "block";
      btn.classList.toggle("rtb-open", !isVisible);
    };
    btn.addEventListener("click", toggle);
    return function () {
      return btn.removeEventListener("click", toggle);
    };
  }, [html]); // re-attach when html prop changes

  return /*#__PURE__*/React.createElement("div", {
    ref: wrapperRef,
    dangerouslySetInnerHTML: {
      __html: html
    }
  });
};

exports.TocWrapper = TocWrapper;
exports.generateToc = generateToc;
//# sourceMappingURL=index.cjs.js.map
