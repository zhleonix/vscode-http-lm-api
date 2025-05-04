# VScode extention that serve HTTP API using vscode Language Model API

 - [English](https://github.com/flat35hd99/vscode-http-lm-api/blob/main/README.md)
 - [日本語](https://github.com/flat35hd99/vscode-http-lm-api/blob/main/README_ja.md)

## Features

 - Provide API compatible with OpenAI API using VScode Language Model API.
   - You can use the API only install vscode extension.
 - [Available all models](https://docs.github.com/en/copilot/using-github-copilot/ai-models/changing-the-ai-model-for-copilot-chat) for GitHub Copilot chat

<!-- Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow. -->

## Motivation

VScode provides Language Models API to vscode extensions. For now, GitHub copilot provides LLM access for fixed fee. If we can use this access via OpenAI compatible HTTP API, we obtain strong power!

Furthermore, someone look llm proxy software that do not require additional installation, this vsvode extension is good solution.

## Requirements

This extension uses VScode Language Model API.

If you can use GitHub Copilot, then (probably) you can use this 

## Extension Settings

| name                                 | default | description                                                              |
|-|-|-|
|`http-lm-api.port`                    |`59603`  |The port number for the API server listening                              |
|`http-lm-api.startServerAutomatically`|`true`   |If true, start the server automatically after the vscode initialization finished|

## Specifications

 - OpenAI compatible
   - `POST /chat/completion`
     - Supporting stream mode.
   - `GET /v1/models`
   - `GET /models`
