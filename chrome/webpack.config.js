const webpack = require("webpack"),
    path = require("path"),
    fileSystem = require("fs"),
    env = require("./utils/env"),
    baseManifest = require("./src/chrome/manifest.json"),
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
    app: path.join(__dirname, "src", "static", "index.js"),	  
    classifier: path.join(__dirname, "src", "app", "content", "classifier.js"),
    fetchNodes: path.join(__dirname, "src", "app", "content", "fetchNodes.js"),
    options: path.join(__dirname, "src", "app", "options.js"),
    background: path.join(__dirname, "src", "app", "background.js")
  },
  //chromeExtensionBoilerplate: {
  //  notHotReload: ["fetchNodes", "classifier", "popup", "background"]
  //},
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
      title: "Attentional",
      meta: {
        charset: "utf-8",
        viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
        "theme-color": "#000000"
      },
      manifest: "manifest.json",
      filename: "index.html",
      template: "src/static/index.html",
      hash: true
    }),

   // new CopyWebpackPlugin([{
   //   from: "src/manifest.json",
   //   transform: function (content, path) {
   //     // generates the manifest file using the package.json informations
   //     return Buffer.from(JSON.stringify({
   //       description: process.env.npm_package_description,
   //       version: process.env.npm_package_version,
   //       ...JSON.parse(content.toString())
   //     }))
   //   }
   // }]),
	
    new CopyWebpackPlugin({
      patterns: [{ 
        from: "src/chrome/icons", 
        to: "icons" 
      }]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "static", "options.html"),
      filename: "options.html",
      chunks: ["options"]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "static", "background.html"),
      filename: "background.html",
      chunks: ["background"]
    }),
    new WebpackExtensionManifestPlugin({
      config: {
        base: baseManifest
      }
    }),
    new WriteFilePlugin()
  ]
};

if (env.NODE_ENV === "development") {
  options.devtool = "cheap-module-eval-source-map";
}

module.exports = options;
