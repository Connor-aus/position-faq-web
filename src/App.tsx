import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import JobsPage from './components/jobs/JobsPage';
import PositionDetailsPage from './components/positions/PositionDetailsPage';

// Default company ID for demo purposes
const DEFAULT_COMPANY_ID = 2001;

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JobsPage companyId={DEFAULT_COMPANY_ID} />} />
        <Route path="/position/:positionId" element={<PositionDetailsPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
