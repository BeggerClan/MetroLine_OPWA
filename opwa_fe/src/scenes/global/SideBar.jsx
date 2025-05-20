import {
  Sidebar as ProSidebar,
  Menu,
  MenuItem,
  ProSidebarProvider,
} from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import DirectionsTransitOutlinedIcon from "@mui/icons-material/DirectionsTransitOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"; // Add this import at the top
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined"; // thêm dòng này
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined"; // Import icon tiền

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
      component={<Link to={to} />}
    >
      <Typography>{title}</Typography>
    </MenuItem>
  );
};

const Sidebar = ({ isCollapsed, onToggleCollapse, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const location = useLocation();
  const navigate = useNavigate();

  // Hàm logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <ProSidebarProvider>
      <Box
        sx={{
          position: "fixed",
          left: 0,
          top: 0, // Topbar will be offset, so Sidebar starts at top
          height: "100vh",
          zIndex: 1100,
          width: isCollapsed ? "80px" : "250px",
          transition: "width 0.3s",
          background: colors.primary[400],
        }}
      >
        <ProSidebar collapsed={isCollapsed}>
          <Menu iconShape="square">
            {/* LOGO AND MENU ICON */}
            <MenuItem
              icon={
                isCollapsed ? (
                  <IconButton onClick={onToggleCollapse}>
                    <MenuOutlinedIcon />
                  </IconButton>
                ) : undefined
              }
              style={{
                margin: "10px 0 20px 0",
                color: colors.grey[100],
              }}
            >
              {!isCollapsed && (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  ml="15px"
                >
                  <Typography variant="h3" color={colors.grey[100]}>
                    ADMINIS
                  </Typography>
                  <IconButton onClick={onToggleCollapse}>
                    <MenuOutlinedIcon />
                  </IconButton>
                </Box>
              )}
            </MenuItem>

            <Box paddingLeft={isCollapsed ? undefined : "10%"}>
              <Item
                title="Dashboard"
                to="/dashboard"
                icon={<HomeOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />

              <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                Staff
              </Typography>
              <Item
                title="Manage Staff"
                to="/dashboard/team"
                icon={<PeopleOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />

              <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                Ticket
              </Typography>
              <Item
                title="Ticket Purchase"
                to="/dashboard/ticket"
                icon={<ReceiptOutlinedIcon />} // Changed to buying ticket icon
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Booking Records"
                to="/dashboard/booking-records"
                icon={<ReceiptOutlinedIcon />} // hoặc icon khác bạn thích
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Add Funds to Account"
                to="/dashboard/add-funds"
                icon={<AttachMoneyOutlinedIcon />} // hoặc icon khác bạn thích
                selected={selected}
                setSelected={setSelected}
              />

              <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                HCMC Metro System
              </Typography>
              <Item
                title="Metro Line"
                to="/dashboard/metroline"
                icon={<DirectionsTransitOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
                onClick={() => {
                  if (location.pathname === "/dashboard/metroline") {
                    // Force a refresh/reset by navigating to the same route with replace and no state
                    navigate("/dashboard/metroline", { replace: true, state: {} });
                  }
                }}
              />
              <Item
                title="Station"
                to="/dashboard/station"
                icon={<LocationOnOutlinedIcon />} // <-- Station icon here
                selected={selected}
                setSelected={setSelected}
              />
              <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: "15px 0 5px 20px" }}
              >
                Static Charts
              </Typography>
              <Item
                title="Pie Chart"
                to="/dashboard/pie"
                icon={<PieChartOutlineOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              {/* Logout */}
              <MenuItem
                icon={<LogoutOutlinedIcon />}
                style={{ color: colors.grey[100], marginTop: "2rem" }}
                onClick={handleLogout}
              >
                <Typography>Logout</Typography>
              </MenuItem>
            </Box>
          </Menu>
        </ProSidebar>
      </Box>
    </ProSidebarProvider>
  );
};

export default Sidebar;
