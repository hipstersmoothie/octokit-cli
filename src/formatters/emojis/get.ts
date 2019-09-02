import Octokit from '@octokit/rest';
import terminalLink from 'terminal-link';

/** Format the emoji results into a terse list */
export default ({ data }: Octokit.Response<Octokit.EmojisGetResponse>) => {
  const lines = Object.entries(data).map(([emoji, link]) => {
    const copyable = `:${emoji}:`;

    return terminalLink.isSupported
      ? terminalLink(copyable, link as string)
      : copyable;
  });

  return lines.join('\n');
};
