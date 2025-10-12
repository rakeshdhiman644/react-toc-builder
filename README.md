# 📘 react-toc-builder

A simple and customizable Table of Contents (TOC) generator for React applications.  
It automatically scans your HTML content for headings (h2–h6) and injects a collapsible, stylized TOC after a chosen paragraph — with support for custom icons or images.

-------------------------------------------------------------
# 🚀 Installation

npm install react-toc-builder
or
yarn add react-toc-builder

-------------------------------------------------------------
# 💡 Basic Usage

import React from "react";
import { generateToc, TocWrapper } from "react-toc-builder";

const BlogContent = () => {
  const content = `
    <p>Welcome to my blog!</p>
    <h2>Introduction</h2>
    <p>This is the intro.</p>
    <h3>Overview</h3>
    <p>Some overview text.</p>
  `;

  const htmlWithToc = generateToc(content, {
    positionAfter: 1,
    icon: "/toc-icon.png"
  });

  return <TocWrapper html={htmlWithToc} />;
};

export default BlogContent;

-------------------------------------------------------------
# ⚙️ Configuration Options

positionAfter (number): Insert TOC after paragraph index (default: 1)
icon (string): Path to custom icon or image
showInitially (boolean): Whether TOC is open by default (default: false)
title (string): Custom title for the TOC (default: "Table of Contents")

-------------------------------------------------------------
# 🎨 Styling the TOC

CSS Classes:
- .rtb-toc: Wrapper
- .rtb-toc-header: Header section
- .rtb-toggle-btn: Toggle button
- .rtb-toc-list: List container
- .rtb-toc-item: Each TOC item

-------------------------------------------------------------
# 🧩 Example Project Structure

my-app/
 ├─ public/
 │   ├─ toc-icon.png
 │   └─ custom-icon.svg
 ├─ src/
 │   ├─ components/
 │   │   └─ BlogContent.js
 │   └─ App.js
 ├─ package.json
 └─ README.md

-------------------------------------------------------------
# 🧪 Local Development

git clone https://github.com/rakeshdhiman644/react-toc-builder.git
cd react-toc-builder
npm install
npm run build
npm link

Then in your React app:
npm link react-toc-builder

-------------------------------------------------------------
# 🧾 License

MIT © 2025 [Rakesh Kumar]

Links:
NPM: https://www.npmjs.com/package/react-toc-builder
GitHub: https://github.com/rakeshdhiman644/react-toc-builder
