import fs from 'fs';
import chalk from 'chalk';

export function createFolders(dir, showError){
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  } else if(showError) {
    console.error(chalk.red(`❌ Error: Folder "${dir}" already exists.`));
    throw new Error(`Project folder already exists at ${dir}`);
  }
}