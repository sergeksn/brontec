const mode = process.env.ksn_mode;//режим сборки проекта

const path = require("path"); //нодовский модуль для получение путей

const HtmlWebpackPlugin = require("html-webpack-plugin"); //плагин создаёт новый html файл по нашему шаблону и подключает в него скрипты и стили
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); //плагин собирает css в один файл для дальнейшего подключаения
//ПРИМЕЧАНИЕ: будет создавать новый css файл на каждый файл точки входа
const HtmlWebpackSkipAssetsPlugin = require("html-webpack-skip-assets-plugin").HtmlWebpackSkipAssetsPlugin; //исключит excludeAssets в HtmlWebpackPlugin
//const Copy_Webpack_Plagin = require("copy-webpack-plugin"); //плагин позволит копировать файлы из одной поки в другуюnpx jsconfig.json /configs
const Alias = require("alias-jsconfig-webpack-plugin"); //создаст файл jsconfig.json для поддержки алиасов в js файлах дял vscode

const ENTRY_PATH = path.resolve(__dirname, "../src"); //путь к папке с исходниками
const OUTPUT_PATH = path.resolve(__dirname, `../dist/${mode === "prod" ? "prod_build" : "dev_build"}`); //путь к папке куда будет собираться проект как готовый вариант для продакшена

const { Get_Alias_list } = require("./create-webpack-alias"); //получает список алиасов компонентов
//${component_name}-main.js
//${component_name}-render.scss
//${component_name}-interaction.scss

const Import_Components_Assets = require("./import-components"); //записывает иморты компонетов в соответсвующие файлы
Import_Components_Assets(); //записывает иморты компонетов в соответсвующие файлы

process.env.BROWSERSLIST_CONFIG = path.resolve(__dirname, "../configs/.browserslistrc"); //путь к файлу со списком поддерживаемых браузеров

function Get_Base_Aliases() {
    let aliases = {
        "@": path.resolve(__dirname, "../src"), //будет работать в подключённых scss js ejs
        "@pages": "@/pages",
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
        "@js-libs": "@js/libs",
    };
    return aliases;
}

function Get_Extensions() {
    let ext = [
        ".js", //
        ".json",
        ".css",
        ".scss",
        ".ejs",
        ".png",
        ".jpg",
        ".jpeg",
        ".svg",
        ".ico",
    ];
    return ext;
}

function Get_Pages() {
    let pages = [
        "glavnaya", //
        "abaut",
        "instruction",
        "dostavka_i_oplata",
        "vibrat_complekt",
        "komplekt",
        "detal",
        "oformit_zakaz",
        "ostavit_otziv",
    ];
    return pages;
}

function Get_Plagins() {
    let plagins = [
        new Alias({
            language: "js", // or 'ts'
            jsx: true, // default to true,
            indentation: 4, // default to 4, the indentation of jsconfig.json file
        }),
        //new Copy_Webpack_Plagin(JUST_COPY_FILS),//скопирует файлы в сборку
        ...Get_Pages().map(
            page =>
                new HtmlWebpackPlugin({
                    //плагин переносить добавляет во все файл из массива PAGES скрипты и стили с указание актуальных хешей
                    template: `${ENTRY_PATH}/pages/${page}.ejs`,
                    filename: `./pages/${page}.html`,
                    inject: "body",
                    scriptLoading: "blocking",
                    minify: false,
                    excludeAssets: [/critical\.?.*\.js/],
                }),
        ),
        new HtmlWebpackSkipAssetsPlugin(), //исключит excludeAssets в HtmlWebpackPlugin
        new MiniCssExtractPlugin({
            filename: `./assets/css/[name]${mode === "prod" ? ".[contenthash]" : ""}.css`, //указывает куда сохранить и как назвать выходные css файлы
        }),
    ];

    return plagins;
}

function Componets_Assets_Chenge_Output_Path(asset_object, type) {
    let result = asset_object.module.resourceResolveData.relativePath.replace("./src/", ""); //сразу очищаем путь к исходной попке

    let test = result.match(`components\/[^\/]+\/([^\/]+)\/${type}\/(.+)`); //проверяем что этот файл подключён в компоненте

    if (test) result = `assets/${type}/${test[1]}/${test[2]}`; //если он подключён в компоненте то строим новый путь
    //type - тип файла
    //${test[1]} - имя компонета
    //${test[2]} - файл

    return result;
}

function Get_Rules() {
    let rules = [
        {
            test: /\.(ejs|html)$/i,
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
            },
        },
        {
            test: /\.(c|sa|sc)ss$/i,
            use:
                mode === "prod"
                    ? [
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
                      ]
                    : [
                          MiniCssExtractPlugin.loader, //вставляет css в свой файл
                          "css-loader", //позволяет ноде обработать файл css
                          "group-css-media-queries-loader",
                          "sass-loader", //переводит код и scss или sass в css
                      ],
        },
        {
            test: /\.(jpe?g|png|svg|ico)$/i,
            type: "asset/resource",
            generator: {
                filename: asset_object => Componets_Assets_Chenge_Output_Path(asset_object, "img"),
            },
        },
        {
            test: /\.(woff2?|ttf)$/i,
            type: "asset/resource",
            generator: {
                filename: asset_object => Componets_Assets_Chenge_Output_Path(asset_object, "fonts"),
            },
        },
    ];

    return rules;
}
module.exports = {
    ENTRY_PATH,
    OUTPUT_PATH,
    Get_Base_Aliases,
    Get_Extensions,
    Get_Pages,
    Get_Plagins,
    Get_Rules,
    Get_Alias_list,
};