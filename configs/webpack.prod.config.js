process.env.ksn_mode = "prod";

const {
    ENTRY_PATH, //
    OUTPUT_PATH,
    Get_Extensions,
    Get_Plagins,
    Get_Rules,
    Get_Alias_list,
} = require("../scripts/data-for-webpack"); //получаем данный для данной сборки, такие как список расширений, набор плагинов и правил загрузки ресурсов

// const JUST_COPY_FILS = {
//   patterns: [
//     {
//       from: `${ENTRY_PATH}/123.txt`,
//       to: `${OUTPUT_PATH}/123.txt`,
//     },
//   ],
// }; //файлы которые нужно простос каопировать в сиходную папку

module.exports = {
    mode: "production",
    target: "browserslist",
    resolve: {
        alias: Get_Alias_list(),
        extensions: Get_Extensions(),
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
    plugins: Get_Plagins(),
    module: {
        rules: Get_Rules(),
    },
};
