import { IconButton } from "@mui/material";
import React, { useState, useRef } from "react";

function FileItem({ file }) {
  const [translateX, setTranslateX] = useState(0);
  const textRef = useRef(null);

  const handleMouseEnter = () => {
    const element = textRef.current;
    if (element) {
      const overflowWidth = element.scrollWidth - element.clientWidth;
      // Apply translation to reveal the hidden text
      setTranslateX(-overflowWidth);
    }
  };

  const handleMouseLeave = () => {
    setTranslateX(0); // Reset translation on mouse leave
  };

  return (
    <li className="itemBox">
      <div className="leftpanel" title={"Download File: " + file.display_name}>
        <a
          href={file.url}
          className="itemText"
          download
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span
            ref={textRef}
            style={{
              transform: `translateX(${translateX}px)`,
              transition: "transform 2s linear",
            }}
          >
            {file.display_name}
          </span>
        </a>
      </div>
      <div className="rightpanel">
        <div className="elapsedTime">{elapsedTime}</div>
        <IconButton
          onClick={() => handlePreviewClick(file.id)}
          aria-label="preview"
          title="Preview File"
        >
          <RemoveRedEyeIcon />
        </IconButton>
      </div>
    </li>
  );
}
