import React, { useEffect } from "react";

export const TocWrapper = ({ html }) => {
  useEffect(() => {
    const btn = document.querySelector(".rtb-toggle-btn");
    const list = document.querySelector(".rtb-toc-list");
    if (!btn || !list) return;

    const toggle = () => {
      list.style.display = list.style.display === "none" ? "block" : "none";
    };

    btn.addEventListener("click", toggle);
    return () => btn.removeEventListener("click", toggle);
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default TocWrapper;
