import * as vscode from 'vscode';
import { NewServer, Server } from './server';
import { getConfig } from './config';

let server: Server;


export function activate(context: vscode.ExtensionContext) {
	const config = getConfig();
	server = NewServer(config);

	const startLmApiServerDisposable = vscode.commands.registerCommand('http-lm-api.startLmApiServer', () => {
		server.start();
	});

	const stopLmApiServerDisposable = vscode.commands.registerCommand('http-lm-api.stopLmApiServer', () => {
		server.stop();
	});

	context.subscriptions.push(startLmApiServerDisposable);
	context.subscriptions.push(stopLmApiServerDisposable);

	if (config.startAutomatically) {
		server.start();
	} else {
		vscode.window.showInformationMessage('LM API server is not started automatically. Use "Start LM API Server" command to start it.');
	}
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log("deactivation started");
	
	if (!server) {
		console.log("Server is not initialized");
	} else {
		console.log("Trying to stop server");
		server.stop();
	}
	
	console.log("deactivation finished");
}
