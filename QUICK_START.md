# クイックスタートガイド

## 🚀 最短で始める方法

### 外出先で使いたい → GitHub Pagesにデプロイ（推奨）

詳細は [DEPLOY.md](DEPLOY.md) を参照してください。

**簡単3ステップ:**

1. **GitHubでリポジトリ作成**
   - https://github.com で新しいリポジトリ `travel-route-tracker` を作成

2. **コードをプッシュ**
   ```bash
   cd "c:/Users/j0113167/OneDrive - Honda/dev2/travel-route-tracker"
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/[YOUR_USERNAME]/travel-route-tracker.git
   git branch -M main
   git push -u origin main
   ```

3. **GitHub Pagesを有効化**
   - リポジトリの Settings → Pages → Source: "GitHub Actions"

✅ 完了！ `https://[YOUR_USERNAME].github.io/travel-route-tracker/` でアクセス可能

---

### 今すぐ試したい → ローカルで起動

1. **`start.bat` をダブルクリック**（Windows）

2. **ブラウザで開く**
   ```
   http://localhost:3000
   ```

3. **位置情報を許可**

✅ 完了！記録開始ボタンで使用開始

---

## 📱 スマホで使う

### GitHub Pagesにデプロイした場合
- スマホのブラウザで公開URLにアクセス
- ホーム画面に追加すればアプリのように使える
- **外出先でも使用可能**

### ローカルサーバーの場合
- PCとスマホを同じWi-Fiに接続
- `http://[PCのIPアドレス]:3000` にアクセス
- **同じWi-Fi内でのみ使用可能**

---

## ❓ 困ったら

### 位置情報が取得できない
- スマホの位置情報設定を確認
- ブラウザの位置情報許可を確認
- HTTPSまたはlocalhostで接続しているか確認

### データが消えた
- ブラウザのデータを消去すると記録も削除されます
- 重要なデータは定期的に「エクスポート」してください

### もっと詳しく知りたい
- 基本的な使い方: [README.md](README.md)
- デプロイ方法: [DEPLOY.md](DEPLOY.md)
