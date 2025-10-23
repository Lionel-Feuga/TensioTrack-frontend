import React, { useState } from "react";
import axios from "axios";
import "./MeasurementForm.css";

const MeasurementForm = ({ onMeasurementAdded }) => {
  const [formData, setFormData] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
    measurementDate: new Date().toISOString().split("T")[0],
    measurementTime: new Date().toTimeString().split(" ")[0].slice(0, 5),
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "https://tensio-track-backend.vercel.app/api/measurements",
        {
          ...formData,
          systolic: parseInt(formData.systolic),
          diastolic: parseInt(formData.diastolic),
          pulse: parseInt(formData.pulse),
        }
      );

      setSuccess("Mesure enregistrée avec succès !");
      setFormData({
        systolic: "",
        diastolic: "",
        pulse: "",
        measurementDate: new Date().toISOString().split("T")[0],
        measurementTime: new Date().toTimeString().split(" ")[0].slice(0, 5),
        notes: "",
      });

      if (onMeasurementAdded) {
        onMeasurementAdded(response.data.measurement);
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de l'enregistrement"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="measurement-form-container">
      <h3>Nouvelle mesure</h3>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="measurement-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="systolic">Systolique (mmHg)</label>
            <input
              type="number"
              id="systolic"
              name="systolic"
              value={formData.systolic}
              onChange={handleInputChange}
              min="50"
              max="300"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="diastolic">Diastolique (mmHg)</label>
            <input
              type="number"
              id="diastolic"
              name="diastolic"
              value={formData.diastolic}
              onChange={handleInputChange}
              min="30"
              max="200"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pulse">
              Pouls <br></br> (bpm)
            </label>
            <input
              type="number"
              id="pulse"
              name="pulse"
              value={formData.pulse}
              onChange={handleInputChange}
              min="30"
              max="220"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="measurementDate">Date</label>
            <input
              type="date"
              id="measurementDate"
              name="measurementDate"
              value={formData.measurementDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="measurementTime">Heure</label>
            <input
              type="time"
              id="measurementTime"
              name="measurementTime"
              value={formData.measurementTime}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (optionnel)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            maxLength="500"
            rows="3"
            placeholder="Commentaires sur la mesure..."
          />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Enregistrement..." : "Enregistrer la mesure"}
        </button>
      </form>
    </div>
  );
};

export default MeasurementForm;
