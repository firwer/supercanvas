import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./options.css";
export const handleLogin = (isInteractiveMode: boolean) => {
  chrome.identity.launchWebAuthFlow(
    {
      url: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?
    client_id=6f4898fb-80f4-4b0b-af04-b97969c5ed40
    &redirect_uri=${chrome.identity.getRedirectURL()}
    &response_type=token
    &response_mode=fragment
    &scope=Tasks.ReadWrite offline_access`,
      interactive: isInteractiveMode,
    },
    function (response) {
      const url = new URL(response);
      const params = new URLSearchParams(url.hash.slice(1)); // extract parameters from the URL hash
      const accessToken = params.get("access_token"); // extract the access token value
      console.log(accessToken);
      chrome.storage.local.set({ token: accessToken });
    }
  );
};
const App: React.FC<{}> = () => {
  const [tasklists, setTasklists] = useState([]);
  const handleSelectedOption = (event: any) => {
    chrome.storage.local.set({ selectedTaskList: event.target.value });
  };

  // function to fetch task lists
  async function getTaskLists() {
    const token = await new Promise((resolve) => {
      chrome.storage.local.get("token", (result) => {
        resolve(result.token);
      });
    });
    console.log(token);
    if (token != null) {
      const response = await fetch(
        "https://graph.microsoft.com/v1.0/me/todo/lists",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("data: " + data);
        const taskLists = data.value.map((list: any) => {
          return { id: list.id, displayName: list.displayName };
        });
        setTasklists(taskLists);
      } else {
        console.log("Error fetching task lists");
      }
    } else {
      console.log("No token found");
    }
  }

  useEffect(() => {
    getTaskLists();
  }, []);
  return (
    <div>
      <h1>Configuration Settings</h1>
      <button onClick={() => handleLogin(true)}>
        Sign in to Microsoft To-Do
      </button>
      {tasklists.length > 0 ? (
        <div>
          <h2>Select a Task List:</h2>
          <select onChange={handleSelectedOption}>
            {tasklists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.displayName}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p>No tasklists available.</p>
      )}
    </div>
  );
};

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);
root.render(<App />);
