import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Blank page component
const BlankPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Position FAQ Web</h1>
        <p className="mt-2 text-gray-600">Blank page ready for development</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BlankPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
