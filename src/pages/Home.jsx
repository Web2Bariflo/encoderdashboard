import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 py-10">
            <h2 className="text-2xl font-semibold mb-8 text-gray-700">GearBox Dashboard</h2>

            <Link
                to="/chart"
                className="w-28 h-28 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center 
                          transition-all hover:shadow-lg hover:border-blue-400 hover:scale-105 cursor-pointer mt-10"
            >
                <span className=" font-medium text-gray-700">Device One</span>
            </Link>
        </div>
    );
};

export default Home;