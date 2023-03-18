import { addTask } from "../util/api";
const domain = window.location.origin;
const current_page = window.location.pathname;
// TODO: content script

function loadAssignmentButtons() {
  try {
    const row = document.getElementsByClassName("ig-row__layout");
    console.log(row);
    const TITLEREGEX = /Assignments:\s*(.*?)\s/;
    const courseTitle = document
      .querySelector("title")
      .innerHTML.match(TITLEREGEX);
    for (let i = 0; i < row.length; i++) {
      // Element Selectors
      const infoElement = row[i].querySelector(".ig-info");
      const assignmentTitleElement =
        infoElement.getElementsByClassName("ig-title");
      const dateDueElement = infoElement.querySelector(
        "span[data-html-tooltip-title]"
      );
      const newElement = createElement(
        "div",
        `<button title="Add to Microsoft To-Do List" class="btn">Add <img  width="20" height="20" src="${chrome.runtime.getURL(
          "todo.png"
        )}" alt="todo" class="btn-icon"></button>`
      );

      // Check if the button was clicked before
      // console.log(assignmentTitleElement[0].innerHTML.trim());
      // if (localStorage.getItem(assignmentTitleElement[0].innerHTML.trim())) {
      //   newElement.querySelector(".btn").disabled = true;
      //   newElement.querySelector(".btn").innerText = "Added";
      // }
      row[i].appendChild(newElement);

      // Add event listener to button click
      newElement.querySelector(".btn").addEventListener("click", function () {
        const dueDate = dateDueElement
          ? dateDueElement.getAttribute("data-html-tooltip-title")
          : "";
        const assignmentTitle = assignmentTitleElement[0].innerHTML.trim();
        const moduleCode = courseTitle[1];
        if (addTask(dueDate, assignmentTitle, moduleCode)) {
          this.disabled = true;
          this.innerText = "Added";
          // chrome.storage.local.set({ assignmentTitle });
        } else {
          alert("Failed to add task");
        }
      });
    }
  } catch (error) {
    console.error(error);
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
        }, 1000);
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});

function createElement(type, html) {
  const newElement = document.createElement(type);
  newElement.innerHTML = html;
  return newElement;
}
