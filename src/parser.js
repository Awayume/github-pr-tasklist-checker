// SPDX-FileCopyrightText: 2025 Awayume <dev@awayume.jp>
// SPDX-License-Identifier: MIT

'use strict';

const { base_regex, Task } = require('./task');


const parse = pr_body => {
  // Parse PR body
  const tasklist = [];
  let idt_unit = undefined;
  let previous_idt = 0;
  let parents = [];
  let idx = 0;
  let in_comment = false;
  pr_body.split('\n').forEach(line => {
    if (!in_comment && base_regex.test(line)) {
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
    } else if (line.includes('-->')) {
      in_comment = false;
    } else if (line.includes('<!--')) {
      in_comment = true;
    }
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

  // Make a message
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

  return message;
};


module.exports = Object.freeze({
  parse,
});
