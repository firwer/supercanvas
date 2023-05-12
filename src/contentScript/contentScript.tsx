import SearchIcon from "@mui/icons-material/Search";
import "./contentScript.css";
import SearchBox from "../components/CourseSearchBox";
import "react-dom/client";

import React, { useState } from "react";
import { createRoot } from "react-dom/client";
const domain = window.location.origin;
const current_page = window.location.pathname;
let color = null;
let deadlineData = null;
// TODO: content script

function checkDashboardReady() {
  if (current_page !== "/" && current_page !== "") return;

  const callback = (mutationList) => {
    for (const mutation of mutationList) {
      if (
        mutation.type === "childList" &&
        mutation.target == document.querySelector("#DashboardCard_Container")
      ) {
        console.log("Scripts running");
        loadQuickSearch();
        deadlineCard();
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(document.querySelector("html"), {
    childList: true,
    subtree: true,
  });
}

function getDeadlines() {
  let weekAgo = new Date(Date.now() - 604800000);
  async function fetchDeadlines() {
    const response = await fetch(
      `/api/v1/planner/items?start_date=${weekAgo.toISOString()}&per_page=100`
    );
    let r = await response.json();
    return r;
  }
  deadlineData = fetchDeadlines();
}

function loadQuickSearch() {
  if (
    document.querySelectorAll(".course-search-btn").length > 0 &&
    document.querySelectorAll(".general-search-btn").length > 0
  )
    return;
  // Find the header element and append the search div to it
  const dashboardHeader = document.querySelector(".fOyUs_bGBk");
  const headers = document.querySelectorAll(".ic-DashboardCard__header");
  const threeDots = dashboardHeader.querySelector(".dJCgj_bGBk");

  headers.forEach((header) => {
    const newElement = elementCreate(
      "div",
      "course-search-btn",
      header,
      "Test"
    );
    const root = createRoot(newElement!);
    root.render(<SearchIcon sx={{ width: "80px", height: "80px" }} />);
    header.appendChild(newElement);

    // Add event listener to button click
    newElement.addEventListener("click", function (e) {
      const element = header.querySelector(".ic-DashboardCard__link");
      const href = element.getAttribute("href");
      const id = href.match(/\d+/)[0]; // extracts the first number in the href
      const dialogContainer = document.createElement("div");
      header.appendChild(dialogContainer);
      const root = createRoot(dialogContainer!);
      root.render(<SearchBox courseId={id} />);
    });
  });
  const iconButton = <SearchIcon sx={{ width: "25px", height: "25px" }} />;
  const searchBar = elementCreate(
    "div",
    "general-search-btn",
    dashboardHeader,
    "Search All Files..."
  );
  //searchBar.appendChild(iconButton);
  dashboardHeader.insertBefore(searchBar, threeDots);
}

console.log("Running SuperCanvas");
getDeadlines();
checkDashboardReady();

function elementCreate(element, elclass, location, text) {
  let creation = document.createElement(element);
  creation.classList.add(elclass);
  creation.textContent = text;
  location.appendChild(creation);
  return creation;
}

function deadlineCard() {
  try {
    if (
      document.querySelectorAll(".ic-DashboardCard").length > 0 &&
      document.querySelectorAll(".supercanvas-card-container").length > 0
    )
      return;

    let cards = document.querySelectorAll(".ic-DashboardCard");
    for (let i = 0; i < cards.length; i++) {
      let cardContainer = elementCreate(
        "div",
        "supercanvas-card-container",
        cards[i],
        ""
      );
      let deadlineHeader = elementCreate(
        "div",
        "supercanvas-card-header-container",
        cardContainer,
        ""
      );
      let deadlineTitle = elementCreate(
        "h3",
        "supercanvas-card-header",
        deadlineHeader,
        "Deadlines"
      );
      let skeletonText = elementCreate(
        "div",
        "supercanvas-skeleton-text",
        cardContainer,
        ""
      );
    }
    deadlineData.then((data) => {
      insertAssignments(data);
    });
  } catch (e) {}
}

function cleanDue(date) {
  let newdate = new Date(date);
  return newdate.getMonth() + 1 + "/" + newdate.getDate();
}

function getCountdown(date): string {
  const now = new Date();
  const taskDate = new Date(date);
  const timeRemaining = taskDate.getTime() - now.getTime();

  if (timeRemaining <= 0) {
    return "Now";
  }

  const seconds = Math.floor(timeRemaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  if (days < 1) {
    color = "#EC2F2F"; // red
  } else if (days < 3) {
    color = "#E69435"; // orange
  } else {
    color = "#2A9028"; // green
  }
  if (months >= 1) {
    return `In ${months} month${months === 1 ? "" : "s"}`;
  } else if (days >= 1) {
    return `In ${days} day${days === 1 ? "" : "s"}`;
  } else if (hours >= 1) {
    return `In ${hours} hour${hours === 1 ? "" : "s"}`;
  } else if (minutes >= 1) {
    return `In ${minutes} minute${minutes === 1 ? "" : "s"}`;
  } else {
    return `In ${seconds} second${seconds === 1 ? "" : "s"}`;
  }
}

function insertAssignments(data) {
  if (
    document.querySelectorAll(".supercanvas-assignment-container").length > 0
  ) {
    return;
  }
  try {
    let cards = document.querySelectorAll(".ic-DashboardCard");
    for (let i = 0; i < cards.length; i++) {
      let cardContainer = cards[i].querySelector(".supercanvas-card-container");
      cardContainer.querySelector(".supercanvas-skeleton-text").remove(); //remove loader
      let count = 0;
      let course_id = parseInt(
        cards[i]
          .querySelector(".ic-DashboardCard__link")
          .getAttribute("href")
          .match(/\d+/)[0]
      );
      data.forEach((assignment) => {
        console.log(assignment);
        if (
          course_id === assignment.course_id &&
          new Date(assignment.plannable_date) > new Date()
        ) {
          if (
            assignment.plannable_type === "assignment" ||
            assignment.plannable_type === "quiz"
          ) {
            count++;
            let assignmentContainer = elementCreate(
              "div",
              "supercanvas-deadline-container",
              cardContainer,
              ""
            );
            let assignmentName = elementCreate(
              "a",
              "supercanvas-deadline-text",
              assignmentContainer,
              assignment.plannable.title.length > 15
                ? assignment.plannable.title.substring(0, 15) + "..."
                : assignment.plannable.title
            );
            let timeRemaining = getCountdown(assignment.plannable_date);
            let assignmentCountdown = elementCreate(
              "div",
              "supercanvas-deadline-countdown",
              assignmentContainer,
              timeRemaining
            );
            assignmentCountdown.style.color = color;
            let assignmentDueAt = elementCreate(
              "span",
              "supercanvas-deadline-time",
              assignmentContainer,
              cleanDue(assignment.plannable_date)
            );
            assignmentName.setAttribute("href", assignment.html_url);
          }
        }
      });
      if (count === 0) {
        let assignmentContainer = elementCreate(
          "div",
          "supercanvas-deadline-container",
          cardContainer,
          ""
        );
        let assignmentDivLink = elementCreate(
          "p",
          "supercanvas-deadline-empty",
          assignmentContainer,
          "None 🎉"
        );
      }
    }
  } catch (e) {
    console.log("Some error");
    console.log(e);
  }
}
