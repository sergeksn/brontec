process.env.ksn_mode = 'prod';

const {
    ENTRY_PATH, //
    OUTPUT_PATH,
    Get_Extensions,
    Get_Plagins,
    Get_Rules,
    Get_Alias_list,
} = require('../scripts/webpack-data'); //получаем данный для данной сборки, такие как список расширений, набор плагинов и правил загрузки ресурсов

module.exports = {
    mode: 'production',
    target: 'browserslist',
    resolve: {
        alias: Get_Alias_list(),
        extensions: Get_Extensions(),
    },
    entry: {
        critical: `${ENTRY_PATH}/entrys/main/critical.js`,
        main: `${ENTRY_PATH}/entrys/main/main.js`, //точка входа, файл с которого мы начинаем собирать наш проект в нём и нужно подключать все другие файлы такие как html css и другие
        AbortController: `${ENTRY_PATH}/entrys/polyfills/AbortController.js`,
        IntersectionObserver: `${ENTRY_PATH}/entrys/polyfills/IntersectionObserver.js`,
    },
    output: {
        path: OUTPUT_PATH, //путь по которому будут выгружаться итоговые файлы
        filename: data_obj => {
            //помещаем файлы по попкам
            let to_bace_path = ['main', 'critical'],
                to_pollyfill_path = ['AbortController', 'IntersectionObserver'];

            if (to_bace_path.includes(data_obj.runtime)) return './assets/js/[name].js';
            if (to_pollyfill_path.includes(data_obj.runtime)) return './assets/js/polyfills/[name].js';
        },
        clean: true, //сообщает что нужно очистить выходную папку перед тем как записать обновлённые или новые файлы
    },
    plugins: Get_Plagins(),
    module: {
        rules: Get_Rules(),
    },
};
