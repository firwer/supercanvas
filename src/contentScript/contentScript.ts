import { addTask } from "../util/api";
const domain = window.location.origin;
const current_page = window.location.pathname;
// TODO: content script

function loadAssignmentButtons() {
  const row = document.getElementsByClassName("ig-row__layout");
  console.log(row);
  const TITLEREGEX = /Assignments:\s*(.*?)\s/;
  const courseTitle = document
    .querySelector("title")
    .innerHTML.match(TITLEREGEX);
  for (let i = 0; i < row.length; i++) {
    console.log("row" + i);
    const newElement = document.createElement("div");
    newElement.innerHTML = `<button class="btn">Add <img  width="20" height="20" src="${chrome.runtime.getURL(
      "todo.png"
    )}" alt="todo" class="btn-icon"></button>`;
    row[i].appendChild(newElement);
    newElement.querySelector(".btn").addEventListener("click", function () {
      const infoElement = row[i].querySelector(".ig-info");
      const assignmentTitleElement =
        infoElement.getElementsByClassName("ig-title");
      const dateDueElement = infoElement.querySelector(
        "span[data-html-tooltip-title]"
      );
      const dueDate = dateDueElement
        ? dateDueElement.getAttribute("data-html-tooltip-title")
        : "";
      const assignmentTitle = assignmentTitleElement[0].innerHTML.trim();
      const moduleCode = courseTitle[1];
      addTask(dueDate, assignmentTitle, moduleCode);
    });
  }
}

window.addEventListener("load", function () {
  loadAssignmentButtons();
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === "childList") {
        setTimeout(() => {
          if (document.querySelector(".btn")) {
            console.log("button already exists, disconnecting observer");
            observer.disconnect();
          } else {
            console.log("Couldn't find buttons, adding them");
            loadAssignmentButtons();
          }
        }, 2000);
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});
