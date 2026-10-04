# Progress — Attachment Tidy

Last updated: 2026-10-04

## Current focus

v0.1.0 の実装が完了。ritar-lab vault で実際に動かして確認する段階。

## Done

- [x] repo-init でプロジェクト構造を初期化（docs/, memory/, AGENTS.md）。仕様の議論の結果を `docs/PRD.md` に反映済み。
- [x] 雛形を作成（package.json, tsconfig.json, esbuild.config.mjs, manifest.json, versions.json, styles.css）。minAppVersion は 1.6.0。
- [x] `src/planner.ts`（collectTargets / buildReferenceIndex / planTidy）をテストから実装。`src/planner.test.ts` の12件は green。
- [x] `src/main.ts`・`src/settings.ts`・`src/confirm-modal.ts` を実装。`npm run build`（tsc + esbuild）は通るが、**Obsidian上ではまだ動かしていない**。

## In progress

## Next

- ritar-lab に入れて実際に動かす。期待される結果: ルートの18枚のうち、16枚が `Misc/ACT-X/採用後/` と `Humane Parallel Agents/survey/` へ移動し、2枚（`Pasted image 20260925133935.png` と `Pasted image 20260929212255.png`）がゴミ箱へ行く
- vaultスコープで実行する前に、`00_Slides` などを除外フォルダに入れる必要があるか確認する

## Backlog

- 添付ファイル用サブフォルダへの振り分け（PRDの未決事項）
- Community Pluginsとして公開するか
- 起動直後、metadataCache の索引が終わる前に実行すると、参照されている画像を「未使用」と誤判定するおそれがある。必要なら `resolved` イベントを待つガードを入れる
