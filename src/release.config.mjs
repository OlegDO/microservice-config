const shouldPublishNpm = Boolean(Number(process.env.PUBLISH_PACKAGE) || 0);
const monorepoConfig = await import('@lomray/semantic-release-monorepo');

/**
 * This is root config for microservices
 * All microservices extends from this
 */
export default {
  branches: [
    'prod',
    {
      name: 'staging',
      prerelease: 'beta',
      channel: 'beta',
    },
  ],
  ...monorepoConfig,
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/exec',
      {
        publishCmd:
          'zip -r build.zip lib' +
          " && echo '${nextRelease.version}' > .version",
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
