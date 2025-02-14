# GitHub PR Tasklist Checker
Pull Requestのタスクが完了しているかチェックするためのAction。

## 特徴
このActionは、Pull Requestのタスクリストをよりコントロールできるようにします。  
チェックされていないタスクがある場合、Actionは失敗し、またチェックされていないタスクがコメントで指摘されます。

<details>
<summary>スクリーンショット</summary>

[![](https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/e5e79c5c-3054-424d-b895-f9e260e8bfcd)](#)
[![](https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/ca85fc0b-e34f-4284-9ea2-38c8870c8fb7)](#)
[![](https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/d19f6b77-b2be-4058-a5fe-02116163f362)](#)
[![](https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/157eb787-933d-4361-a6d7-82d55fb0778e)](#)
[![](https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/6f8a9fcb-dea6-4b35-89ef-1267440fb5df)](#)
[![](https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/054955d8-01ea-4dc7-846d-9d861e955aed)](#)
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

##### 子タスク
それぞれのタスクに対し、子タスクを定義することができます。  
子タスクは、親タスクが任意や選択肢である場合、それがチェックされている場合のみ検証されます。
```markdown
- [ ] 親タスク1
  - [ ] 子タスク1
  - [ ] 子タスク2
    - [ ] 孫タスク

- [ ] <!-- Optional --> 親タスク2
  - [ ] 「親タスク2」がチェックされているときのみ検証される
```
子タスクはインデントを作ることで定義できます。インデントの深さは同じである必要があります。
```markdown
- [ ] 親タスク
  - [ ] 子タスク
   - [ ] 構文エラー発生
```

#### タグポリシー
タグは常に「v」で始まり、それぞれのバージョンを参照します。それらのタグは不変です。  
また、メジャーバージョンとマイナーバージョンのみのタグ（v1.0, v2.0など）と
メジャーバージョンのみのタグ（v1, v2など）、「latest」タグも存在します。  
前２つの形式のタグはそれぞれの名前で始まる最も新しいバージョンを参照し、
最後の形式のタグはこのリポジトリ内で最新のバージョンを参照します。
