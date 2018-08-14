#!/usr/bin/env node
const { spawn } = require('child_process');
const [,, port] = process.argv;
const chalk = require('chalk');
const readline = require('readline');

if (port.match(/^[0-9]+$/)) {
  console.log('🐗');
  const childProc = spawn('lsof', ['-i', `:${port}`]);

  childProc.on('error', e => { console.error(e); });

  childProc.stderr.on('data', data => {
    console.error(`${data}`);
  });

  childProc.stdout.on('data', data => {
    const output = `${data}`;
    const [ procName, pid ] = output.split('\n')[1].split(' ').filter(i => i.trim());
    getUserConfirmation(pid, procName);
  });

  childProc.on('exit', code => {
    switch(code) {
      case 1:
        console.log(chalk.red.bold(`❗️   No process found hogging port: ${chalk.cyan.underline(port)}`));
        break;
    }
  });
} else {
  // default usage output when no arg or invalid args are provided by the user
  console.log(`${chalk.gray.bold('Usage:')} ${chalk.red.bold('porthog [port number]')}`);
}

function getUserConfirmation(pid, procName) {
  // initialize the readline interface to confirm with the user
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(chalk.green.bold(`❓   Are you sure you want to run: ${chalk.red.underline(`kill ${pid}`)} to stop the running process: ${chalk.magenta.underline(procName)}? ${chalk.yellow.bold('(y / n)')}`), answer => {
    if (answer.toLowerCase().match(/y|yes/)) {
      killProcess(pid, procName, port);
    }
    rl.close();
  });
}

function killProcess(pid, procName, port) {
  const killProc = spawn('kill', [pid]);
  killProc.on('error', e => { console.log(e); });
  killProc.stderr.on('data', data => { console.error(`${data}`); });
  killProc.on('exit', () => {
    console.log(chalk.blue.bold(`✅   ${procName} was succesfully killed on port: ${chalk.yellow.underline(port)}`));
  });
}