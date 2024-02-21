import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import React from "react";
import "./CourseSearchBox.css";
import ClearIcon from "@mui/icons-material/Clear";
import Fuse from "fuse.js";
import ItemBox from "./ItemBox";

const fuseOptions = {
  includeScore: true,
  keys: ["display_name"],
  threshold: 0.3,
};

const SearchBox = ({ courseId }) => {
  const [open, setOpen] = React.useState(true);
  const [files, setFiles] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedFolder, setSelectedFolder] = React.useState("");
  const [folders, setFolders] = React.useState([]);
  const [fuse, setFuse] = React.useState(new Fuse(files, fuseOptions));

  React.useEffect(() => {
    const newFuse = new Fuse(files, fuseOptions);
    setFuse(newFuse);
  }, [files]);

  React.useEffect(() => {
    async function fetchFiles() {
      const response = await fetch(
        `/api/v1/courses/${courseId}/files?per_page=100`
      );
      if (response.ok) {
        const data = await response.json();
        const folderIds = [
          ...new Set(
            data.filter((file) => file.url !== "").map((file) => file.folder_id)
          ),
        ];
        setFiles(data);
        fetchFolders(folderIds);
      }
      setIsLoading(false);
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
    setSelectedFolder(event.target.value);
  };

  const filteredFiles = React.useMemo(() => {
    if (selectedFolder !== "") {
      if (searchQuery === "") {
        return files.filter((file) => file.folder_id === selectedFolder);
      }
      const filtered = fuse.search(searchQuery);
      return filtered
        .map((result) => result.item) // map FuseResult to original item
        .filter((file) => file.folder_id === selectedFolder);
    } else {
      if (searchQuery === "") {
        return files;
      }
      return fuse.search(searchQuery).map((result) => result.item); // map FuseResult to original item
    }
  }, [files, searchQuery, selectedFolder]);

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
                  return f;
                })
                .map((folder) => {
                  const name = folder.full_name.replace("course files/", "");
                  return (
                    <MenuItem
                      sx={{ justifyContent: "space-between" }}
                      key={folder.id}
                      value={folder.id}
                    >
                      {name.length > 40 ? name.substring(0, 40) + "..." : name}
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
            height: "350px",
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
                    return (
                      <ItemBox key={index} file={file} courseId={courseId} />
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
