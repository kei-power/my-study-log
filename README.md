# かんたん日記

HTML/CSS/JavaScriptとlocalStorageだけで動く、気分ログ付きの小さな日記アプリです。

日付ごとに「今日の気分」と「一言メモ」を保存できます。保存した記録はブラウザのlocalStorageに残るため、ページを閉じても同じブラウザで再度開けば過去ログを確認できます。

## 📱 デモ

🔗 [https://gigaschool.github.io/tiny-diary/](https://gigaschool.github.io/tiny-diary/)

![📷 image.png](image.png)

## デモの動かし方

`index.html` をブラウザで開くだけで使えます。ビルドやサーバー起動は不要です。

```text
tiny-diary/
├── index.html
├── styles.css
├── app.js
├── README.md
└── LICENSE
```

## 機能

- 今日の日付を自動セット
- 気分を5種類から選択
- 一言メモを保存
- 日付ごとに1件の記録として保存
- 同じ日付で保存すると上書き
- 過去ログの一覧表示
- 保存済みログの編集
- 保存済みログの削除
- メモ検索
- 気分フィルター
- 最近7件の気分の流れを表示するsin曲線風の気分バイオリズム

## 使用技術

- HTML
- CSS
- JavaScript
- localStorage

外部ライブラリは使っていません。

## localStorage

保存キーは `tiny-diary.entries.v1` です。

データは次のような配列で保存されます。

```json
[
  {
    "id": "example-id",
    "date": "2026-04-29",
    "mood": "happy",
    "note": "今日は少しうまくいった",
    "createdAt": "2026-04-29T10:00:00.000Z",
    "updatedAt": "2026-04-29T10:00:00.000Z"
  }
]
```

## 気分データ

気分は次の5種類です。

| 値 | 表示 | スコア |
| --- | --- | --- |
| `happy` | うれしい | 5 |
| `calm` | おだやか | 4 |
| `normal` | ふつう | 3 |
| `tired` | つかれた | 2 |
| `sad` | しょんぼり | 1 |

気分バイオリズムでは、最近7件の記録をこのスコアに変換して、SVGの波形グラフとして表示します。

## 教材で説明しやすい流れ

1. フォームから値を受け取る
2. JavaScriptの配列に日記データを追加する
3. `JSON.stringify` でlocalStorageへ保存する
4. `JSON.parse` でlocalStorageから読み込む
5. 配列をもとに一覧と気分バイオリズムを再描画する

## ファイル構成

- `index.html`: 画面の構造
- `styles.css`: レイアウトと見た目
- `app.js`: 保存、表示、編集、削除、検索、バイオリズム描画
- `README.md`: この説明ファイル
- `LICENSE`: MITライセンス

## ライセンス

MIT License
