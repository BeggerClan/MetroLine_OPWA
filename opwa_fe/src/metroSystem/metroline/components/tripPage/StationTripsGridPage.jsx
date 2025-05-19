import React, { useEffect, useState } from "react";
import { getTripsForStationInLine, getAllStations, getMetroLineById } from "../../../services/metroLineApi";
import { Box, CircularProgress, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import "./AllTripsGridPage.css";

const formatTime = (time) => {
  if (!time) return '-';
  if (time instanceof Date) return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    const [h, m] = time.split(":");
    return `${h}:${m}`;
  }
  const d = new Date(time);
  if (!isNaN(d)) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return '-';
};

const PAGE_SIZE = 10;

const StationTripsGridPage = ({ lineId, station, onBack }) => {
  const [segments, setSegments] = useState([]);
  const [stationMap, setStationMap] = useState({});
  const [lineName, setLineName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    if (!lineId || !station) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tripsRes, stationsRes, lineRes] = await Promise.all([
          getTripsForStationInLine(lineId, station.stationId),
          getAllStations(),
          getMetroLineById(lineId),
        ]);
        const stationMap = {};
        (stationsRes.data || []).forEach((s) => {
          stationMap[s.stationId] = s.stationName;
        });
        setStationMap(stationMap);
        setLineName(lineRes.data?.lineName || lineId);
        // Flatten all segments from all trips
        const allSegments = [];
        (tripsRes.data || []).forEach(trip => {
          (trip.segments || []).forEach(segment => {
            allSegments.push({
              tripId: trip.tripId,
              lineId: trip.lineId,
              departureTime: segment.departureTime,
              arrivalTime: segment.arrivalTime,
              fromStationId: segment.fromStationId,
              toStationId: segment.toStationId,
              durationMinutes: segment.durationMinutes,
            });
          });
        });
        setSegments(allSegments);
      } catch (err) {
        setError("Failed to load trips or stations");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lineId, station]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, segments.length));
  };

  if (!lineId || !station) return null;
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ color: 'red', mt: 2 }}>{error}</Box>;

  return (
    <Box sx={{ background: '#fff', borderRadius: 3, p: 4, boxShadow: '0 2px 12px #e1e1e1', width: '100%', height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
      <h2 className="alltrips-title">Trips for {station.stationName} ({station.stationId}) in {lineName}</h2>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        sx={{ borderRadius: 2, fontWeight: 600, letterSpacing: 0.5, mb: 2 }}
      >
        Back to Stations
      </Button>
      <div className="alltrips-table-wrapper" style={{ width: '100%', margin: '0 auto', flex: 1, minWidth: 0 }}>
        <table className="alltrips-table">
          <thead>
            <tr className="alltrips-header-row">
              <th className="alltrips-header">Trip ID</th>
              <th className="alltrips-header">Line ID</th>
              <th className="alltrips-header">Departure</th>
              <th className="alltrips-header">Arrival</th>
              <th className="alltrips-header">From</th>
              <th className="alltrips-header">To</th>
              <th className="alltrips-header">Duration (min)</th>
            </tr>
          </thead>
          <tbody>
            {segments.length > 0 ? segments.slice(0, visibleCount).map((seg, index) => (
              <tr
                key={index}
                className={`alltrips-row${index % 2 === 0 ? " even" : " odd"}`}
              >
                <td className="alltrips-cell center">{seg.tripId}</td>
                <td className="alltrips-cell center">{seg.lineId}</td>
                <td className="alltrips-cell center">{formatTime(seg.departureTime)}</td>
                <td className="alltrips-cell center">{formatTime(seg.arrivalTime)}</td>
                <td className="alltrips-cell center">
                  <span className="alltrips-station-chip">
                    {stationMap[seg.fromStationId] || seg.fromStationId} <span className="alltrips-station-id">({seg.fromStationId})</span>
                  </span>
                </td>
                <td className="alltrips-cell center">
                  <span className="alltrips-station-chip">
                    {stationMap[seg.toStationId] || seg.toStationId} <span className="alltrips-station-id">({seg.toStationId})</span>
                  </span>
                </td>
                <td className="alltrips-cell center">{seg.durationMinutes}</td>
              </tr>
            )) : (
              <tr>
                <td className="alltrips-cell center" colSpan={7}>No trips found for this station.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {visibleCount < segments.length && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleLoadMore}
          sx={{ mt: 2, fontWeight: 600, borderRadius: 2 }}
        >
          Load More
        </Button>
      )}
    </Box>
  );
};

export default StationTripsGridPage; 