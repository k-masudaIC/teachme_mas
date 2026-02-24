# teachme.mas
マニュアル管理システム

# 業務マニュアル自動生成システム 要件定義書

**バージョン：** 1.1  
**作成日：** 2026年  
**ステータス：** Draft

**変更履歴：**

| バージョン | 変更内容 |
|-----------|---------|
| 1.0 | 初版作成 |
| 1.1 | フォルダ管理テーブル追加、manualsテーブルに`folder_id`追加、Phase 2に関連機能を追記 |

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [システム構成](#2-システム構成)
3. [想定ユーザー](#3-想定ユーザー)
4. [機能要件](#4-機能要件)
5. [データベース設計](#5-データベース設計)
6. [AI連携仕様](#6-ai連携仕様)
7. [非同期処理仕様](#7-非同期処理仕様)
8. [非機能要件](#8-非機能要件)
9. [制約条件](#9-制約条件)
10. [開発フェーズ](#10-開発フェーズ)
11. [今後の拡張候補](#11-今後の拡張候補)
12. [成功基準](#12-成功基準)


---

## 1. プロジェクト概要

### 1.1 システム名

**社内業務マニュアル自動生成システム**（仮称）

### 1.2 背景・目的

社内業務の属人化を解消し、動画撮影ベースでAIが自動的にマニュアル化する仕組みを構築する。  
teachme.biz のような直感的なステップ型マニュアルを、社内専用環境で低コストに実現することを目指す。

### 1.3 達成目標

| 目標 | 内容 |
|------|------|
| 業務手順の自動文書化 | 動画から手順書を自動生成する |
| 教育コスト削減 | OJT・引き継ぎ時間を短縮する |
| 手順更新の効率化 | 再撮影・再生成で簡単に最新化できる |
| ナレッジ蓄積 | 社内の暗黙知をデジタル資産として蓄積する |

---

## 2. システム構成

### 2.1 アーキテクチャ概要

```
[ブラウザ / クライアント]
        ↓ HTTPS
[フロントエンド: Vue 3 or React]
        ↓ REST API
[バックエンド: Laravel 11]
        ↓
  ┌──────────────────────────────────┐
  │  MySQL（メインDB）               │
  │  Redis（キュー / セッション）    │
  │  AWS S3（動画・画像ストレージ）  │
  └──────────────────────────────────┘
        ↓ 非同期ジョブ
[Laravel Queue Worker]
        ↓
[外部AI API（文字起こし / テキスト整形）]
[FFmpeg（音声抽出・動画処理）]
```

### 2.2 技術スタック

| レイヤー | 採用技術 | 備考 |
|----------|----------|------|
| フロントエンド | Vue 3 または React | SPA構成 |
| バックエンド | Laravel 11 | PHP 8.2以上 |
| データベース | **MySQL 8.0** | 主データストア |
| ストレージ | AWS S3 | 動画・画像ファイル |
| キュー | Redis + Laravel Queue | 非同期処理基盤 |
| AI連携 | 外部AI API | 音声文字起こし・テキスト整形 |
| 動画処理 | FFmpeg | 音声抽出・サムネイル生成 |

---

## 3. 想定ユーザー

### 3.1 ユーザー区分

| ロール | 概要 | 主な操作 |
|--------|------|----------|
| 管理者（Admin） | システム全体を管理する担当者 | ユーザー管理、全マニュアル閲覧・編集・削除、ログ確認 |
| 一般ユーザー（User） | 業務担当者 | マニュアル作成・編集・閲覧、動画アップロード |

---

## 4. 機能要件

### 4.1 認証機能

- メールアドレス＋パスワードによるログイン
- Laravel Sanctum による認証トークン管理
- パスワードリセット機能（メール送信）
- ロールベースアクセス制御（admin / user）
- セッションタイムアウト設定

### 4.2 マニュアル作成機能

#### 4.2.1 方法1：動画アップロード

```
1. ユーザーが動画ファイルをアップロード
2. AWS S3 へ保存
3. 非同期ジョブを発火
4. FFmpeg により音声（mp3）を抽出
5. 音声文字起こし AI API へ送信
6. プレーンテキストを取得
7. テキスト整形 AI API へ送信（マニュアル形式化）
8. ステップ形式の JSON を取得
9. DB へ保存（manual_steps テーブル）
```

**対応動画形式：** mp4, mov, avi, webm  
**最大ファイルサイズ：** 2GB（S3 マルチパートアップロード使用）

#### 4.2.2 方法2：ブラウザ内録画

- `getUserMedia()` によるカメラ・マイク録画
- `getDisplayMedia()` による画面キャプチャ録画
- 録画完了後に自動アップロード開始
- 録画中はリアルタイムプレビュー表示

### 4.3 マニュアル閲覧機能

- ステップ順の一覧表示
- スライド形式でのステップ切り替え表示
- PDF エクスポート（ステップ画像含む）
- 印刷用レイアウト対応
- 公開ステータス（下書き / 公開）によるアクセス制御

### 4.4 マニュアル編集機能

- ステップの追加・削除
- ステップの並び替え（ドラッグ＆ドロップ）
- タイトル・説明文のテキスト修正
- ステップ画像の差し替え・追加
- タイトル・概要の編集

### 4.5 検索・フィルタ機能

- タイトルによるキーワード検索
- 本文のフルテキスト検索（MySQL FULLTEXT インデックス使用）
- 作成者によるフィルタ
- 作成日・更新日によるフィルタ
- フォルダによるフィルタ（Phase 2）

### 4.6 ログ・分析機能

- マニュアル別閲覧回数の集計
- 最終閲覧日時の記録
- ユーザー別閲覧履歴の管理
- 管理者向けダッシュボードでの統計表示

---

## 5. データベース設計

> **DB:** MySQL 8.0  
> 文字コード：`utf8mb4`、照合順序：`utf8mb4_unicode_ci`

### 5.1 users（ユーザー）

| カラム名 | 型 | 制約 | 説明 |
|----------|----|------|------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | ユーザーID |
| name | VARCHAR(100) | NOT NULL | 氏名 |
| email | VARCHAR(255) | NOT NULL, UNIQUE | メールアドレス |
| password | VARCHAR(255) | NOT NULL | ハッシュ化パスワード |
| role | ENUM('admin','user') | NOT NULL, DEFAULT 'user' | ロール |
| email_verified_at | TIMESTAMP | NULL | メール認証日時 |
| remember_token | VARCHAR(100) | NULL | リメンバートークン |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

### 5.2 manuals（マニュアル）

| カラム名 | 型 | 制約 | 説明 |
|----------|----|------|------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | マニュアルID |
| user_id | BIGINT UNSIGNED | NOT NULL, FK(users.id) | 作成者 |
| folder_id | BIGINT UNSIGNED | NULL, FK(folders.id) | 所属フォルダ（Phase 2で使用開始） |
| title | VARCHAR(255) | NOT NULL | タイトル |
| description | TEXT | NULL | 概要 |
| status | ENUM('draft','published') | NOT NULL, DEFAULT 'draft' | 公開状態 |
| view_count | INT UNSIGNED | NOT NULL, DEFAULT 0 | 閲覧回数 |
| last_viewed_at | TIMESTAMP | NULL | 最終閲覧日時 |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |
| deleted_at | TIMESTAMP | NULL | 論理削除日時 |

**インデックス：**
- `FULLTEXT INDEX ft_title_description (title, description)` — フルテキスト検索用
- `INDEX idx_folder_id (folder_id)` — フォルダ絞り込み用

### 5.3 manual_steps（ステップ）

| カラム名 | 型 | 制約 | 説明 |
|----------|----|------|------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | ステップID |
| manual_id | BIGINT UNSIGNED | NOT NULL, FK(manuals.id) | マニュアルID |
| step_number | INT UNSIGNED | NOT NULL | 手順番号 |
| title | VARCHAR(255) | NOT NULL | ステップタイトル |
| body | TEXT | NULL | 説明文 |
| image_path | VARCHAR(500) | NULL | S3画像パス |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

**インデックス：**
- `INDEX idx_manual_id (manual_id)`
- `UNIQUE INDEX uq_manual_step (manual_id, step_number)`
- `FULLTEXT INDEX ft_body (body)` — 本文フルテキスト検索用

### 5.4 manual_videos（動画管理）

| カラム名 | 型 | 制約 | 説明 |
|----------|----|------|------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | 動画ID |
| manual_id | BIGINT UNSIGNED | NOT NULL, FK(manuals.id) | マニュアルID |
| file_path | VARCHAR(500) | NOT NULL | S3ファイルパス |
| original_filename | VARCHAR(255) | NULL | 元ファイル名 |
| duration | INT UNSIGNED | NULL | 動画長さ（秒） |
| file_size | BIGINT UNSIGNED | NULL | ファイルサイズ（バイト） |
| processing_status | ENUM('pending','processing','completed','failed') | NOT NULL, DEFAULT 'pending' | 処理状態 |
| error_message | TEXT | NULL | エラー内容 |
| retry_count | TINYINT UNSIGNED | NOT NULL, DEFAULT 0 | リトライ回数 |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |

**インデックス：**
- `INDEX idx_manual_id (manual_id)`
- `INDEX idx_processing_status (processing_status)`

### 5.5 folders（フォルダ管理）※ Phase 2で使用開始

> Phase 1では`manuals.folder_id`カラムのみ作成しておき、実際のフォルダ機能はPhase 2で実装する。

| カラム名 | 型 | 制約 | 説明 |
|----------|----|------|------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | フォルダID |
| parent_id | BIGINT UNSIGNED | NULL, FK(folders.id) | 親フォルダID（階層構造用） |
| name | VARCHAR(100) | NOT NULL | フォルダ名 |
| sort_order | INT UNSIGNED | NOT NULL, DEFAULT 0 | 表示順 |
| created_by | BIGINT UNSIGNED | NOT NULL, FK(users.id) | 作成者 |
| created_at | TIMESTAMP | NOT NULL | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL | 更新日時 |
| deleted_at | TIMESTAMP | NULL | 論理削除日時 |

**インデックス：**
- `INDEX idx_parent_id (parent_id)`

**備考：**
- 階層は2段階まで（フォルダ > サブフォルダ）を推奨
- `parent_id = NULL` はルートフォルダを意味する

### 5.6 view_logs（閲覧ログ）

| カラム名 | 型 | 制約 | 説明 |
|----------|----|------|------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | ログID |
| manual_id | BIGINT UNSIGNED | NOT NULL, FK(manuals.id) | マニュアルID |
| user_id | BIGINT UNSIGNED | NULL, FK(users.id) | 閲覧ユーザーID |
| ip_address | VARCHAR(45) | NULL | IPアドレス |
| viewed_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 閲覧日時 |

**インデックス：**
- `INDEX idx_manual_id (manual_id)`
- `INDEX idx_user_id (user_id)`
- `INDEX idx_viewed_at (viewed_at)`

### 5.7 テーブルER図（概略）

```
folders ──< folders（自己参照・階層）
   │
   └──< manuals（Phase 2〜）
           │
users ──< manuals ──< manual_steps
               │
               └──< manual_videos
               │
               └──< view_logs >── users
```

---

## 6. AI連携仕様

### 6.1 音声文字起こし API

| 項目 | 内容 |
|------|------|
| 入力形式 | mp3（FFmpegにより動画から抽出） |
| 出力形式 | プレーンテキスト |
| タイムアウト | 5分 |

### 6.2 テキスト整形 API（手順化）

**送信プロンプト例：**

```
以下の業務説明テキストを、業務マニュアル形式に変換してください。

出力形式（JSONのみ）:
[
  {
    "step_number": 1,
    "title": "ステップタイトル",
    "body": "手順の詳細説明"
  }
]

テキスト：
{{文字起こし結果}}
```

| 項目 | 内容 |
|------|------|
| 出力形式 | JSON のみ（マークダウン・前後の説明文は不可） |
| バリデーション | JSON パース成功・必須キー存在チェック |
| エラー時 | リトライまたは手動編集モードへ移行 |

---

## 7. 非同期処理仕様

### 7.1 キュー設定

| 項目 | 内容 |
|------|------|
| キューバックエンド | Redis |
| 最大処理時間 | 10分 |
| 失敗時リトライ回数 | 3回 |
| リトライ間隔 | 60秒（指数バックオフ） |
| 失敗ログ | `failed_jobs` テーブルへ保存 |

### 7.2 処理フロー

```
[動画アップロード完了]
        ↓
[Job: VideoProcessingJob ディスパッチ]
        ↓
① FFmpeg: 動画から音声(mp3)抽出
        ↓
② 音声文字起こし API へ送信 → テキスト取得
        ↓
③ テキスト整形 API へ送信 → JSON 取得
        ↓
④ manual_steps テーブルへ保存
        ↓
⑤ manual_videos.processing_status を 'completed' に更新
        ↓
[ユーザーへ完了通知（メールまたは画面通知）]
```

---

## 8. 非機能要件

### 8.1 パフォーマンス

| 指標 | 目標値 |
|------|--------|
| 同時接続ユーザー数 | 50人 |
| 画面表示速度 | 3秒以内（TTI） |
| 動画アップロード | プログレスバー表示必須 |

### 8.2 セキュリティ

| 項目 | 対策 |
|------|------|
| 通信 | HTTPS 必須（TLS 1.2以上） |
| 動画・画像アクセス | AWS S3 署名付きURL（有効期限付き）を使用 |
| アクセス制御 | ロールベースアクセス制御（RBAC） |
| SQLインジェクション | Laravel Eloquent / Prepared Statement 使用 |
| XSS | CSP ヘッダー設定・Blade エスケープ |
| CSRF | Laravel CSRF トークン保護 |
| パスワード | bcrypt / argon2 でハッシュ化 |

### 8.3 可用性・バックアップ

| 対象 | 方針 |
|------|------|
| MySQL | 1日1回フルバックアップ（自動スナップショット） |
| AWS S3 | ライフサイクルポリシーによる世代管理 |
| アプリ | デプロイはゼロダウンタイム対応（Blue/Green 推奨） |

---

## 9. 制約条件

| 制約 | 内容 |
|------|------|
| 利用対象 | 社内専用（外部公開なし） |
| マルチテナント | 不要（単一組織）|
| モバイル対応 | 必須ではないが、基本的な閲覧は対応 |
| 使用言語 | 日本語のみ（UIおよびマニュアル内容） |

---

## 10. 開発フェーズ

### Phase 1（MVP）— 最優先

| # | 機能 |
|---|------|
| 1 | ユーザー認証・ロール管理 |
| 2 | 動画アップロード |
| 3 | AI文字起こし・非同期処理 |
| 4 | 手順（ステップ）自動生成 |
| 5 | ステップ編集機能 |

### Phase 2

| # | 機能 | 備考 |
|---|------|------|
| 1 | フォルダ管理 | foldersテーブルの有効化・フォルダUI実装 |
| 2 | ブラウザ内録画（カメラ・画面） | getUserMedia / getDisplayMedia |
| 3 | PDF エクスポート | ステップ画像含む |
| 4 | 閲覧ログ・分析ダッシュボード | 管理者向け統計画面 |
| 5 | フルテキスト検索 | MySQL FULLTEXT活用 |
| 6 | QRコード出力 | マニュアル単位でQR生成・印刷用レイアウト |

### Phase 3

| # | 機能 | 備考 |
|---|------|------|
| 1 | 動画からの自動スクリーンショット抽出 | FFmpegで任意フレーム切り出し |
| 2 | 画像アノテーション | 矢印・テキスト注記をCanvas上で描画 |
| 3 | タスク配信・既読確認 | ユーザーへの閲覧指示と完了管理 |
| 4 | トレーニングコース機能 | 複数マニュアルをコース化・進捗管理 |
| 5 | 高度なAI補助（要約・改善提案） | |
| 6 | 承認ワークフロー | 上長による公開承認フロー |
| 7 | UI/UX 改善・アクセシビリティ対応 | |

---

## 11. 今後の拡張候補

- フォルダ管理（Phase 2で実装予定、DBカラムは初期から用意済み）
- QRコード出力（Phase 2で実装予定）
- 画像アノテーション（矢印・テキスト注記、Phase 3で実装予定）
- タスク配信・既読確認（Phase 3で実装予定）
- トレーニングコース機能（Phase 3で実装予定）
- 動画から操作タイミングに合わせた自動スクリーンショット抽出
- 多言語翻訳（日本語 → 英語など）
- AI要約機能（長いマニュアルの概要生成）
- 音声入力のみによる簡易マニュアル作成
- 承認ワークフロー（上長による公開承認）
- Slack / Teams への通知連携
- 外部 LMS との連携

---

## 12. 成功基準

| 指標 | 測定方法 |
|------|----------|
| 月間マニュアル作成数 | view_logs および manuals テーブルの集計 |
| 教育時間削減率 | 導入前後のOJT所要時間の比較 |
| マニュアル更新頻度 | manuals.updated_at の更新回数 |
| ユーザー定着率 | 月間アクティブユーザー数の推移 |

---

*以上*
