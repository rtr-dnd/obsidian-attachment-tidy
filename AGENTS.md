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

- TODO: 雛形を作ったら書く（`npm install` / `npm run dev` / `npm run build` / `npm test` の予定）
