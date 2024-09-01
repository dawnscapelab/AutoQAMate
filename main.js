const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');
const os = require('os');
const csv = require('csv-writer').createObjectCsvWriter;
const { main: startAppium } = require('appium');
const { remote } = require('webdriverio');
const ADB = require('appium-adb').ADB;
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const jwt = require('jsonwebtoken');

const isDev = !app.isPackaged;

let mainWindow;
let csvFolderPath;
let appiumServer;
let adb;
let scenarioFilePath;
let xpathElements = {};
let xpathElementsPath;
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const accessAsync = util.promisify(fs.access);
let toolsWindow = null;

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

async function startAppiumServer() {
    const args = {
        port: 4724,
        host: 'localhost',
        useDrivers: ['uiautomator2'],
        driverPath: path.join(__dirname, 'node_modules')
    };
    appiumServer = await startAppium(args);
    console.log('Appium server started');
}

async function initializeADB() {
    try {
        const adbPath = getAdbPath();
        const sdkRoot = path.dirname(adbPath);
        process.env.ANDROID_HOME = sdkRoot;
        process.env.ANDROID_SDK_ROOT = sdkRoot;

        const adbOptions = {
            sdkRoot: sdkRoot,
            adbPort: 5037,
            suppressKillServer: true,
            adbExecTimeout: 20000,
            executable: {
                path: adbPath,
                defaultArgs: []
            }
        };
        adb = await ADB.createADB(adbOptions);
        const adbPaths = adb.getAdbPath();
        console.log(`ADB initialized successfully. Using ADB from: ${adbPaths}`);
    } catch (error) {
        console.error('Error initializing ADB:', error);
    }
}

async function getConnectedDevices() {
    if (!adb) {
        await initializeADB();
    }
    try {
        const devices = await adb.getConnectedDevices();
        return devices.map(device => ({
            id: device.udid,
            name: `${device.udid} (${device.state || 'Unknown'})`
        }));
    } catch (error) {
        console.error('Error getting connected devices:', error);
        return [];
    }
}

function getAdbPath() {
    const platform = os.platform();
    const adbFileName = platform === 'win32' ? 'adb.exe' : 'adb';
    const adbPath = app.isPackaged
        ? path.join(
            process.resourcesPath,
            'adb',
            platform === 'win32' ? 'windows' : platform === 'darwin' ? 'mac' : 'linux',
            adbFileName
        )
        : path.join(
            app.getAppPath(),
            'resources',
            'adb',
            platform === 'win32' ? 'windows' : platform === 'darwin' ? 'mac' : 'linux',
            adbFileName
        );
    console.log("adbPath", adbPath);
    if (!fs.existsSync(adbPath)) {
        throw new Error(`ADB binary not found at ${adbPath}`);
    }

    return adbPath;
}

function setupScenarioFilePath() {
    const scenariosDir = app.isPackaged
        ? path.join(
            process.resourcesPath,
            'scenarios',
        )
        : path.join(
            app.getAppPath(),
            'scenarios',
        );
    if (!fs.existsSync(scenariosDir)) {
        fs.mkdirSync(scenariosDir, { recursive: true });
    }

    scenarioFilePath = path.join(scenariosDir, 'testScenario.json');

    if (!fs.existsSync(scenarioFilePath)) {
        const initialScenarioPath = path.join(__dirname, 'resources', 'testScenario.json');
        fs.copyFileSync(initialScenarioPath, scenarioFilePath);
    }
}

async function launchAppWithAdb(deviceId, packageName) {
    try {
        const command = `adb -s ${deviceId} shell monkey -p ${packageName} -c android.intent.category.LAUNCHER 1`;
        await execAsync(command);
        console.log(`Launched app: ${packageName}`);
    } catch (error) {
        console.error(`Error launching app: ${error.message}`);
        throw error;
    }
}

