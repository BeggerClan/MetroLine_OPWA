import React, { useEffect, useState, useCallback } from "react";
import { getAllTrips, getAllMetroLines, getAllStations } from "../../../services/metroLineApi";
import { Button, CircularProgress, Box } from "@mui/material";

// Helper to format 'HH:mm:ss' as 'HH:mm', fallback to '-'
const formatTime = (time) => {
  if (!time) return '-';
  if (typeof time === "string" && time.length >= 5) return time.slice(0, 5);
  if (time instanceof Date) return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return '-';
};

const MetroLineTripsOverview = ({ stationUpdateCount }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tripsByLine, setTripsByLine] = useState({});
  const [lines, setLines] = useState([]);
  const [stationMap, setStationMap] = useState({});
  const [tripType, setTripType] = useState("both"); // "both" | "forward" | "return"

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tripsRes, linesRes, stationsRes] = await Promise.all([
        getAllTrips(),
        getAllMetroLines(),
        getAllStations(),
      ]);
      const trips = tripsRes.data || [];
      const lines = linesRes.data || [];
      const stations = stationsRes.data || [];
      setLines(lines);

      // Map stationId to stationName
      const map = {};
      stations.forEach((s) => {
        map[s.stationId] = s.stationName;
      });
      setStationMap(map);

      // Group trips by lineId
      const grouped = {};
      trips.forEach((trip) => {
        if (!grouped[trip.lineId]) grouped[trip.lineId] = [];
        grouped[trip.lineId].push(trip);
      });
      // Sort trips for each line by departure time
      Object.keys(grouped).forEach((lineId) => {
        grouped[lineId].sort((a, b) =>
          a.departureTime.localeCompare(b.departureTime)
        );
      });
      setTripsByLine(grouped);
    } catch (err) {
      setError("Failed to load trips, lines, or stations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, stationUpdateCount]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress />
    </Box>
  );
  if (error) return <Box sx={{ color: 'red', mt: 2 }}>{error}</Box>;

  // Helper to render a trip's route as station names and IDs
  const renderRoute = (segments) => {
    if (!segments || segments.length === 0) return "-";
    const stops = [segments[0].fromStationId, ...segments.map(seg => seg.toStationId)];
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {stops.map((sid, idx) => (
          <span key={sid} style={{
            background: "#f1f2f6",
            borderRadius: 4,
            padding: "2px 8px",
            fontSize: 13,
            color: "#222"
          }}>
            {stationMap[sid] || sid} <span style={{ color: "#888", fontSize: 11 }}>({sid})</span>
            {idx < stops.length - 1 && <span style={{ margin: "0 4px", color: "#2d98da" }}>→</span>}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 32, boxShadow: "0 2px 12px #e1e1e1" }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, gap: 16 }}>
        <h2 style={{ margin: 0, color: "#2d98da" }}>Metro Line Trips Overview</h2>
        <Button variant="outlined" color="primary" onClick={fetchData} disabled={loading} sx={{ fontWeight: 600, borderRadius: 2 }}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      {lines.map((line) => {
        const trips = tripsByLine[line.lineId] || [];
        if (trips.length === 0) return null;
        // Split trips by type
        const forwardTrips = trips.filter(t => !t.returnTrip);
        const returnTrips = trips.filter(t => t.returnTrip);
        // Get last 2 of each
        const last2Forward = forwardTrips.slice(-2);
        const last2Return = returnTrips.slice(-2);
        let filteredTrips = [];
        if (tripType === "forward") filteredTrips = last2Forward;
        else if (tripType === "return") filteredTrips = last2Return;
        else filteredTrips = [...last2Forward, ...last2Return];
        return (
          <div key={line.lineId + '-' + stationUpdateCount} style={{ marginBottom: 40 }}>
            <h3 style={{ color: "#222", marginBottom: 12 }}>
              {line.lineName} <span style={{ color: "#888", fontWeight: 400 }}>({line.lineId})</span>
            </h3>
            <div style={{ marginBottom: 12 }}>
              <Button
                variant={tripType === "both" ? "contained" : "outlined"}
                onClick={() => setTripType("both")}
                sx={{ mr: 1 }}
              >
                Both
              </Button>
              <Button
                variant={tripType === "forward" ? "contained" : "outlined"}
                onClick={() => setTripType("forward")}
                sx={{ mr: 1 }}
              >
                Forward
              </Button>
              <Button
                variant={tripType === "return" ? "contained" : "outlined"}
                onClick={() => setTripType("return")}
              >
                Return
              </Button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "#fafcff", border: "2px solid #2d98da" }}>
                <thead>
                  <tr style={{ background: "#f1f2f6" }}>
                    <th style={{ padding: 8, fontWeight: 500, border: "1.5px solid #2d98da" }}>Trip ID</th>
                    <th style={{ padding: 8, fontWeight: 500, border: "1.5px solid #2d98da" }}>Departure</th>
                    <th style={{ padding: 8, fontWeight: 500, border: "1.5px solid #2d98da" }}>Arrival</th>
                    <th style={{ padding: 8, fontWeight: 500, border: "1.5px solid #2d98da" }}>Route</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrips.map((trip) => (
                    <tr key={trip.tripId} style={{ borderBottom: "2px solid #2d98da" }}>
                      <td style={{ padding: 8, border: "1.5px solid #2d98da" }}>{trip.tripId}</td>
                      <td style={{ padding: 8, border: "1.5px solid #2d98da" }}>{formatTime(trip.departureTime)}</td>
                      <td style={{ padding: 8, border: "1.5px solid #2d98da" }}>{formatTime(trip.arrivalTime)}</td>
                      <td style={{ padding: 8, border: "1.5px solid #2d98da" }}>{renderRoute(trip.segments)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetroLineTripsOverview; 