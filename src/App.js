import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
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
                    <Route path="/tools" element={<ToolsPage />} />
                    <Route path="/" element={<WebPage />} />
                    <Route path="/tools/token" element={<TokenAcquisition />} />
                    <Route path="/tools/tester-info" element={<TesterInfo />} />
                    <Route path="/tools/tester-info/list" element={<TesterInfoList />} />
                    <Route path="/tools/tester-info/add" element={<AddTesterInfo />} />
                    <Route path="/tools/tester-info/delete" element={<DeleteTesterInfo />} />
                    <Route path="/tools/test-management" element={<TestManagement />} />
                    <Route path="/tools/test-management/list" element={<TestManagementList />} />
                    <Route path="/tools/test-management/add" element={<AddTestManagement />} />
                    <Route path="/tools/test-management/delete" element={<DeleteTestManagement />} />
                    <Route path="/tools/start-test" element={<StartTest />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
