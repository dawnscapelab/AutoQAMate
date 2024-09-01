import React from 'react';
import TestManagementList from "./test-management/TestManagementList";
import AddTestManagement from "./test-management/AddTestManagement";
import DeleteTestManagement from "./test-management/DeleteTestManagement";
import {Link} from "react-router-dom";

const secondaryNavigation = [
    { name: '저장된 테스트 정보', href: '/tools/test-management/list', component: TestManagementList },
    { name: '테스트 추가', href: '/tools/test-management/add', component: AddTestManagement },
    { name: '테스트 삭제', href: '/tools/test-management/delete', component: DeleteTestManagement },
]

function TestManagement() {
    return (
        <div className="pb-5 sm:pb-0">
            <h3 className="text-base font-semibold leading-6 text-gray-900">테스트 관리</h3>
            <div className="mt-3 sm:mt-4">
                <div className="hidden sm:block">
                    <nav className="-mb-px flex space-x-8">
                        {secondaryNavigation.map((item) => (
                            <Link
                                to={item.href}
                                className='border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium'
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">메뉴를 선택해주세요.</p>
        </div>
    );
}

export default TestManagement;
