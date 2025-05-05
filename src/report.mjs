// SPDX-FileCopyrightText: 2023-2025 Awayume <dev@awayume.jp>
// SPDX-License-Identifier: MIT

import github from '@actions/github';
import { maybeForbidden } from './utils.mjs';


const message_sign = '​  ​​​​​​​​ ​​​​​​​';


export async function send(context, message) {
  const octokit = github.getOctokit(context.token);

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
