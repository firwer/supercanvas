import "./contentScript.css";
// TODO: content script

loadAssignmentButtons();

function parseAssignmentInfo(info: string) {}

function loadAssignmentButtons() {
  window.addEventListener("load", function () {
    const row = document.getElementsByClassName("ig-row__layout");
    const TITLEREGEX = /Assignments:\s*(.*?)\s/;
    const courseTitle = document
      .querySelector("title")
      .innerHTML.match(TITLEREGEX);
    for (let i = 0; i < row.length; i++) {
      const newElement = document.createElement("div");
      newElement.innerHTML = `<button class="btn">Add to Notion</button>`;
      console.log(row[i]);
      row[i].appendChild(newElement);

      const button = newElement.querySelector(".btn");
      button.addEventListener("click", function () {
        const infoElement = row[i].querySelector(".ig-info");
        const assignmentTitleElement =
          infoElement.getElementsByClassName("ig-title");
        const dateDueElement = infoElement.querySelector(
          ".assignment-date-due span[data-tooltip]"
        );
        const dueDate = dateDueElement ? dateDueElement.textContent.trim() : "";
        console.log(dueDate);
        console.log(assignmentTitleElement[0].innerHTML.trim());
        console.log(courseTitle[1]);
      });
    }
  });
}