async function performClick(driver, xpath, ignoreIfNotFound = false) {
    try {
        const element = await driver.$(xpath);
        const isExisting = await element.isExisting();
        if (isExisting) {
            await element.click();
            console.log(`Clicked element with XPath: ${xpath}`);
        } else if (!ignoreIfNotFound) {
            throw new Error(`Element with XPath ${xpath} not found`);
        } else {
            console.log(`Element with XPath ${xpath} not found, ignoring as requested`);
        }
    } catch (error) {
        if (!ignoreIfNotFound) {
            throw error;
        } else {
            console.log(`Error clicking element with XPath ${xpath}, ignoring as requested: ${error.message}`);
        }
    }
}

async function performInputText(driver, xpath, text) {
    try {
        const element = await driver.$(xpath);
        const isExisting = await element.isExisting();
        if (isExisting) {
            await element.setValue(text);
            console.log(`Input text "${text}" into element with XPath: ${xpath}`);
        } else {
            throw new Error(`Element with XPath ${xpath} not found`);
        }
    } catch (error) {
        console.error(`Error inputting text into element with XPath ${xpath}: ${error.message}`);
        throw error;
    }
}

async function performScrollTo(driver, targetXpath) {
    const maxScrollAttempts = 10;
    let attempts = 0;

    while (attempts < maxScrollAttempts) {
        try {
            const element = await driver.$(targetXpath);
            if (await element.isDisplayed()) {
                return element; // 요소를 찾았으면 반환
            }
        } catch (error) {
            // 요소를 찾지 못했으면 계속 스크롤
        }

        // 화면의 중앙에서 아래쪽으로 스와이프
        const { width, height } = await driver.getWindowSize();
        await driver.execute('mobile:swipeGesture', {
            left: width / 2, top: height * 0.7,
            width: 10, height: height * 0.5,
            direction: 'up',
            percent: 0.7
        });

        attempts++;
    }

    throw new Error(`Element not found after ${maxScrollAttempts} scroll attempts`);
}

async function performDragAndDrop(driver, sourceXpath, targetXpath) {
    try {
        // 소스 요소로 스크롤
        const sourceElement = await performScrollTo(driver, sourceXpath);

        // 타겟 요소로 스크롤
        const targetElement = await performScrollTo(driver, targetXpath);

        // 소스 요소의 위치와 크기 가져오기
        const sourceLocation = await sourceElement.getLocation();
        const sourceSize = await sourceElement.getSize();
        // 대상 요소의 위치와 크기 가져오기
        const targetLocation = await targetElement.getLocation();
        const targetSize = await targetElement.getSize();

        // 소스 요소의 중앙 좌표 계산
        const sourceX = Math.round(sourceLocation.x + sourceSize.width / 2);
        const sourceY = Math.round(sourceLocation.y + sourceSize.height / 2);

        // 대상 요소의 중앙 좌표 계산
        const targetX = Math.round(targetLocation.x + targetSize.width / 2);
        const targetY = Math.round(targetLocation.y + targetSize.height / 2);

        // 드래그 앤 드롭 수행
        await driver.performActions([
            {
                type: 'pointer',
                id: 'finger1',
                parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', duration: 0, x: sourceX, y: sourceY },
                    { type: 'pointerDown', button: 0 },
                    { type: 'pause', duration: 600 }, // 롱 프레스를 위한 대기
                    { type: 'pointerMove', duration: 1000, x: targetX, y: sourceY },
                    { type: 'pointerUp', button: 0 }
                ]
            }
        ]);

        // 드래그 앤 드롭 후 잠시 대기
        await driver.pause(1000);

        console.log(`Dragged from (${sourceX}, ${sourceY}) to (${targetX}, ${targetY})`);
    } catch (error) {
        console.error(`Error performing drag and drop: ${error.message}`);
        throw error;
    }
}

async function terminateApp(driver, packageName) {
    try {
        await driver.terminateApp(packageName);
        console.log(`Terminated app: ${packageName}`);
    } catch (error) {
        console.error(`Error terminating app: ${error.message}`);
        throw error;
    }
}

