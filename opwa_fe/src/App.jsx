// App.jsx
import React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import AppRoutes from "./routes/AppRoutes";
import Topbar from "./scenes/global/Topbar";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import MetroLineGrid from "./metroSystem/metroline/components/metrolineGridPage/MetroLineGrid.jsx";
import LoginPage from "./components/loginpage";
import MetroLineStations from "./metroSystem/metroline/components/metrolineStationGridPage/MetroLineStations.jsx";

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppRoutes />
          
        </BrowserRouter>
      </ThemeProvider>
    </ColorModeContext.Provider>
    
  );
}

export default App;
