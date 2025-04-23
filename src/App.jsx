import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Chart from './pages/Chart';
import Count from './pages/Count';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br text-gray-800 py-12 bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/chart"
            element={
              <div className="p-2 max-w-screen-xl mx-auto grid lg:grid-cols-3 gap-2">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white shadow-sm rounded-xl p-6 transition duration-300">
                  <h2 className="text-xl font-semibold mb-4 text-blue-600">Live Gear Chart</h2>
                  <Chart />
                </div>

                {/* Count Panel */}
                <div className="bg-white shadow-sm rounded-xl p-6 transition duration-300">
                  <h2 className="text-xl font-semibold mb-4 text-blue-600">Gear Stats</h2>
                  <Count />
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
