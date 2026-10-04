# Progress — Attachment Tidy

Last updated: 2026-10-04

## Current focus

PRDが確定したので、プロジェクトの雛形（package.json / esbuild / manifest）と振り分けロジックの実装に入る。

## Done

- [x] repo-init でプロジェクト構造を初期化（docs/, memory/, AGENTS.md）。仕様の議論の結果を `docs/PRD.md` に反映済み。

## In progress

## Next

- 雛形を作る（package.json, tsconfig, esbuild.config.mjs, manifest.json）
- `src/planner.ts`（振り分けの純粋関数）を vitest のテストから書く
- `src/main.ts`（コマンド・リボン・モーダル・設定）
- ritar-lab vault で実際に動かして確認する

## Backlog

- 添付ファイル用サブフォルダへの振り分け（PRDの未決事項）
- Community Pluginsとして公開するか
