import React from 'react';
import {HashRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import Layout from './components/Layout';
import WebPage from './pages/WebPage';
import MobilePage from './pages/MobilePage';
import ToolsPage from './pages/ToolsPage';
import TokenAcquisition from "./pages/tools/TokenAcquisition";
import TesterInfo from "./pages/tools/TesterInfo";
import TesterInfoList from "./pages/tools/tester-info/TesterInfoList";
import AddTesterInfo from "./pages/tools/tester-info/AddTesterInfo";
import DeleteTesterInfo from "./pages/tools/tester-info/DeleteTesterInfo";
import TestManagement from "./pages/tools/TestManagement";
import TestManagementList from "./pages/tools/test-management/TestManagementList";
import AddTestManagement from "./pages/tools/test-management/AddTestManagement";
import DeleteTestManagement from "./pages/tools/test-management/DeleteTestManagement";
import StartTest from "./pages/tools/StartTest";

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/web" element={<WebPage />} />
                    <Route path="/mobile" element={<MobilePage />} />
                    <Route path="/tools" element={<ToolsPage />}>
                        <Route index element={<Navigate to="/tools" replace />} />
                        <Route path="token" element={<TokenAcquisition />} />
                        <Route path="tester-info" element={<TesterInfo />}>
                            <Route path="list" element={<TesterInfoList />} />
                            <Route path="add" element={<AddTesterInfo />} />
                            <Route path="delete" element={<DeleteTesterInfo />} />
                        </Route>
                        <Route path="test-management" element={<TestManagement />}>
                            <Route path="list" element={<TestManagementList />} />
                            <Route path="add" element={<AddTestManagement />} />
                            <Route path="delete" element={<DeleteTestManagement />} />
                        </Route>
                        <Route path="start-test" element={<StartTest />} />
                    </Route>
                    <Route path="/" element={<WebPage />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
