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
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

function generateToc(contentHtml) {
  var positionAfter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var icon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  // Default SVG icon if none provided
  var defaultIcon = "\n    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"18\" height=\"18\" \n      viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" \n      stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n      <polyline points=\"6 9 12 15 18 9\"></polyline>\n    </svg>\n  ";

  // If icon is an image URL, render <img>, otherwise assume SVG string
  var iconHtml = icon ? icon.trim().startsWith("<svg") ? icon : "<img src=\"".concat(icon, "\" alt=\"toggle-icon\" width=\"18\" height=\"18\" />") : defaultIcon;
  var tocHtml = "\n  <style>\n  .rtb-toc {\n    border: 1px solid #ddd;\n    padding: 10px;\n    margin-bottom: 1rem;\n    border-radius: 4px;\n    display: table;\n    box-shadow: 0 1px 1px #0000000d;\n    min-width: 200px;\n    background: #fff;\n  }\n  .rtb-toc-header {\n    margin-bottom: 0;\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    gap: 10px;\n  }\n  .rtb-toc-list {\n    display: none;\n    list-style: none !important;\n    padding: 0;\n    margin: 0;\n  }\n  .rtb-toc-item {\n    margin-top: 5px;\n  }\n  .rtb-toc-item a {\n    text-decoration: none;\n    color: inherit;\n    display: block;\n    padding: 2px 0;\n    transition: color 0.2s;\n  }\n  /* Font sizing per heading depth */\n  .rtb-toc-item.rtb-level-2 a { font-size: 1rem; }\n  .rtb-toc-item.rtb-level-3 a { font-size: 0.95rem; }\n  .rtb-toc-item.rtb-level-4 a { font-size: 0.9rem; }\n  .rtb-toc-item.rtb-level-5 a { font-size: 0.85rem; }\n  .rtb-toc-item.rtb-level-6 a { font-size: 0.8rem; }\n  .rtb-toc-item a:hover, .rtb-toc-item a.active {\n    color: #007bff;\n  }\n  /* Indentation for nested levels */\n  .rtb-toc-list .rtb-toc-list {\n    display: block; /* Always show nested lists if parent is visible */\n    padding-left: 20px;\n    margin-top: 0;\n  }\n  .rtb-toc-number {\n    margin-right: 5px;\n    font-weight: 500;\n    color: #666;\n  }\n  </style>\n    <div class=\"rtb-toc\">\n      <div class=\"rtb-toc-header\">\n        <b>Table of Contents</b>\n        <button data-toc-toggle class=\"rtb-toggle-btn\" aria-label=\"Toggle TOC\" style=\"cursor:pointer; background:none; border:none; padding:0; display:flex;\">\n          ".concat(iconHtml, "\n        </button>\n      </div>\n      <ul class=\"rtb-toc-list\" style=\"display: none; list-style: none; padding: 0;\">\n  ");
  var headingRegex = /<h([2-6])[^>]*>(.*?)<\/h\1>/gi;
  var match;
  var contentWithIds = contentHtml;
  var headings = [];

  // 1. Extract headings and inject IDs
  while ((match = headingRegex.exec(contentHtml)) !== null) {
    var level = parseInt(match[1]);
    var text = match[2].replace(/<[^>]+>/g, "").trim();
    if (!text) continue;
    var id = "toc-".concat(level, "-").concat(match.index);
    contentWithIds = contentWithIds.replace(match[0], "<h".concat(level, " id=\"").concat(id, "\">").concat(match[2], "</h").concat(level, ">"));
    headings.push({
      level: level,
      text: text,
      id: id,
      children: []
    });
  }

  // 2. Build Tree Structure
  var root = {
    level: 0,
    children: []
  };
  var stack = [root];
  headings.forEach(function (heading) {
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
  tocHtml += "\n      </ul>\n    </div>\n  ";

  // 🧩 Insert TOC after the nth paragraph (positionAfter)
  if (positionAfter >= 0) {
    var paragraphRegex = /(<p[^>]*>.*?<\/p>)/gi;
    var paragraphs = _toConsumableArray(contentWithIds.matchAll(paragraphRegex));
    if (paragraphs.length > positionAfter) {
      var targetParagraph = paragraphs[positionAfter][0];
      contentWithIds = contentWithIds.replace(targetParagraph, "".concat(targetParagraph).concat(tocHtml));
    } else {
      contentWithIds += tocHtml;
    }
  } else {
    contentWithIds = tocHtml + contentWithIds;
  }
  return contentWithIds;
}

var TocWrapper = function TocWrapper(_ref) {
  var html = _ref.html;
  React.useEffect(function () {
    var btn = document.querySelector(".rtb-toggle-btn");
    var list = document.querySelector(".rtb-toc-list");
    if (!btn || !list) return;
    var toggle = function toggle() {
      list.style.display = list.style.display === "none" ? "block" : "none";
    };
    btn.addEventListener("click", toggle);
    return function () {
      return btn.removeEventListener("click", toggle);
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    dangerouslySetInnerHTML: {
      __html: html
    }
  });
};

exports.TocWrapper = TocWrapper;
exports.generateToc = generateToc;
//# sourceMappingURL=index.cjs.js.map
