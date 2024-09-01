import React, {useEffect, useState} from 'react';
import { Dialog } from '@headlessui/react'
const { ipcRenderer } = window.require('electron');

function WebPage() {
    const [searchKeyword, setSearchKeyword] = useState('삼쩜삼');
    const [timeRange, setTimeRange] = useState('w');
    const [executionStatus, setExecutionStatus] = useState('');
    const [csvFiles, setCsvFiles] = useState([]);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [csvContent, setCsvContent] = useState('');
    const [viewerTitle, setViewerTitle] = useState('');

    useEffect(() => {
        loadCsvFiles();
    }, []);

    const loadCsvFiles = async () => {
        const files = await ipcRenderer.invoke('get-csv-files');
        setCsvFiles(files);
    };

    const handleExecute = async (e) => {
        e.preventDefault();
        setExecutionStatus('Executing...');
        try {
            const result = await ipcRenderer.invoke('execute-web-automation', searchKeyword, timeRange);
            setExecutionStatus(result.message);
            loadCsvFiles();
        } catch (error) {
            setExecutionStatus(`Error: ${error.message}`);
        }
    };

    const handleDownload = async (filePath) => {
        try {
            const result = await ipcRenderer.invoke('download-csv', filePath);
            if (result.success) {
                alert('File downloaded successfully');
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert(`Error downloading file: ${error.message}`);
        }
    };

    const handleView = async (file) => {
        try {
            const result = await ipcRenderer.invoke('read-csv', file.path);
            if (result.success) {
                setCsvContent(result.content);
                setViewerTitle(file.name);
                setIsViewerOpen(true);
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert(`Error viewing file: ${error.message}`);
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
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">CSV Files</h3>
                {csvFiles.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {csvFiles.map((file, index) => (
                            <li key={index} className="py-4 flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-900">{file.name}</span>
                                <div>
                                    <button
                                        onClick={() => handleView(file)}
                                        className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleDownload(file.path)}
                                        className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Download
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500">No CSV files available.</p>
                )}
            </div>

            <Dialog open={isViewerOpen} onClose={() => setIsViewerOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="w-full max-w-3xl rounded bg-white p-6">
                        <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">{viewerTitle}</Dialog.Title>
                        <div className="mt-2">
                            <pre className="text-sm text-gray-500 whitespace-pre-wrap break-words h-96 overflow-y-auto">
                                {csvContent}
                            </pre>
                        </div>
                        <div className="mt-4">
                            <button
                                type="button"
                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                onClick={() => setIsViewerOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
}

export default WebPage;
