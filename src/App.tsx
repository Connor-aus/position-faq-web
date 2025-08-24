import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import JobsPage from './components/jobs/JobsPage';

// Default company ID for demo purposes
const DEFAULT_COMPANY_ID = 1;

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JobsPage companyId={DEFAULT_COMPANY_ID} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
