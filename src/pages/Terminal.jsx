import { useState, useRef, useEffect } from 'react'
import './Terminal.css'

const HOSTNAME = 'srv-01'
const USER = 'admin'

const FS = {
  '/': ['home', 'etc', 'var', 'tmp', 'usr'],
  '/home': ['admin'],
  '/home/admin': ['notes.txt', 'script.sh', '.bashrc'],
  '/etc': ['hosts', 'passwd', 'nginx', 'ssh'],
  '/etc/nginx': ['nginx.conf', 'sites-enabled'],
  '/etc/ssh': ['sshd_config'],
  '/var': ['log', 'www'],
  '/var/log': ['syslog', 'auth.log', 'nginx'],
  '/var/log/nginx': ['access.log', 'error.log'],
  '/var/www': ['html'],
  '/var/www/html': ['index.html'],
  '/usr': ['bin', 'local'],
  '/tmp': ['tmp_file_1', 'session_abc'],
}

const FILE_CONTENT = {
  '/home/admin/notes.txt': 'TODO:
- Check disk space on all servers
- Update nginx config
- Rotate SSH keys
- Review firewall rules',
  '/home/admin/.bashrc': '# ~/.bashrc
export PATH=$PATH:/usr/local/bin
alias ll="ls -alF"
alias grep="grep --color=auto"
export PS1="\\u@\\h:\\w$ "',
  '/etc/hosts': '127.0.0.1   localhost
127.0.1.1   srv-01
10.0.0.1    gateway
10.0.0.10   db-server
10.0.0.20   web-server',
  '/etc/nginx/nginx.conf': 'worker_processes auto;
events { worker_connections 1024; }
http {
  include /etc/nginx/sites-enabled/*;
  server {
    listen 80;
    server_name localhost;
    root /var/www/html;
  }
}',
  '/etc/ssh/sshd_config': 'Port 22
PermitRootLogin no
PasswordAuthentication yes
PubkeyAuthentication yes
AllowUsers admin
MaxAuthTries 3',
  '/var/www/html/index.html': '<!DOCTYPE html>
<html>
  <head><title>srv-01</title></head>
  <body><h1>Server is running</h1></body>
</html>',
  '/var/log/nginx/access.log': '10.0.0.5 - - [12/Mar/2026:14:22:01] "GET / HTTP/1.1" 200 612
10.0.0.8 - - [12/Mar/2026:14:22:15] "GET /api HTTP/1.1" 404 123
10.0.0.5 - - [12/Mar/2026:14:23:00] "POST /login HTTP/1.1" 200 88',
  '/var/log/nginx/error.log': '2026/03/12 14:22:15 [error] 1234#0: *3 open() "/var/www/html/api" failed
(2: No such file or directory)',
}

const PROCESSES = [
  { pid: 1,    user: 'root',  cpu: 0.0, mem: 0.1, cmd: '/sbin/init' },
  { pid: 312,  user: 'root',  cpu: 0.0, mem: 0.2, cmd: '/usr/sbin/sshd' },
  { pid: 891,  user: 'www',   cpu: 0.3, mem: 1.4, cmd: 'nginx: master process' },
  { pid: 892,  user: 'www',   cpu: 0.8, mem: 1.1, cmd: 'nginx: worker process' },
  { pid: 1021, user: 'postgres', cpu: 0.1, mem: 4.2, cmd: 'postgres: main process' },
  { pid: 1244, user: 'admin', cpu: 0.0, mem: 0.3, cmd: '-bash' },
  { pid: 1312, user: 'root',  cpu: 0.0, mem: 0.1, cmd: 'cron' },
  { pid: 2001, user: 'admin', cpu: 0.2, mem: 0.4, cmd: 'python3 monitor.py' },
]

const IFCONFIG = `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.0.0.5  netmask 255.255.255.0  broadcast 10.0.0.255
        inet6 fe80::1  prefixlen 64  scopeid 0x20
        ether 00:1a:2b:3c:4d:5e  txqueuelen 1000
        RX packets 182443  bytes 218MB
        TX packets 91221   bytes 54MB

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        RX packets 4821  bytes 412KB`

const NETSTAT = `Active Internet connections
Proto  Local Address        Foreign Address      State
tcp    0.0.0.0:22           0.0.0.0:*            LISTEN
tcp    0.0.0.0:80           0.0.0.0:*            LISTEN
tcp    0.0.0.0:443          0.0.0.0:*            LISTEN
tcp    0.0.0.0:5432         0.0.0.0:*            LISTEN
tcp    10.0.0.5:22          10.0.0.1:51234       ESTABLISHED`

const DISK = `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   18G   30G  38% /
/dev/sda2       200G  142G   58G  71% /var
tmpfs           7.8G  1.2G  6.6G  16% /dev/shm
/dev/sdb1       500G  210G  290G  42% /backup`

const UNAME = `Linux srv-01 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux`

const UPTIME = `up 42 days, 7:14,  2 users,  load average: 0.18, 0.22, 0.19`

const WHOAMI_OUT = `admin`

const HELP_TEXT = `Available commands:

  Navigation:
    ls [path]        list directory contents
    cd <path>        change directory
    pwd              print working directory
    cat <file>       show file contents

  System:
    ps               list running processes
    top              system resource usage
    uname -a         kernel information
    uptime           system uptime
    whoami           current user
    df -h            disk usage
    free -h          memory usage

  Network:
    ifconfig         network interfaces
    netstat          network connections
    ping <host>      ping a host
    ss -tlnp         listening ports

  Other:
    clear            clear terminal
    help             show this help
    echo <text>      print text`

const TOP_TEXT = `top - 20:41:01 up 42 days,  7:14,  2 users,  load average: 0.18, 0.22, 0.19
Tasks: 112 total,   1 running, 111 sleeping
%Cpu(s):  1.2 us,  0.4 sy,  0.0 ni, 98.2 id
MiB Mem :  15872.0 total,   8241.4 free,   4312.2 used,   3318.4 buff
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used

  PID USER      CPU%  MEM%  COMMAND
  892 www        0.8   1.1  nginx: worker
 2001 admin      0.2   0.4  python3 monitor.py
  891 www        0.3   1.4  nginx: master
 1021 postgres   0.1   4.2  postgres: main
  312 root       0.0   0.2  sshd
 1244 admin      0.0   0.3  bash`

const FREE_TEXT = `               total        used        free      shared  buff/cache
Mem:           15872        4312        8241         512        3318
Swap:           2048           0        2048`

const SS_TEXT = `Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port
tcp    LISTEN  0       128     0.0.0.0:22          0.0.0.0:*
tcp    LISTEN  0       511     0.0.0.0:80          0.0.0.0:*
tcp    LISTEN  0       511     0.0.0.0:443         0.0.0.0:*
tcp    LISTEN  0       128     0.0.0.0:5432        0.0.0.0:*`

const PING_RESPONSES = {
  'localhost':   '127.0.0.1',
  '127.0.0.1':  '127.0.0.1',
  'google.com':  '142.250.74.110',
  '8.8.8.8':    '8.8.8.8',
  'gateway':     '10.0.0.1',
  'db-server':   '10.0.0.10',
  'web-server':  '10.0.0.20',
}

function resolvePath(cwd, p) {
  if (!p) return cwd
  if (p.startsWith('/')) return p.replace(/\/+/g, '/').replace(/\/$/, '') || '/'
  const parts = cwd.split('/').filter(Boolean)
  for (const seg of p.split('/')) {
    if (seg === '..') parts.pop()
    else if (seg !== '.') parts.push(seg)
  }
  return '/' + parts.join('/')
}

function runCommand(cmd, cwd) {
  const parts = cmd.trim().split(/\s+/)
  const base = parts[0]
  const args = parts.slice(1)

  switch (base) {
    case '': return { out: '', cwd }
    case 'help': return { out: HELP_TEXT, cwd }
    case 'clear': return { out: '__CLEAR__', cwd }
    case 'whoami': return { out: WHOAMI_OUT, cwd }
    case 'uname': return { out: UNAME, cwd }
    case 'uptime': return { out: UPTIME, cwd }
    case 'top': return { out: TOP_TEXT, cwd }
    case 'ifconfig': return { out: IFCONFIG, cwd }
    case 'netstat': return { out: NETSTAT, cwd }
    case 'df': return { out: DISK, cwd }
    case 'free': return { out: FREE_TEXT, cwd }
    case 'ss': return { out: SS_TEXT, cwd }
    case 'pwd': return { out: cwd, cwd }

    case 'echo': return { out: args.join(' '), cwd }

    case 'ps': {
      const header = '  PID USER        CPU%  MEM%  COMMAND'
      const rows = PROCESSES.map(p =>
        `${String(p.pid).padStart(5)} ${p.user.padEnd(10)} ${String(p.cpu).padStart(4)}  ${String(p.mem).padStart(4)}  ${p.cmd}`
      ).join('\n')
      return { out: header + '\n' + rows, cwd }
    }

    case 'ls': {
      const target = resolvePath(cwd, args[0])
      const entries = FS[target]
      if (!entries) return { out: `ls: cannot access '${args[0] || target}': No such file or directory`, cwd, err: true }
      return { out: entries.join('  '), cwd }
    }

    case 'cd': {
      if (!args[0] || args[0] === '~') return { out: '', cwd: '/home/admin' }
      const target = resolvePath(cwd, args[0])
      if (FS[target] !== undefined) return { out: '', cwd: target }
      return { out: `cd: ${args[0]}: No such file or directory`, cwd, err: true }
    }

    case 'cat': {
      if (!args[0]) return { out: 'cat: missing operand', cwd, err: true }
      const target = resolvePath(cwd, args[0])
      const content = FILE_CONTENT[target]
      if (content !== undefined) return { out: content, cwd }
      // check if it's a dir
      if (FS[target]) return { out: `cat: ${args[0]}: Is a directory`, cwd, err: true }
      return { out: `cat: ${args[0]}: No such file or directory`, cwd, err: true }
    }

    case 'ping': {
      if (!args[0]) return { out: 'Usage: ping <host>', cwd, err: true }
      const ip = PING_RESPONSES[args[0]] || null
      if (!ip) return { out: `ping: ${args[0]}: Name or service not known`, cwd, err: true }
      const lines = [`PING ${args[0]} (${ip}): 56 data bytes`]
      for (let i = 0; i < 4; i++) {
        const ms = (8 + Math.random() * 20).toFixed(3)
        lines.push(`64 bytes from ${ip}: icmp_seq=${i} ttl=64 time=${ms} ms`)
      }
      lines.push(`--- ${args[0]} ping statistics ---`)
      lines.push(`4 packets transmitted, 4 received, 0% packet loss`)
      return { out: lines.join('\n'), cwd }
    }

    case 'mkdir': {
      if (!args[0]) return { out: 'mkdir: missing operand', cwd, err: true }
      const target = resolvePath(cwd, args[0])
      if (FS[target]) return { out: `mkdir: cannot create directory '${args[0]}': File exists`, cwd, err: true }
      const parent = target.substring(0, target.lastIndexOf('/')) || '/'
      const name = target.split('/').pop()
      if (!FS[parent]) return { out: `mkdir: cannot create directory '${args[0]}': No such file or directory`, cwd, err: true }
      FS[parent] = [...FS[parent], name]
      FS[target] = []
      return { out: '', cwd }
    }

    case 'touch': {
      if (!args[0]) return { out: 'touch: missing file operand', cwd, err: true }
      const target = resolvePath(cwd, args[0])
      const parent = target.substring(0, target.lastIndexOf('/')) || '/'
      const name = target.split('/').pop()
      if (!FS[parent]) return { out: `touch: cannot touch '${args[0]}': No such file or directory`, cwd, err: true }
      if (!FS[parent].includes(name)) FS[parent] = [...FS[parent], name]
      return { out: '', cwd }
    }

    case 'rm': {
      if (!args[0]) return { out: 'rm: missing operand', cwd, err: true }
      const target = resolvePath(cwd, args[0])
      const parent = target.substring(0, target.lastIndexOf('/')) || '/'
      const name = target.split('/').pop()
      if (!FS[parent] || !FS[parent].includes(name))
        return { out: `rm: cannot remove '${args[0]}': No such file or directory`, cwd, err: true }
      FS[parent] = FS[parent].filter(e => e !== name)
      return { out: '', cwd }
    }

    default:
      return { out: `${base}: command not found. Type 'help' for available commands.`, cwd, err: true }
  }
}

export default function Terminal() {
  const [history, setHistory] = useState([
    { type: 'system', text: 'SysAdmin Guide — Linux Terminal Simulator' },
    { type: 'system', text: `Connected to ${HOSTNAME} as ${USER}` },
    { type: 'system', text: "Type 'help' for available commands." },
  ])
  const [input, setInput] = useState('')
  const [cwd, setCwd] = useState('/home/admin')
  const [cmdHistory, setCmdHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const bottomRef = useRef()
  const inputRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const prompt = `${USER}@${HOSTNAME}:${cwd === '/home/admin' ? '~' : cwd}$`

  const submit = (e) => {
    e.preventDefault()
    const cmd = input.trim()
    if (!cmd) return

    setCmdHistory(prev => [cmd, ...prev])
    setHistIdx(-1)

    const result = runCommand(cmd, cwd)

    if (result.out === '__CLEAR__') {
      setHistory([])
      setInput('')
      return
    }

    setHistory(prev => [
      ...prev,
      { type: 'input', text: `${prompt} ${cmd}` },
      ...(result.out ? [{ type: result.err ? 'error' : 'output', text: result.out }] : []),
    ])
    setCwd(result.cwd)
    setInput('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(histIdx + 1, cmdHistory.length - 1)
      setHistIdx(next)
      setInput(cmdHistory[next] || '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(histIdx - 1, -1)
      setHistIdx(next)
      setInput(next === -1 ? '' : cmdHistory[next])
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Autocomplete
      const parts = input.split(' ')
      if (parts.length === 1) {
        const cmds = ['ls','cd','cat','pwd','ps','top','uname','uptime','whoami','df','free','netstat','ifconfig','ping','ss','echo','mkdir','touch','rm','help','clear']
        const matches = cmds.filter(c => c.startsWith(parts[0]))
        if (matches.length === 1) setInput(matches[0] + ' ')
      } else {
        const partial = parts[parts.length - 1]
        const targetDir = partial.includes('/') ? resolvePath(cwd, partial.substring(0, partial.lastIndexOf('/'))) : cwd
        const prefix = partial.includes('/') ? partial.substring(0, partial.lastIndexOf('/') + 1) : ''
        const entries = FS[targetDir] || []
        const name = partial.includes('/') ? partial.split('/').pop() : partial
        const matches = entries.filter(e => e.startsWith(name))
        if (matches.length === 1) {
          parts[parts.length - 1] = prefix + matches[0]
          setInput(parts.join(' '))
        }
      }
    }
  }

  return (
    <div>
      <h1 className="page-title">Terminal <span className="accent">Simulator</span></h1>
      <p className="page-subtitle">Linux-терминал прямо в браузере. Поддержка ls, cd, cat, ping, ps, df, ifconfig и других команд.</p>

      <div className="terminal-wrap">
        <div className="terminal-titlebar">
          <div className="titlebar-dots">
            <span className="dot red"/>
            <span className="dot yellow"/>
            <span className="dot green"/>
          </div>
          <div className="titlebar-title">{USER}@{HOSTNAME} — bash</div>
          <div className="titlebar-info">cwd: {cwd}</div>
        </div>

        <div className="terminal-body" onClick={() => inputRef.current?.focus()}>
          {history.map((line, i) => (
            <div key={i} className={`term-line ${line.type}`}>
              <pre>{line.text}</pre>
            </div>
          ))}
          <form onSubmit={submit} className="term-input-row">
            <span className="term-prompt">{prompt}&nbsp;</span>
            <input
              ref={inputRef}
              className="term-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </form>
          <div ref={bottomRef}/>
        </div>
      </div>

      <div className="terminal-hints">
        <div className="hints-label">QUICK COMMANDS</div>
        <div className="hints-list">
          {['ls', 'pwd', 'ps', 'df -h', 'free -h', 'ifconfig', 'netstat', 'ping 8.8.8.8', 'cat /etc/hosts', 'top', 'help'].map(cmd => (
            <button key={cmd} className="hint-btn" onClick={() => { setInput(cmd); inputRef.current?.focus() }}>
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
