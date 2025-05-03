// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { NewServer } from './server';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// const server = newServer()
	const server = NewServer()

	const startLmApiServerDisposable = vscode.commands.registerCommand('http-lm-api.startLmApiServer', () => {
		server.start();
	});

	const stopLmApiServerDisposable = vscode.commands.registerCommand('http-lm-api.stopLmApiServer', () => {
		server.stop();
	});

	context.subscriptions.push(startLmApiServerDisposable);
	context.subscriptions.push(stopLmApiServerDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
