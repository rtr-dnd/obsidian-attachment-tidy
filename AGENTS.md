# Attachment Tidy

vaultの添付ファイルを、参照しているノートと同じフォルダへ移し、使われていないものを削除するObsidianプラグイン。

## ディレクトリ

- `docs/` — PRD・仕様書。仕様の正はここ。
- `memory/progress.md` — プロジェクト全体の進捗ログ（1本の長いファイル）。
- `memory/session-handoff.md` — 前セッションからの引き継ぎ。毎セッション上書き。

## 運用ルール

1. **セッション開始時に `memory/session-handoff.md` を必ず読む。**「Pick up next session by」が作業の起点。あわせて `memory/progress.md` の Current focus を確認する。
2. **実装前に `docs/` を読む。** 仕様が書かれていない機能を実装するときは、先に `docs/` に追記してから着手する。仕様変更はコードより先に `docs/` を更新し、コードと PRD が食い違ったら PRD を疑ってユーザーに確認する。
3. **作業が一区切りついたら `memory/progress.md` を更新する。** Done に追記し、Current focus / In progress / Next を現状に合わせ、Last updated を書き換える。
4. **セッション終了時（または大きな区切りごと）に `memory/session-handoff.md` を上書きする。** This session / NOT done / Pick up next session by の3節。次のセッションの自分が読んで即座に再開できる粒度で書く。

## 開発コマンド

- `npm install` — 依存関係を入れる
- `npm test` — 振り分けロジック（`src/planner.ts`）のユニットテスト（vitest）
- `npm run build` — 型チェックをしてから `main.js` を出力する
- `npm run dev` — watchビルド（インラインsourcemap付き）
- 実機で試す: vaultの `.obsidian/plugins/attachment-tidy/` に `main.js`・`manifest.json`・`styles.css` を置く（またはこのリポジトリをシンボリックリンクする）。

## コード構成

- `src/planner.ts` — 振り分けルール（純粋関数。Obsidian APIに依存しない）。仕様の中心なので、変更するときはテストから
- `src/main.ts` — プラグイン本体（コマンド、リボン、計画の作成と実行）
- `src/confirm-modal.ts` — 削除前の確認モーダル
- `src/settings.ts` — 設定とその画面
