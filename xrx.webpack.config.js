const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  mode: 'development',
  entry: './src/test.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    publicPath: '/',
  },
  devServer: {
    host: 'localhost',
    port: 8000,
    open: true, // 自动服务
    hot: true, // 热更新
    compress: true, // 服务器压缩
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ]
}