const shouldPublishNpm = Boolean(Number(process.env.PUBLISH_PACKAGE) || 0);
const workingDir = process.env.SEMANTIC_WORKING_DIR;
const rootDir = process.env.SEMANTIC_ROOT_DIR;

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
        publishCmd:
          'zip -r build.zip lib' +
          ` && cd ${rootDir} npx @lomray/microservices-cli patch-package-version --dir ${workingDir} ` +
          ' --package-version ${nextRelease.version}',
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
