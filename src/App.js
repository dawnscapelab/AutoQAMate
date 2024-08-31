import React from 'react';

function App() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-8">AutoQAMate</h1>
            <div className="space-y-4">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-48">
                    Button 1
                </button>
                <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-48">
                    Button 2
                </button>
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-48">
                    Button 3
                </button>
            </div>
        </div>
    );
}

export default App;
