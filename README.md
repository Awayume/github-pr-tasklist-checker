# GitHub PR Tasklist Checker
An Action to check if the PR task list is complete.

## Features
This Action gives you more control over your pull request task list.  
Also, when a check is missing, this not only causes the Action to fail, but also points it out in the comments.

<details>
<summary>Screenshots</summary>
<img src="https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/e4ab44a2-3a8f-4612-b6b5-f55f7cd7ba5a">
<img src="https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/469ed1df-84f1-47d3-abbc-a28ffbb29220">
<img src="https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/55710b34-6d4b-4b74-b8b5-e771db102451">
<img src="https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/834e89ad-a7f7-4f3d-a42f-2ccf7888d1f3">
<img src="https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/87c5d4a2-62ee-4407-bb33-a50a6b2b5438">
<img src="https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/c77715f1-eed8-484a-a858-ce69670903eb">
</details>

## How to use
I recommend creating a Pull Request template.  
In it, write the tasks you want contributors to check.

### About permission
This Action requires write permission to Pull Requests.  
Details on [GitHub Docs](https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)

### Workflow template
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

### Syntax

##### Basic syntax
This is the basic syntax. It follows the basics of a regular markdown checklist.  
It doesn't matter if there are no options.
When specifying multiple options, separate them with commas.
```markdown
- [ ] Task title
- [ ] <!-- (Options) --> Task title
```

##### Options
- Optional
Make it an optional task
```markdown
- [ ] <!-- Optional --> Task title
```

- Choice
Create choices.
```markdown
- [ ] <!-- Choice --> Task title
- [ ] <!-- Choice --> Task title
```
When asking several questions, you must specify an ID.
```markdown
- [ ] <!-- Choice#1 --> Task title
- [ ] <!-- Choice#1 --> Task title

- [ ] <!-- Choice#2 --> Task title
- [ ] <!-- Choice#2 --> Task title
```

  - multiple
  Allow to choose more than one.
  ```markdown
  - [ ] <!-- Choice,multiple --> Task title
  - [ ] <!-- Choice,multiple --> Task title
  ```

#### Tag Policy
Tags always start with 'v' and refer to the version. Those tags are always immutable.  
There are also tags for major version and minor version (v1.0, v2.0, etc.),
tags for major versions only (v1, v2, etc.), and "latest" tags.  
The first two types of tags refer to the latest version starting with their name, the last type of tag refers to the latest version in the repository.
