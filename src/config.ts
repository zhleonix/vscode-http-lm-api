import * as vscode from 'vscode';

export interface Config {
  /**
   * The port number to use for the server.
   */
  port: number;

/**
 * Start the server automatically when the extension is activated.
 */
  startAutomatically: boolean;
}

export function getConfig(): Config {
    const config = vscode.workspace.getConfiguration('http-lm-api');
    return {
        port: config.get<number>('port', 59603),
        startAutomatically: config.get<boolean>('startAutomatically', false),
    };
}
