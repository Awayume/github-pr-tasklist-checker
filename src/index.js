// SPDX-FileCopyrightText: 2023 Awayume <dev@awayume.jp>
// SPDX-License-Identifier: MIT

'use strict';

const core = require('@actions/core');
const github = require('@actions/github');

const parser = require('./parser');
const report = require('./report');


// For debugging
if (process.env.DEBUG) {
  github.context = {
    eventName: 'pull_request',
    payload: {
      pull_request: {
        body: '# This is a test PR!\n'
          + '## PR summary\n'
          + 'This is a PR!\n'
          + '## Checklist\n'
          + '- [x] task1\n'
          + '- [ ] <!-- Optional --> task2\n'
          + '  - [ ] <!-- Optional -->  task2-child1\n'
          + '  - [x] task2-child2\n'
          + '    - [x] task2-grandchild1\n'
          + '      - [x] task2-great-grandchild\n'
          + '    - [x] task2-grandchild2\n'
          + '- [x] task3\n'
          + '  - [x] <!-- Choice#1 --> task3-child1\n'
          + '    - [x] task3-grandchild1\n'
          + '  - [ ] <!-- Choice#1 -->  task3-child2\n'
          + '    - [ ] task3-grandchild2\n'
          + '- [x] <!-- Choice#2 --> task4-1\n'
          + '- [ ] <!-- Choice#2 --> task4-2\n'
          + '- [ ] <!-- Optional,Choice#3 --> task5-1\n'
          + '- [ ] <!-- Optional,Choice#3 --> task5-2\n'
          + '- [x] <!-- Choice#4,multiple --> task6-1\n'
          + '- [ ] <!-- Choice#4,multiple --> task6-2\n'
      },
    },
    repo: {
      owner: 'Awayume',
      repo: 'github-pr-tasklist-checker',
    },
    issue: {
      number: 0,
    },
  };
  github.getOctokit = () => {
    return {
      rest: {
        issues: {
          listComments: async () => {
            return {
              data: [],
            };
          },
          createComment: async () => {},
        },
      },
    };
  };
};


// Run
(async () => {
  try {
    const context = github.context;
    context.token = core.getInput('github_token');

    // Event check
    if (context.eventName !== 'pull_request') {
      throw new Error('This Action only works in Pull Requests.');
    };

    // Get PR body
    const pr_body = context.payload.pull_request.body;
    // Parse PR
    const message = parser.parse(pr_body);
    // Send a report
    await report.send(context, message);

    if (!message.length) {
      core.info('All tasks are completed. Great!');
      process.exit(0);
    } else {
      message.split('\n').forEach(line => {
        core.error(line);
      });

      throw new Error('Some tasks are not completed.');
    };
  } catch (err){
    if (process.env.DEBUG) {
      console.error(err.stack);
    };

    core.setFailed(err.message);
  };
})();
