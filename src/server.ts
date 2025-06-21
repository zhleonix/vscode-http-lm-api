import * as vscode from 'vscode';

import * as http from 'http';
import * as express from 'express';
import * as morgan from 'morgan';

import { Config } from './config';
import { logger } from './logger';
import { log } from 'console';

export type Server = {
    start: () => void;
    stop: () => void;
}

export function NewServer(config: Config): Server {
    const server = newExpressServer();
    // shutdown するときに server への参照が必要なのであらかじめ確保しておく
    let startedServer: http.Server | undefined;

    return {
        start: () => {
            const port = config.port;
            if (startedServer) {
                vscode.window.showInformationMessage('LM API server is already running');
                return;
            }
            startedServer = server.listen(port, () => {
                vscode.window.showInformationMessage(`LM API server is running on port ${port}`);
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

    logger.info("server started");

    app.use(morgan.default('dev'));
    app.use(express.json({
        limit: '100mb',
    }));
    app.use((req, res, next) => {
        logger.http(req.method, req.path.toString());
        logger.debug("request body: " + JSON.stringify(req.body));
        next();
    });

    app.get('/', (_, res) => {
        res.send('ok');
    });

    app.post('/v1/chat/completions', (req, res, next) => {
        req.url = '/chat/completions';
        next();
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
        const chatRequest = mapMessagesToChatMessages(body);
        const chatOptions: vscode.LanguageModelChatRequestOptions = {
            tools:  mapMessagesToChatMessagesWithToolCalls(body)
        };
        if (body.stream) {
            const chatResponse = await model.sendRequest(chatRequest,chatOptions);
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            });
            const resp_id = generateTimeSequenceId();
            for await (const chunk of chatResponse.stream) {
                if (chunk instanceof vscode.LanguageModelTextPart) {
                    const json = JSON.stringify({
                        id: resp_id,
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
                    logger.debug(`text part: ${chunk.value}`);
                    logger.debug(`json: ${json}`);
                    res.write(`data: ${json}\n\n`);
                } else if (chunk instanceof vscode.LanguageModelToolCallPart) {
                    logger.debug(`tool call happened: ${chunk}`);
                    // result.push(JSON.stringify(chunk))
                    const json = JSON.stringify({
                        id: chunk.callId,
                        type: 'function',
                        function: {
                            name: chunk.name,
                            arguments: chunk.input ? JSON.stringify(chunk.input) : undefined,
                        }   
                    });
                    logger.debug(`text part: ${JSON.stringify(chunk)}`);
                    logger.debug(`json: ${json}`);
                    res.write(`data: ${json}\n\n`);
                }
            }
            res.end('data: [DONE]\n\n');

        } else {
            
            try {
                logger.debug("chat request: " + JSON.stringify(chatRequest, null, 2));
                const chatResponse = await model.sendRequest(chatRequest,chatOptions);
                let result: String[] = [];
                let toolCalls: vscode.LanguageModelToolCallPart[] = [];
                for await (const chunk of chatResponse.stream) {
                    if (chunk instanceof vscode.LanguageModelTextPart) {
                        result.push(chunk.value)
                    } else if (chunk instanceof vscode.LanguageModelToolCallPart) {
                        logger.debug("tool call happend", chunk);
                        toolCalls.push(chunk);
                    }
                }
    
                const responseBody = {
                    id: generateTimeSequenceId(),
                    object: 'chat.completion',
                    created: 1741569952,
                    model: model.id,
                    choices: [
                        {
                            index: 0,
                            message: {
                                role: 'assistant',
                                content: result.join(''),
                                tool_calls: toolCalls.map((toolCall) => {
                                    return {
                                        id: toolCall.callId,
                                        type: 'function',
                                        function: {
                                            name: toolCall.name,
                                            arguments: toolCall.input ? JSON.stringify(toolCall.input) : undefined,
                                        }
                                    };
                                }),
                            },
                            finish_reason: 'stop',
                        }
                    ],
                };
                logger.debug("response body: " + JSON.stringify(responseBody, null, 2));
    
                res.json(responseBody);
            } catch (e) {
                if (e instanceof Error) {
                    logger.error(`Error occurred while processing request: ${e}, \n${e.stack}`);
                } else {
                    logger.error(`Error occurred while processing request: ${e}`);
                }
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
    
    // TODO: Do not repeat the same code as above
    app.get('/models', async (req, res) => {
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

function mapMessagesToChatMessages(body: any) {
    return body.messages.map((message: any) => {
        const role = (message.role === 'assistant')? message.role : 'user'; //message.role;//
        let content: string | Array<vscode.LanguageModelTextPart|vscode.LanguageModelToolCallPart|vscode.LanguageModelToolResultPart>;
        //if ( message.role === 'tool') {
            /*

                {
                    "role": "tool",
                    "tool_call_id": "call_QqGp4rWAU66O2emdXlvkaxwd",
                    "content": "{\"status\": \"success\", \"report\": \"The current time in new york is 2025-06-21 09:13:04 EDT-0400\"}"
                }


            *//*
            return new vscode.LanguageModelChatMessage(role,[
                new vscode.LanguageModelToolResultPart(
                    message.tool_call_id,
                    message.content instanceof Array ?
                        message.content.map((part: any) => {
                            return new vscode.LanguageModelTextPart(part.text);
                        }) : [message.content]//[new vscode.LanguageModelTextPart(message.content)],
                    )]);*/
        //}
        if ( message.tool_calls ) {
            /*
                {
                    "role": "assistant",
                    "tool_calls": [
                        {
                            "id": "call_QqGp4rWAU66O2emdXlvkaxwd",
                            "type": "function",
                            "function": {
                                "name": "get_current_time",
                                "arguments": "{\"city\": \"new york\"}"
                            }
                        }
                    ]
                }
            */
            return new vscode.LanguageModelChatMessage(role, message.tool_calls.map((toolCall: any) => {
                return new vscode.LanguageModelToolCallPart(
                    toolCall.id,
                    toolCall.function.name,
                    toolCall.function.arguments ? JSON.parse(toolCall.function.arguments) : undefined
                );
            }));
        }
        
        if (message.content instanceof Array) {
            content = message.content.map((part: any) => {
                return new vscode.LanguageModelTextPart(part.text);
            });
        } else {
            content = message.content;
        }
        
        return new vscode.LanguageModelChatMessage(role, content);
    });
}

function mapMessagesToChatMessagesWithToolCalls(body: any) : vscode.LanguageModelChatTool[] {
    if (!body.tools) {
        return [];
    }

    /* Tools attribute Example in request body
        [
        {
            "type": "function",
            "function": {
            "name": "get_weather",
            "description": "Retrieves the current weather report for a specified city.\n\nArgs:\n    city (str): The name of the city for which to retrieve the weather report.\n\nReturns:\n    dict: status and result or error msg.\n",
            "parameters": {
                "type": "object",
                "properties": {
                "city": {
                    "type": "string"
                }
                }
            }
            }
        },
        {
            "type": "function",
            "function": {
            "name": "get_current_time",
            "description": "Returns the current time in a specified city.\n\nArgs:\n    city (str): The name of the city for which to retrieve the current time.\n\nReturns:\n    dict: status and result or error msg.\n",
            "parameters": {
                "type": "object",
                "properties": {
                "city": {
                    "type": "string"
                }
                }
            }
            }
        }
        ]


    */
    return body.tools.map((tool: any) => {

        return {
            name: tool.function.name,
            description: tool.function.description,
            inputSchema: tool.function.parameters,
        };
    });
}

function generateTimeSequenceId(): string {
  const timestamp = Date.now(); // milliseconds since epoch
  const random = Math.random().toString(36).substring(2, 8); // random 6 chars
  return `chatcmpl-${timestamp}-${random}`;
}