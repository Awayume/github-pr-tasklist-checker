// SPDX-FileCopyrightText: 2023-2025 Awayume <dev@awayume.jp>
// SPDX-License-Identifier: MIT

export const base_regex = /- +\[.] +/;
const checked_regex = /- +\[x] +.+/i;
const choice_regex = /Choice(#.+)?/;
const comment_regex = /<!--.*-->/;
const options_regex = /<!-- +.+ +-->/;
const options_start = '<!--';
const options_end = '-->';


export class Task {
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
