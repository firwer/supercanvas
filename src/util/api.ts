export function getAccessToken(auth_code) {
  console.log("Auth code: " + auth_code);
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  var urlencoded = new URLSearchParams();
  urlencoded.append("grant_type", "authorization_code");
  urlencoded.append("code", auth_code);
  urlencoded.append("client_id", "6f4898fb-80f4-4b0b-af04-b97969c5ed40");
  urlencoded.append("scope", "offline_access Tasks.ReadWrite");
  urlencoded.append("redirect_uri", chrome.identity.getRedirectURL());

  var requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      console.log(result);
      const json = JSON.parse(result);
      console.log("Refresh: " + json.refresh_token);
      console.log("Access: " + json.access_token);
    })
    .catch((error) => console.log("error", error));
}
