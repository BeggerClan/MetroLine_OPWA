import { useParams } from "react-router-dom";
import StationTripsGridPage from "./StationTripsGridPage";
import { useEffect, useState } from "react";
import { getStation } from "../../../services/stationApi";

const StationTripsGridPageWrapper = () => {
  const { lineId, stationId } = useParams();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStation(stationId)
      .then(res => setStation(res.data))
      .finally(() => setLoading(false));
  }, [stationId]);

  if (loading) return <div style={{ padding: 32 }}>Loading station...</div>;
  if (!station) return <div style={{ padding: 32, color: 'red' }}>Station not found.</div>;

  return (
    <StationTripsGridPage
      lineId={lineId}
      station={station}
      onBack={() => window.history.back()}
    />
  );
};

export default StationTripsGridPageWrapper; 