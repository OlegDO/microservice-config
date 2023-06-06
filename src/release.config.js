const shouldPublishNpm = Boolean(Number(process.env.PUBLISH_PACKAGE) || 0);
const workingDir = process.env.SEMANTIC_WORKING_DIR;

/**
 * This is root config for microservices
 * All microservices extends from this
 */
module.exports = {
  branches: [
    'prod',
    {
      name: 'staging',
      prerelease: 'beta',
      channel: 'beta',
    },
  ],
  extends: 'semantic-release-monorepo',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/exec',
      {
        execCwd: workingDir,
        publishCmd:
          'npx @lomray/microservices-cli patch-package-version --package-version ${nextRelease.version}' +
          ' && zip -r build.zip lib',
      },
    ],
    ...(shouldPublishNpm ? [[
      '@semantic-release/npm',
      {
        pkgRoot: './lib',
      },
    ]] : []),
    [
      '@semantic-release/github',
      {
        labels: false,
        releasedLabels: false,
        successComment: false,
        assets: [{ path: 'build.zip', label: 'Build-${nextRelease.gitTag}' }],
      },
    ],
  ],
};
