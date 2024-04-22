const path = require('path');

const plugins = [
  [
    path.join(__dirname, 'release', 'index.js'),
  ],
  [
    '@semantic-release/exec',
    {
      analyzeCommitsCmd: 'echo "minor"',
      generateNotesCmd: 'echo "chore: bump version"'
    },
  ],
]

module.exports = plugins;
