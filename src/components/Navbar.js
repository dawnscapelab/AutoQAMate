import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import logoSrc from '../assets/logo.svg';
import {ArrowTopRightOnSquareIcon} from "@heroicons/react/16/solid";
const { ipcRenderer } = window.require('electron');

const navigation = [
    { name: 'Web', href: '/web' },
    { name: 'Mobile', href: '/mobile' },
    { name: 'Tools', href: '/tools', action: 'openTools', icon: ArrowTopRightOnSquareIcon },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

function Navbar() {
    const location = useLocation();

    const handleNavClick = (item) => {
        if (item.action === 'openTools') {
            ipcRenderer.invoke('open-tools-window');
        }
    };

    return (
        <Disclosure as="nav" className="border-b border-gray-200 bg-white">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex flex-shrink-0 items-center">
                                    <img src={logoSrc} alt="logo" className="block h-8 w-auto lg:hidden"/>
                                    <img src={logoSrc} alt="logo" className="hidden h-8 w-auto lg:block"/>
                                </div>
                                <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                                    {navigation.map((item) => (
                                        item.action ? (
                                            <button
                                                key={item.name}
                                                onClick={() => handleNavClick(item)}
                                                className={classNames(
                                                    'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                                    'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                                                )}
                                            >
                                                {item.name}
                                                {item.icon && (
                                                    <item.icon className="ml-1 -mr-0.5 h-4 w-4" aria-hidden="true" />
                                                )}
                                            </button>
                                        ) : (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                className={classNames(
                                                    (location.pathname === item.href || location.pathname.startsWith(item.href + '/'))
                                                        ? 'border-indigo-500 text-gray-900'
                                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                                    'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                                                )}
                                            >
                                                {item.name}
                                            </Link>
                                        )
                                    ))}
                                </div>
                            </div>
                            <div className="-mr-2 flex items-center sm:hidden">
                                <DisclosureButton className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </DisclosureButton>
                            </div>
                        </div>
                    </div>

                    <DisclosurePanel className="sm:hidden">
                        <div className="space-y-1 pb-3 pt-2">
                            {navigation.map((item) => (
                                <Disclosure.Button
                                    key={item.name}
                                    as={item.action ? 'button' : Link}
                                    to={item.action ? undefined : item.href}
                                    onClick={item.action ? () => handleNavClick(item) : undefined}
                                    className={classNames(
                                        location.pathname === item.href
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800',
                                        'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                                    )}
                                >
                                    {item.name}
                                    {item.icon && (
                                        <item.icon className="ml-1 -mr-0.5 h-4 w-4" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            ))}
                        </div>
                    </DisclosurePanel>
                </>
            )}
        </Disclosure>
    );
}

export default Navbar;
