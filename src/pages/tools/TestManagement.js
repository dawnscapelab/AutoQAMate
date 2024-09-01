import React from 'react';
import TestManagementList from "./test-management/TestManagementList";
import AddTestManagement from "./test-management/AddTestManagement";
import DeleteTestManagement from "./test-management/DeleteTestManagement";
import {Link, Outlet, useLocation} from "react-router-dom";

const secondaryNavigation = [
    { name: '저장된 테스트 정보', href: '/tools/test-management/list', component: TestManagementList },
    { name: '테스트 추가', href: '/tools/test-management/add', component: AddTestManagement },
    { name: '테스트 삭제', href: '/tools/test-management/delete', component: DeleteTestManagement },
    { name: '뒤로가기', href: '/tools' }
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function TestManagement() {
    const location = useLocation();

    return (
        <div className="pb-5 sm:pb-0">
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
            <div className="mt-6">
                {location.pathname === '/tools/test-management' ? (
                    <p className="mt-1 text-sm text-gray-500">메뉴를 선택해주세요.</p>
                ) : (
                    <Outlet/>
                )}
            </div>
        </div>
    );
}

export default TestManagement;
