# GitHub PR Tasklist Checker
An Action to check if the PR task list is complete.

## Features
This Action gives you more control over your pull request task list.  
Also, when a check is missing, this not only causes the Action to fail, but also points it out in the comments.

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
