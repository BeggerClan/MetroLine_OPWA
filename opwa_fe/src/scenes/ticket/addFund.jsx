import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { fetchPassengerIds, addFunds } from "./ticketAPI";

const AddFund = () => {
  const [passengerIds, setPassengerIds] = useState([]);
  const [form, setForm] = useState({
    passengerId: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPassengerIds(token)
      .then(setPassengerIds)
      .catch((err) => alert("Failed to load passenger list: " + err.message));
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addFunds(
        { passengerId: form.passengerId, amount: Number(form.amount) },
        token
      );
      alert("Funds added successfully!");
      setForm({ passengerId: "", amount: "" });
    } catch (err) {
      alert("Failed to add funds: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        minHeight: "100vh",
        bgcolor: "#f4f6f8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Add Funds to Account
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <form onSubmit={handleSubmit}>
          <Autocomplete
            options={passengerIds}
            value={
              passengerIds.find((p) => p.passengerId === form.passengerId) ||
              null
            }
            onChange={(_, value) =>
              setForm({
                ...form,
                passengerId: value ? value.passengerId : "",
              })
            }
            getOptionLabel={(option) =>
              typeof option === "string"
                ? option
                : `${option.name || ""} : ${option.passengerId || ""}`
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Passenger"
                margin="normal"
                required
              />
            )}
            fullWidth
            isOptionEqualToValue={(option, value) =>
              (typeof option === "object" ? option.passengerId : option) ===
              (typeof value === "object" ? value.passengerId : value)
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Amount to Add (VND)"
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            required
            inputProps={{ min: 1000 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={
              loading ||
              !form.passengerId ||
              !form.amount ||
              Number(form.amount) < 1000
            }
          >
            {loading ? "Processing..." : "Add Funds"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AddFund;