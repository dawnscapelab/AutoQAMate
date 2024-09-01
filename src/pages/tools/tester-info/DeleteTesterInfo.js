import React, { useState } from 'react';
const { ipcRenderer } = window.require('electron');

function DeleteTesterInfo() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await ipcRenderer.invoke('delete-tester-info', email);
            if (result.success) {
                setMessage(result.message);
                setEmail(''); // 입력 필드 초기화
            } else {
                setMessage(`오류: ${result.message}`);
            }
        } catch (error) {
            setMessage(`오류: ${error.message}`);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-12">
                    <h2 className="text-base font-semibold leading-7 text-gray-900">테스터 정보 삭제</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">삭제 할 테스터 이메일을 입력 받고 삭제합니다.</p>

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
                                    autoComplete="email"
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

export default DeleteTesterInfo;
