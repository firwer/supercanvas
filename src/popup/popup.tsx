import React, { useEffect, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { TwitterPicker } from "react-color";
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
  const [disableFileSearch, setDisableFileSearch] = useState(true);

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

  useEffect(() => {
    chrome.storage.local.get(
      ["isEnabledDeadline", "isEnabledFileSearch"],
      function (result) {
        if (result.isEnabledDeadline !== undefined) {
          setDisableDeadline(result.isEnabledDeadline);
        }
        if (result.isEnabledFileSearch !== undefined) {
          setDisableFileSearch(result.isEnabledFileSearch);
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
          <FormGroup>
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
          </FormGroup>
          <p>⚠️ Please refresh your canvas tab after making changes</p>
          <p>
            ☣️ Report Issues/Bugs to Developer:{" "}
            <a href="mailto:me@pohwp.dev">me@pohwp.dev</a>
          </p>
          <p>☕ Made by Wei Pin P.</p>
        </Grid>
      </div>
    </ThemeProvider>
  );
};

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);
root.render(<App />);
