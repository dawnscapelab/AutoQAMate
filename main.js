const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const puppeteer = require('puppeteer');

const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: path.join(__dirname, 'src/assets/icons/icon.ico')
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:8080');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle('execute-web-automation', async (event, searchKeyword, timeRange) => {
    try {
        const browser = await puppeteer.launch({ headless: false, defaultViewport: null, args: ['--start-maximized'] });
        let page = (await browser.pages())[0];
        await page.setViewport({
            width: 1366,
            height: 768
        })
        const searchUrl = `https://www.google.co.kr/search?q=${encodeURIComponent(searchKeyword)}&newwindow=1&tbm=nws&source=lnt&tbs=qdr:${timeRange}`;
        await page.goto(searchUrl);
        await page.evaluate(() => {
            document.body.style.zoom = '100%';
        });
        await new Promise(resolve => setTimeout(resolve, 5000));
        await browser.close();
        return { success: true, message: 'Web automation executed successfully' };
    } catch (error) {
        console.error('Web automation error:', error);
        return { success: false, message: error.toString() };
    }
});
