const {join} = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = [{
  target:'electron-renderer',
  entry:{
    main:join(__dirname, 'src/js/host-main.js')
  },
  output:{
    path:join(__dirname,'host', 'bundle'),
    filename:'[name].js'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      // this will apply to both plain `.css` files
      // AND `<style>` blocks in `.vue` files
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    // make sure to include the plugin for the magic
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename:'[name].css'
    })
  ],
  devtool:'cheap-eval-source-map'
},
{
  target:'electron-renderer',
  entry:{
    main:join(__dirname, 'src/js/guest-main.js')
  },
  output:{
    path:join(__dirname,'guest', 'bundle'),
    filename:'[name].js'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      // this will apply to both plain `.css` files
      // AND `<style>` blocks in `.vue` files
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    // make sure to include the plugin for the magic
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename:'[name].css'
    })
  ],
  devtool:'cheap-eval-source-map'
}]
