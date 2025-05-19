import React, { useState, useEffect } from "react";
import StationGrid from "./components/StationGrid";
import StationMapView from "./components/StationMapView";
import { getAllStations } from "../services/stationApi";
import "../metroline/indexMapModal.css";
import { useLocation, useNavigate } from "react-router-dom";

export default function Station() {
  const [selectedStationIds, setSelectedStationIds] = useState([]);
  const [allStationIds, setAllStationIds] = useState([]);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  // Read stationId from query string
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stationId = params.get("stationId");
    if (stationId) {
      setSelectedStationIds([stationId]);
    }
  }, [location.search]);

  useEffect(() => {
    getAllStations().then(res => {
      setAllStationIds(res.data.map(st => st.stationId));
    });
  }, []);

  const handleShowStation = (stationId) => {
    setSelectedStationIds(prev => {
      if (prev.includes(stationId)) {
        // Remove if already selected
        return prev.filter(id => id !== stationId);
      } else {
        // Add to selection
        return [...prev, stationId];
      }
    });
  };

  const handleResetSelection = () => {
    setSelectedStationIds([]);
    // Remove stationId from query string
    navigate({ search: "" });
  };

  // If all stations are selected or none, treat as "show all"
  const isAllSelected =
    selectedStationIds.length === 0 ||
    (allStationIds.length > 0 && selectedStationIds.length === allStationIds.length);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(120deg, #f5f6fa 60%, #eaf0fb 100%)"
      }}
    >
      <div style={{
        width: "98vw",
        maxWidth: 1500,
        display: "flex",
        gap: 32,
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 4px 32px #e1e1e1",
        padding: 32,
        margin: 24
      }}>
        {/* Main content */}
        <div style={{ flex: 2, minWidth: 0, paddingRight: 16 }}>
          <div style={{ marginBottom: 16 }} />
          <StationGrid
            onShowStation={handleShowStation}
            selectedStationIds={selectedStationIds}
          />
        </div>
        {/* Mini Map on the right */}
        <div style={{ flex: 1, minWidth: 350, maxWidth: 500, position: "relative", background: "#f8fafd", borderRadius: 14, boxShadow: "0 2px 12px #e1e1e1", padding: 16 }}>
          <div className="mini-map-container">
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
              <button
                onClick={() => setMapModalOpen(true)}
                className="mini-map-enlarge-btn"
                title="Enlarge Map"
              >
                <span style={{ fontSize: 20, color: "#2d98da" }}>⤢</span>
              </button>
            </div>
            <StationMapView
              selectedStationIds={isAllSelected ? [] : selectedStationIds}
              onResetSelection={handleResetSelection}
              showResetButton={(!isAllSelected && selectedStationIds.length > 0) || (new URLSearchParams(location.search).get("stationId") != null)}
            />
          </div>
        </div>
        {/* Map Modal */}
        {mapModalOpen && (
          <div className="map-modal-overlay" onClick={() => setMapModalOpen(false)}>
            <div className="map-modal-close-row">
              <button
                onClick={() => setMapModalOpen(false)}
                className="map-modal-close-btn"
                title="Close"
              >
                <span style={{ fontSize: 20, color: "#2d98da" }}>×</span>
              </button>
            </div>
            <div className="map-modal-box" onClick={e => e.stopPropagation()}>
              <StationMapView
                selectedStationIds={isAllSelected ? [] : selectedStationIds}
                onResetSelection={handleResetSelection}
                showResetButton={(!isAllSelected && selectedStationIds.length > 0) || (new URLSearchParams(location.search).get("stationId") != null)}
                style={{ width: "80vw", height: "70vh" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}