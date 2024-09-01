import React from 'react';
import {Link, Outlet, useLocation} from "react-router-dom";
import TesterInfoList from "./tester-info/TesterInfoList";
import AddTesterInfo from "./tester-info/AddTesterInfo";
import DeleteTesterInfo from "./tester-info/DeleteTesterInfo";

const secondaryNavigation = [
    { name: '저장된 테스터 정보', href: '/tools/tester-info/list', component: TesterInfoList },
    { name: '테스터 정보 추가', href: '/tools/tester-info/add', component: AddTesterInfo },
    { name: '테스터 정보 삭제', href: '/tools/tester-info/delete', component: DeleteTesterInfo },
    { name: '뒤로가기', href: '/tools' }
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function TesterInfo() {
    const location = useLocation();

    return (
        <>
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
                    {location.pathname === '/tools/tester-info' ? (
                        <p className="mt-1 text-sm text-gray-500">메뉴를 선택해주세요.</p>
                    ) : (
                        <Outlet/>
                    )}
                </div>
            </div>
        </>
    );
}

export default TesterInfo;
