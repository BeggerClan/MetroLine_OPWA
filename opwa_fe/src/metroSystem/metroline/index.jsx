import React, { useState } from "react";
import MetroLineGrid from "./components/metrolineGridPage/MetroLineGrid";
import MetroLineStations from "./components/metrolineStationGridPage/MetroLineStations";
import MetroLineMapView from "./components/mapView/MetroLineMapView";
import MetroLineTripsOverview from "./components/tripPage/MetroLineTripsOverview";
import AllTripsGridPage from "./components/tripPage/AllTripsGridPage";
import "./indexMapModal.css";
import { useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [showOverview, setShowOverview] = useState(false);
  const [showAllTrips, setShowAllTrips] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [visibleLineIds, setVisibleLineIds] = useState(null);
  const [stationUpdateCount, setStationUpdateCount] = useState(0);
  const [overviewKey, setOverviewKey] = useState(0);
  const [autoShowStationId, setAutoShowStationId] = useState(null);

  // Handle navigation from Topbar (or other places) with state
  React.useEffect(() => {
    if (location.state && location.state.lineId && location.state.stationId) {
      setSelectedLineId(location.state.lineId);
      setAutoShowStationId(location.state.stationId);
      // Clear state so it doesn't repeat on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleShowStations = (lineId) => {
    setSelectedLineId(lineId);
    setShowOverview(false);
    setShowAllTrips(false);
  };

  const handleBack = () => {
    setSelectedLineId(null);
  };

  const handleVisibleLinesChange = (ids) => {
    setVisibleLineIds(ids);
  };

  const handleShowOverview = () => {
    setShowOverview(true);
    setShowAllTrips(false);
    setSelectedLineId(null);
    setOverviewKey(k => k + 1);
  };

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
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <button
              onClick={() => { setShowOverview(false); setShowAllTrips(false); setSelectedLineId(null); }}
              style={{
                padding: "8px 20px",
                background: !showOverview && !showAllTrips ? "#2d98da" : "#f5f6fa",
                color: !showOverview && !showAllTrips ? "#fff" : "#2d98da",
                border: "1px solid #2d98da",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              Metro Lines
            </button>
            <button
              onClick={handleShowOverview}
              style={{
                padding: "8px 20px",
                background: showOverview ? "#2d98da" : "#f5f6fa",
                color: showOverview ? "#fff" : "#2d98da",
                border: "1px solid #2d98da",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              Trips Overview
            </button>
            <button
              onClick={() => { setShowOverview(false); setShowAllTrips(true); setSelectedLineId(null); }}
              style={{
                padding: "8px 20px",
                background: showAllTrips ? "#2d98da" : "#f5f6fa",
                color: showAllTrips ? "#fff" : "#2d98da",
                border: "1px solid #2d98da",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              All Trips
            </button>
          </div>
          {!showOverview && !showAllTrips ? (
            !selectedLineId ? (
              <MetroLineGrid onShowStations={handleShowStations} />
            ) : (
              <MetroLineStations
                lineId={selectedLineId}
                onBack={handleBack}
                onStationChanged={() => setStationUpdateCount(c => c + 1)}
                autoShowStationId={autoShowStationId}
                onAutoShowStationHandled={() => setAutoShowStationId(null)}
              />
            )
          ) : showOverview ? (
            <MetroLineTripsOverview key={overviewKey + '-' + stationUpdateCount} stationUpdateCount={stationUpdateCount} />
          ) : (
            <AllTripsGridPage stationUpdateCount={stationUpdateCount} />
          )}
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
            <MetroLineMapView
              key={showAllTrips ? (visibleLineIds ? visibleLineIds.join(',') : 'all') : selectedLineId || 'all'}
              selectedLineId={showAllTrips ? null : selectedLineId}
              visibleLineIds={showAllTrips ? visibleLineIds : null}
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
              <MetroLineMapView
                key={showAllTrips ? (visibleLineIds ? visibleLineIds.join(',') : 'all') : selectedLineId || 'all'}
                selectedLineId={showAllTrips ? null : selectedLineId}
                visibleLineIds={showAllTrips ? visibleLineIds : null}
                style={{ width: "80vw", height: "70vh" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
