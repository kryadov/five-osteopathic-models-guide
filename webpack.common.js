const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: './js/app.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/app.js',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'index.html', to: 'index.html' },
        { from: '404.html', to: '404.html' },
        { from: 'css', to: 'css' },
        { from: 'favicon.ico', to: 'favicon.ico' },
        { from: 'icon.png', to: 'icon.png' },
        { from: 'icon.svg', to: 'icon.svg' },
        { from: 'robots.txt', to: 'robots.txt' },
        { from: 'site.webmanifest', to: 'site.webmanifest' },
        { from: 'assets', to: 'assets', noErrorOnMissing: true },
      ],
    }),
  ],
};
