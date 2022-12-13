/*скрипт создаёт и обновляет при ресайзе css переменный для высоты и ширины экрна в rem*/
let head = d.getElementsByTagName('head')[0],
    common_style = d.createElement('style'),
    dynamic_vars = d.createElement('style'),
    dfs = GDS.win.default_font_size;
/*обязательно нужно получить размешь штифта по умолчанию, т.к. в противном случае если просто делить на 16 
          переменная --wwr будет не корректной и все блоки будут ехать, конечно если пользователь поменяет размер шрифта находясь на сайте, 
          изменения не вступят в силу до перезагрузки страницы*/

dynamic_vars.id = 'dynamic-vars'; /*будет содержать динамические переменные*/
common_style.id = 'common-style'; /*добавляем id чтоб можно было потом обращаться к этому блоку стилей для того чтоб дополнять его стилями*/

head.append(common_style);
/*--wwr = --win-width-rem
    --wwrn= --win-width-bez-rem
    --whr = --win-heigth-rem*/
function set_css_vars() {
    let w = d.documentElement.clientWidth,
        h = d.documentElement.clientHeight;
    dynamic_vars.innerHTML = '';
    dynamic_vars.innerHTML = `:root{
      --wwr: ${w / dfs}rem;
      --wwrn: ${w / dfs};
      --whr: ${h / dfs}rem;
    }`;
    head.append(dynamic_vars);
}
set_css_vars();
w.addEventListener('resize', set_css_vars);
