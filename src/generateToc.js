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
  .rtb-toc{
    border: 1px solid #ddd;
    padding: 10px;
    margin-bottom: 1rem;
    border-radius: 4px;
    display: table;
    box-shadow: 0 1px 1px #0000000d;
  }
.rtb-toc-header {
    margin-bottom: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  </style>
    <div class="rtb-toc">
      <div class="rtb-toc-header">
        <b>Table of Contents</b>
        <button data-toc-toggle class="rtb-toggle-btn" aria-label="Toggle TOC" style="cursor:pointer;">
          ${iconHtml}
        </button>
      </div>
      <ul class="rtb-toc-list" style="display: none; list-style: none; padding: 0;">
  `;

  const headingRegex = /<h([2-6])[^>]*>(.*?)<\/h\1>/gi;
  let match;
  let count = 1;
  let contentWithIds = contentHtml;

  while ((match = headingRegex.exec(contentHtml)) !== null) {
    const tag = match[1];
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    if (!text) continue;

    const id = `toc-${tag}-${match.index}`;
    contentWithIds = contentWithIds.replace(
      match[0],
      `<h${tag} id="${id}">${text}</h${tag}>`
    );

    tocHtml += `<li class="rtb-toc-item">${count}. <a href="#${id}">${text}</a></li>`;
    count++;
  }

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
