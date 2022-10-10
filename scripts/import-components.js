const path = require("path");
const fs = require("fs");

//функция получает все индексы начала вхождения подстроки substr в строке str
function getListIdx(str, substr) {
    let listIdx = [];
    let lastIndex = -1;
    while ((lastIndex = str.indexOf(substr, lastIndex + 1)) !== -1) {
        listIdx.push(lastIndex);
    }
    return listIdx;
}

//функция добавляет импорты между комментариями target_comment
//inject_fill_path - path.resolve(__dirname, "assets/scss/critical.scss")
//componet_asset_path - "assets/scss/render.scss"
function import_componets_assets(inject_fill_path, componet_asset_path) {
    let content = fs.readFileSync(inject_fill_path, "utf8"),
        target_comment = "//@dinamic node import fils",
        import_text = componet_asset_path.includes(".js") ? "import" : "@import",
        components_path = path.resolve(__dirname, "../src/components"),
        index_target_comment = getListIdx(content, target_comment),
        first_content_part = content.slice(0, index_target_comment[0] + target_comment.length),
        last_content_part = content.slice(index_target_comment[1]),
        inject_str = "\n";

    fs.readdirSync(components_path).forEach(components_type_dir => {
        fs.readdirSync(components_path + "/" + components_type_dir).forEach(component => {
            inject_str += `${import_text} "@components/${components_type_dir}/${component}/${componet_asset_path}";\n`;
        });
    });

    let result_inject_content = first_content_part + inject_str + last_content_part;

    fs.writeFile(inject_fill_path, result_inject_content, err => console.log(err));
}

import_componets_assets(path.resolve(__dirname, "../src/assets/scss/critical.scss"), "assets/scss/render.scss");
import_componets_assets(path.resolve(__dirname, "../src/assets/scss/main.scss"), "assets/scss/interaction.scss");
import_componets_assets(path.resolve(__dirname, "../src/assets/js/main.js"), "assets/js/main.js");
