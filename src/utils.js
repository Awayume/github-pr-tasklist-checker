// SPDX-FileCopyrightText: 2023 Awayume <dev@awayume.jp>
// SPDX-License-Identifier: MIT

'use strict';

const github = require('@actions/github');


let octokit = undefined;

const getOctokit = (context) => {
  if (!octokit) {
    octokit = github.getOctokit(context.token);
    Object.freeze(octokit);
  };
  return octokit;
};


const maybeForbidden = async (func, ...args) => {
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


module.exports = Object.freeze({
  getOctokit,
  maybeForbidden,
});
