const { execFileSync } = require('child_process');

const PORT = 8000;

function getListeningPids() {
  try {
    const output = execFileSync('netstat', ['-ano'], { encoding: 'utf8' });
    const lines = output.split(/\r?\n/);
    const pids = new Set();

    for (const line of lines) {
      if (!line.includes(`:${PORT}`) || !line.includes('LISTENING')) continue;

      const parts = line.trim().split(/\s+/);
      const pid = Number(parts[parts.length - 1]);
      if (Number.isInteger(pid)) {
        pids.add(pid);
      }
    }

    return [...pids];
  } catch (error) {
    console.error(`❌ Failed to inspect port ${PORT}:`, error.message);
    return [];
  }
}

function killPid(pid) {
  try {
    execFileSync('taskkill', ['/PID', String(pid), '/F'], {
      stdio: 'pipe',
      encoding: 'utf8',
    });
    console.log(`🧹 Killed process ${pid} using port ${PORT}`);
  } catch (error) {
    const stderr = error.stderr ? String(error.stderr).trim() : error.message;
    console.error(`⚠️ Failed to kill PID ${pid}: ${stderr}`);
  }
}

const pids = getListeningPids();

if (pids.length === 0) {
  console.log(`✅ No process found on port ${PORT}`);
  process.exit(0);
}

for (const pid of pids) {
  killPid(pid);
}
