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
//componet_asset_path - "assets/scss"
//componet_fill_and_ext - "render.scss"
function import_componets_assets(inject_fill_path, componet_asset_path, componet_fill_and_ext) {
    let content = fs.readFileSync(inject_fill_path, "utf8"),
        target_comment = "//@dinamic node import fils",
        import_text = componet_fill_and_ext.includes(".js") ? "import" : "@import",
        components_path = path.resolve(__dirname, "../src/components"),
        index_target_comment = getListIdx(content, target_comment),
        first_content_part = content.slice(0, index_target_comment[0] + target_comment.length),
        last_content_part = content.slice(index_target_comment[1]),
        inject_str = "\n";

    fs.readdirSync(components_path).forEach(components_type_dir => {
        fs.readdirSync(components_path + "/" + components_type_dir).forEach(component_name => {
            if (fs.existsSync(`${components_path}/${components_type_dir}/${component_name}/${componet_asset_path}/${component_name}-${componet_fill_and_ext}`)) {
                inject_str += `${import_text} "@${component_name}-${componet_fill_and_ext.replace(".", "-")}";\n`;
            }
        });
    });

    let result_inject_content = first_content_part + inject_str + last_content_part;

    fs.writeFileSync(inject_fill_path, result_inject_content);//записываем синхронно чтоб импорты были прописаны до того как приступим к анализу файлов средствами вебпака
}

module.exports = function () {
    import_componets_assets(path.resolve(__dirname, "../src/assets/scss/critical.scss"), "assets/scss", "render.scss");
    import_componets_assets(path.resolve(__dirname, "../src/assets/scss/main.scss"), "assets/scss", "interaction.scss");
    import_componets_assets(path.resolve(__dirname, "../src/assets/js/main.js"), "assets/js", "main.js");
};
