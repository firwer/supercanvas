import SearchIcon from "@mui/icons-material/Search";
import "./contentScript.css";
import SearchBox from "../components/CourseSearchBox";
import "react-dom/client";

import React from "react";
import { createRoot } from "react-dom/client";
const domain = window.location.origin;
const current_page = window.location.pathname;
let color = null;
let deadlineData = null;

// Some parts of the code was referenced from ksucpea@gmail.com

function checkDashboardReady(): void {
  if (current_page !== "/" && current_page !== "") return;

  const callback = (mutationList) => {
    for (const mutation of mutationList) {
      if (
        mutation.type === "childList" &&
        mutation.target == document.querySelector("#DashboardCard_Container")
      ) {
        chrome.storage.local
          .get("isEnabledDeadline")
          .then((result) => {
            if (result.isEnabledDeadline) {
              deadlineCard();
            }
          })
          .catch((err) => {});
        chrome.storage.local
          .get("isEnabledFileSearch")
          .then((result) => {
            if (result.isEnabledFileSearch) {
              loadQuickSearch();
            }
          })
          .catch((err) => {});
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
  ) {
    return;
  }
  const headers = document.querySelectorAll(".ic-DashboardCard__header");

  headers.forEach((header) => {
    const newElement = elementCreate("div", "course-search-btn", header, "");
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
  // const searchBar = elementCreate(
  //   "div",
  //   "general-search-btn",
  //   dashboardHeader,
  //   "Search All Files..."
  // );
  // dashboardHeader.insertBefore(searchBar, threeDots);
}

if (domain.includes("canvas")) {
  console.log("Running SuperCanvas");
  getDeadlines();
  checkDashboardReady();
}

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
      document.querySelectorAll(".supercanvas-container").length > 0
    )
      return;

    let cards = document.querySelectorAll(".ic-DashboardCard");
    for (let i = 0; i < cards.length; i++) {
      let cardContainer = elementCreate(
        "div",
        "supercanvas-container",
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
      elementCreate("div", "supercanvas-skeleton-text", cardContainer, "");
    }
    deadlineData.then((data) => {
      insertTasks(data);
    });
  } catch (e) {}
}

function formattedDueDate(date) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let newdate = new Date(date);
  return monthNames[newdate.getMonth()] + " " + newdate.getDate();
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
    color = "#be7420"; // orange
  } else {
    color = "#2A9028"; // green
  }
  if (months >= 1) {
    return `In ${months} month${months === 1 ? "" : "s"} - ${formattedDueDate(
      date
    )}`;
  } else if (days >= 1) {
    return `In ${days} day${days === 1 ? "" : "s"} - ${formattedDueDate(date)}`;
  } else if (hours >= 1) {
    return `In ${hours} hour${hours === 1 ? "" : "s"} - ${formattedDueDate(
      date
    )}`;
  } else if (minutes >= 1) {
    return `In ${minutes} minute${
      minutes === 1 ? "" : "s"
    } - ${formattedDueDate(date)}`;
  } else {
    return `In ${seconds} second${
      seconds === 1 ? "" : "s"
    } - ${formattedDueDate(date)}`;
  }
}

function insertTasks(data) {
  if (
    document.querySelectorAll(".supercanvas-assignment-container").length > 0
  ) {
    return;
  }
  try {
    let cards = document.querySelectorAll(".ic-DashboardCard");
    for (let i = 0; i < cards.length; i++) {
      let cardContainer = cards[i].querySelector(".supercanvas-container");
      cardContainer.querySelector(".supercanvas-skeleton-text").remove(); //remove loader
      let count = 0;
      let course_id = parseInt(
        cards[i]
          .querySelector(".ic-DashboardCard__link")
          .getAttribute("href")
          .match(/\d+/)[0]
      );
      data.forEach((task) => {
        if (
          course_id === task.course_id &&
          new Date(task.plannable_date) > new Date()
        ) {
          if (
            task.plannable_type === "assignment" ||
            task.plannable_type === "quiz"
          ) {
            count++;
            let taskContainer = elementCreate(
              "div",
              "supercanvas-deadline-container",
              cardContainer,
              ""
            );
            let taskName = elementCreate(
              "a",
              "supercanvas-deadline-text",
              taskContainer,
              task.plannable.title.length > 15
                ? task.plannable.title.substring(0, 15) + "..."
                : task.plannable.title
            );
            let timeRemaining = getCountdown(task.plannable_date);
            let taskCountdown = elementCreate(
              "div",
              "supercanvas-deadline-countdown",
              taskContainer,
              timeRemaining
            );
            taskCountdown.style.color = color;
            taskName.setAttribute("href", task.html_url);
          }
        }
      });
      if (count === 0) {
        let taskContainer = elementCreate(
          "div",
          "supercanvas-deadline-container",
          cardContainer,
          ""
        );
        elementCreate(
          "p",
          "supercanvas-deadline-empty",
          taskContainer,
          "None 🎉"
        );
      }
    }
  } catch (e) {
    console.log(e);
  }
}
