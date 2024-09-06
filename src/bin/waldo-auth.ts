#!/usr/bin/env node
/* eslint-disable no-console -- This file is a command line program */

/**
 * This is a very basic utility to capture the token into a local file
 * so passing the variable can be omitted
 */

import process from 'process';
import { homedir } from 'os';
import { promises as fsPromises } from 'fs';
import { parseDocument, Document, YAMLMap } from 'yaml';

const { writeFile, readFile, mkdir, access } = fsPromises;

function printHelp() {
    console.error(
        `usage:
> npm exec waldo-auth {YOUR_TOKEN}
`,
        '\n',
    );
}

type Arguments = { readonly token: string };

function parseArguments(): Arguments {
    // argv[0] is node, argv[1] is the script path,
    // argv[2] should be our single argument
    if (process.argv.length < 3) {
        printHelp();
        process.exit(1);
    }
    const token = process.argv[2];
    return { token };
}

async function fileExists(path: string) {
    return await access(path)
        .then(() => true)
        .catch(() => false);
}

async function ensureWaldoDirExists(waldoDir: string) {
    const exists = await fileExists(waldoDir);
    if (!exists) {
        await mkdir(waldoDir, { recursive: true });
        console.log(`Initialized waldo directory at ${waldoDir}`);
    }
}

async function loadProfile(profilePath: string): Promise<Document> {
    const exists = await fileExists(profilePath);
    if (!exists) {
        return new Document({});
    }

    const content = await readFile(profilePath, 'utf-8');
    return parseDocument(content);
}

async function saveProfile(profilePath: string, doc: Document) {
    await writeFile(profilePath, doc.toString(), 'utf-8');
}

async function updateProfile(profilePath: string, token: string) {
    let doc = await loadProfile(profilePath);
    let contents = doc.contents;
    if (!(contents instanceof YAMLMap)) {
        console.warn('Invalid profile document, overwriting');
        doc = new Document({});
        contents = doc.contents as YAMLMap;
    }

    if (contents.get('format_version') === undefined) {
        contents.set('format_version', 1);
    }
    contents.set('user_token', token);

    await saveProfile(profilePath, doc);
}

async function main() {
    const { token } = parseArguments();

    const waldoDir = `${homedir()}/.waldo`;
    await ensureWaldoDirExists(waldoDir);

    const profilePath = `${waldoDir}/profile.yml`;

    await updateProfile(profilePath, token);
    console.log(`Captured Waldo credentials at ${profilePath}`);
}

void main();
