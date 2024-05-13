import { IconButton } from "@mui/material";
import React, { useState, useRef } from "react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import "./ItemBox.css";

const FileItem = ({ file, courseId }) => {
  const [translateX, setTranslateX] = useState(0);
  const textRef = useRef(null);
  // Calculate the elapsed time since the file was uploaded
  const calculateElapsedTime = (created_at) => {
    const currentDate = new Date();
    const createdAtDate = new Date(created_at);
    const timeDifference = currentDate.getTime() - createdAtDate.getTime();
    const secondsElapsed = timeDifference / 1000;
    const minutesElapsed = secondsElapsed / 60;
    const hoursElapsed = minutesElapsed / 60;
    const daysElapsed = hoursElapsed / 24;
    const weeksElapsed = daysElapsed / 7;
    const monthsElapsed = weeksElapsed / 4;

    if (hoursElapsed < 12) {
      return "Added recently";
    } else if (hoursElapsed >= 12 && hoursElapsed < 24) {
      return `Added ${Math.round(hoursElapsed)} hours ago`;
    } else if (daysElapsed < 7) {
      return `Added ${Math.round(daysElapsed)} days ago`;
    } else if (weeksElapsed < 4) {
      return `Added ${Math.round(weeksElapsed)} weeks ago`;
    } else {
      return `Added ${Math.round(monthsElapsed)} month(s) ago`;
    }
  };

  const getImageSrc = (file: any) => {
    const doc = chrome.runtime.getURL("doc.png");
    const pdf = chrome.runtime.getURL("pdf.png");
    const ppt = chrome.runtime.getURL("ppt.png");
    const txt = chrome.runtime.getURL("txt.png");
    const xls = chrome.runtime.getURL("xls.png");
    const zip = chrome.runtime.getURL("zip.png");
    const mp3 = chrome.runtime.getURL("mp3.png");
    const png = chrome.runtime.getURL("png.png");
    const jpg = chrome.runtime.getURL("jpg.png");
    const mpeg = chrome.runtime.getURL("mpeg.png");
    const avi = chrome.runtime.getURL("avi.png");
    const unk = chrome.runtime.getURL("unk.png");
    switch (file["content-type"]) {
      case "video/x-msvideo":
        return avi;
      case "video/mp4":
      case "video/mpeg":
        return mpeg;
      case "audio/mp3":
        return mp3;
      case "image/jpeg":
      case "image/jpg":
        return jpg;
      case "image/png":
        return png;
      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return doc;
      case "application/pdf":
        return pdf;
      case "application/vnd.ms-powerpoint":
      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        return ppt;
      case "text/plain":
        return txt;
      case "application/vnd.ms-excel":
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return xls;
      case "application/zip":
      case "application/x-zip-compressed":
      case "application/x-7z-compressed":
        return zip;
      default:
        return unk;
    }
  };
  const handleMouseEnter = () => {
    const element = textRef.current;
    if (element) {
      const overflowWidth = element.scrollWidth - 265;
      // Apply translation to reveal the hidden text
      if (overflowWidth > 0) setTranslateX(-overflowWidth);
    }
  };
  const handleMouseLeave = () => {
    const element = textRef.current;
    if (element) {
      // Instantly reset the text position without animation
      element.style.transition = "transform 0s linear";
      setTranslateX(0);
    }
  };
  const handlePreviewClick = (file_id) => {
    window.open(`courses/${courseId}/files?preview=${file_id}`, "_blank");
  };
  const imageSrc = getImageSrc(file);
  const elapsedTime = calculateElapsedTime(file.created_at);
  return (
    <li className="itemBox">
      <div className="leftpanel" title={"Download File: " + file.display_name}>
        <img
          src={imageSrc}
          style={{ height: "30px", width: "30px", paddingRight: "4px" }}
        />
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
              transition: "transform 0s linear",
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
};

export default FileItem;
