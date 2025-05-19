import React, { useEffect, useState } from "react";
import { getAllStations, addStation, updateStation, deleteStation } from "../../services/stationApi";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Snackbar, Alert, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const emptyStation = { stationName: '', latitude: '', longitude: '', mapMarker: '' };

const markerColors = [
  'red', 'blue', 'green', 'orange', 'purple', 'yellow', 'brown', 'gray', 'pink'
];

const StationGrid = ({ onShowStation }) => {
  const [stations, setStations] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [form, setForm] = useState(emptyStation);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchStations = () => {
    setLoading(true);
    getAllStations()
      .then(res => {
        if (Array.isArray(res.data)) {
          setStations(res.data);
          setError(null);
        } else {
          setStations([]);
          setError('Malformed station data received.');
        }
      })
      .catch(() => {
        setStations([]);
        setError('Failed to fetch stations. Please check your backend or network.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleOpenAdd = () => {
    setEditingStation(null);
    setForm(emptyStation);
    setDialogOpen(true);
  };

  const handleOpenEdit = (station) => {
    setEditingStation(station);
    setForm({
      stationName: station.stationName || '',
      latitude: station.latitude || '',
      longitude: station.longitude || '',
      mapMarker: station.mapMarker || ''
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingStation(null);
    setForm(emptyStation);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (editingStation) {
        await updateStation(editingStation.stationId, form);
        setSnackbar({ open: true, message: 'Station updated successfully!', severity: 'success' });
      } else {
        await addStation(form);
        setSnackbar({ open: true, message: 'Station added successfully!', severity: 'success' });
      }
      fetchStations();
      handleDialogClose();
    } catch (e) {
      setError('Failed to save station.');
      setSnackbar({ open: true, message: 'Failed to save station.', severity: 'error' });
    }
  };

  const handleOpenDelete = (stationId) => {
    setDeleteId(stationId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteStation(deleteId);
      fetchStations();
      setSnackbar({ open: true, message: 'Station deleted successfully!', severity: 'success' });
    } catch (e) {
      setError('Failed to delete station.');
      setSnackbar({ open: true, message: 'Failed to delete station.', severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) return <div style={{ padding: 24 }}><CircularProgress /></div>;
  if (error) return <div style={{ color: 'red', margin: 16 }}>{error}</div>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Stations</h2>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd} color="primary">Add Station</Button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Station ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Latitude</TableCell>
              <TableCell>Longitude</TableCell>
              <TableCell>Marker</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stations.map(station => (
              <TableRow
                key={station.stationId}
                style={{ cursor: "pointer" }}
                onClick={e => {
                  // Prevent row click when clicking action buttons
                  if (e.target.closest('button')) return;
                  onShowStation(station.stationId);
                }}
              >
                <TableCell>{station.stationId}</TableCell>
                <TableCell>{station.stationName}</TableCell>
                <TableCell>{station.latitude}</TableCell>
                <TableCell>{station.longitude}</TableCell>
                <TableCell>{station.mapMarker}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpenEdit(station)} title="Edit"><EditIcon /></IconButton>
                  <IconButton size="small" onClick={() => handleOpenDelete(station.stationId)} title="Delete" color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>{editingStation ? 'Edit Station' : 'Add Station'}</DialogTitle>
        <DialogContent style={{ minWidth: 350 }}>
          <TextField
            margin="dense"
            label="Name"
            name="stationName"
            value={form.stationName}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Latitude"
            name="latitude"
            value={form.latitude}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Longitude"
            name="longitude"
            value={form.longitude}
            onChange={handleFormChange}
            fullWidth
            required
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="marker-select-label">Marker Color</InputLabel>
            <Select
              labelId="marker-select-label"
              label="Marker Color"
              name="mapMarker"
              value={form.mapMarker}
              onChange={handleFormChange}
            >
              {markerColors.map(color => (
                <MenuItem key={color} value={color}>
                  <span style={{ display: 'inline-block', width: 16, height: 16, background: color, borderRadius: '50%', marginRight: 8, verticalAlign: 'middle' }} />
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">{editingStation ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Station</DialogTitle>
        <DialogContent>Are you sure you want to delete this station?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default StationGrid;