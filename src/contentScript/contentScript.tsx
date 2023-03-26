import { addTask } from "../util/api";
import SearchIcon from "@mui/icons-material/Search";
import "./contentScript.css";
import Dialog from "@mui/material/Dialog";
import ReactDOM from "react-dom";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";

import React, { useState } from "react";
import {
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from "@mui/material";
import { Folder } from "@mui/icons-material";
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
      console.log(id); // prints the ID number
      const dialogContainer = document.createElement("div");
      header.appendChild(dialogContainer);
      ReactDOM.render(<DialogBox courseId={id} />, dialogContainer);
    });
  });
}

function DialogBox({ courseId }) {
  const [open, setOpen] = React.useState(true);
  const [files, setFiles] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedFolder, setSelectedFolder] = React.useState("");
  const [folders, setFolders] = React.useState([]);

  React.useEffect(() => {
    async function fetchFiles() {
      const response = await fetch(
        `/api/v1/courses/${courseId}/files?per_page=100`
      );
      const data = await response.json();
      const folderIds = [...new Set(data.map((file) => file.folder_id))];
      setFiles(data);
      setIsLoading(false);
      fetchFolders(folderIds);
    }
    async function fetchFolders(folderIds) {
      const response = await fetch(
        `/api/v1/courses/${courseId}/folders?per_page=100`
      );
      const allFolders = await response.json();
      const filteredFolders = allFolders
        .filter((folder) => folder.files_count !== 0)
        .filter((folder) => folder.hidden_for_user !== true)
        .filter((folder) => folderIds.includes(folder.id));

      setFolders(filteredFolders);
    }

    fetchFiles();
  }, [courseId]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSelectFolder = (event) => {
    console.log("Selected Folder: " + event.target.value);
    setSelectedFolder(event.target.value);
  };

  const filteredFiles = React.useMemo(() => {
    if (selectedFolder !== "") {
      return files.filter(
        (file) =>
          file.display_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          file.folder_id === selectedFolder
      );
    } else {
      return files.filter((file) =>
        file.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }, [files, searchQuery, selectedFolder]);
  const handlePreviewClick = (id) => {
    window.open(`https://canvas.nus.edu.sg/files/${id}`, "_blank");
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle sx={{ width: "500px", padding: "0px" }}>
        <input
          value={searchQuery}
          onChange={handleSearchInputChange}
          type="text"
          placeholder="Search Files..."
          style={{
            fontSize: "24px",
            width: "100%",
            height: "40px",
            padding: "0.5rem",
            border: "none",
          }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <Select
            placeholder="Folder"
            sx={{ width: "100%", margin: "0px 10px" }}
            labelId="folder-select-label"
            value={selectedFolder}
            onChange={handleSelectFolder}
          >
            <MenuItem value="">All Folders</MenuItem>
            {folders.map((folder) => (
              <MenuItem
                sx={{ justifyContent: "space-between" }}
                key={folder.id}
                value={folder.id}
              >
                {folder.full_name.replace("course files/", "")}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogTitle>
      <DialogContent
        sx={{ alignItems: "center", justifyContent: "center", height: "500px" }}
      >
        {isLoading ? (
          <CircularProgress />
        ) : (
          <ul style={{ padding: "0", margin: "0" }}>
            {filteredFiles.length > 0 ? (
              filteredFiles.map((file, index) => (
                <li
                  key={index}
                  style={{
                    listStyle: "none",
                    borderBottom: "1px solid #ccc",
                    padding: "10px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <a
                    href={file.url}
                    style={{
                      display: "block",
                      textDecoration: "none",
                      color: "#333",
                    }}
                    download
                  >
                    {file.display_name}
                  </a>
                  <IconButton
                    onClick={() => handlePreviewClick(file.id)}
                    aria-label="preview"
                  >
                    <RemoveRedEyeIcon />
                  </IconButton>
                </li>
              ))
            ) : (
              <p>No files found</p>
            )}
          </ul>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

function loadAssignmentButtons() {
  try {
    const row = document.getElementsByClassName("ig-row__layout");
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
  console.log("Running");
  loadQuickSearch();
  const elementExists = document.querySelector(".ig-row__layout") !== null;
  if (elementExists) {
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
  }
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
