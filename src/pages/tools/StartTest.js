import React, { useState, useRef, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

function StartTest() {
    const [email, setEmail] = useState('');
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const logContainerRef = useRef(null);

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const addLog = async (message) => {
        await sleep(500);
        setLogs(prevLogs => [...prevLogs, message]);
    };

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const formatToken = (token) => {
        const parts = token.split('.');
        return parts.join('.\n');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setLogs([]);

        try {
            await addLog('테스트 정보를 가져오는 중...');
            const testResult = await ipcRenderer.invoke('get-test-info');

            if (testResult.success) {
                const testInfos = Object.entries(testResult.data);

                if (testInfos.length === 0) {
                    await addLog('등록된 테스트가 없습니다.');

                } else {
                    await addLog(`총 ${testInfos.length}개의 테스트가 등록되어 있습니다.\n`);

                    for(const [testName, testInfo] of testInfos) {
                        const tokenResult = await ipcRenderer.invoke('get-token', email);
                        if (tokenResult.success) {
                            await addLog(`토큰: ${tokenResult.token}`);
                        } else {
                            throw new Error('토큰을 찾을 수 없습니다.');
                        }

                        const testerResult = await ipcRenderer.invoke('get-tester-info');
                        if (testerResult.success && testerResult.data[email]) {
                            const testerInfo = testerResult.data[email];
                            await addLog(`테스터 정보:`);
                            await addLog(`  이름: ${testerInfo.name}`);
                            await addLog(`  이메일: ${testerInfo.email}`);
                            await addLog(`  전화번호: ${testerInfo.phoneNumber}`);
                            await addLog(`  생년월일: ${testerInfo.birthday}`);
                        } else {
                            throw new Error('테스터 정보를 찾을 수 없습니다.');
                        }

                        await addLog(`테스트:`);
                        await addLog(`  테스트명: ${testName}`);
                        await addLog('\n');
                    }
                }
            } else {
                throw new Error('테스트 정보를 불러오는데 실패했습니다.');
            }

            await addLog('테스트가 완료되었습니다.');
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
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
                                        className="block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
                        disabled={isLoading}
                    >
                        {isLoading ? '처리 중...' : '시작'}
                    </button>
                </div>
            </form>

            {error && <p className="text-red-500">{error}</p>}

            {logs.length > 0 && (
                <div className="mt-8 bg-gray-100 p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-2">테스트 로그</h3>
                    <div
                        ref={logContainerRef}
                        className="h-64 overflow-y-auto"
                    >
                        <pre className="whitespace-pre-wrap text-sm">
                            {logs.join('\n')}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StartTest;
