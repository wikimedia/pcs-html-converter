const path = require('path');

module.exports = {
  entry: {
    PCSHTMLConverter: './PCSHTMLConverter.js',
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
    library: '[name]'
  }
};