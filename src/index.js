import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

const render = () => {
    root.render(<App />);
};

render();

if (module.hot) {
    module.hot.accept('./App', render);
}
