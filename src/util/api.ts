import * as moment from "moment-timezone";
import { handleLogin } from "../options/options";

export async function addTask(dueDate, assignmentTitle, moduleCode) {
  const taskList = await chrome.storage.local.get("selectedTaskList");
  const inputFormatString = "DD MMM [at] HH:mm";
  const timeZone = "UTC"; // Set the target time zone for conversion

  // Parse the input date string to a moment object
  const inputDateObj = moment.tz(dueDate, inputFormatString, timeZone);

  // Convert the moment object to the dateTimeTimeZone format
  const deadline = {
    dateTime: inputDateObj.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
    timeZone: timeZone,
  };
  const token = await new Promise((resolve) => {
    chrome.storage.local.get("token", (result) => {
      resolve(result.token);
    });
  });
  console.log(taskList.selectedTaskList);
  const url = `https://graph.microsoft.com/v1.0/me/todo/lists/${taskList.selectedTaskList}/tasks`;
  console.log(url);
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  let task = {};
  if (dueDate != "") {
    task = {
      title: `${moduleCode} - ${assignmentTitle}`,
      dueDateTime: deadline,
    };
  } else {
    task = {
      title: `${moduleCode} - ${assignmentTitle}`,
    };
  }
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify(task),
  };
  console.log(JSON.stringify(task));
  try {
    const response = await fetch(url, options);
    console.log(response);
    // if (!response.ok) {
    //   if (response.status === 401) {
    //     // Handle unauthorized error
    //     console.log("Token expired");
    //     await handleLogin(false);
    //     // Rerun API request
    //     console.log("Rerunning API request...   ");
    //     await addTask(dueDate, assignmentTitle, moduleCode);
    //   } else {
    //     throw new Error(`Failed to create task: ${response.statusText}`);
    //   }
    // }
    const createdTask = await response.json();
    console.log(createdTask);
  } catch (error) {
    console.error(error);
  }
}

// export function getAccessToken(auth_code) {
//   console.log("Auth code: " + auth_code);
//   var myHeaders = new Headers();
//   myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

//   var urlencoded = new URLSearchParams();
//   urlencoded.append("grant_type", "authorization_code");
//   urlencoded.append("code", auth_code);
//   urlencoded.append("client_id", "6f4898fb-80f4-4b0b-af04-b97969c5ed40");
//   urlencoded.append("scope", "offline_access Tasks.ReadWrite");
//   urlencoded.append("redirect_uri", chrome.identity.getRedirectURL());

//   var requestOptions: RequestInit = {
//     method: "POST",
//     headers: myHeaders,
//     body: urlencoded,
//     redirect: "follow",
//   };

//   fetch(
//     "https://login.microsoftonline.com/common/oauth2/v2.0/token",
//     requestOptions
//   )
//     .then((response) => response.text())
//     .then((result) => {
//       console.log(result);
//       const json = JSON.parse(result);
//       console.log("Refresh: " + json.refresh_token);
//       console.log("Access: " + json.access_token);
//     })
//     .catch((error) => console.log("error", error));
