#!/usr/bin/env node
import { runValidate } from "./validate";
import { agendaCmd, nextCmd, rollupCmd } from "./rollup";
import { buildSite } from "./site";

const [, , cmd, ...rest] = process.argv;

const USAGE = `
painter-harness CLI
  npm run validate        校验数据 schema / 日期 / 跨文件引用
  npm run rollup          生成 reports/dashboard.md（进度条、技能树、周统计）
  npm run agenda [天数]    未来日程（默认 14 天，逾期置顶）
  npm run next [条数]      作业优先级队列（DDL 驱动，默认 10 条）
  npm run build           生成单文件站点 dist/index.html（部署用）
`;

switch (cmd) {
  case "validate":
    process.exit(runValidate());
  case "rollup":
    rollupCmd();
    break;
  case "agenda":
    agendaCmd(Number(rest[0]) > 0 ? Number(rest[0]) : 14);
    break;
  case "next":
    nextCmd(Number(rest[0]) > 0 ? Number(rest[0]) : 10);
    break;
  case "build":
    buildSite();
    break;
  default:
    console.log(cmd ? `未知命令: ${cmd}\n${USAGE}` : USAGE);
    process.exit(cmd ? 1 : 0);
}
