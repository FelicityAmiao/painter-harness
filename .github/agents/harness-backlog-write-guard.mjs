import path from 'node:path';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';

const event = JSON.parse(readFileSync(0, 'utf8'));
const toolName = String(event.toolName ?? event.tool?.name ?? '');

if (['read', 'search'].includes(toolName)) {
  process.exit(0);
}

const deny = () => process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'PreToolUse',
    permissionDecision: 'deny',
    permissionDecisionReason: '此 agent 只能编辑 .github/harness-backlog/ 下按日期主题命名的提案 Markdown 文件。',
  },
}));

if (toolName !== 'edit') {
  deny();
  process.exit(0);
}

const filePath = event.toolInput?.filePath
  ?? event.toolInput?.path
  ?? event.input?.filePath
  ?? event.filePath
  ?? '';
const target = path.resolve(String(filePath));
const githubRoot = path.resolve('.github');
const backlogRoot = path.resolve('.github/harness-backlog');
const relativePath = path.relative(backlogRoot, target);
const isWithinBacklog = () => {
  let githubRootStat;
  let backlogRootStat;
  let backlogRootReal;
  try {
    githubRootStat = lstatSync(githubRoot);
    backlogRootStat = lstatSync(backlogRoot);
    if (githubRootStat.isSymbolicLink() || backlogRootStat.isSymbolicLink()) {
      return false;
    }
    if (!githubRootStat.isDirectory() || !backlogRootStat.isDirectory()) {
      return false;
    }
    backlogRootReal = realpathSync(backlogRoot);
  } catch {
    return false;
  }

  let candidate = target;
  while (true) {
    try {
      lstatSync(candidate);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        return false;
      }

      const parent = path.dirname(candidate);
      if (parent === candidate) {
        return false;
      }
      candidate = parent;
      continue;
    }

    try {
      const realCandidate = realpathSync(candidate);
      const realRelativePath = path.relative(backlogRootReal, realCandidate);
      return realRelativePath === ''
        || (!realRelativePath.startsWith(`..${path.sep}`)
          && realRelativePath !== '..'
          && !path.isAbsolute(realRelativePath));
    } catch {
      return false;
    }
  }
};
const isProposal = relativePath !== ''
  && !relativePath.startsWith(`..${path.sep}`)
  && relativePath !== '..'
  && !path.isAbsolute(relativePath)
  && !relativePath.includes(path.sep)
  && /^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/i.test(relativePath)
  && isWithinBacklog();

if (!isProposal) {
  deny();
}