import React from 'react';
import {Link} from "react-router-dom";
import TesterInfoList from "./tester-info/TesterInfoList";
import AddTesterInfo from "./tester-info/AddTesterInfo";
import DeleteTesterInfo from "./tester-info/DeleteTesterInfo";

const secondaryNavigation = [
    { name: '저장된 테스터 정보', href: '/tools/tester-info/list', component: TesterInfoList },
    { name: '테스터 정보 추가', href: '/tools/tester-info/add', component: AddTesterInfo },
    { name: '테스터 정보 삭제', href: '/tools/tester-info/delete', component: DeleteTesterInfo },
]

function TesterInfo() {
    return (
        <div className="pb-5 sm:pb-0">
            <h3 className="text-base font-semibold leading-6 text-gray-900">테스터 정보 관리</h3>
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

export default TesterInfo;
