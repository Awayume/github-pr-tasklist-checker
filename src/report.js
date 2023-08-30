// SPDX-FileCopyrightText: 2023 Awayume <dev@awayume.jp>
// SPDX-License-Identifier: MIT

'use strict';

const { getOctokit, maybeForbidden } = require('./utils');


const message_sign = '​  ​​​​​​​​ ​​​​​​​';


const send = async (context, message) => {
  const octokit = getOctokit(context);

  const comments = (await maybeForbidden(
    octokit.rest.issues.listComments,
    {
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
    },
  )).data;
  const previous_comment = comments.filter(comment => comment.body.endsWith(message_sign))[0];

  if (!message.length) {
    if (previous_comment) {
      await maybeForbidden(
        octokit.rest.issues.deleteComment,
        {
          owner: context.repo.owner,
          repo: context.repo.repo,
          comment_id: previous_comment.id,
        },
      );
    };
  } else {
    if (comments.length && previous_comment) {
      await maybeForbidden(
        octokit.rest.issues.updateComment,
        {
          owner: context.repo.owner,
          repo: context.repo.repo,
          comment_id: previous_comment.id,
          body: message.trim() + message_sign,
        },
      );
    } else {
      await maybeForbidden(
        octokit.rest.issues.createComment,
        {
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: context.issue.number,
          body: message.trim() + message_sign,
        },
      );
    };
  };
};


module.exports = Object.freeze({
  send,
});
