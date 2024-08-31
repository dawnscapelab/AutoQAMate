import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import WebPage from './pages/WebPage';
import MobilePage from './pages/MobilePage';
import ToolsPage from './pages/ToolsPage';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/web" element={<WebPage />} />
                    <Route path="/mobile" element={<MobilePage />} />
                    <Route path="/tools" element={<ToolsPage />} />
                    <Route path="/" element={<WebPage />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
