import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
const { ipcRenderer } = window.require('electron');

function MobilePage() {
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [testStatus, setTestStatus] = useState('');
    const [testScenario, setTestScenario] = useState({
        name: '',
        steps: []
    });
    const [showPageSourceModal, setShowPageSourceModal] = useState(false);
    const [pageSource, setPageSource] = useState('');
    const [xpathElements, setXpathElements] = useState([]);
    const [showXPathModal, setShowXPathModal] = useState(false);
    const [newXPathName, setNewXPathName] = useState('');
    const [newXPathValue, setNewXPathValue] = useState('');

    useEffect(() => {
        loadDevices();
        loadTestScenario();
        loadXpathElements();
    }, []);

    const loadDevices = async () => {
        try {
            const connectedDevices = await ipcRenderer.invoke('get-connected-devices');
            setDevices(connectedDevices);
        } catch (error) {
            console.error('Error loading devices:', error);
        }
    };

    const loadTestScenario = async () => {
        try {
            const scenario = await ipcRenderer.invoke('load-test-scenario');
            setTestScenario(scenario);
        } catch (error) {
            console.error('Error loading test scenario:', error);
        }
    };

    const loadXpathElements = async () => {
        const elements = await ipcRenderer.invoke('get-xpath-elements');
        setXpathElements(elements);
    };

    const handleDeviceSelect = (device) => {
        setSelectedDevice(device);
    };

    const handleRunTest = async () => {
        if (!selectedDevice) {
            setTestStatus('Please select a device first');
            return;
        }

        setTestStatus('Running test...');
        try {
            const result = await ipcRenderer.invoke('run-mobile-test', selectedDevice, testScenario);
            setTestStatus(result.message);
        } catch (error) {
            setTestStatus(`Error: ${error.message}`);
        }
    };

    const handleScenarioNameChange = (e) => {
        setTestScenario({ ...testScenario, name: e.target.value });
    };

    const handleStepChange = (index, field, value) => {
        const newSteps = [...testScenario.steps];
        if (field === 'command') {
            newSteps[index] = { ...newSteps[index], [field]: value, params: {} };
        } else if (field === 'params') {
            newSteps[index] = { ...newSteps[index], params: { ...newSteps[index].params, ...value } };
        } else {
            newSteps[index] = { ...newSteps[index], [field]: value };
        }
        setTestScenario({ ...testScenario, steps: newSteps });
    };

    const handleAddStep = () => {
        setTestScenario({
            ...testScenario,
            steps: [...testScenario.steps, { id: uuidv4(), name: '', command: '', params: {} }]
        });
    };

    const handleRemoveStep = (index) => {
        const newSteps = testScenario.steps.filter((_, i) => i !== index);
        setTestScenario({ ...testScenario, steps: newSteps });
    };

    const handleSaveScenario = async () => {
        try {
            await ipcRenderer.invoke('save-test-scenario', testScenario);
            setTestStatus('Test scenario saved successfully');
        } catch (error) {
            setTestStatus(`Error saving test scenario: ${error.message}`);
        }
    };

    const handleGetPageSource = async () => {
        if (!selectedDevice) {
            setTestStatus('Please select a device first');
            return;
        }

        try {
            const result = await ipcRenderer.invoke('get-page-source', selectedDevice);
            if (result.success) {
                setPageSource(result.pageSource);
                setShowPageSourceModal(true);
            } else {
                setTestStatus(`Error: ${result.message}`);
            }
        } catch (error) {
            setTestStatus(`Error: ${error.message}`);
        }
    };

    const handleAddXPath = async () => {
        if (newXPathName && newXPathValue) {
            const updatedElements = await ipcRenderer.invoke('add-xpath-element', newXPathName, newXPathValue);
            setXpathElements(updatedElements);
            setNewXPathName('');
            setNewXPathValue('');
        }
    };

    const handleRemoveXPath = async (name) => {
        const updatedElements = await ipcRenderer.invoke('remove-xpath-element', name);
        setXpathElements(updatedElements);
    };

    const renderStepParams = (step, index) => {
        switch (step.command) {
            case 'launch_app':
                return (
                    <input
                        type="text"
                        value={step.params.package || ''}
                        onChange={(e) => handleStepChange(index, 'params', { package: e.target.value })}
                        placeholder="Package name"
                        className="w-full px-3 py-2 border rounded mb-2"
                    />
                );
            case 'click':
            case 'input_text':
                return (
                    <>
                        <div className="flex items-center mb-2">
                            <select
                                value={xpathElements.some(([name]) => name === step.params.xpath) ? step.params.xpath : ''}
                                onChange={(e) => {
                                    const selectedValue = e.target.value;
                                    if (selectedValue) {
                                        const xpathValue = xpathElements.find(([name]) => name === selectedValue)[1];
                                        handleStepChange(index, 'params', { xpath: xpathValue });
                                    }
                                }}
                                className="w-1/2 px-3 py-2 border rounded mr-2"
                            >
                                <option value="">Select XPath</option>
                                {xpathElements.map(([name, value]) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={step.params.xpath || ''}
                                onChange={(e) => handleStepChange(index, 'params', { xpath: e.target.value })}
                                placeholder="Enter custom XPath"
                                className="w-1/2 px-3 py-2 border rounded"
                            />
                        </div>
                        {step.command === 'input_text' && (
                            <input
                                type="text"
                                value={step.params.text || ''}
                                onChange={(e) => handleStepChange(index, 'params', { text: e.target.value })}
                                placeholder="Text to input"
                                className="w-full px-3 py-2 border rounded mb-2"
                            />
                        )}
                        {step.command === 'click' && (
                            <label className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    checked={step.params.ignoreIfNotFound || false}
                                    onChange={(e) => handleStepChange(index, 'params', { ignoreIfNotFound: e.target.checked })}
                                    className="mr-2"
                                />
                                Ignore if not found
                            </label>
                        )}
                    </>
                );
            case 'wait':
                return (
                    <input
                        type="number"
                        value={step.params.duration || ''}
                        onChange={(e) => handleStepChange(index, 'params', { duration: parseInt(e.target.value) })}
                        placeholder="Duration (ms)"
                        className="w-full px-3 py-2 border rounded mb-2"
                    />
                );
            case 'scroll_to':
                return (
                    <div className="flex items-center mb-2">
                        <select
                            value={xpathElements.some(([name]) => name === step.params.xpath) ? step.params.xpath : ''}
                            onChange={(e) => {
                                const selectedValue = e.target.value;
                                if (selectedValue) {
                                    const xpathValue = xpathElements.find(([name]) => name === selectedValue)[1];
                                    handleStepChange(index, 'params', { xpath: xpathValue });
                                }
                            }}
                            className="w-1/2 px-3 py-2 border rounded mr-2"
                        >
                            <option value="">Select XPath</option>
                            {xpathElements.map(([name, value]) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={step.params.xpath || ''}
                            onChange={(e) => handleStepChange(index, 'params', { xpath: e.target.value })}
                            placeholder="Enter custom XPath"
                            className="w-1/2 px-3 py-2 border rounded"
                        />
                    </div>
                );
            case 'drag_and_drop':
                return (
                    <>
                        <div className="flex items-center mb-2">
                            <select
                                value={xpathElements.some(([name]) => name === step.params.sourceXpath) ? step.params.sourceXpath : ''}
                                onChange={(e) => {
                                    const selectedValue = e.target.value;
                                    if (selectedValue) {
                                        const xpathValue = xpathElements.find(([name]) => name === selectedValue)[1];
                                        handleStepChange(index, 'params', { sourceXpath: xpathValue });
                                    }
                                }}
                                className="w-1/2 px-3 py-2 border rounded mr-2"
                            >
                                <option value="">Select Source XPath</option>
                                {xpathElements.map(([name, value]) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={step.params.sourceXpath || ''}
                                onChange={(e) => handleStepChange(index, 'params', { sourceXpath: e.target.value })}
                                placeholder="Enter source XPath"
                                className="w-1/2 px-3 py-2 border rounded"
                            />
                        </div>
                        <div className="flex items-center mb-2">
                            <select
                                value={xpathElements.some(([name]) => name === step.params.targetXpath) ? step.params.targetXpath : ''}
                                onChange={(e) => {
                                    const selectedValue = e.target.value;
                                    if (selectedValue) {
                                        const xpathValue = xpathElements.find(([name]) => name === selectedValue)[1];
                                        handleStepChange(index, 'params', { targetXpath: xpathValue });
                                    }
                                }}
                                className="w-1/2 px-3 py-2 border rounded mr-2"
                            >
                                <option value="">Select Target XPath</option>
                                {xpathElements.map(([name, value]) => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={step.params.targetXpath || ''}
                                onChange={(e) => handleStepChange(index, 'params', { targetXpath: e.target.value })}
                                placeholder="Enter target XPath"
                                className="w-1/2 px-3 py-2 border rounded"
                            />
                        </div>
                    </>
                );
            case 'terminate_app':
                return (
                    <input
                        type="text"
                        value={step.params.package || ''}
                        onChange={(e) => handleStepChange(index, 'params', { package: e.target.value })}
                        placeholder="Package name"
                        className="w-full px-3 py-2 border rounded mb-2"
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Mobile Automation</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-4">
                <h2 className="text-xl font-semibold mb-2">Connected Devices</h2>
                {devices.length > 0 ? (
                    <ul className="space-y-2 mb-4">
                        {devices.map((device, index) => (
                            <li
                                key={index}
                                className={`p-2 rounded cursor-pointer ${
                                    selectedDevice === device ? 'bg-blue-100' : 'hover:bg-gray-100'
                                }`}
                                onClick={() => handleDeviceSelect(device)}
                            >
                                {device.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 mb-4">No devices connected.</p>
                )}
                <div className="flex space-x-2">
                    <button
                        onClick={loadDevices}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Refresh Devices
                    </button>
                    <button
                        onClick={handleGetPageSource}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        disabled={!selectedDevice}
                    >
                        Get Page Source
                    </button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-4">
                <h2 className="text-xl font-semibold mb-2">Test Scenario</h2>
                <input
                    type="text"
                    value={testScenario.name}
                    onChange={handleScenarioNameChange}
                    placeholder="Scenario Name"
                    className="w-full px-3 py-2 border rounded mb-4"
                />
                {testScenario.steps.map((step, index) => (
                    <div key={step.id} className="mb-4 p-4 border rounded">
                        <h3 className="text-lg font-semibold mb-2">Step {index + 1}</h3>
                        <input
                            type="text"
                            value={step.name}
                            onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                            placeholder="Step Name"
                            className="w-full px-3 py-2 border rounded mb-2"
                        />
                        <select
                            value={step.command}
                            onChange={(e) => handleStepChange(index, 'command', e.target.value)}
                            className="w-full px-3 py-2 border rounded mb-2"
                        >
                            <option value="">Select Command</option>
                            <option value="launch_app">Launch App</option>
                            <option value="click">Click</option>
                            <option value="input_text">Input Text</option>
                            <option value="wait">Wait</option>
                            <option value="scroll_to">Scroll To</option>
                            <option value="drag_and_drop">Drag and Drop</option>
                            <option value="terminate_app">Terminate App</option>
                        </select>
                        {renderStepParams(step, index)}
                        <button
                            onClick={() => handleRemoveStep(index)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Remove Step
                        </button>
                    </div>
                ))}
                <div className="flex justify-between">
                    <button
                        onClick={handleAddStep}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Add Step
                    </button>
                    <button
                        onClick={handleSaveScenario}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Save Scenario
                    </button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-4">
                <h2 className="text-xl font-semibold mb-2">XPath Management</h2>
                <button
                    onClick={() => setShowXPathModal(true)}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 mb-4"
                >
                    Manage XPath Elements
                </button>
            </div>

            <div className="mt-4">
                <button
                    onClick={handleRunTest}
                    disabled={!selectedDevice}
                    className={`px-4 py-2 bg-indigo-600 text-white rounded ${
                        !selectedDevice ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                    }`}
                >
                    Run Test
                </button>
            </div>

            {testStatus && (
                <div className="mt-4 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700">
                    <p className="font-bold">Test Status</p>
                    <p>{testStatus}</p>
                </div>
            )}

            {showPageSourceModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Page Source</h3>
                            <div className="mt-2 px-7 py-3">
                                <textarea
                                    className="w-full h-96 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                                    readOnly
                                    value={pageSource}
                                />
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    onClick={() => setShowPageSourceModal(false)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showXPathModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Manage XPath Elements</h3>
                        <input
                            type="text"
                            value={newXPathName}
                            onChange={(e) => setNewXPathName(e.target.value)}
                            placeholder="XPath Name"
                            className="w-full px-3 py-2 border rounded mb-2"
                        />
                        <input
                            type="text"
                            value={newXPathValue}
                            onChange={(e) => setNewXPathValue(e.target.value)}
                            placeholder="XPath Value"
                            className="w-full px-3 py-2 border rounded mb-2"
                        />
                        <button
                            onClick={handleAddXPath}
                            className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
                        >
                            Add XPath
                        </button>
                        <div className="mt-4">
                            <h4 className="font-medium mb-2">Existing XPath Elements:</h4>
                            <ul>
                                {xpathElements.map(([name, value]) => (
                                    <li key={name} className="flex justify-between items-center mb-2">
                                        <span title={value}>{name}</span>
                                        <button
                                            onClick={() => handleRemoveXPath(name)}
                                            className="px-2 py-1 bg-red-500 text-white rounded"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button
                            onClick={() => setShowXPathModal(false)}
                            className="mt-4 px-4 py-2 bg-gray-300 text-black rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MobilePage;
