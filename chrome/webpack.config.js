const webpack = require("webpack"),
    path = require("path"),
    fileSystem = require("fs"),
    env = require("./utils/env"),
    baseManifest = require("./public/manifest.json"),
    CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin,
    CopyWebpackPlugin = require("copy-webpack-plugin"),
    HtmlWebpackPlugin = require("html-webpack-plugin"),
    WebpackExtensionManifestPlugin = require("webpack-extension-manifest-plugin"),
    WriteFilePlugin = require("write-file-webpack-plugin");

// load the secrets
var alias = {};

var secretsPath = path.join(__dirname, ("secrets." + env.NODE_ENV + ".js"));

var fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2"];

if (fileSystem.existsSync(secretsPath)) {
  alias["secrets"] = secretsPath;
}

var options = {
  mode: process.env.NODE_ENV || "development",
  entry: {
    app: path.join(__dirname, "src", "index.js"),	  
    sideBar: path.join(__dirname, "src", "contentScripts", "sideBar.js"),
    featureRemover: path.join(__dirname, "src", "contentScripts", "featureRemover.js"),
    background: path.join(__dirname, "src", "background.js")
  },
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },	    
      {
        test: /\.css$/,
        loader: "style-loader!css-loader",
        exclude: /node_modules/
      },
      {
        test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
        loader: "file-loader?name=[name].[ext]",
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: "html-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    alias: alias,
    extensions: ["*", ".js"]
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin(),

    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
    new HtmlWebpackPlugin({
      title: "Attentional – Hide distracting content",
      meta: {
        charset: "utf-8",
        viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
        "theme-color": "#000000"
      },
      manifest: "./public/manifest.json",
      filename: "index.html",
      chunks: ["app"],
      template: "./public/index.html",
      hash: true
    }),
    new CopyWebpackPlugin({
      patterns: [{ 
        from: "public/icons", 
        to: "icons" 
      }]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public", "options.html"),
      filename: "options.html",
      chunks: ["options"]
    }),
    new CopyWebpackPlugin({
      patterns: [{ 
        from: "public/css",
        to: "css"
      }]
    }),
    new WebpackExtensionManifestPlugin({
      config: {
        base: baseManifest
      }
    }),
    new WriteFilePlugin()
  ],
  devtool: "source-map"
};

module.exports = options;
