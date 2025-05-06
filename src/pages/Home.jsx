import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 py-10">
      <h2 className="text-2xl font-semibold mb-8 text-gray-700">GearBox Dashboard</h2>

      {/* Device Container */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">

          {/* Device One */}
          <Link
            to="/chart"
            className="w-70 h-48 md:w-28 md:h-28 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center
              transition-all hover:shadow-lg hover:border-blue-400 hover:scale-105 cursor-pointer"
          >
            <span className="font-medium text-gray-700">Device One</span>
          </Link>

          {/* Device Two */}
          <Link
            to="/device-two"
            className="w-70 h-48 md:w-28 md:h-28 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center
              transition-all hover:shadow-lg hover:border-blue-400 hover:scale-105 cursor-pointer"
          >
            <span className="font-medium text-gray-700">Device Two</span>
          </Link>

          {/* Device Three */}
          <Link
            to="/device-three"
            className="w-70 h-48 md:w-28 md:h-28 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center
              transition-all hover:shadow-lg hover:border-blue-400 hover:scale-105 cursor-pointer"
          >
            <span className="font-medium text-gray-700">Device Three</span>
          </Link>

          {/* Device Four */}
          <Link
            to="/device-four"
            className="w-70 h-48 md:w-28 md:h-28 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center
              transition-all hover:shadow-lg hover:border-blue-400 hover:scale-105 cursor-pointer"
          >
            <span className="font-medium text-gray-700">Device Four</span>
          </Link>

          {/* Device Five */}
          <Link
            to="/device-five"
            className="w-70 h-48 md:w-28 md:h-28 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center
              transition-all hover:shadow-lg hover:border-blue-400 hover:scale-105 cursor-pointer"
          >
            <span className="font-medium text-gray-700">Device Five</span>
          </Link>

          {/* Device Six */}
          <Link
            to="/device-six"
            className="w-70 h-48 md:w-28 md:h-28 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center
              transition-all hover:shadow-lg hover:border-blue-400 hover:scale-105 cursor-pointer"
          >
            <span className="font-medium text-gray-700">Device Six</span>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default Home;
