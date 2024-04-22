// This file will be injected into semantic-release lib that USE ES6 MODULES
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Replace semantic-release getNextVersion
 */
export default () => {
  let currentDir = __dirname; // Get the current directory of the module
  let version = null;

  // Traverse upwards until reaching the root of the project
  while (currentDir !== '/') {
    const versionFilePath = path.join(currentDir, '.version');

    // Check if .version file exists
    if (fs.existsSync(versionFilePath)) {
      // Read the version from .version file
      version = fs.readFileSync(versionFilePath, 'utf8').trim();
      break;
    }

    // Move up one directory
    currentDir = path.dirname(currentDir);
  }

  if(!version) {
    throw new Error('Missing microservices next release version.');
  }

  return version;
}
