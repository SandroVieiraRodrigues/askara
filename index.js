const { BrowserWindow, app } = require('electron');
let win;

let boot = () => {
	win = new BrowserWindow({
		width: 800,
		height: 600
	});

	// Esconder a toolbar
	win.setMenu(null);

	win.loadURL(`file://${__dirname}/index.html`);
	//win.maximize();
	//win.webContents.openDevTools();
};

app.on('ready', boot);