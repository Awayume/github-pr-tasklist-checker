# GitHub PR Tasklist Checker
An Action to check if the Pull Request task list is complete.

このドキュメントの日本語版は[こちら](/docs/README_ja.md)

## Features
This Action gives you more control over the tasks in the Pull Requests.  
If there are unchecked tasks, the action will fail and the missing checks will be noted in the comments.

<details>
<summary>Screenshots</summary>

[![](https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/e5e79c5c-3054-424d-b895-f9e260e8bfcd)](#)
[![](https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/ca85fc0b-e34f-4284-9ea2-38c8870c8fb7)](#)
[![](https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/d19f6b77-b2be-4058-a5fe-02116163f362)](#)
[![](https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/157eb787-933d-4361-a6d7-82d55fb0778e)](#)
[![](https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/6f8a9fcb-dea6-4b35-89ef-1267440fb5df)](#)
[![](https://github.com/Awayume/github-pr-tasklist-checker/assets/79361022/054955d8-01ea-4dc7-846d-9d861e955aed)](#)

</details>

## How to use
Create a Pull Request template and write the tasks you want contributors to check off in it.

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
- [ ] Task content
- [ ] <!-- (Options) --> Task content
```

##### Options
- Optional
Marks it an optional task
```markdown
- [ ] <!-- Optional --> Task content
```

- Choice
Creates choices.
```markdown
- [ ] <!-- Choice --> Task content
- [ ] <!-- Choice --> Task content
```
When asking several questions, you must specify an ID.
```markdown
- [ ] <!-- Choice#1 --> Task content
- [ ] <!-- Choice#1 --> Task content

- [ ] <!-- Choice#2 --> Task content
- [ ] <!-- Choice#2 --> Task content
```

  - multiple
  Allows to choose more than one.
  ```markdown
  - [ ] <!-- Choice,multiple --> Task content
  - [ ] <!-- Choice,multiple --> Task content
  ```

##### Child Tasks
For each task, child tasks can be defined.
A child task is validated only if it is checked if the parent task is optional or optional.
```markdown
- [ ] Parent Task 1
 - [ ] Child task 1
 - [ ] Child task 2
 - [ ] Subtasks.

- [ ] <! -- Optional --> Parent Task 2
 - [ ] Validated only when "Parent Task 2" is checked.
```
Child tasks can be defined by creating indents. The depth of indentation must be the same.
```markdown
- [ ] Parent task
 - [ ] Child tasks
 - [ ] Syntax error occurred.
```

#### Tag Policy
Tags always start with 'v' and refer to the version. Those tags are always immutable.  
There are also tags for major version and minor version (v1.0, v2.0, etc.),
tags for major versions only (v1, v2, etc.), and "latest" tags.  
The first two types of tags refer to the latest version starting with their name, the last type of tag refers to the latest version in the repository.
