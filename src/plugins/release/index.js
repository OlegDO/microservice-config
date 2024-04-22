const fs = require('fs');
const path = require('path');

const parentDirectory = '..'; // Microservices folder
const rootMicroservicesDirectory = path.join('..', '..'); // Root microservices folder

/**
 * Returns highest version
 */
function getHighestVersion(current, highest = '1.0.0') {
  if(!current) {
    return '1.0.0';
  }

  const currentParts = current.split('.').map(part => parseInt(part, 10));
  const currentHighestParts = highest.split('.').map(part => parseInt(part, 10));

  // Compare major version
  if (currentParts[0] !== currentHighestParts[0]) {
    return currentParts[0] > currentHighestParts[0] ? current : highest;
  }

  // Compare minor version
  if (currentParts[1] !== currentHighestParts[1]) {
    return currentParts[1] > currentHighestParts[1] ? current : highest;
  }

  // Compare patch version
  if(currentParts[2] !== currentHighestParts[2]) {
    return currentParts[2] > currentHighestParts[2] ? current : highest
  }

  // Current here will be equal to highest
  return current;
}

/**
 * Replace semantic release getNextVersion on release getNextVersion
 */
function replaceGetNextVersion() {
  const nodeParentModulesPath = path.resolve(__dirname, '..', '..', '..', '..');
  const semanticReleasePath = path.join(nodeParentModulesPath, 'semantic-release');
  const getNextVersionPath = path.join(semanticReleasePath, 'lib', 'get-next-version.js');
  const getNextVersionOriginPath = path.join(semanticReleasePath, 'lib', 'get-next-version-origin.js');
  const getNextVersionPluginPath = path.join(nodeParentModulesPath, '@lomray', 'microservice-config', 'plugins', 'release', 'get-next-version.js')

  // Handle error if file doesn't exist
  if(!fs.existsSync(getNextVersionPath)) {
    throw new Error('Semantic-release get-next-version file not found.');
  }

  // Rename the file
  fs.renameSync(getNextVersionPath, getNextVersionOriginPath);

  // Inject prod release "get next version" function
  fs.copyFileSync(getNextVersionPluginPath, getNextVersionPath);
}

/**
 * Write in .version file the highest version of microservice
 */
function writeNextReleaseVersion(context) {
  const { nextRelease } = context;
  const versionFilePath = '.version';

  console.info('Original next release version:', nextRelease.version)

  const version = nextRelease.version.match(/\d+\.\d+\.\d+/)?.[0] || '';

  // Write the next release version to the file
  fs.writeFileSync(versionFilePath, version);

  console.info(`Next release version ${version} has been written to ${versionFilePath}`);
}

/**
 * Write in .version file the highest version in the root microservices folder
 */
function writeHighestNextReleaseVersion() {
  let highestVersion = '';
  let isVersionUpdated = false;

  try {
    highestVersion = fs.readFileSync(path.join(rootMicroservicesDirectory, '.version'), 'utf8').trim();
  } catch (error) {
    console.info('Highest version file was not found.');
  }

  // Get a list of all directories in the parent directory
  const directories = fs.readdirSync(parentDirectory, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  console.info('Found microservices:', directories.join(' '))

  if(!directories.length) {
    throw new Error('No one directory was found.');
  }

  directories.forEach(folder => {
    const versionFilePath = path.join(parentDirectory, folder, '.version');

    // Check if .version file exists in the directory
    if (fs.existsSync(versionFilePath)) {
      // Read the version from .version file
      const version = fs.readFileSync(versionFilePath, 'utf8').trim();
      const newVersion = highestVersion ? getHighestVersion(version, highestVersion) : version;

      if(highestVersion !== newVersion) {
        highestVersion = newVersion;
        isVersionUpdated = true;
      }
    }
  });

  if(!isVersionUpdated || !highestVersion) {
    return;
  }

  console.info(`Highest version found: ${highestVersion}`);

  // Write the highest version to .version file in root microservices directory
  const versionFilePath = path.join(rootMicroservicesDirectory, '.version');

  fs.writeFileSync(versionFilePath, highestVersion);

  console.info(`chore: bump version ${highestVersion}`);
}

/**
 * Clean up microservices .version file
 */
function cleanUpVersionFiles() {
  const directories = fs.readdirSync(parentDirectory, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  directories.forEach(directory => {
    const versionFilePath = path.join(parentDirectory, directory, '.version');

    if (fs.existsSync(versionFilePath)) {
      try {
        fs.unlinkSync(versionFilePath);

        console.info(`Removed .version file from ${directory}`);

      } catch (error) {
        console.error(`Error removing .version file from ${directory}: ${error.message}`);
      }
    }
  });
}

/**
 * Analyze commits hook
 * @description Remove previously created .version files
 */
async function analyzeCommits() {
  console.info('Clean up version files');

  cleanUpVersionFiles()
}

/**
 * Prepare hook
 * @description This will be not called in dry run mode. Enable it by your own hands in semantic-release lib config
 */
async function prepare(_, context) {
  console.info('Preparing release version');

  writeNextReleaseVersion(context);
  replaceGetNextVersion();
  writeHighestNextReleaseVersion();
}

module.exports = {
  analyzeCommits,
  prepare
}
