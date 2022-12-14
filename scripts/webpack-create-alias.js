const path = require("path"); //нодовский модуль для получение путей
const fs = require("fs");

const alias_fill_path = path.resolve(__dirname, "../configs/alias.json");

function Get_Alias_list() {
    return JSON.parse(fs.readFileSync(alias_fill_path));
}

function Refresh_Alias_Json() {
    let components_path = path.resolve(__dirname, "../src/components"),
        alias = require("./webpack-data").Get_Base_Aliases();

    fs.readdirSync(components_path).forEach(components_type_dir => {
        fs.readdirSync(components_path + "/" + components_type_dir).forEach(component_name => {
            alias[`@${component_name}`] = `@components/${components_type_dir}/${component_name}`;
            alias[`@${component_name}-main-js`] = `@components/${components_type_dir}/${component_name}/js/${component_name}-main.js`;
            alias[`@${component_name}-render-scss`] = `@components/${components_type_dir}/${component_name}/scss/${component_name}-render.scss`;
            alias[`@${component_name}-interaction-scss`] = `@components/${components_type_dir}/${component_name}/scss/${component_name}-interaction.scss`;
            alias[`@${component_name}-fonts`] = `@components/${components_type_dir}/${component_name}/fonts`;
            alias[`@${component_name}-img`] = `@components/${components_type_dir}/${component_name}/img`;
        });
    });

    fs.writeFile(alias_fill_path, JSON.stringify(alias), err => (err ? console.log(err) : null));
    return alias;
}

// for (var i = 0; i < process.argv.length; i++) {
//     switch (process.argv[i]) {
//         case "Get_Alias_list":
//             Get_Alias_list();
//             break;
//         case "Create_Alias_Json":
//             Refresh_Alias_Json();
//             break;
//     }
// }
//"alias refresh": "node ./scripts/webpack-create-alias.js Create_Alias_Json"
//Get_Alias_list();
module.exports = { Get_Alias_list, Refresh_Alias_Json };
