import React from 'react';

function WebPage() {
    return (
        <div>
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Web Automation
                    </h2>
                </div>
            </div>
            <p>This is the content of the Web page.</p>
        </div>
    );
}

export default WebPage;
