import { Box, IconButton, useTheme } from "@mui/material";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import {
  searchStationsByName,
  getLinesForStation,
} from "../../metroSystem/services/stationApi";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Badge from "@mui/material/Badge";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import { getActiveSuspensions } from "../../metroSystem/services/suspensionApi";
import ClickAwayListener from "@mui/material/ClickAwayListener";

const Topbar = ({ isSidebarCollapsed }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const sidebarWidth = isSidebarCollapsed ? 80 : 250;

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchAnchor, setSearchAnchor] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [linesForStation, setLinesForStation] = useState({});
  const [linesLoading, setLinesLoading] = useState({});

  const [suspensions, setSuspensions] = useState([]);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);

  // Chỉ cập nhật search text, không gọi API ở đây
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim().length === 0) {
      setSearchResults([]);
      setSearchAnchor(null);
    }
    // Không gọi API ở đây nữa!
  };

  // Khi bấm Enter mới gọi API tìm kiếm
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (search.trim().length === 0) {
        setSearchResults([]);
        setSearchAnchor(null);
        return;
      }
      if (!searchAnchor) setSearchAnchor(e.target);
      setSearchLoading(true);
      searchStationsByName(search)
        .then((res) => setSearchResults(res.data || []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }
  };

  const handleSearchFocus = (e) => setSearchAnchor(e.currentTarget);

  const fetchLinesForStation = async (stationId) => {
    if (linesForStation[stationId] || linesLoading[stationId]) return;
    setLinesLoading((prev) => ({ ...prev, [stationId]: true }));
    try {
      const res = await getLinesForStation(stationId);
      setLinesForStation((prev) => ({ ...prev, [stationId]: res.data || [] }));
    } catch {
      setLinesForStation((prev) => ({ ...prev, [stationId]: [] }));
    } finally {
      setLinesLoading((prev) => ({ ...prev, [stationId]: false }));
    }
  };

  const handleGoToMapView = (stationId) => {
    navigate(`/dashboard/station?stationId=${stationId}`);
    setSearchAnchor(null);
    setSearch("");
    setSearchResults([]);
  };

  const handleGoToTrips = (lineId, stationId) => {
    navigate("/dashboard/metroline", { state: { lineId, stationId } });
    setSearchAnchor(null);
    setSearch("");
    setSearchResults([]);
  };

  const isFuzzyMatch = (stationName) => {
    if (!search) return false;
    return !stationName.toLowerCase().includes(search.toLowerCase());
  };

  useEffect(() => {
    setNotifLoading(true);
    getActiveSuspensions()
      .then((res) => setSuspensions(res.data || []))
      .catch(() => setSuspensions([]))
      .finally(() => setNotifLoading(false));
  }, []);

  const handleNotifClick = (e) => setNotifAnchor(e.currentTarget);
  const handleNotifClose = () => setNotifAnchor(null);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      p={2}
      sx={{
        position: "fixed",
        top: 0,
        left: `${sidebarWidth}px`,
        width: `calc(100% - ${sidebarWidth}px)`,
        backgroundColor: colors.primary[400],
        zIndex: 1200,
        height: "64px",
        transition: "left 0.3s, width 0.3s",
      }}
    >
      {/* SEARCH BAR */}
      <Box
        display="flex"
        bgcolor={theme.palette.background.paper}
        borderRadius="3px"
        p={1}
      >
        <InputBase
          sx={{ ml: 2, flex: 1, color: theme.palette.text.primary }}
          placeholder="Search station by name"
          value={search}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onKeyDown={handleSearchKeyDown} // Thêm dòng này
        />
        <IconButton
          type="button"
          sx={{ p: 1 }}
          onClick={() => {
            if (search.trim().length === 0) {
              setSearchResults([]);
              setSearchAnchor(null);
              return;
            }
            setSearchAnchor(document.activeElement);
            setSearchLoading(true);
            searchStationsByName(search)
              .then((res) => setSearchResults(res.data || []))
              .catch(() => setSearchResults([]))
              .finally(() => setSearchLoading(false));
          }}
        >
          <SearchIcon />
        </IconButton>
        <ClickAwayListener onClickAway={() => setSearchAnchor(null)}>
          <div>
            <Popover
              open={Boolean(searchAnchor) && searchResults.length > 0}
              anchorEl={searchAnchor}
              onClose={() => setSearchAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              PaperProps={{ style: { minWidth: 350, maxHeight: 400 } }}
            >
              <List dense>
                {searchLoading && (
                  <ListItem>
                    <ListItemText primary="Searching..." />
                  </ListItem>
                )}
                {!searchLoading && searchResults.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No stations found." />
                  </ListItem>
                )}
                {searchResults.map((station) => (
                  <ListItem
                    key={station.stationId}
                    alignItems="flex-start"
                    divider
                    onMouseEnter={() => fetchLinesForStation(station.stationId)}
                  >
                    <ListItemText
                      primary={
                        <>
                          {station.stationName}
                          {isFuzzyMatch(station.stationName) && (
                            <Chip
                              label="fuzzy match"
                              size="small"
                              color="info"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </>
                      }
                      secondary={`ID: ${station.stationId}`}
                    />
                    <Tooltip title="Show on map and highlight marker">
                      <Button
                        size="small"
                        onClick={() => handleGoToMapView(station.stationId)}
                      >
                        Map View
                      </Button>
                    </Tooltip>
                    <Box sx={{ ml: 1, minWidth: 120 }}>
                      {linesLoading[station.stationId] ? (
                        <Typography variant="caption" color="text.secondary">
                          Loading lines...
                        </Typography>
                      ) : linesForStation[station.stationId] &&
                        linesForStation[station.stationId].length > 0 ? (
                        linesForStation[station.stationId].map((line) => (
                          <Tooltip
                            key={line.lineId}
                            title={`View trips for ${station.stationName} on ${line.lineName}`}
                          >
                            <Button
                              size="small"
                              sx={{ ml: 0.5, mb: 0.5 }}
                              onClick={() =>
                                handleGoToTrips(line.lineId, station.stationId)
                              }
                            >
                              Trips ({line.lineName})
                            </Button>
                          </Tooltip>
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No lines
                        </Typography>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Popover>
          </div>
        </ClickAwayListener>
      </Box>

      {/* ICONS */}
      <Box display="flex" gap={1}>
        <IconButton>{/* Optional MetroLine icon */}</IconButton>
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
        <IconButton onClick={handleNotifClick}>
          <NotificationsIcon />
        </IconButton>
        <IconButton>
          <SettingsIcon />
        </IconButton>
        <IconButton>
          <PersonIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
