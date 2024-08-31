import React, { useState } from 'react';
const { ipcRenderer } = window.require('electron');

function WebPage() {
    const [searchKeyword, setSearchKeyword] = useState('삼쩜삼');
    const [timeRange, setTimeRange] = useState('w');
    const [executionStatus, setExecutionStatus] = useState('');

    const handleExecute = async (e) => {
        e.preventDefault();
        setExecutionStatus('Executing...');
        try {
            const result = await ipcRenderer.invoke('execute-web-automation', searchKeyword, timeRange);
            setExecutionStatus(result.message);
        } catch (error) {
            setExecutionStatus(`Error: ${error.message}`);
        }
    };

    return (
        <div>
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Web Automation
                    </h2>
                </div>
            </div>
            <form onSubmit={handleExecute}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label htmlFor="time-range"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Time Range
                                </label>
                                <div className="mt-2">
                                    <select
                                        id="time-range"
                                        name="time-range"
                                        className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        value={timeRange}
                                        onChange={(e) => setTimeRange(e.target.value)}
                                    >
                                        <option value="h">지난 1시간</option>
                                        <option value="d">지난 1일</option>
                                        <option value="w">지난 1주</option>
                                        <option value="m">지난 1개월</option>
                                        <option value="y">지난 1년</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-full">
                                <label htmlFor="search-keyword"
                                       className="block text-sm font-medium leading-6 text-gray-900">
                                    Search Keyword
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="search-keyword"
                                        name="search-keyword"
                                        type="text"
                                        autoComplete="search-keyword"
                                        className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        required={true}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                        type="submit"
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Execute
                    </button>
                </div>
            </form>
            {executionStatus && (
                <div className="mt-4 text-sm text-gray-500">
                    {executionStatus}
                </div>
            )}
        </div>
    );
}

export default WebPage;
