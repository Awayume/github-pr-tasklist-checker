# GitHub PR Tasklist Checker
Pull Requestのタスクが完了しているかチェックするためのAction。

## 特徴
このActionは、Pull Requestのタスクリストをよりコントロールできるようにします。  
チェックされていないタスクがある場合、Actionは失敗し、またチェックされていないタスクがコメントで指摘されます。

<details>
<summary>スクリーンショット</summary>
<img src="https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/e4ab44a2-3a8f-4612-b6b5-f55f7cd7ba5a">
<img src="https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/469ed1df-84f1-47d3-abbc-a28ffbb29220">
<img src="https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/55710b34-6d4b-4b74-b8b5-e771db102451">
<img src="https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/834e89ad-a7f7-4f3d-a42f-2ccf7888d1f3">
<img src="https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/87c5d4a2-62ee-4407-bb33-a50a6b2b5438">
<img src="https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/c77715f1-eed8-484a-a858-ce69670903eb">
</details>

## 使い方
Pull Requestテンプレートを作成し、コントリビューターに確認してほしいタスクを記入します。

### 権限について
このActionはPull Requestへの書き込み権限を必要とします。  
詳しくは[GitHub Docs](https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)を参照。

### ワークフローのテンプレート
```yaml
name: PR Moderation

on:
  pull_request:
    types:
      - opened
      - edited
      - reopened

jobs:
  verify:
    name: Verify
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      - name: Check tasklist
        uses: Awayume/github-pr-tasklist-checker@v1

```

### 構文

##### 基本構文
これが基本の構文です。Markdownのチェックリスト構文に準拠します。  
オプションは無くても構いません。複数のオプションを指定する場合、コンマで区切ってください。
```markdown
- [ ] タスクの内容
- [ ] <!-- (オプション) --> タスクの内容
```

##### 任意
- Optional
任意のタスクにする。
```markdown
- [ ] <!-- Optional --> タスクの内容
```

##### 選択肢
- Choice
選択肢を作成する。
```markdown
- [ ] <!-- Choice --> タスクの内容
- [ ] <!-- Choice --> タスクの内容
```
複数設問する場合、識別子を指定する必要があります。
```markdown
- [ ] <!-- Choice#1 --> タスクの内容
- [ ] <!-- Choice#1 --> タスクの内容

- [ ] <!-- Choice#2 --> タスクの内容
- [ ] <!-- Choice#2 --> タスクの内容
```

  - multiple
  複数回答を許可する。
  ```markdown
  - [ ] <!-- Choice,multiple --> タスクの内容
  - [ ] <!-- Choice,multiple --> タスクの内容
  ```

#### タグポリシー
タグは常に「v」で始まり、それぞれのバージョンを参照します。それらのタグは不変です。  
また、メジャーバージョンとマイナーバージョンのみのタグ（v1.0, v2.0など）と
メジャーバージョンのみのタグ（v1, v2など）、「latest」タグも存在します。  
前２つのタイプのタグはそれぞれの名前で始まる最も新しいバージョンを参照し、
最後のタイプのタグはこのリポジトリ内で最新のバージョンを参照します。
