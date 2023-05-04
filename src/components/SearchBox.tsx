import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import React from "react";
import "./SearchBox.css";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ClearIcon from "@mui/icons-material/Clear";

const SearchBox = ({ courseId }) => {
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
      const folderIds = [
        ...new Set(
          data.filter((file) => file.url !== "").map((file) => file.folder_id)
        ),
      ];
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

  // Calculate the elapsed time since the file was uploaded
  const calculateElapsedTime = (created_at) => {
    const currentDate = new Date();
    const createdAtDate = new Date(created_at);
    const timeDifference = currentDate.getTime() - createdAtDate.getTime();
    const secondsElapsed = timeDifference / 1000;
    const minutesElapsed = secondsElapsed / 60;
    const hoursElapsed = minutesElapsed / 60;
    const daysElapsed = hoursElapsed / 24;
    const weeksElapsed = daysElapsed / 7;
    const monthsElapsed = weeksElapsed / 4;

    if (hoursElapsed < 12) {
      return "Added recently";
    } else if (hoursElapsed >= 12 && hoursElapsed < 24) {
      return `Added ${Math.round(hoursElapsed)} hours ago`;
    } else if (daysElapsed < 7) {
      return `Added ${Math.round(daysElapsed)} days ago`;
    } else if (weeksElapsed < 4) {
      return `Added ${Math.round(weeksElapsed)} weeks ago`;
    } else {
      return `Added ${Math.round(monthsElapsed)} month(s) ago`;
    }
  };

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
      <div style={{ borderRadius: "30px" }}>
        <DialogTitle
          sx={{
            width: "100%",
            padding: "0px",
          }}
        >
          <div className="searchBar">
            <input
              value={searchQuery}
              onChange={handleSearchInputChange}
              type="text"
              placeholder={`Search Module Files...`}
              style={{
                fontSize: "24px",
                width: "100%",
                height: "40px",
                marginBottom: "0.5rem",
                border: "none",
              }}
            ></input>
            {searchQuery != "" && (
              <ClearIcon
                htmlColor="#999"
                fontSize="large"
                sx={{ padding: "10px", cursor: "pointer" }}
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>
          <FormControl sx={{ minWidth: 120 }}>
            <Select
              placeholder="Folder"
              sx={{ width: "100%", margin: "0px 10px" }}
              labelId="folder-select-label"
              value={selectedFolder}
              onChange={handleSelectFolder}
              displayEmpty
            >
              <MenuItem value="">
                <em>All Folders</em>
              </MenuItem>
              {folders
                .map((f) => {
                  console.log(f.id);
                  return f;
                })
                .map((folder) => {
                  return (
                    <MenuItem
                      sx={{ justifyContent: "space-between" }}
                      key={folder.id}
                      value={folder.id}
                    >
                      {folder.full_name.replace("course files/", "")}
                    </MenuItem>
                  );
                })}
            </Select>
          </FormControl>
        </DialogTitle>
        <DialogContent
          sx={{
            alignItems: "center",
            justifyContent: "center",
            height: "500px",
            minHeight: "100px",
            width: "500px",
          }}
        >
          {isLoading ? (
            <div className="spinnerBox">
              <CircularProgress thickness={10} />
            </div>
          ) : (
            <ul style={{ padding: "0", margin: "0" }}>
              {filteredFiles.length > 0 ? (
                filteredFiles
                  .sort(
                    (a, b) =>
                      Date.parse(b.created_at) - Date.parse(a.created_at)
                  )
                  .map((file, index) => {
                    const elapsedTime = calculateElapsedTime(file.created_at);
                    return (
                      <li key={index} className="itemBox">
                        <div className="leftpanel">
                          <a href={file.url} className="itemText" download>
                            {file.display_name}
                          </a>
                        </div>
                        <div className="rightpanel">
                          <div className="elapsedTime">{elapsedTime}</div>
                          <IconButton
                            onClick={() => handlePreviewClick(file.id)}
                            aria-label="preview"
                            title="Preview File"
                          >
                            <RemoveRedEyeIcon />
                          </IconButton>
                        </div>
                      </li>
                    );
                  })
              ) : (
                <p>No files found</p>
              )}
            </ul>
          )}
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default SearchBox;
