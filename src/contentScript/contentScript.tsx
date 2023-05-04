import SearchIcon from "@mui/icons-material/Search";
import "./contentScript.css";
import SearchBox from "../components/SearchBox";
import ReactDOM from "react-dom";

import React, { useState } from "react";
const domain = window.location.origin;
const current_page = window.location.pathname;
// TODO: content script

function loadQuickSearch() {
  // Find the header element and append the search div to it
  const headers = document.querySelectorAll(".ic-DashboardCard__header");
  headers.forEach((header) => {
    const newElement = makeElement("div", "search-btn", header, "Test");
    const iconButton = <SearchIcon sx={{ width: "80px", height: "80px" }} />;
    ReactDOM.render(iconButton, newElement);
    header.appendChild(newElement);

    // Add event listener to button click
    newElement.addEventListener("click", function (e) {
      const element = header.querySelector(".ic-DashboardCard__link");
      const href = element.getAttribute("href");
      const id = href.match(/\d+/)[0]; // extracts the first number in the href
      const dialogContainer = document.createElement("div");
      header.appendChild(dialogContainer);
      ReactDOM.render(<SearchBox courseId={id} />, dialogContainer);
    });
  });
}

window.addEventListener("load", function () {
  console.log("Running");
  loadQuickSearch();
});

function createElement(type, html) {
  const newElement = document.createElement(type);
  newElement.innerHTML = html;
  return newElement;
}

function makeElement(element, elclass, location, text) {
  let creation = document.createElement(element);
  creation.classList.add(elclass);
  creation.textContent = text;
  location.appendChild(creation);
  return creation;
}
