// SPDX-FileCopyrightText: 2023 Awayume <dev@awayume.jp>
// SPDX-License-Identifier: MIT

'use strict';

const core = require('@actions/core');
const github = require('@actions/github');


const base_regex = /- +\[.] +/;
const checked_regex = /- +\[x] +.+/;
const choice_regex = /Choice(#.+)?/;
const comment_regex = /<!--.*-->/;
const options_regex = /<!-- +.+ +-->/;
const options_start = '<!--';
const options_end = '-->';
const message_sign = '​  ​​​​​​​​ ​​​​​​​';


class Task {
  constructor(line) {
    line = line.trim();

    this.title = line
      .replace(base_regex, '')
      .replace(comment_regex, '')
      .trim();

    this.checked = checked_regex.test(line);

    this._params = line
      .match(options_regex)?.[0]
      .replace(options_start, '')
      .replace(options_end, '')
      .trim()
      .split(',')
      .reduce((obj, val, idx) => {
        obj[idx] = val.trim();
        return obj;
      }, []);
    if (!this._params) this._params = [];

    this.optional = this._params.includes('Optional');
    this.choosable = this._params.some(elm => choice_regex.test(elm));
    this.choice_id = this._params.find(elm => choice_regex.test(elm))?.replace(/Choice(#)?/, '');
    this.multiple_choosable = this._params.includes('multiple');
    this.children = [];
  };
};


const maybe_forbidden = async (func, ...args) => {
  try {
    return await func(...args);
  } catch (err) {
    switch (err.name) {
      case 'HttpError':
        if (err.status === 403) {
          throw new Error(
              'Action cannot continue due to permission error.\n'
            + 'You have to grant write permission to Pull Requests.\n'
            + 'See https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs'
          );
        }

      default:
        throw err;
    };
  }
};


const run = async () => {
  const context = github.context;
  const github_token = core.getInput('github_token');
  const octokit = github.getOctokit(github_token);

  // Event check
  if (context.eventName !== 'pull_request') {
    throw new Error('This Action only works in Pull Requests.');
  };

  // Get PR body
  const pr_body = context.payload.pull_request.body;

  // Parse PR body
  const tasklist = [];
  let idt_unit = undefined;
  let previous_idt = 0;
  let parents = [];
  let idx = 0;
  pr_body.split('\n').forEach(line => {
    if (base_regex.test(line)) {
      let idt = line.match(/^ */)?.[0].length;
      if (idt && !idt_unit) {
        idt_unit = idt;
      } else if (idt && (idt % idt_unit)) {
        throw new Error('The indentation depth is not constant.');
      };

      if (idt > previous_idt) {
        if (!parents.length) {
          parents.push(tasklist[idx - 1]);
        } else {
          let ancestor = parents.at(-1);
          while (true) {
            if (!ancestor.children.length) {
              parents.push(ancestor);
              break;
            } else {
              ancestor = ancestor.children.at(-1);
            };
          };
        };
      } else if (idt < previous_idt) {
        for (let i = 0; i < (previous_idt - idt) / idt_unit; i++) {
          parents.pop();
        };
      };

      if (!parents.length) {
        tasklist.push(new Task(line));
        idx++;
      } else {
        parents.at(-1).children.push(new Task(line));
      };

      previous_idt = idt;
    };
  });

  // Check
  /** @type {Object<string, Array<Task>>} */
  const choices = {};
  const unchecked = [];
  const unchose = [];
  const both = [];

  const _check_task = task => {
    if (task.choosable) {
      if (choices[task.choice_id]) {
        choices[task.choice_id].push(task);
      } else {
        choices[task.choice_id] = [task];
      };

      if (task.checked) {
        task.children.forEach(c_task => {
          _check_task(c_task);
        });
      }
    } else {
      if (!task.optional) {
        if (!task.checked) {
          unchecked.push(task);
        }
        task.children.forEach(c_task => {
          _check_task(c_task);
        });
      };

      if (task.checked || !task.optional) {
        task.children.forEach(c_task => {
          _check_task(c_task);
        });
      };
    };
  };

  tasklist.forEach(task => {
    _check_task(task);
  });

  for (let key in choices) {
    let tasks = choices[key];
    let allow_multiple = tasks.every(task => task.multiple_choosable);
    let is_optional = tasks.every(task => task.optional);
    let check_status = tasks.reduce((res, task) => res + task.checked, 0);

    if (!is_optional && !check_status) {
      unchose.push(tasks);
      continue;
    } else if (check_status > 1 && !allow_multiple) {
      both.push(tasks);
      continue;
    };
  };

  // Send message
  let message = '';

  if (unchecked.length) {
    message += 'You should check these:\n';
    unchecked.forEach(task => {
      message += `> - ${task.title}\n`;
    });
  };

  if (unchose.length) {
    if (message.length) {
      message += '\n';
    };
    message += 'You should choose these:\n';
    for (let i = 0; i < unchose.length; i++) {
      unchose[i].forEach(task => {
        message += `> > - ${task.title}\n`;
      });
      if (!(unchose.length - i === 1)) {
        message += '>\n';
      };
    };
  };

  if (both.length) {
    if (message.length) {
      message += '\n';
    };
    message += 'You cannot make multiple choices of these:\n';
    for (let i = 0; i < both.length; i++) {
      both[i].forEach(task => {
        message += `> > - ${task.title}\n`;
      });
      if (!(both.length - i === 1)) {
        message += '>\n';
      };
    };
  };

  const comments = (await octokit.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
  })).data;
  const previous_comment = comments.filter(comment => comment.body.endsWith(message_sign))[0];

  if (!message.length) {
    core.info('All tasks are completed. Great!');
    if (previous_comment) {
      await octokit.rest.issues.deleteComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        comment_id: previous_comment.id,
      });
    };
    process.exit(0);
  } else {
    message.split('\n').forEach(line => {
      core.error(line);
    });

    if (comments.length && previous_comment) {
      await octokit.rest.issues.updateComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        comment_id: previous_comment.id,
        body: message.trim() + message_sign,
      });
    } else {
      await octokit.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        body: message.trim() + message_sign,
      });
    };

    throw new Error('Some tasks are not completed.');
  };
};


// Run
try {
  if (!process.env.DEBUG) {
    run();
  } else {
    try {
      github.context = {
        eventName: 'pull_request',
        payload: {
          pull_request: {
            body: '# This is a test PR!\n'
              + '## PR summary\n'
              + 'This is a PR!\n'
              + '## Checklist\n'
              + '- [ ] task1\n'
              + '- [ ] <!-- Optional --> task2\n'
              + '  - [ ] <!-- Optional -->  task2-child1\n'
              + '  - [ ] task2-child2\n'
              + '    - [ ] task2-grandchild1\n'
              + '      - [ ] task2-great-grandchild\n'
              + '    - [ ] task2-grandchild2\n'
              + '- [ ] task3\n'
              + '  - [ ] <!-- Choice#1 --> task3-child1\n'
              + '    - [ ] task3-grandchild1\n'
              + '  - [ ] <!-- Choice#1 -->  task3-child2\n'
              + '    - [ ] task3-grandchild2\n'
              + '- [ ] <!-- Choice#2 --> task4-1\n'
              + '- [ ] <!-- Choice#2 --> task4-2\n'
              + '- [ ] <!-- Optional,Choice#3 --> task5-1\n'
              + '- [ ] <!-- Optional,Choice#3 --> task5-2\n'
              + '- [ ] <!-- Choice#4,multiple --> task6-1\n'
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
      run();
    } catch (err) {
      console.error(err.stack);
      throw err;
    }
  };
} catch (err) {
  core.setFailed(err.message);
};
