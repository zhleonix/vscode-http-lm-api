import * as vscode from 'vscode';
import * as http from 'http';
import * as express from 'express';
import * as morgan from 'morgan';

import { pipeline } from "node:stream/promises";

export type Server = {
    start: () => void;
    stop: () => void;
}

export function NewServer() {
    const server = newExpressServer();
    // shutdown するときに server への参照が必要なのであらかじめ確保しておく
    let startedServer: http.Server | undefined;

    return {
        start: () => {
            startedServer = server.listen(8080, () => {
                vscode.window.showInformationMessage('LM API server is running on port 8080');
            });
        },
        stop: () => {
            if (startedServer) {
                startedServer.close(() => {
                    vscode.window.showInformationMessage('LM API server stopped');
                });
            } else {
                vscode.window.showInformationMessage('LM API server is not running');
            }
        }
    } as Server;
}

function newExpressServer() {

    const app = express.default();

    app.use(morgan.default('dev'));
    app.use(express.json());
    app.use((req, res, next) => {
        console.log("request body", req.body)
        next()
    })

    app.get('/', (_, res) => {
        res.send('ok');
    });

    app.post('/chat/completions', async (req, res) => {
        const body = req.body;

        const models = await vscode.lm.selectChatModels({id: body.model});
        const model = models.find((model) => {
            return model.id === body.model;
        });
        if (!model) {
            res.status(400).json({
                error: `model not found`,
            })
            return;
        }

        if (body.stream) {
            const chatRequest = body.messages.map((message: any) => {
                const role = message.role === 'assistant' ? message.role : 'user';
                let content: string | Array<vscode.LanguageModelTextPart>
                if (message.content instanceof Array) {
                    content = message.content.map((part: any) => {
                        return new vscode.LanguageModelTextPart(part.text);
                    });
                } else {
                    content = message.content;
                }
                return new vscode.LanguageModelChatMessage(role, content);
            });
    
            const chatResponse = await model.sendRequest(chatRequest);
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            });
    
            for await (const chunk of chatResponse.stream) {
                if (chunk instanceof vscode.LanguageModelTextPart) {
                    console.log("text part", chunk.value);
                    const json = JSON.stringify({
                        id: 'yyy',
                        object: 'chat.completion.chunk',
                        choices: [
                            {
                                index: 0,
                                delta: {
                                    content: chunk.value,
                                },
                            }
                        ],
                    });
                    console.log("json", json);
                    res.write(`data: ${json}\n\n`);
                } else if (chunk instanceof vscode.LanguageModelToolCallPart) {
                    console.log("tool call happend", chunk);
                    // result.push(JSON.stringify(chunk))
                }
            }
            res.end();

        } else {
            const chatRequest = body.messages.map((message: any) => {
                const role = message.role === 'assistant' ? message.role : 'user';
                let content: string | Array<vscode.LanguageModelTextPart>
                if (message.content instanceof Array) {
                    content = message.content.map((part: any) => {
                        return new vscode.LanguageModelTextPart(part.text);
                    });
                } else {
                    content = message.content;
                }
                return new vscode.LanguageModelChatMessage(role, content);
            });
    
            const chatResponse = await model.sendRequest(chatRequest);
            try {
                let result: String[] = []
                for await (const chunk of chatResponse.stream) {
                    if (chunk instanceof vscode.LanguageModelTextPart) {
                        result.push(chunk.value)
                    } else if (chunk instanceof vscode.LanguageModelToolCallPart) {
                        console.log("tool call happend", chunk);
                        // result.push(JSON.stringify(chunk))
                    }
                }
    
                const responseBody = {
                    id: 'xxx',
                    object: 'chat.completion',
                    created: 1741569952,
                    model: model.id,
                    choices: [
                        {
                            index: 0,
                            message: {
                                role: 'assistant',
                                content: result.join(''),
                            },
                            finish_reason: 'stop',
                        }
                    ],
                }
                console.log("response body", JSON.stringify(responseBody, null, 2));
    
                res.json(responseBody);
            } catch (e) {
                console.error(e);
                res.status(500).json({
                    error: 'stream decode failed'
                })
            }
        }
    })

    app.get('/v1/models', async (req, res) => {
        const models = await vscode.lm.selectChatModels();
        res.json(models.map((model) => {
            return {
                id: model.id,
                object: 'model',
                owned_by: 'user',
                permission: [],
            }
        }))
    })

    return app;
}