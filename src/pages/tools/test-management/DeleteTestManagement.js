import React, { useState } from 'react';
const { ipcRenderer } = window.require('electron');

function DeleteTestManagement() {
    const [testName, setTestName] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await ipcRenderer.invoke('delete-test-info', testName);
            if (result.success) {
                setMessage(result.message);
                setTestName(''); // Clear the input field
            } else {
                setMessage(`Error: ${result.message}`);
            }
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-12">
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="col-span-full">
                            <label htmlFor="test-name"
                                   className="block text-sm font-medium leading-6 text-gray-900">
                                테스트 명
                            </label>
                            <div className="mt-2">
                                <input
                                    id="test-name"
                                    name="test-name"
                                    type="text"
                                    value={testName}
                                    onChange={(e) => setTestName(e.target.value)}
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
                <button
                    type="submit"
                    className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    Delete
                </button>
            </div>
            {message && (
                <div className="mt-4 text-sm text-gray-600">
                    {message}
                </div>
            )}
        </form>
    );
}

export default DeleteTestManagement;
