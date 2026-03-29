FROM node:20-alpine

# アプリケーションのディレクトリを作成
WORKDIR /app

# パッケージの定義ファイルをコピー
COPY package*.json ./

# 依存モジュールのインストール
RUN npm install

# アプリケーションのコードをコピー
COPY . .

# 今回のサーバーが使用するポートを公開
EXPOSE 3000

# サーバー起動コマンド
CMD ["npm", "start"]
