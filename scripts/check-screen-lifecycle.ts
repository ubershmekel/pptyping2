import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

type LifecycleRule = {
  regex: RegExp;
  message: string;
};

export type LifecycleTarget = {
  file: string;
  rules: LifecycleRule[];
  source?: string;
};

const screenRules: LifecycleRule[] = [
  {
    regex: /\b(?:window\.)?setTimeout\s*\(/,
    message: "Use `mount.timeout(...)`.",
  },
  {
    regex: /\b(?:window\.)?clearTimeout\s*\(/,
    message: "Use the disposer returned by `mount.timeout(...)`.",
  },
  {
    regex: /\b(?:window\.)?setInterval\s*\(/,
    message: "Use `mount.interval(...)`.",
  },
  {
    regex: /\b(?:window\.)?clearInterval\s*\(/,
    message: "Use the disposer returned by `mount.interval(...)`.",
  },
  {
    regex: /\b(?:window\.)?requestAnimationFrame\s*\(/,
    message: "Use `mount.frame(...)`.",
  },
  {
    regex: /\b(?:window\.)?cancelAnimationFrame\s*\(/,
    message: "Use the disposer returned by `mount.frame(...)`.",
  },
  { regex: /\.addEventListener\s*\(/, message: "Use `mount.listen(...)`." },
  {
    regex: /\.removeEventListener\s*\(/,
    message: "Use the disposer returned by `mount.listen(...)`.",
  },
];

const appRules: LifecycleRule[] = [
  {
    regex: /\b(?:window\.)?setTimeout\s*\(/,
    message:
      "App screen renderers should use `createScreenMount(...).timeout(...)`.",
  },
  {
    regex: /\b(?:window\.)?clearTimeout\s*\(/,
    message:
      "App screen renderers should use mount disposers instead of `clearTimeout(...)`.",
  },
  {
    regex: /\b(?:window\.)?setInterval\s*\(/,
    message:
      "App screen renderers should use `createScreenMount(...).interval(...)`.",
  },
  {
    regex: /\b(?:window\.)?clearInterval\s*\(/,
    message:
      "App screen renderers should use mount disposers instead of `clearInterval(...)`.",
  },
  {
    regex: /\.addEventListener\s*\(/,
    message:
      "App screen renderers should use `createScreenMount(...).listen(...)`.",
  },
  {
    regex: /\.removeEventListener\s*\(/,
    message:
      "App screen renderers should use mount disposers instead of `removeEventListener(...)`.",
  },
];

function collectTsFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...collectTsFiles(fullPath));
    } else if (entry.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

export function buildLifecycleTargets(rootDir: string): LifecycleTarget[] {
  const screensDir = join(rootDir, "src", "screens");
  const appFile = join(rootDir, "src", "app.ts");

  const targets: LifecycleTarget[] = collectTsFiles(screensDir).map((file) => ({
    file,
    rules: screenRules,
  }));

  // app.ts is removed after the Vue migration; skip if absent.
  if (existsSync(appFile)) {
    targets.push({ file: appFile, rules: appRules });
  }

  return targets;
}

export function findLifecycleViolations(
  rootDir: string,
  targets: LifecycleTarget[],
): string[] {
  const violations: string[] = [];

  for (const { file, rules, source } of targets) {
    const contents = source ?? readFileSync(file, "utf8");
    const displayPath = relative(rootDir, file).split(sep).join("/");
    const lines = contents.split(/\r?\n/);

    lines.forEach((line, index) => {
      for (const rule of rules) {
        if (rule.regex.test(line)) {
          violations.push(`${displayPath}:${index + 1}: ${rule.message}`);
        }
      }
    });
  }

  return violations;
}

export function runLifecycleCheck(rootDir: string): number {
  const violations = findLifecycleViolations(
    rootDir,
    buildLifecycleTargets(rootDir),
  );
  if (violations.length === 0) {
    return 0;
  }

  console.error("Screen lifecycle enforcement failed:\n");
  for (const violation of violations) {
    console.error(violation);
  }
  return 1;
}

const invokedAsScript =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedAsScript) {
  const rootDir = fileURLToPath(new URL("..", import.meta.url));
  process.exit(runLifecycleCheck(rootDir));
}
