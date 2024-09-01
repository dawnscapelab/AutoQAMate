import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

const people = [
    { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
]

function TesterInfoList() {
    const [testers, setTesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadTesterInfo = async () => {
            try {
                const result = await ipcRenderer.invoke('get-tester-info');
                if (result.success) {
                    setTesters(Object.values(result.data));
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setError('테스터 정보를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        loadTesterInfo();
    }, []);

    if (loading) {
        return <p className="text-center py-4">테스터 정보를 불러오는 중...</p>;
    }

    if (error) {
        return <p className="text-center py-4 text-red-500">{error}</p>;
    }

    return (
        <div>
            {testers.length > 0 ? (
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead>
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">이메일</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">이름</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">핸드폰 번호</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">생년월일</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {testers.map((tester) => (
                                    <tr key={tester.email}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{tester.email}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tester.name}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tester.phoneNumber}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{tester.birthday}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-center py-4 text-gray-500">저장된 테스터 정보가 없습니다.</p>
            )}
        </div>
    );
}

export default TesterInfoList;
