import React, { useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

function StartTest() {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [testerInfo, setTesterInfo] = useState(null);
    const [testInfo, setTestInfo] = useState([]);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 토큰 가져오기
            const tokenResult = await ipcRenderer.invoke('get-token', email);
            if (tokenResult.success) {
                setToken(tokenResult.token);
            } else {
                throw new Error('토큰을 찾을 수 없습니다.');
            }

            // 테스터 정보 가져오기
            const testerResult = await ipcRenderer.invoke('get-tester-info');
            if (testerResult.success && testerResult.data[email]) {
                setTesterInfo(testerResult.data[email]);
            } else {
                throw new Error('테스터 정보를 찾을 수 없습니다.');
            }

            // 테스트 정보 가져오기
            const testResult = await ipcRenderer.invoke('get-test-info');
            if (testResult.success) {
                setTestInfo(Object.entries(testResult.data));
            } else {
                throw new Error('테스트 정보를 불러오는데 실패했습니다.');
            }

            setError('');
        } catch (error) {
            setError(error.message);
            setToken('');
            setTesterInfo(null);
            setTestInfo([]);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base font-semibold leading-7 text-gray-900">테스트 시작</h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600">테스터 이메일을 입력 받고, 테스트 정보를 표시합니다.</p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="col-span-full">
                                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                    이메일
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Start
                    </button>
                </div>
            </form>
            {error && <p className="text-red-500">{error}</p>}

            {token && testerInfo && testInfo.length > 0 && (
                <div className="space-y-6">
                    {testInfo.map(([testName, testData]) => (
                        <div key={testName} className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">{testName}</h3>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                                <dl className="sm:divide-y sm:divide-gray-200">
                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">토큰</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{token}</dd>
                                    </div>
                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">이름</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{testerInfo.name}</dd>
                                    </div>
                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">이메일</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{testerInfo.email}</dd>
                                    </div>
                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">전화번호</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{testerInfo.phoneNumber}</dd>
                                    </div>
                                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">생년월일</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{testerInfo.birthday}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default StartTest;
