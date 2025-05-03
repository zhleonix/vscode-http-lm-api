# VScode extention that serve HTTP API using vscode Language Model API

 - [English](https://github.com/flat35hd99/vscode-http-lm-api/blob/main/README.md)
 - [日本語](https://github.com/flat35hd99/vscode-http-lm-api/blob/main/README_ja.md)

## Features

 - Provide API compatible with OpenAI API using VScode Language Model API.
   - You can use the API only install vscode extension.

<!-- Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow. -->

## Requirements

This extension uses VScode Language Model API.

If you can use GitHub Copilot, then (probably) you can use this 

## Extension Settings

| name                                 | default | description                                                              |
|-|-|-|
|`http-lm-api.port`                    |`59603`  |The port number for the API server listening                              |
|`http-lm-api.startServerAutomatically`|`true`   |If the server start automatically after the vscode initialization finished|

<!-- Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something. -->
