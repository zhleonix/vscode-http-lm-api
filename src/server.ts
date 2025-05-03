import * as vscode from 'vscode';
import * as http from 'http';

export type Server = {
    start: () => void;
    stop: () => void;
}

export function NewServer() {
    const server = newHTTPServer();
    return {
        start: () => {
            server.listen(8080, () => {
                vscode.window.showInformationMessage('LM API server is running on port 8080');
            });
        },
        stop: () => {
            server.close(() => {
                vscode.window.showInformationMessage('LM API server has gracefully shut down');
            });
        }
    } as Server;
}


export function newHTTPServer() {
    // TODO: vscode lm api を叩く、openai format か litellm 形式などの実装を用意する
    const server = http.createServer((_, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Hello World\n');
    });
    server.on('error', (e) => vscode.window.showInformationMessage(`LM API server failed to start: ${e.message}`))
    return server;
}
