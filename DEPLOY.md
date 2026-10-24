# GitHub Pagesへのデプロイ方法

このアプリをインターネット上で公開して、外出先のスマホからもアクセスできるようにする手順です。

## 手順

### 1. GitHubアカウントの作成（未作成の場合）
https://github.com にアクセスしてアカウントを作成してください。

### 2. 新しいリポジトリを作成
1. GitHubにログイン
2. 右上の「+」→「New repository」をクリック
3. Repository name: `travel-route-tracker` と入力
4. Public を選択
5. 「Create repository」をクリック

### 3. コードをGitHubにプッシュ

プロジェクトフォルダで以下のコマンドを実行：

```bash
cd "c:/Users/j0113167/OneDrive - Honda/dev2/travel-route-tracker"

# Gitの初期化（すでに実行済みならスキップ）
git init

# すべてのファイルを追加
git add .

# コミット
git commit -m "Initial commit: 旅行ルートトラッカー"

# GitHubのリポジトリに接続（[USERNAME]を自分のユーザー名に置き換え）
git remote add origin https://github.com/[USERNAME]/travel-route-tracker.git

# メインブランチにプッシュ
git branch -M main
git push -u origin main
```

### 4. GitHub Pagesを有効化

1. GitHubのリポジトリページで「Settings」タブをクリック
2. 左サイドバーから「Pages」を選択
3. Source で「GitHub Actions」を選択
4. 自動的にデプロイが開始されます

### 5. デプロイ完了を確認

1. リポジトリの「Actions」タブで進行状況を確認
2. 緑のチェックマークが表示されたら完了
3. 「Settings」→「Pages」で公開URLを確認
   - URL: `https://[USERNAME].github.io/travel-route-tracker/`

## スマホからアクセス

デプロイ完了後、スマホのブラウザで公開URLにアクセスしてください：
```
https://[USERNAME].github.io/travel-route-tracker/
```

### ホーム画面に追加（推奨）

#### Android (Chrome)
1. ブラウザのメニュー（⋮）→「ホーム画面に追加」
2. アプリのようにホーム画面から起動できます

#### iOS (Safari)
1. 共有ボタン（□↑）→「ホーム画面に追加」
2. アプリのようにホーム画面から起動できます

## 更新方法

アプリを更新したい場合：

```bash
cd "c:/Users/j0113167/OneDrive - Honda/dev2/travel-route-tracker"

git add .
git commit -m "更新内容の説明"
git push
```

プッシュすると自動的に再デプロイされます。

## 注意事項

- **HTTPSで動作**: GitHub PagesはHTTPSで提供されるため、位置情報APIが正常に動作します
- **完全無料**: GitHub Pagesは無料で利用できます
- **データ保存**: データはスマホのブラウザ内に保存されるため、ブラウザのデータを消去すると記録も削除されます
- **定期的なバックアップ**: 重要なデータは「エクスポート」機能でGPXファイルとして保存してください

## トラブルシューティング

### デプロイが失敗する
- リポジトリがPublicになっているか確認
- GitHub Actions が有効になっているか確認
- `.github/workflows/deploy.yml` が正しく配置されているか確認

### 位置情報が取得できない
- HTTPSで接続されているか確認（GitHub Pagesは自動的にHTTPS）
- スマホの位置情報設定がオンになっているか確認
- ブラウザに位置情報の許可を与えているか確認
