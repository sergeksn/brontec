const { Refresh_Alias_Json } = require("./webpack-create-alias"); //получает список алиасов компонентов
//${component_name}-main.js
//${component_name}-render.scss
//${component_name}-interaction.scss

const Import_Components_Assets = require("./webpack-import-components"); //записывает иморты компонетов в соответсвующие файлы

Refresh_Alias_Json();//обновляем алифасы в файле
Import_Components_Assets();//записывает иморты компонетов в соответсвующие файлы