function loadXPathElements() {
    try {
        const data = fs.readFileSync(xpathElementsPath, 'utf8');
        xpathElements = JSON.parse(data);
        console.log('XPath elements loaded successfully');
    } catch (error) {
        console.error('Error loading XPath elements:', error);
        xpathElements = {};
    }
}

function saveXPathElements() {
    try {
        fs.writeFileSync(xpathElementsPath, JSON.stringify(xpathElements, null, 2));
        console.log('XPath elements saved successfully');
    } catch (error) {
        console.error('Error saving XPath elements:', error);
    }
}

function setupFilePaths() {
    const scenariosDir = app.isPackaged
        ? path.join(
            process.resourcesPath,
            'scenarios',
        )
        : path.join(
            app.getAppPath(),
            'scenarios',
        );

    if (!fs.existsSync(scenariosDir)) {
        fs.mkdirSync(scenariosDir, { recursive: true });
    }

    scenarioFilePath = path.join(scenariosDir, 'testScenario.json');
    xpathElementsPath = path.join(scenariosDir, 'xpathElements.json');

    if (!fs.existsSync(scenarioFilePath)) {
        const initialScenarioPath = path.join(__dirname, 'resources', 'testScenario.json');
        fs.copyFileSync(initialScenarioPath, scenarioFilePath);
    }

    if (!fs.existsSync(xpathElementsPath)) {
        const defaultElements = {
            "calendarNewEventButton": "//*[@resource-id=\"com.google.android.calendar:id/floating_action_button\"]",
            "calendarScheduleButton": "//android.widget.TextView[@content-desc=\"일정 버튼\"]",
            "calendarStartDate": "//android.widget.TextView[starts-with(@content-desc, \"시작일\")]",
            "calendarInputModeToggle": "//android.widget.ImageButton[@resource-id=\"com.google.android.calendar:id/mtrl_picker_header_toggle\"]"
        };
        fs.writeFileSync(xpathElementsPath, JSON.stringify(defaultElements, null, 2));
    }

    loadXPathElements();
}

