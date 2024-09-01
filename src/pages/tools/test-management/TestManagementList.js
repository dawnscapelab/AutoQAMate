import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

function TestManagementList() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTestInfo = async () => {
            try {
                const result = await ipcRenderer.invoke('get-test-info');
                if (result.success) {
                    const testArray = Object.entries(result.data).map(([name, info]) => ({
                        name,
                        createdAt: info.createdAt
                    }));
                    setTests(testArray);
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setError('테스트 정보를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        loadTestInfo();
    }, []);

    if (loading) {
        return <p className="text-center py-4">테스트 정보를 불러오는 중...</p>;
    }

    if (error) {
        return <p className="text-center py-4 text-red-500">{error}</p>;
    }

    if (tests.length === 0) {
        return <p className="text-center py-4 text-gray-500">저장된 테스트 정보가 없습니다.</p>;
    }

    return (
        <div>
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                            <tr>
                                <th scope="col"
                                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                                    테스트 명
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {tests.map((test) => (
                                <tr key={test.name}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                        {test.name}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TestManagementList;
