# Laravel 11用Docker開発環境

- PHP 8.2 (FPM)
- MySQL 8.0
- Redis 7.2
- MinIO (S3互換)
- FFmpeg

## 起動方法

1. 初回のみ

```
docker compose build
```

2. サービス起動

```
docker compose up -d
```

3. Laravelプロジェクト作成（初回のみ）

```
docker compose exec app composer create-project laravel/laravel . "^11.0"
```

4. .envファイルを編集し、DBやS3(MinIO)の接続情報を設定

5. マイグレーション実行

```
docker compose exec app php artisan migrate
```

6. アプリにアクセス

- http://localhost:8080

---

## MinIO (S3互換) 設定例

.env
```
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_DEFAULT_REGION=ap-northeast-1
AWS_BUCKET=teachme-local
AWS_ENDPOINT=http://minio:9000
AWS_USE_PATH_STYLE_ENDPOINT=true
```

MinIO管理画面: http://localhost:9001

---

## FFmpeg

動画・音声処理用にappコンテナにインストール済み

---

## Tips
- MySQL: ユーザー teachme / teachme, DB teachme, rootパスワード root
- MinIO: ユーザー minioadmin / minioadmin
- Redis: ポート6379
