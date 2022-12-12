process.env.ksn_mode = "server";

const {
    ENTRY_PATH, //
    OUTPUT_PATH,
    Get_Extensions,
    Get_Plagins,
    Get_Rules,
    Get_Alias_list,
} = require("../scripts/webpack-data"); //получаем данный для данной сборки, такие как список расширений, набор плагинов и правил загрузки ресурсов
//ПРИМЧАНИЕ: так же этот скрипт выполянет по умолчанию некоторые функции, такие как импорт файлов компонентов в соответсвующие файлы и созданию архитекуры для не заполненых компонетов

module.exports = {
    mode: "development",
    devtool: "source-map",
    devServer: {
        port: 3579,
        open: "/pages/glavnaya.html",
        hot: true,
        compress: true, //включит сжатие gzip
    },
    stats: {
        loggingDebug: ["sass-loader"], //позволяет выводить логи scss в консоль сервера
    },
    resolve: {
        alias: Get_Alias_list(),
        extensions: Get_Extensions(),
    },
    entry: {
        main: `${ENTRY_PATH}/entrys/server/main.js`, //точка входа, файл с которого мы начинаем собирать наш проект в нём и нужно подключать все другие файлы такие как html css и другие
        critical: `${ENTRY_PATH}/entrys/server/critical.js`,
        // AbortController: `${ENTRY_PATH}/entrys/polyfills/AbortController.js`,
        // IntersectionObserver: `${ENTRY_PATH}/entrys/polyfills/IntersectionObserver.js`,
        //полифилы придётся коментировать т.к. они блокируют горячую перезагрузку добавлять тольок для тестов
    },
    plugins: Get_Plagins(),
    module: {
        rules: Get_Rules(),
    },
};
