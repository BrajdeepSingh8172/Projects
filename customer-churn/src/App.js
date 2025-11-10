import React, { useState } from 'react';
import axios from 'axios';

const DEFAULT_FIELDS = {
  gender: 'Male',
  SeniorCitizen: 0,
  Partner: 'No',
  Dependents: 'No',
  tenure: 12,
  PhoneService: 'Yes',
  MultipleLines: 'No',
  InternetService: 'DSL',
  OnlineSecurity: 'No',
  OnlineBackup: 'No',
  DeviceProtection: 'No',
  TechSupport: 'No',
  StreamingTV: 'No',
  StreamingMovies: 'No',
  Contract: 'Month-to-month',
  PaperlessBilling: 'Yes',
  PaymentMethod: 'Electronic check',
  MonthlyCharges: 70.0,
  TotalCharges: 840.0
};

export default function App() {
  const [form, setForm] = useState(DEFAULT_FIELDS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      // convert numeric fields
      const payload = { ...form, tenure: Number(form.tenure), MonthlyCharges: Number(form.MonthlyCharges), TotalCharges: Number(form.TotalCharges) };
      const res = await axios.post('http://localhost:5000/predict', payload);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setResult({ error: err?.response?.data || err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h2>Customer Churn Predictor</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        <div className="form-row">
          <label>Tenure (months)</label>
          <input name="tenure" type="number" value={form.tenure} onChange={handleChange} />
        </div>
        <div className="form-row">
          <label>Internet Service</label>
          <select name="InternetService" value={form.InternetService} onChange={handleChange}>
            <option>DSL</option>
            <option>Fiber optic</option>
            <option>No</option>
          </select>
        </div>
        <div className="form-row">
          <label>Contract</label>
          <select name="Contract" value={form.Contract} onChange={handleChange}>
            <option>Month-to-month</option>
            <option>One year</option>
            <option>Two year</option>
          </select>
        </div>
        <div className="form-row">
          <label>Monthly Charges</label>
          <input name="MonthlyCharges" type="number" step="0.01" value={form.MonthlyCharges} onChange={handleChange} />
        </div>
        <div className="form-row">
          <label>Total Charges</label>
          <input name="TotalCharges" type="number" step="0.01" value={form.TotalCharges} onChange={handleChange} />
        </div>

        <button type="submit" disabled={loading}>{loading ? 'Predicting...' : 'Predict'}</button>
      </form>

      <div className="result">
        {result && result.error && <div className="churn">Error: {JSON.stringify(result.error)}</div>}
        {result && result.label && (
          <div className={result.prediction === 1 ? 'churn' : 'stay'}>
            {result.prediction === 1 ? '🔴 Customer likely to churn' : '🟢 Customer will stay'}
            <div>Probability: {(result.probability || 0).toFixed(3)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