app.whenReady().then(async () => {
    createWindow();
    setupCsvFolder();
    setupScenarioFilePath();
    setupFilePaths();
    const testerConfPath = getTesterConfPath();
    try {
        console.log('Checking if testerconf.json exists');
        await accessAsync(testerConfPath, fs.constants.F_OK);
        console.log('testerconf.json exists');

        const initialContent = await readFileAsync(testerConfPath, 'utf-8');
        console.log('Initial content of testerconf.json:', initialContent);

        if (initialContent.trim() === '' || initialContent === '[]') {
            console.log('testerconf.json is empty or contains an empty array, initializing with empty object');
            await writeFileAsync(testerConfPath, JSON.stringify({}, null, 2));
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('testerconf.json does not exist, creating new file');
            try {
                await writeFileAsync(testerConfPath, JSON.stringify({}, null, 2));
                console.log('Successfully created testerconf.json');
            } catch (writeError) {
                console.error('Error creating testerconf.json:', writeError);
            }
        } else {
            console.error('Error checking testerconf.json:', error);
        }
    }
    await initializeADB();
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

app.on('will-quit', async () => {
    if (appiumServer) {
        await appiumServer.close();
        console.log('Appium server stopped');
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

ipcMain.handle('get-connected-devices', async () => {
    return getConnectedDevices();
});

ipcMain.handle('run-mobile-test', async (event, device, scenario) => {
    try {
        if (!appiumServer) {
            await startAppiumServer();
        }

        const caps = {
            platformName: 'Android',
            'appium:deviceName': device.id,
            'appium:automationName': 'UiAutomator2',
        };

        const driver = await remote({
            hostname: "localhost",
            port: 4724,
            logLevel: "info",
            capabilities: caps
        });
        for (const step of scenario.steps) {
            switch (step.command) {
                case 'launch_app':
                    await launchAppWithAdb(device.id, step.params.package);
                    await driver.pause(5000);
                    break;
                case 'navigate':
                    await driver.url(step.params.url);
                    break;
                case 'input_text':
                    await performInputText(driver, step.params.xpath, step.params.text);
                    break;
                case 'click':
                    await performClick(driver, step.params.xpath, step.params.ignoreIfNotFound);
                    break;
                case 'wait':
                    await driver.pause(step.params.duration);
                    break;
                case 'scroll_to':
                    await performScrollTo(driver, step.params.xpath);
                    break;
                case 'drag_and_drop':
                    await performDragAndDrop(driver, step.params.sourceXpath, step.params.targetXpath);
                    break;
                case 'terminate_app':
                    await terminateApp(driver, step.params.package);
                    break;
                default:
                    console.warn(`Unknown command: ${step.command}`);
            }
        }
        await driver.pause(5000);
        await driver.deleteSession();
        return { success: true, message: `Test completed on ${device.name}` };
    } catch (error) {
        console.error('Mobile test error:', error);
        return { success: false, message: error.toString() };
    }
});

ipcMain.handle('load-test-scenario', async () => {
    if (fs.existsSync(scenarioFilePath)) {
        const data = fs.readFileSync(scenarioFilePath, 'utf8');
        return JSON.parse(data);
    }
    return { name: '', steps: [] };
});

ipcMain.handle('save-test-scenario', async (event, scenario) => {
    fs.writeFileSync(scenarioFilePath, JSON.stringify(scenario, null, 2));
});

ipcMain.handle('select-scenario-file', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (!result.canceled && result.filePaths.length > 0) {
        scenarioFilePath = result.filePaths[0];
        const data = fs.readFileSync(scenarioFilePath, 'utf8');
        return JSON.parse(data);
    }
    return null;
});

ipcMain.handle('save-scenario-as', async (event, scenario) => {
    const result = await dialog.showSaveDialog({
        filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (!result.canceled) {
        scenarioFilePath = result.filePath;
        fs.writeFileSync(scenarioFilePath, JSON.stringify(scenario, null, 2));
        return true;
    }
    return false;
});

ipcMain.handle('get-page-source', async (event, device) => {
    try {
        if (!appiumServer) {
            await startAppiumServer();
        }

        const caps = {
            platformName: 'Android',
            'appium:deviceName': device.id,
            'appium:automationName': 'UiAutomator2',
        };

        const driver = await remote({
            hostname: "localhost",
            port: 4724,
            logLevel: "info",
            capabilities: caps
        });

        const pageSource = await driver.getPageSource();

        await driver.deleteSession();

        return { success: true, pageSource };
    } catch (error) {
        console.error('Error getting page source:', error);
        return { success: false, message: error.toString() };
    }
});


ipcMain.handle('get-xpath-elements', () => {
    return Object.entries(xpathElements);
});

ipcMain.handle('add-xpath-element', (event, name, xpath) => {
    xpathElements[name] = xpath;
    saveXPathElements();
    return Object.entries(xpathElements);
});

ipcMain.handle('remove-xpath-element', (event, name) => {
    delete xpathElements[name];
    saveXPathElements();
    return Object.entries(xpathElements);
});

ipcMain.handle('get-xpath-element', (event, name) => {
    return xpathElements[name];
});

function getTokenFilePath() {
    if (app.isPackaged) {
        return path.join(process.resourcesPath, 'resources', 'token.txt');
    } else {
        return path.join(__dirname, 'resources', 'token.txt');
    }
}

const JWT_SECRET = 'autoqamate';

ipcMain.handle('generate-token', async (event, email) => {
    try {
        const tokenFilePath = getTokenFilePath();
        let tokens = '';

        try {
            tokens = fs.readFileSync(tokenFilePath, 'utf-8');
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }

        const lines = tokens.split('\n').filter(line => line.trim() !== '');
        const tokenMap = new Map(lines.map(line => line.split(',')));

        const newToken = jwt.sign({ email: email }, JWT_SECRET, { expiresIn: '1h' });
        tokenMap.set(email, newToken);

        const updatedTokens = Array.from(tokenMap.entries())
            .map(([email, token]) => `${email},${token}`)
            .join('\n');

        fs.writeFileSync(tokenFilePath, updatedTokens, 'utf-8');

        return { message: '토큰이 성공적으로 생성되었습니다.' };
    } catch (error) {
        console.error('Error generating token:', error);
        return { message: '토큰 생성 중 오류가 발생했습니다.' };
    }
});

ipcMain.handle('get-token', async (event, email) => {
    try {
        const tokenFilePath = getTokenFilePath();
        const tokens = fs.readFileSync(tokenFilePath, 'utf-8');
        const lines = tokens.split('\n');
        for (const line of lines) {
            const [storedEmail, token] = line.split(',');
            if (storedEmail === email) {
                return { success: true, token };
            }
        }
        return { success: false, message: '토큰을 찾을 수 없습니다.' };
    } catch (error) {
        console.error('토큰을 가져오는 중 오류 발생:', error);
        return { success: false, message: '토큰을 가져오는 데 실패했습니다.' };
    }
});

function getTesterConfPath() {
    const testerConfPath = app.isPackaged
        ? path.join(process.resourcesPath, 'resources', 'testerconf.json')
        : path.join(__dirname, 'resources', 'testerconf.json');

    console.log('Tester configuration file path:', testerConfPath);
    return testerConfPath;
}

ipcMain.handle('add-tester-info', async (event, testerInfo) => {
    try {
        const testerConfPath = getTesterConfPath();
        let testerData = {};

        console.log('Attempting to read testerconf.json');
        try {
            const data = await readFileAsync(testerConfPath, 'utf-8');
            console.log('Raw file content:', data);
            if (data.trim() === '') {
                console.log('File is empty, initializing with empty object');
                testerData = {};
            } else {
                testerData = JSON.parse(data);
            }
            console.log('Successfully read testerconf.json');
            console.log('Current content:', JSON.stringify(testerData));
        } catch (error) {
            console.error('Error reading testerconf.json:', error);
            if (error.code === 'ENOENT') {
                console.log('testerconf.json does not exist, will create new file');
            } else {
                throw error;
            }
        }

        if (testerData[testerInfo.email]) {
            return { success: false, error: 'DUPLICATE_EMAIL', message: '이미 등록된 이메일입니다.' };
        }

        console.log('New tester info to be added:', JSON.stringify(testerInfo));
        testerData[testerInfo.email] = testerInfo;
        console.log('Updated testerData:', JSON.stringify(testerData));

        console.log('Attempting to write to testerconf.json');
        const dataToWrite = JSON.stringify(testerData, null, 2);
        console.log('Data to be written:', dataToWrite);
        await writeFileAsync(testerConfPath, dataToWrite);
        console.log('Successfully wrote to testerconf.json');

        const verificationData = await readFileAsync(testerConfPath, 'utf-8');
        console.log('File content after writing:', verificationData);

        if (Object.keys(JSON.parse(verificationData)).length === 0) {
            console.error('Warning: File appears to be empty after writing');
        }

        return { success: true, message: '테스터 정보가 성공적으로 저장되었습니다.' };
    } catch (error) {
        console.error('테스터 정보 저장 중 오류 발생:', error);
        return { success: false, message: error.toString() };
    }
});

ipcMain.handle('get-tester-info', async () => {
    try {
        const testerConfPath = getTesterConfPath();
        const data = await readFileAsync(testerConfPath, 'utf-8');
        const testerData = JSON.parse(data);
        return { success: true, data: testerData };
    } catch (error) {
        console.error('테스터 정보를 읽는 중 오류 발생:', error);
        return { success: false, message: '테스터 정보를 불러오는 데 실패했습니다.' };
    }
});

ipcMain.handle('delete-tester-info', async (event, email) => {
    try {
        const testerConfPath = getTesterConfPath();
        let testerData = {};

        const data = await readFileAsync(testerConfPath, 'utf-8');
        testerData = JSON.parse(data);

        if (testerData[email]) {
            delete testerData[email];
            await writeFileAsync(testerConfPath, JSON.stringify(testerData, null, 2));
            return { success: true, message: '테스터 정보가 성공적으로 삭제되었습니다.' };
        } else {
            return { success: false, message: '해당 이메일의 테스터 정보를 찾을 수 없습니다.' };
        }
    } catch (error) {
        console.error('테스터 정보 삭제 중 오류 발생:', error);
        return { success: false, message: '테스터 정보 삭제 중 오류가 발생했습니다.' };
    }
});

function getTestConfPath() {
    return app.isPackaged
        ? path.join(process.resourcesPath, 'resources', 'testconf.json')
        : path.join(__dirname, 'resources', 'testconf.json');
}

ipcMain.handle('add-test-info', async (event, testName, testInfo) => {
    try {
        const testConfPath = getTestConfPath();
        let testData = {};

        try {
            const data = await readFileAsync(testConfPath, 'utf-8');
            if (data.trim() !== '') {
                testData = JSON.parse(data);
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('testconf.json does not exist, will create new file');
            } else if (error instanceof SyntaxError) {
                console.log('Invalid JSON in testconf.json, starting with empty object');
            } else {
                throw error;
            }
        }

        if (testData[testName]) {
            return { success: false, error: 'DUPLICATE_TEST_NAME', message: '이미 존재하는 테스트 이름입니다.' };
        }
        testData[testName] = testInfo;

        await writeFileAsync(testConfPath, JSON.stringify(testData, null, 2));
        console.log('Successfully wrote to testconf.json');

        return { success: true, message: '테스트 정보가 성공적으로 저장되었습니다.' };
    } catch (error) {
        console.error('테스트 정보 저장 중 오류 발생:', error);
        return { success: false, message: error.toString() };
    }
});

ipcMain.handle('delete-test-info', async (event, testName) => {
    try {
        const testConfPath = getTestConfPath();
        let testData = {};

        const data = await readFileAsync(testConfPath, 'utf-8');
        testData = JSON.parse(data);

        if (testData[testName]) {
            delete testData[testName];
            await writeFileAsync(testConfPath, JSON.stringify(testData, null, 2));
            return { success: true, message: '테스트 정보가 성공적으로 삭제되었습니다.' };
        } else {
            return { success: false, message: '해당 이름의 테스트 정보를 찾을 수 없습니다.' };
        }
    } catch (error) {
        console.error('테스트 정보 삭제 중 오류 발생:', error);
        return { success: false, message: '테스트 정보 삭제 중 오류가 발생했습니다.' };
    }
});

ipcMain.handle('get-test-info', async () => {
    try {
        const testConfPath = getTestConfPath();
        const data = await readFileAsync(testConfPath, 'utf-8');
        if (!data.trim()) {
            return { success: true, data: {} };
        }
        const testData = JSON.parse(data);
        return { success: true, data: testData };
    } catch (error) {
        console.error('테스트 정보를 읽는 중 오류 발생:', error);
        return { success: false, message: '테스트 정보를 불러오는 데 실패했습니다.' };
    }
});

ipcMain.handle('exit-app', () => {
    app.quit();
});

function createToolsWindow() {
    if (toolsWindow) {
        toolsWindow.focus();
        return;
    }

    toolsWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: path.join(__dirname, 'src/assets/icons/icon.ico')
    });

    if (isDev) {
        toolsWindow.loadURL('http://localhost:8080/#/tools');
        toolsWindow.webContents.openDevTools();
    } else {
        toolsWindow.loadURL(`file://${path.join(__dirname, 'dist', 'index.html')}#/tools`);
    }

    toolsWindow.on('closed', () => {
        toolsWindow = null;
    });
}

ipcMain.handle('open-tools-window', () => {
    createToolsWindow();
});

ipcMain.handle('close-tools-window', () => {
    if (toolsWindow) {
        toolsWindow.close();
    }
});
