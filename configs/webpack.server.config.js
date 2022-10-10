const path = require("path"); //нодовский модуль для получение путей
const HtmlWebpackPlugin = require("html-webpack-plugin"); //плагин создаёт новый html файл по нашему шаблону и подключает в него скрипты и стили
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); //плагин собирает css в один файл для дальнейшего подключаения

const { Get_Alias_list } = require("../scripts/create-webpack-alias"); //получает список алиасов компонентов
//${component_name}-main.js
//${component_name}-render.scss
//${component_name}-interaction.scss

const Import_Components_Assets = require("../scripts/import-components"); //записывает иморты компонетов в соответсвующие файлы
Import_Components_Assets(); //записывает иморты компонетов в соответсвующие файлы

const PAGES = ["abaut", "instruction", "dostavka_i_oplata", "vibrat_complekt", "komplekt", "detal", "oformit_zakaz", "ostavit_otziv"]; //список страниц с путями

const ENTRY_PATH = path.resolve(__dirname, "../src"); //путь к папке с исходниками

module.exports = {
    mode: "development",
    devtool: "source-map",
    devServer: {
        port: 3579,
        open: true,
        hot: true,
    },
    stats: {
        loggingDebug: ["sass-loader"], //позволяет выводить логи scss в консоль сервера
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "../src"), //будет работать в подключённых scss js ejs
            "@components": "@/components",
            "@components-blocks": "@components/blocks",
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
            ...Get_Alias_list(), //добавляем алиасы компонетов
        },
        extensions: [".js", ".json", ".css", ".scss", ".ejs", ".png", ".jpg", ".jpeg", ".svg", ".ico"],
    },
    entry: {
        main: `${ENTRY_PATH}/entrys/server/index.js`, //точка входа, файл с которого мы начинаем собирать наш проект в нём и нужно подключать все другие файлы такие как html css и другие
    },
    plugins: [
        new HtmlWebpackPlugin({
            //плагин переносить добавляет во все файл из массива PAGES скрипты и стили с указание актуальных хешей
            template: `${ENTRY_PATH}/index.ejs`,
            filename: `./index.html`,
            inject: "body",
            scriptLoading: "blocking",
            minify: false,
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
                }),
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
                    "template-ejs-loader",
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
                    // "style-loader", //вставляет css в head
                    "css-loader", //позволяет ноде обработать файл css
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
