#!/usr/bin/env node

import path from 'path';
import Papa from 'papaparse';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { Command } from 'commander';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createFolders } from './utils/index.js';

function copyFolder(source, destination) {
  fs.cpSync(source, destination, { recursive: true, force: true });
}

function inferJsonSchema(data) {
  const columns = Object.keys(Array.isArray(data) ? data[0] || {} : data);

  const schema = columns.map(d=> {
    const values = Array.isArray(data) ? data.map(row => row[d]) : [data[d]];
    const isRequired = values.every(
      (v) => v !== null && v !== undefined && v !== ''
    );
    const nonEmptyValues = values.filter(
      (v) => v !== null && v !== undefined && v !== ''
    );
    const uniqueValues = [...new Set(nonEmptyValues)];
    let type = 'string';
    if (
      nonEmptyValues.every(
        (v) =>
          typeof v === 'number' &&
          Number.isInteger(v) &&
          v >= 1900 &&
          v <= 2100
      )
    ) {
      type = 'dateTime';
    } else if (nonEmptyValues.every((v) => typeof v === 'number')) {
      type = 'number';
    } else if (nonEmptyValues.every((v) => typeof v === 'boolean')) {
      type = 'boolean';
    } else if (
      nonEmptyValues.every(
        (v) =>
          typeof v === 'string' &&
          /^[A-Z]{3}$/.test(v)
      )
    ) {
      type = 'Alpha 3 code';
    }
    const enumValue =
      type === 'string' &&
      uniqueValues.length <= nonEmptyValues.length * 0.5
        ? uniqueValues
        : undefined;
    return {
      columnName: d,
      type,
      required: isRequired,
      ...(enumValue !== undefined && { enum: enumValue }),
      ...(type === 'dateTime' && { dateFormat: 'yyyy' }),
    };
  });



  return schema;
}

async function main() {

  const program = new Command();

  program
    .name('@undp/create-data-repo')
    .argument('<projectName>', 'Project name')
    .option('--file <files...>', 'Input files')
    .parse(process.argv);

  const options = program.opts();
  const projectName = program.args[0];
  const files = options.file || [];

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const projectPath = path.resolve(process.cwd(), projectName);
  console.log(chalk.gray('\n' + '─'.repeat(60)));
  console.log(chalk.bold.green(`\n📁 Creating project at: ${chalk.cyan(projectPath)}\n`));

  createFolders(projectPath, true);

  process.chdir(projectPath);

  console.log(chalk.gray('\n' + '─'.repeat(60)));
  console.log(chalk.bold.green(`\n📄 Copying files to the project and generating schema files...\n`));
 
  const dataDir = path.join(projectPath, 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const schemaDir = path.join(projectPath, 'schema');
  fs.mkdirSync(schemaDir, { recursive: true });
  copyFolder(path.join(__dirname, `./template`), projectPath);
  files.forEach(file => {
    const sourcePath = path.isAbsolute(file)
      ? file
      : path.join(process.cwd(), '..', file);

    fs.copyFileSync(
      sourcePath,
      path.join(dataDir, path.basename(file))
    );

    const ext = path.extname(file).toLowerCase();
    let schema;

    if (ext === '.json') {
      const json = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
      schema = inferJsonSchema(json);
    }

    if (ext === '.csv') {
      const csv = fs.readFileSync(sourcePath, 'utf8');

      const parsed = Papa.parse(csv, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      });

      schema = inferJsonSchema(parsed.data);
    }

    if (schema) {
      const schemaFileName =
        `${path.basename(file, ext)}.json`;

      fs.writeFileSync(
        path.join(schemaDir, schemaFileName),
        JSON.stringify(schema, null, 2)
      );
    }
  });
  
  console.log(chalk.green('  ✓ Project folder and files generated\n'));
  try {
    execSync('git init', { stdio: 'ignore' });
    console.log(chalk.green('  ✓ Git repository initialized'));
  } catch {
    console.log(chalk.yellow('  ⚠️ Skipped git init (Git not installed or error occurred)'));
  }
  console.log(chalk.bold.green('\n✅ Project created successfully!\n'));
    
  console.log(chalk.cyan('\n🚀 Next steps:'));
  console.log(chalk.white(`  cd ${chalk.bold(projectName)}`));
  console.log(chalk.dim('\nHappy coding! 🎉\n'));
}

main().catch(console.error);