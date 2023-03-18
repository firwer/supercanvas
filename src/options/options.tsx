import React from "react";
import { createRoot } from "react-dom/client";
import "./options.css";
import { getAccessToken } from "../util/api";

const App: React.FC<{}> = () => {
  interface TaskList {
    id: string;
    displayName: string;
  }

  const handleLogin = () => {
    chrome.identity.launchWebAuthFlow(
      {
        url: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?
      client_id=6f4898fb-80f4-4b0b-af04-b97969c5ed40
      &redirect_uri=${chrome.identity.getRedirectURL()}
      &response_type=token
      &response_mode=fragment
      &scope=Tasks.ReadWrite offline_access`,
        interactive: true,
      },
      function (response) {
        const url = new URL(response);
        const params = new URLSearchParams(url.hash.slice(1)); // extract parameters from the URL hash
        const accessToken = params.get("access_token"); // extract the access token value
        console.log(accessToken);
      }
    );
  };
  // function to fetch task lists
  async function getTaskLists(): Promise<TaskList[]> {
    const token = chrome.storage.local.get("token");
    if (token != null) {
      const response = await fetch(
        "https://graph.microsoft.com/v1.0/me/todo/lists",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      const taskLists = data.value.map((list: any) => {
        return { id: list.id, displayName: list.displayName };
      });
      return taskLists;
    } else {
      console.log("No token found");
      return [];
    }
  }

  // save the selected task list id to chrome storage
  function saveSelectedTaskListId(taskListId: string): void {
    chrome.storage.sync.set({ selectedTaskListId: taskListId });
  }

  // populate dropdown with task lists
  async function populateTaskListDropdown(): Promise<void> {
    const taskLists = await getTaskLists();
    const select = document.getElementById(
      "tasklist-dropdown"
    ) as HTMLSelectElement;
    taskLists.forEach((list) => {
      const option = document.createElement("option");
      option.value = list.id;
      option.text = list.displayName;
      select.add(option);
    });
    // add event listener to save selected task list id to chrome storage on change
    select.addEventListener("change", (event) => {
      const selectedTaskListId = (event.target as HTMLSelectElement).value;
      saveSelectedTaskListId(selectedTaskListId);
    });
  }

  // call function to populate task list dropdown when extension popup is opened
  document.addEventListener("DOMContentLoaded", populateTaskListDropdown);
  return (
    <div>
      <h1>Configuration Settings</h1>
      <button onClick={handleLogin}>Sign in to Microsoft To-Do</button>
    </div>
  );
};

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);
root.render(<App />);
