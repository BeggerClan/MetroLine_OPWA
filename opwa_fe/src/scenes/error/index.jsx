import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useLocation } from "react-router-dom";

const ErrorPage = () => {
  const location = useLocation();
  const errorCode = location.state?.code || 403;
  const errorMsg =
    errorCode === 401
      ? "You are not authenticated. Please log in to continue."
      : "You do not have permission to access this page.";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4f6f8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "1600px", // Add fixed width
        mx: "auto", // Center horizontally
      }}
    >
      <Typography variant="h2" color="error" gutterBottom>
        {errorCode}
      </Typography>
      <Typography variant="h5" gutterBottom>
        {errorMsg}
      </Typography>
    </Box>
  );
};

export default ErrorPage;
