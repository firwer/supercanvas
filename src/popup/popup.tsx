import React, { useEffect, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { createRoot } from "react-dom/client";
import "./popup.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "#f39c12",
    },
    secondary: {
      main: "#f1c40f",
    },
  },
});

const App: React.FC<{}> = () => {
  const [disableDeadline, setDisableDeadline] = useState(true);
  const [maxDeadlines, setMaxDeadlines] = useState(6);
  const [disableFileSearch, setDisableFileSearch] = useState(true);
  const [timeValue, setTimeValue] = useState(6);
  const [date, setDate] = useState("weeks");
  const handleFileSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    chrome.storage.local.set({ isEnabledFileSearch: event.target.checked });
    setDisableFileSearch(event.target.checked);
  };

  const handleDeadlineChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    chrome.storage.local.set({ isEnabledDeadline: event.target.checked });
    setDisableDeadline(event.target.checked);
  };

  const handleMaxDeadlinesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.value === "") return;
    setMaxDeadlines(parseInt(event.target.value));
    chrome.storage.local.set({ userMaxDeadlines: event.target.value });
  };

  const handleTimeValueChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.value === "") return;
    setTimeValue(parseInt(event.target.value));
    chrome.storage.local.set({ userTimeValue: event.target.value });
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value);
    chrome.storage.local.set({ userDate: event.target.value });
  };

  const handleSaveChanges = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
    });
  };

  useEffect(() => {
    chrome.storage.local.get(
      [
        "isEnabledDeadline",
        "isEnabledFileSearch",
        "userMaxDeadlines",
        "userTimeValue",
        "userDate",
      ],
      function (result) {
        if (result.isEnabledDeadline !== undefined) {
          setDisableDeadline(result.isEnabledDeadline);
        }
        if (result.isEnabledFileSearch !== undefined) {
          setDisableFileSearch(result.isEnabledFileSearch);
        }
        if (result.userMaxDeadlines !== undefined) {
          setMaxDeadlines(result.userMaxDeadlines);
        }
        if (result.userTimeValue !== undefined) {
          setTimeValue(result.userTimeValue);
        }
        if (result.userDate !== undefined) {
          setDate(result.userDate);
        }
      }
    );
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div className="container">
        <div className="section">
          {" "}
          <img src="icon.png" className="logo" />
          <h1 className="title">Super Canvas</h1>
        </div>
        <Grid item xs={12}>
          <FormGroup sx={{ gap: "5px" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={disableFileSearch}
                  onChange={handleFileSearchChange}
                  name="disable-file-search"
                  color="primary"
                />
              }
              label="Quick File Search"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={disableDeadline}
                  onChange={handleDeadlineChange}
                  name="disable-deadline"
                  color="primary"
                />
              }
              label="Deadline Card"
            />
            <div style={{ display: "flex", gap: "4px" }}>
              <p>Only show deadlines for the next:</p>
              <TextField
                type="number"
                InputProps={{
                  inputProps: { min: 0 },
                }}
                size="small"
                sx={{ width: "70px", height: "30px" }}
                value={timeValue}
                onChange={handleTimeValueChange}
              />
              <Select
                size="small"
                displayEmpty
                value={date}
                defaultValue="weeks"
                onChange={handleDateChange}
              >
                <MenuItem value="days">days</MenuItem>
                <MenuItem value="weeks">weeks</MenuItem>
                <MenuItem value="months">months</MenuItem>
              </Select>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <p>Display up to</p>
              <TextField
                required
                type="number"
                size="small"
                sx={{ width: "70px", height: "30px" }}
                InputProps={{
                  inputProps: { min: 0 },
                }}
                value={maxDeadlines}
                onChange={handleMaxDeadlinesChange}
              />
              <p> deadlines per course</p>
            </div>
            <Button variant="outlined" onClick={handleSaveChanges}>
              Reload Page
            </Button>
          </FormGroup>
          <p>⚠️ Please refresh your canvas tab after making changes</p>
          <p>
            ☣️ Report Issues/Bugs to Developer:{" "}
            <a href="mailto:me@pohwp.dev">me@pohwp.dev</a>
          </p>
          <p>☕ Made by Wei Pin P.</p>
          <Button
            size="small"
            sx={{ color: "white", borderRadius: "10px", fontSize: "12px" }}
            onClick={() => chrome.runtime.openOptionsPage()}
            className="button"
            variant="contained"
          >
            How To Use?
          </Button>
        </Grid>
      </div>
    </ThemeProvider>
  );
};

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);
root.render(<App />);
