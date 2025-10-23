import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

const Dashboard = () => {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://tensio-track-backend.vercel.app/api/measurements/range", {
          params: dateRange,
        });
        setMeasurements(response.data.measurements);
        setError("");
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error("Error fetching measurements:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurements();
  }, [dateRange]);

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeleteMeasurement = async (measurementId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette mesure ?")) {
      return;
    }

    try {
      setDeleteLoading(measurementId);
      await axios.delete(`https://tensio-track-backend.vercel.app/api/measurements/${measurementId}`);

      setMeasurements(measurements.filter((m) => m._id !== measurementId));
      setError("");
    } catch (err) {
      setError("Erreur lors de la suppression de la mesure");
      console.error("Error deleting measurement:", err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const chartData = measurements
    .map((measurement) => ({
      date: new Date(measurement.measurementDate).toLocaleDateString("fr-FR"),
      time: measurement.measurementTime,
      systolic: measurement.systolic,
      diastolic: measurement.diastolic,
      pulse: measurement.pulse,
      dateTime: `${new Date(measurement.measurementDate).toLocaleDateString(
        "fr-FR"
      )} ${measurement.measurementTime}`,
    }))
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  const getBloodPressureCategory = (systolic, diastolic) => {
    if (systolic >= 180 || diastolic >= 110)
      return { category: "Hypertension grade 3", color: "#8b0000" };

    if (
      (systolic >= 160 && systolic <= 179) ||
      (diastolic >= 100 && diastolic <= 109)
    )
      return { category: "Hypertension grade 2", color: "#dc3545" };

    if (
      (systolic >= 140 && systolic <= 159) ||
      (diastolic >= 90 && diastolic <= 99)
    )
      return { category: "Hypertension grade 1", color: "#fd7e14" };

    if (
      (systolic >= 130 && systolic <= 139) ||
      (diastolic >= 85 && diastolic <= 89)
    )
      return { category: "Normal Haute", color: "#ffc107" };

    if (
      (systolic >= 120 && systolic <= 129) ||
      (diastolic >= 80 && diastolic <= 84)
    )
      return { category: "Normale", color: "#28a745" };

    if (systolic < 120 && diastolic < 80)
      return { category: "Optimale", color: "#20c997" };

    return { category: "Non classifiée", color: "#6c757d" };
  };

  const getStats = () => {
    if (measurements.length === 0) return null;

    const systolicValues = measurements.map((m) => m.systolic);
    const diastolicValues = measurements.map((m) => m.diastolic);
    const pulseValues = measurements.map((m) => m.pulse);

    return {
      avgSystolic: Math.round(
        systolicValues.reduce((a, b) => a + b, 0) / systolicValues.length
      ),
      avgDiastolic: Math.round(
        diastolicValues.reduce((a, b) => a + b, 0) / diastolicValues.length
      ),
      avgPulse: Math.round(
        pulseValues.reduce((a, b) => a + b, 0) / pulseValues.length
      ),
      minSystolic: Math.min(...systolicValues),
      maxSystolic: Math.max(...systolicValues),
      minDiastolic: Math.min(...diastolicValues),
      maxDiastolic: Math.max(...diastolicValues),
      totalMeasurements: measurements.length,
    };
  };

  const stats = getStats();

  if (loading) {
    return <div className="loading">Chargement des données...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Tableau de bord</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="date-filter">
        <div className="form-group">
          <label htmlFor="startDate">Date de début</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">Date de fin</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
          />
        </div>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Mesures totales</h3>
            <p className="stat-value">{stats.totalMeasurements}</p>
          </div>
          <div className="stat-card">
            <h3>Moyenne systolique</h3>
            <p className="stat-value">{stats.avgSystolic} mmHg</p>
            <p className="stat-range">
              ({stats.minSystolic} - {stats.maxSystolic})
            </p>
          </div>
          <div className="stat-card">
            <h3>Moyenne diastolique</h3>
            <p className="stat-value">{stats.avgDiastolic} mmHg</p>
            <p className="stat-range">
              ({stats.minDiastolic} - {stats.maxDiastolic})
            </p>
          </div>
          <div className="stat-card">
            <h3>Pouls moyen</h3>
            <p className="stat-value">{stats.avgPulse} bpm</p>
          </div>
        </div>
      )}

      {chartData.length > 0 ? (
        <div className="chart-container">
          <h3>Évolution de la tension</h3>
          <ResponsiveContainer
            width="100%"
            height={window.innerWidth <= 600 ? 300 : 400}
          >
            <LineChart
              data={chartData}
              margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: window.innerWidth <= 600 ? 10 : 12 }}
                angle={-45}
                textAnchor="end"
                height={window.innerWidth <= 600 ? 80 : 60}
                interval={window.innerWidth <= 600 ? "preserveStartEnd" : 0}
              />
              <YAxis tick={{ fontSize: window.innerWidth <= 600 ? 10 : 12 }} />
              <Tooltip
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value, name) => [
                  `${value} ${name === "pulse" ? "bpm" : "mmHg"}`,
                  name === "systolic"
                    ? "Systolique"
                    : name === "diastolic"
                    ? "Diastolique"
                    : "Pouls",
                ]}
                contentStyle={{
                  fontSize: window.innerWidth <= 600 ? "12px" : "14px",
                }}
              />
              <Legend
                verticalAlign="top"
                height={30}
                wrapperStyle={{
                  fontSize: window.innerWidth <= 600 ? "12px" : "14px",
                  paddingBottom: "10px",
                  paddingTop: "5px",
                }}
              />
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="#dc3545"
                strokeWidth={2}
                name="Systolique"
                dot={{ r: window.innerWidth <= 600 ? 3 : 4 }}
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="#007bff"
                strokeWidth={2}
                name="Diastolique"
                dot={{ r: window.innerWidth <= 600 ? 3 : 4 }}
              />
              <Line
                type="monotone"
                dataKey="pulse"
                stroke="#28a745"
                strokeWidth={2}
                name="Pouls"
                dot={{ r: window.innerWidth <= 600 ? 3 : 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="no-data">
          <p>Aucune mesure trouvée pour cette période.</p>
        </div>
      )}

      {measurements.length > 0 && (
        <div className="recent-measurements">
          <h3>Mesures récentes</h3>
          <div className="measurements-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Systolique</th>
                  <th>Diastolique</th>
                  <th>Pouls</th>
                  <th>Catégorie</th>
                </tr>
              </thead>
              <tbody>
                {measurements.slice(0, 10).map((measurement, index) => {
                  const category = getBloodPressureCategory(
                    measurement.systolic,
                    measurement.diastolic
                  );
                  return (
                    <tr
                      key={measurement._id || index}
                      className="measurement-row"
                    >
                      <td>
                        {new Date(
                          measurement.measurementDate
                        ).toLocaleDateString("fr-FR")}
                      </td>
                      <td>{measurement.measurementTime}</td>
                      <td>{measurement.systolic}</td>
                      <td>{measurement.diastolic}</td>
                      <td>{measurement.pulse}</td>
                      <td>
                        <span
                          className="category-badge"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.category}
                        </span>
                        <div className="delete-overlay">
                          <button
                            className="delete-btn-hover"
                            onClick={() =>
                              handleDeleteMeasurement(measurement._id)
                            }
                            disabled={deleteLoading === measurement._id}
                            title="Supprimer cette mesure"
                          >
                            {deleteLoading === measurement._id
                              ? "..."
                              : "Supprimer"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
