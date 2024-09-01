import React from 'react';
import {Link, Outlet, useLocation} from 'react-router-dom';
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

const features = [
    {
        name: '토큰 획득',
        description:
            '사용자 이메일을 입력하고, 입력한 이메일에 대한 토큰을 생성합니다.',
    },
    {
        name: '테스터 정보 관리',
        description:
            '등록된 테스터 목록을 확인하고, 새로운 테스터를 추가 할 수 있으며, 미사용 계정에 대해서 삭제를 할 수 있습니다.',
    },
    {
        name: '테스트 관리',
        description:
            '실행될 테스트에 대한 정보를 표시하고, 새로운 테스트를 추가하고 기존 테스트 정보를 삭제 할 수 있습니다.',
    },
    {
        name: '테스트 시작',
        description:
            '테스트와 관련된 정보를 확인하고, 테스트를 시작할 수 있습니다.',
    },
    {
        name: '종료',
        description:
            '현재 실행중인 AutoQAMate 프로그램을 종료합니다.',
    },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function ToolsPage() {
    const location = useLocation();

    return (
        <>
            <div className="border-b border-gray-200 pb-5 sm:pb-0">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Test Tools</h3>
                <div className="mt-3 sm:mt-4">
                    <div className="hidden sm:block">
                        <nav className="-mb-px flex space-x-8">
                            {secondaryNavigation.map((item) => (
                                <Link
                                    key={item.name}
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
            <div className="mt-6">
                {location.pathname === '/tools' ? (
                    <div className="bg-white">
                        <div className="mx-auto max-w-7xl">
                            <div className="mx-auto max-w-2xl lg:mx-0">
                                <p className="mt-6 text-lg leading-8 text-gray-600">
                                    위 메뉴에서 원하는 메뉴를 선택해주세요.
                                </p>
                            </div>
                            <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                                {features.map((feature) => (
                                    <div key={feature.name}>
                                        <dt className="font-semibold text-gray-900">{feature.name}</dt>
                                        <dd className="mt-1 text-gray-600">{feature.description}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                ) : (
                    <Outlet/>
                )}
            </div>
        </>
    );
}

export default ToolsPage;
