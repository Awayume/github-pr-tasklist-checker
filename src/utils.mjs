// SPDX-FileCopyrightText: 2023-2025 Awayume <dev@awayume.jp>
// SPDX-License-Identifier: MIT

export async function maybeForbidden(func, ...args) {
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
