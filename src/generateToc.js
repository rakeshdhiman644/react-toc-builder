export function generateToc(contentHtml, positionAfter = 0, icon = null) {
  // Default SVG icon if none provided
  const defaultIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" 
      viewBox="0 0 24 24" fill="none" stroke="currentColor" 
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `;

  // If icon is an image URL, render <img>, otherwise assume SVG string
  const iconHtml = icon
    ? icon.trim().startsWith("<svg")
      ? icon
      : `<img src="${icon}" alt="toggle-icon" width="18" height="18" />`
    : defaultIcon;

  let tocHtml = `
  <style>
  .rtb-toc {
    border: 1px solid #ddd;
    padding: 10px;
    margin-bottom: 1rem;
    border-radius: 4px;
    display: table;
    box-shadow: 0 1px 1px #0000000d;
    min-width: 200px;
    background: #fff;
  }
  .rtb-toc-header {
    margin-bottom: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .rtb-toc-list {
    display: none;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .rtb-toc-item {
    margin-top: 5px;
  }
  .rtb-toc-item a {
    text-decoration: none;
    color: inherit;
    display: block;
    padding: 2px 0;
    transition: color 0.2s;
  }
  .rtb-toc-item a:hover, .rtb-toc-item a.active {
    color: #007bff;
  }
  /* Indentation for nested levels */
  .rtb-toc-list .rtb-toc-list {
    display: block; /* Always show nested lists if parent is visible */
    padding-left: 20px;
    margin-top: 0;
  }
  .rtb-toc-number {
    margin-right: 5px;
    font-weight: 500;
    color: #666;
  }
  </style>
    <div class="rtb-toc">
      <div class="rtb-toc-header">
        <b>Table of Contents</b>
        <button data-toc-toggle class="rtb-toggle-btn" aria-label="Toggle TOC" style="cursor:pointer; background:none; border:none; padding:0; display:flex;">
          ${iconHtml}
        </button>
      </div>
      <ul class="rtb-toc-list" style="display: none; list-style: none; padding: 0;">
  `;

  const headingRegex = /<h([2-6])[^>]*>(.*?)<\/h\1>/gi;
  let match;
  let contentWithIds = contentHtml;
  const headings = [];

  // 1. Extract headings and inject IDs
  while ((match = headingRegex.exec(contentHtml)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    if (!text) continue;

    const id = `toc-${level}-${match.index}`;
    contentWithIds = contentWithIds.replace(
      match[0],
      `<h${level} id="${id}">${match[2]}</h${level}>`
    );

    headings.push({ level, text, id, children: [] });
  }

  // 2. Build Tree Structure
  const root = { level: 0, children: [] };
  const stack = [root];

  headings.forEach((heading) => {
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

      html += `<li class="rtb-toc-item">
        <a href="#${item.id}">
          <span class="rtb-toc-number">${displayLabel}</span>${item.text}
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

  // 🧩 Insert TOC after the nth paragraph (positionAfter)
  if (positionAfter >= 0) {
    const paragraphRegex = /(<p[^>]*>.*?<\/p>)/gi;
    let paragraphs = [...contentWithIds.matchAll(paragraphRegex)];

    if (paragraphs.length > positionAfter) {
      const targetParagraph = paragraphs[positionAfter][0];
      contentWithIds = contentWithIds.replace(targetParagraph, `${targetParagraph}${tocHtml}`);
    } else {
      contentWithIds += tocHtml;
    }
  } else {
    contentWithIds = tocHtml + contentWithIds;
  }

  return contentWithIds;
}