const path = require("path"); //нодовский модуль для получение путей
const HtmlWebpackPlugin = require("html-webpack-plugin"); //плагин создаёт новый html файл по нашему шаблону и подключает в него скрипты и стили
//const Copy_Webpack_Plagin = require("copy-webpack-plugin"); //плагин позволит копировать файлы из одной поки в другую
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); //плагин собирает css в один файл для дальнейшего подключаения
//ПРИМЕЧАНИЕ: будет создавать новый css файл на каждый файл подключённый в скриптах
const Alias = require("alias-jsconfig-webpack-plugin");//создаст файл jsconfig.json для поддержки алиасов в js файлах дял vscode

const PAGES = ["abaut", "instruction", "dostavka_i_oplata", "vibrat_complekt", "komplekt", "detal", "oformit_zakaz", "ostavit_otziv"]; //список страниц с путями

const ENTRY_PATH = path.resolve(__dirname, "../src"); //путь к папке с исходниками
const OUTPUT_PATH = path.resolve(__dirname, "../dev_build"); //путь к папке куда будет собираться проект как готовый вариант для разработки

module.exports = {
  mode: "development",
  target: "web",
  devtool: "source-map",
  resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "../src/assets"), //будет работать в подключённых css и js файлах но не в шаблонах ejs
      "@fonts": "@assets/fonts",
      "@img": "@assets/img",
      "@css": "@assets/css",
      "@css_moduls": "@css/moduls",
      "@js": "@assets/js",
      "@js_moduls": "@js/moduls",
      "@js_base_func": "@js/base_func",
    },
  },
  entry: {
    main: `${ENTRY_PATH}/main_entry_point.js`, //точка входа, файл с которого мы начинаем собирать наш проект в нём и нужно подключать все другие файлы такие как html css и другие
  },
  output: {
    path: OUTPUT_PATH, //путь по которому будут выгружаться итоговые файлы
    filename: "./assets/js/[name].js", //имя итоговых файлов js
    clean: true, //сообщает что нужно очистить выходную попку перед тем как записать обновлённые или новые файлы
  },
  plugins: [
    new Alias({
      language: "js", // or 'ts'
      jsx: true, // default to true,
      indentation: 4, // default to 4, the indentation of jsconfig.json file
    }),
    new HtmlWebpackPlugin({
      //плагин переносить добавляет во все файл из массива PAGES скрипты и стили с указание актуальных хешей
      template: `${ENTRY_PATH}/index.ejs`,
      filename: `./index.html`,
      inject: "body",
      scriptLoading: "blocking",
      minify: false,
    }),
    ...PAGES.map(
      (page) =>
        new HtmlWebpackPlugin({
          //плагин переносить добавляет во все файл из массива PAGES скрипты и стили с указание актуальных хешей
          template: `${ENTRY_PATH}/pages/${page}.ejs`,
          filename: `./pages/${page}.html`,
          inject: "body",
          scriptLoading: "blocking",
          minify: false,
        })
    ),
    new MiniCssExtractPlugin({
      filename: "./assets/css/[name].css", //указывает куда сохранить и как назвать выходные css файлы
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ejs$/i,
        use: [
          {
            loader: "html-loader",
            options: {
              minimize: false, //оставим не минимизированным для удобства чтения и переноса на движок
              sources: {
                list: [
                  "...",
                  {
                    tag: "img",
                    attribute: "data-src",
                    type: "src",
                  },
                  {
                    tag: "div",
                    attribute: "data-src",
                    type: "src",
                  },
                ],
              },
            },
          },
          'template-ejs-loader'
        ],
      },
      {
        test: /\.js$/,
        loader: "esbuild-loader", //этот лоадер вроде очень быстрый, ну посмотрим =)
        options: {
          target: "es6", //поддерживаем синтаксис es6
        },
      },
      {
        test: /\.(c|sc)ss$/i,
        use: [
          MiniCssExtractPlugin.loader, //вставляет css в свой файл
          "css-loader", //позволяет ноде обработать файл css
          "sass-loader", //переводит код и scss или sass в css
        ],
      },
      {
        test: /(favicon\.ico)$/i,
        type: "asset/resource",
        generator: {
          filename: "[name][ext]",
        },
      },
      {
        test: /\.(jpe?g|png|svg)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/img/[name][ext]",
        },
      },
      {
        test: /\.(woff2?|ttf)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/fonts/[name][ext]",
        },
      },
    ],
  },
};