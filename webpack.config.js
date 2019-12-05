const path = require('path');

module.exports = {
  entry: {
    MobileHTML: './mobileapps/lib/mobile/MobileHTML.js',
    MobileViewHTML: './mobileapps/lib/mobile/MobileViewHTML.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
    library: '[name]'
  }
};