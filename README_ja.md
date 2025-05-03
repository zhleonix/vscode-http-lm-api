# VScode拡張機能 - VScode Language Model APIを用いた HTTP API server

 - [English](https://github.com/flat35hd99/vscode-http-lm-api/blob/main/README.md)
 - [日本語](https://github.com/flat35hd99/vscode-http-lm-api/blob/main/README_ja.md)

## 機能

 - VScode Language Model APIを使用して、OpenAI API互換のAPIを提供します。
   - VScode拡張機能をインストールするだけでAPIを利用できます。

<!-- 拡張機能の具体的な機能を説明し、動作中のスクリーンショットを含めてください。画像パスはこのREADMEファイルからの相対パスです。

例えば、拡張機能プロジェクトワークスペース内に画像サブフォルダがある場合:

\!\[機能X\]\(images/feature-x.png\)

> ヒント: 多くの人気拡張機能はアニメーションを利用しています。これは拡張機能をアピールする優れた方法です！短く、フォーカスされたアニメーションで、簡単に理解できるものをお勧めします。 -->

## 必要条件

この拡張機能はVScode Language Model APIを使用します。

GitHub Copilotを使用できる場合、おそらくこの拡張機能も使用可能です。

## 拡張機能の設定

| 設定値                                | デフォルト値 | 説明                                                |
|-|-|-|
|`http-lm-api.port`                    |`59603`      |APIサーバーがリッスンするポート番号                         |
|`http-lm-api.startServerAutomatically`|`true`       |VScodeの初期化が完了した後、自動的にサーバーを起動するかどうか|

<!-- 拡張機能が`contributes.configuration`拡張ポイントを通じてVS Code設定を追加する場合、以下を含めてください。

例えば:

この拡張機能は以下の設定を提供します:

* `myExtension.enable`: この拡張機能を有効/無効にします。
* `myExtension.thing`: `blah`に設定すると何かをします。 -->
