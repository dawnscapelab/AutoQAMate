import React, { useState } from 'react';
const { ipcRenderer } = window.require('electron');

function AddTesterInfo() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [birthday, setBirthday] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const testerInfo = {
                email,
                name,
                phoneNumber,
                birthday
            };
            const result = await ipcRenderer.invoke('add-tester-info', testerInfo);
            if (result.success) {
                setMessage('Tester information saved successfully');
                // Clear the form
                setEmail('');
                setName('');
                setPhoneNumber('');
                setBirthday('');
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
                    <h2 className="text-base font-semibold leading-7 text-gray-900">테스터 정보 추가</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">테스트 정보를 입력 받고 추가합니다.</p>

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

                        <div className="col-span-full">
                            <label htmlFor="tester-name"
                                   className="block text-sm font-medium leading-6 text-gray-900">
                                이름
                            </label>
                            <div className="mt-2">
                                <input
                                    id="tester-name"
                                    name="tester-name"
                                    type="text"
                                    autoComplete="tester-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="col-span-full">
                            <label htmlFor="tester-phone-number"
                                   className="block text-sm font-medium leading-6 text-gray-900">
                                핸드폰 번호
                            </label>
                            <div className="mt-2">
                                <input
                                    id="tester-phone-number"
                                    name="tester-phone-number"
                                    type="tel"
                                    autoComplete="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="col-span-full">
                            <label htmlFor="tester-birthday"
                                   className="block text-sm font-medium leading-6 text-gray-900">
                                생년월일
                            </label>
                            <div className="mt-2">
                                <input
                                    id="tester-birthday"
                                    name="tester-birthday"
                                    type="date"
                                    value={birthday}
                                    onChange={(e) => setBirthday(e.target.value)}
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
                    Save
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

export default AddTesterInfo;
