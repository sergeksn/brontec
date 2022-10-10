const path = require("path"); //нодовский модуль для получение путей
const HtmlWebpackPlugin = require("html-webpack-plugin"); //плагин создаёт новый html файл по нашему шаблону и подключает в него скрипты и стили
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); //плагин собирает css в один файл для дальнейшего подключаения
//ПРИМЕЧАНИЕ: будет создавать новый css файл на каждый файл точки входа
const HtmlWebpackSkipAssetsPlugin = require("html-webpack-skip-assets-plugin").HtmlWebpackSkipAssetsPlugin; //исключит excludeAssets в HtmlWebpackPlugin
//const Copy_Webpack_Plagin = require("copy-webpack-plugin"); //плагин позволит копировать файлы из одной поки в другуюnpx jsconfig.json /configs
const Alias = require("alias-jsconfig-webpack-plugin"); //создаст файл jsconfig.json для поддержки алиасов в js файлах дял vscode

const ENTRY_PATH = path.resolve(__dirname, "../src"); //путь к папке с исходниками
const OUTPUT_PATH = path.resolve(__dirname, "../prod_build"); //путь к папке куда будет собираться проект как готовый вариант для продакшена

// const JUST_COPY_FILS = {
//   patterns: [
//     {
//       from: `${ENTRY_PATH}/123.txt`,
//       to: `${OUTPUT_PATH}/123.txt`,
//     },
//   ],
// }; //файлы которые нужно простос каопировать в сиходную папку

const PAGES = ["abaut", "instruction", "dostavka_i_oplata", "vibrat_complekt", "komplekt", "detal", "oformit_zakaz", "ostavit_otziv"]; //список страниц с путями

process.env.BROWSERSLIST_CONFIG = path.resolve(__dirname, "./.browserslistrc"); //путь к файлу со списком поддерживаемых браузеров

module.exports = {
    mode: "production",
    target: "browserslist",
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "../src"), //будет работать в подключённых scss js ejs
            "@assets": "@/assets",
            "@fonts": "@assets/fonts",
            "@img": "@assets/img",
            "@scss": "@assets/scss",
            "@scss-ui": "@scss/ui",
            "@scss-blocks": "@scss/blocks",
            "@scss-libs": "@scss/libs",
            "@scss-general": "@scss/general",
            "@scss-func": "@scss/_scss-func",
            "@js": "@assets/js",
            "@js-moduls": "@js/moduls",
            "@js-base-func": "@js/base-func",
        },
        extensions: [".js", ".json", ".css", ".scss", ".ejs", ".png", ".jpg", ".jpeg", ".svg", ".ico"],
    },
    entry: {
        critical: `${ENTRY_PATH}/entrys/main/critical.js`,
        main: `${ENTRY_PATH}/entrys/main/index.js`, //точка входа, файл с которого мы начинаем собирать наш проект в нём и нужно подключать все другие файлы такие как html css и другие
    },
    output: {
        path: OUTPUT_PATH, //путь по которому будут выгружаться итоговые файлы
        filename: "./assets/js/[name].[contenthash].js", //имя итоговых файлов js
        clean: true, //сообщает что нужно очистить выходную попку перед тем как записать обновлённые или новые файлы
    },
    plugins: [
        new Alias({
            language: "js", // or 'ts'
            jsx: true, // default to true,
            indentation: 4, // default to 4, the indentation of jsconfig.json file
        }),
        //new Copy_Webpack_Plagin(JUST_COPY_FILS),//скопирует файлы в сборку
        new HtmlWebpackPlugin({
            //плагин переносить добавляет во все файл из массива PAGES скрипты и стили с указание актуальных хешей
            template: `${ENTRY_PATH}/index.ejs`,
            filename: `./index.html`,
            inject: "body",
            scriptLoading: "blocking",
            minify: false,
            excludeAssets: [/critical.*.js/],
        }),
        ...PAGES.map(
            page =>
                new HtmlWebpackPlugin({
                    //плагин переносить добавляет во все файл из массива PAGES скрипты и стили с указание актуальных хешей
                    template: `${ENTRY_PATH}/pages/${page}.ejs`,
                    filename: `./pages/${page}.html`,
                    inject: "body",
                    scriptLoading: "blocking",
                    minify: false,
                    excludeAssets: [/critical.*.js/],
                }),
        ),
        new HtmlWebpackSkipAssetsPlugin(), //исключит excludeAssets в HtmlWebpackPlugin
        new MiniCssExtractPlugin({
            filename: "./assets/css/[name].[contenthash].css", //указывает куда сохранить и как назвать выходные css файлы
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
                            //ПРИМЕЧАНИЕ: в общем я создал 2 развные точки входа для итоговой сбори и для сборки сервера, т.к. при подключении всех файлов html или ejs все их картинки и линки поддтгиванись в итоговый файл js что не хорошо, всему вина html-loader, по этой причине из точки входа убраны все html или ejs, а в серверной точке входа оставлены т.к. как горячая перезагрузка работает только с теми файлами которые подключены в точке входа
                            //sources: false, //отключает обратотку всех атрибутов, т.е. в итоговый js файл не будут включены лишний строки об импорте файлов их html
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
                    "template-ejs-loader",
                ],
            },
            {
                test: /\.js$/,
                loader: "esbuild-loader", //этот лоадер вроде очень быстрый, ну посмотрим =)
                options: {
                    target: "es6", //поддерживаем синтаксис es6
                    //minify: true //указываем если нужно минифицировать выходной файл js
                },
            },
            {
                test: /\.(c|sa|sc)ss$/i,
                use: [
                    MiniCssExtractPlugin.loader, //вставляет css в свой файл
                    "css-loader", //позволяет ноде обработать файл css
                    {
                        loader: "postcss-loader", //выполняет все необходимые преобразования перед передачей в следующий лобавдер
                        options: {
                            postcssOptions: {
                                plugins: [
                                    require("autoprefixer"), //добавляет префиксы на основе браузер листа
                                    require("cssnano"), //максимально минифицирует код
                                ],
                            },
                        },
                    },
                    "group-css-media-queries-loader",
                    "sass-loader", //переводит код и scss или sass в css
                ],
            },
            {
                test: /\.(jpe?g|png|svg|ico)$/i,
                type: "asset/resource",
                generator: {
                    filename: asset_object => asset_object.module.resourceResolveData.relativePath.replace("./src/", ""),
                },
            },
            {
                test: /\.(woff2?|ttf)$/i,
                type: "asset/resource",
                generator: {
                    filename: asset_object => asset_object.module.resourceResolveData.relativePath.replace("./src/", ""),
                },
            },
        ],
    },
};
