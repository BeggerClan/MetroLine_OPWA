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
import { searchStationsByName, getLinesForStation } from "../../metroSystem/services/stationApi";
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

const Topbar = ({ isSidebarCollapsed }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const sidebarWidth = isSidebarCollapsed ? 80 : 250;

  // Search bar state
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchAnchor, setSearchAnchor] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // For caching lines per station
  const [linesForStation, setLinesForStation] = useState({});
  const [linesLoading, setLinesLoading] = useState({});

  // Notification bell state
  const [suspensions, setSuspensions] = useState([]);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);

  // Search stations by name
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await searchStationsByName(value);
      setSearchResults(res.data || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Open/close search popover
  const handleSearchFocus = (e) => setSearchAnchor(e.currentTarget);
  const handleSearchBlur = () => setTimeout(() => setSearchAnchor(null), 200);

  // Fetch lines for a station if not already fetched
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

  // Navigation from search result
  const handleGoToMapView = (stationId) => {
    navigate(`/dashboard/station?stationId=${stationId}`);
    setSearchAnchor(null);
    setSearch("");
    setSearchResults([]);
  };

  // Navigation for trips
  const handleGoToTrips = (lineId, stationId) => {
    navigate(`/dashboard/metroline/${lineId}/station/${stationId}/trips`);
    setSearchAnchor(null);
    setSearch("");
    setSearchResults([]);
  };

  // Helper to check if result is a fuzzy match
  const isFuzzyMatch = (stationName) => {
    if (!search) return false;
    return !stationName.toLowerCase().includes(search.toLowerCase());
  };

  // Fetch suspensions on mount
  useEffect(() => {
    setNotifLoading(true);
    getActiveSuspensions()
      .then(res => setSuspensions(res.data || []))
      .catch(() => setSuspensions([]))
      .finally(() => setNotifLoading(false));
  }, []);

  // Open/close notification popover
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
      <Box display="flex" bgcolor={theme.palette.background.paper} borderRadius="3px" p={1}>
        <InputBase
          sx={{ ml: 2, flex: 1, color: theme.palette.text.primary }}
          placeholder="Search station by name"
          value={search}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
        />
        <IconButton type="button" sx={{ p: 1 }} onClick={handleSearchFocus}>
          <SearchIcon />
        </IconButton>
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
                  primary={<>
                    {station.stationName}
                    {isFuzzyMatch(station.stationName) && (
                      <Chip label="fuzzy match" size="small" color="info" sx={{ ml: 1 }} />
                    )}
                  </>}
                  secondary={`ID: ${station.stationId}`}
                />
                <Tooltip title="Show on map and highlight marker">
                  <Button size="small" onClick={() => handleGoToMapView(station.stationId)}>
                    Map View
                  </Button>
                </Tooltip>
                <Box sx={{ ml: 1, minWidth: 120 }}>
                  {linesLoading[station.stationId] ? (
                    <Typography variant="caption" color="text.secondary">Loading lines...</Typography>
                  ) : linesForStation[station.stationId] && linesForStation[station.stationId].length > 0 ? (
                    linesForStation[station.stationId].map((line) => (
                      <Tooltip key={line.lineId} title={`View trips for ${station.stationName} on ${line.lineName}`}> 
                        <Button
                          size="small"
                          sx={{ ml: 0.5, mb: 0.5 }}
                          onClick={() => handleGoToTrips(line.lineId, station.stationId)}
                        >
                          Trips ({line.lineName})
                        </Button>
                      </Tooltip>
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary">No lines</Typography>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </Popover>
      </Box>

      {/* ICONS */}
      <Box display="flex" gap={1}>
        {/* MetroLine navigation icon */}
        <IconButton>
          {/* Add MetroLine icon if needed */}
        </IconButton>
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
        <IconButton>
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
