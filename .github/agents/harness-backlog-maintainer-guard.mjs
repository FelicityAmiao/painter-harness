import path from 'node:path';
import { lstatSync, readFileSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const agentDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(agentDirectory, '../..');
const githubRoot = path.join(workspaceRoot, '.github');
const backlogRoot = path.join(githubRoot, 'harness-backlog');
const proposalNamePattern = /^(\d{4})-(\d{2})-(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;
const deleteCommandPattern = /^node \.github\/agents\/harness-backlog-maintainer-guard\.mjs --delete (\.github\/harness-backlog\/[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.md)$/;

function isProposalName(name) {
  const match = proposalNamePattern.exec(name);
  if (!match) return false;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.getUTCFullYear() === Number(year)
    && date.getUTCMonth() === Number(month) - 1
    && date.getUTCDate() === Number(day);
}

function getProposalTarget(relativePath) {
  if (typeof relativePath !== 'string') return null;
  const target = path.resolve(workspaceRoot, relativePath);
  const relativeToBacklog = path.relative(backlogRoot, target);
  if (relativeToBacklog === '' || relativeToBacklog.includes(path.sep)
    || relativeToBacklog === '..' || relativeToBacklog.startsWith(`..${path.sep}`)
    || path.isAbsolute(relativeToBacklog) || !isProposalName(relativeToBacklog)) {
    return null;
  }
  return target;
}

function isSafeProposal(target, allowMissing) {
  try {
    for (const directory of [githubRoot, backlogRoot]) {
      const directoryStat = lstatSync(directory);
      if (!directoryStat.isDirectory() || directoryStat.isSymbolicLink()) return false;
    }
  } catch {
    return false;
  }

  try {
    const targetStat = lstatSync(target);
    return targetStat.isFile() && !targetStat.isSymbolicLink();
  } catch (error) {
    return allowMissing && error.code === 'ENOENT';
  }
}

function failCli(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

if (process.argv.length > 2) {
  if (process.argv.length !== 4 || process.argv[2] !== '--delete') {
    failCli('拒绝：guard 仅接受 --delete 和一条提案路径。');
  }
  const target = getProposalTarget(process.argv[3]);
  if (!target || !isSafeProposal(target, false)) {
    failCli('拒绝：目标必须是 backlog 根目录中的合法普通提案文件。');
  }
  unlinkSync(target);
  process.exit(0);
}

let event;
try {
  event = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  event = {};
}

const toolName = String(event.toolName ?? event.tool?.name ?? '');
const deny = (reason) => process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'PreToolUse',
    permissionDecision: 'deny',
    permissionDecisionReason: reason,
  },
}));

if (['read', 'search'].includes(toolName)) process.exit(0);

if (toolName === 'edit') {
  const filePath = event.toolInput?.filePath
    ?? event.toolInput?.path
    ?? event.input?.filePath
    ?? event.filePath;
  const target = typeof filePath === 'string'
    ? path.resolve(workspaceRoot, filePath)
    : '';
  const relativePath = path.relative(workspaceRoot, target);
  const proposalTarget = getProposalTarget(relativePath);
  if (proposalTarget && isSafeProposal(proposalTarget, true)) process.exit(0);
  deny('此 agent 只能编辑 backlog 根目录中按日期主题命名的普通提案文件。');
  process.exit(0);
}

if (['execute', 'run_in_terminal'].includes(toolName)) {
  const command = event.toolInput?.command ?? event.input?.command;
  const cwd = event.toolInput?.cwd ?? event.input?.cwd;
  const match = typeof command === 'string' ? deleteCommandPattern.exec(command) : null;
  const cwdIsWorkspace = cwd === undefined
    || (typeof cwd === 'string' && path.resolve(cwd) === workspaceRoot);
  const target = match ? getProposalTarget(match[1]) : null;
  if (target && cwdIsWorkspace && isSafeProposal(target, false)) process.exit(0);
  deny('此 agent 只能通过 guard 的精确命令删除一条明确指定的合法提案。');
  process.exit(0);
}

deny('此 agent 不得使用该工具。');