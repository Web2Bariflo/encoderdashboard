import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Chart from './pages/Chart';
import Count from './pages/Count';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 py-12">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/chart"
            element={
              <div className="p-4 max-w-screen-xl mx-auto flex flex-wrap gap-4">

                {/* Chart Section */}
                <div className="flex-[3] bg-white shadow-md rounded-2xl p-6">
                  <h2 className="text-2xl font-bold mb-4 text-blue-600">Live Gear Chart</h2>
                  <Chart />
                </div>

                {/* Count Panel */}
                <div className="flex-[1] min-w-[29%] bg-white shadow-md rounded-2xl p-4">
                  <h2 className="text-2xl font-bold mb-2 text-blue-600">Gear Stats</h2>
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
