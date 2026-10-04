# Session handoff — 2026-10-04 (リポジトリを初期化し、PRDを確定)

Overwritten each session — the history of past sessions lives in git, not here.

## This session

- ritar-lab vault のルートに溜まった `Pasted image *.png`（18枚: 使用中16、未使用2）を整理するプラグインの仕様をユーザーと議論した。
- 決まったこと: 複数のノートから参照されている画像は、参照元のパスを文字列順に並べた先頭のノートのフォルダへ移す／確認モーダルは削除があるときだけ出す（設定でオフにできる）／vault全体の整理まで見据えて設計する／別リポジトリで開発する。
- repo-init で `docs/PRD.md`・`memory/`・`AGENTS.md` を作った。コードはまだない。
- 参考: ritar-lab の `.obsidian/app.json` には `attachmentFolderPath` が設定されていない。画像がルートに溜まる原因はこれ。

## NOT done / user actions

1. ritar-lab の「添付ファイルの保存場所」を「現在のファイルと同じフォルダ」に変えるかどうかは、ユーザーが決める。

## Pick up next session by

1. `docs/PRD.md` を読む
2. 雛形を作り、`src/planner.ts` をテストから実装する
