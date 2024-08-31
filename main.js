const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('csv-writer').createObjectCsvWriter;

const isDev = !app.isPackaged;

let mainWindow;
let csvFolderPath;

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

function setupCsvFolder() {
    if (isDev) {
        csvFolderPath = path.join(app.getPath('userData'), 'csv_files');
    } else {
        csvFolderPath = path.join(app.getPath('documents'), 'AutoQAMate', 'csv_files');
    }

    if (!fs.existsSync(csvFolderPath)) {
        fs.mkdirSync(csvFolderPath, { recursive: true });
    }
}

app.whenReady().then(() => {
    createWindow();
    setupCsvFolder();
});

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

function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

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
        //await new Promise(resolve => setTimeout(resolve, 30000));
        const results = await page.evaluate(() => {
            const articles = document.querySelectorAll('div[data-news-doc-id]');
            return Array.from(articles).map(article => {
                const linkElement = article.querySelector('a');
                const titleElement = article.querySelector('div[role="heading"]');
                return {
                    title: titleElement ? titleElement.textContent.trim() : '',
                    url: linkElement ? linkElement.href : ''
                };
            });
        });
        await browser.close();
        const formattedDate = getFormattedDate();
        const csvPath = path.join(csvFolderPath, `search_results_${formattedDate}.csv`);
        const csvWriter = csv({
            path: csvPath,
            header: [
                {id: 'title', title: 'Title'},
                {id: 'url', title: 'URL'}
            ]
        });
        await csvWriter.writeRecords(results);
        return { success: true, message: 'Web automation executed successfully' };
    } catch (error) {
        console.error('Web automation error:', error);
        return { success: false, message: error.toString() };
    }
});

ipcMain.handle('get-csv-files', async () => {
    const files = fs.readdirSync(csvFolderPath).filter(file => file.endsWith('.csv'));
    return files.map(file => ({
        name: file,
        path: path.join(csvFolderPath, file)
    }));
});

ipcMain.handle('download-csv', async (event, filePath) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath: path.basename(filePath),
        filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    });

    if (!result.canceled) {
        fs.copyFileSync(filePath, result.filePath);
        return { success: true, message: 'File downloaded successfully' };
    }
    return { success: false, message: 'Download cancelled' };
});
