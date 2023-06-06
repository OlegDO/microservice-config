const shouldPublishNpm = Boolean(Number(process.env.PUBLISH_PACKAGE) || 0);

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
          'echo "${nextRelease.version}" > .version',
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
