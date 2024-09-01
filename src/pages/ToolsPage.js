import React from 'react';
import { Link } from 'react-router-dom';
import TokenAcquisition from './tools/TokenAcquisition';
import TesterInfo from './tools/TesterInfo';
import TestManagement from './tools/TestManagement';
import StartTest from './tools/StartTest';

const secondaryNavigation = [
    { name: '토큰 획득', href: '/tools/token', component: TokenAcquisition },
    { name: '테스터 정보 관리', href: '/tools/tester-info', component: TesterInfo },
    { name: '테스트 관리', href: '/tools/test-management', component: TestManagement },
    { name: '테스트 시작', href: '/tools/start-test', component: StartTest },
    { name: '종료', href: '/tools/exit', component: null },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function ToolsPage() {
    return (
        <>
            <div className="border-b border-gray-200 pb-5 sm:pb-0">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Test Tools</h3>
                <div className="mt-3 sm:mt-4">
                    <div className="hidden sm:block">
                        <nav className="-mb-px flex space-x-8">
                            {secondaryNavigation.map((item) => (
                                <Link
                                    to={item.href}
                                    className={classNames(
                                        location.pathname === item.href
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                        'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium',
                                        )}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ToolsPage;
