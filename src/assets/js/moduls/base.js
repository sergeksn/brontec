window.w = window; //сокращения
window.d = document; //сокращения
window.qs = (s, ws = d) => ws.querySelector(s); //сокращённые записи для поиска одного элемента
window.qsa = (s, ws = d) => ws.querySelectorAll(s); //сокращённые записи для поиска элементов
window.GDS = {}; /*global data site  тут будут хранится все необходимые данные для работы фронтенда сайта, размеры блоков или какието-то данные для взаимодействия модулей*/

GDS.host_url = KSN_DEV_MODE ? 'http://shop.loc' : location.origin; //опредиляем исходный домен
GDS.ajax_url = GDS.host_url + '/wp-content/plugins/ksn_shop/ksn_ajax.php'; //путь для ajax запросов

//получаем и обновляем часто используемые переменные css
w.addEventListener('DOMContentLoaded', () => {
    function update_vars() {
        let test_div = d.createElement('div'),
            sl = w.getComputedStyle(test_div);

        test_div.classList.add('standart-container', 'test-div');
        d.body.append(test_div);

        GDS.vars.standart_container_margin_lr = parseFloat(sl.marginLeft);
        GDS.vars.standart_container_width = parseFloat(sl.width);
        GDS.vars.standart_container_max_width = parseFloat(sl.maxWidth);
        GDS.vars.gap = parseFloat(sl.paddingTop);
        GDS.vars.gap_10 = parseFloat(sl.paddingRight);
        GDS.vars.small_gap = parseFloat(sl.paddingBottom);
        GDS.vars.medium_gap = parseFloat(sl.paddingLeft);
        GDS.vars.big_gap = parseFloat(sl.height);
        test_div.remove();

        //получаем размеры скролбаров
        let tb = d.createElement('div'),
            itb = document.createElement('div');
        tb.style.visibility = 'hidden';
        tb.style.overflow = 'scroll';
        qs('body').appendChild(tb);
        tb.appendChild(itb);
        GDS.scroll.standart_scrollbar_width = tb.offsetWidth - itb.offsetWidth;
        tb.classList.add('custom-page-scrollbar');
        GDS.scroll.custom_page_scrollbar_width = tb.offsetWidth - itb.offsetWidth;
        tb.classList.remove('custom-page-scrollbar');
        tb.classList.add('custom-scrollbar');
        GDS.scroll.custom_scrollbar_width = tb.offsetWidth - itb.offsetWidth;
        tb.parentNode.removeChild(tb);
        //получаем размеры скролбаров
    }

    update_vars();
    w.addEventListener('resize_optimize', update_vars);
});
//получаем и обновляем часто используемые переменные css

//часто используемые переменные
GDS.vars = {};

//параметры окна браузера
GDS.win = {
    default_font_size: parseFloat(w.getComputedStyle(d.documentElement).fontSize),
    flicker_active_elements: true, //определяет будут ли тускнет активные элементы на время отключения
};

let ua = window.navigator.userAgent;

//параметры устройства
GDS.device = {
    is_iOS: /ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i.test(ua) || /cfnetwork\/.+darwin/i.test(ua),
    is_Mac_OS: /(mac os x) ?([\w\. ]*)/i.test(ua) || /(macintosh|mac_powerpc\b)(?!.+haiku)/i.test(ua),
    is_touch: 'ontouchstart' in w || navigator.maxTouchPoints > 0, //определяем сенсорный экран или нет
    dpr: w.devicePixelRatio, //записываем плотность пикселей экрана устройства
    orientation: get_divise_orientation(), //узнаём стартовую отриентацию экрана
};

//параметры медиаресуерсов
GDS.media = {
    img: {
        percent_img_show_to_load: 10, //процент от размера картинки который должен быть виден что она начала грузится
        loader_delay_time: 250, //время которое даётся на загрузку картинки без лоадера, чтобы быстро её показать если она например в кеше или интернет пользователя имеет хорошую скорость
        min_vsible_time: 100, //минимальное время в мс, которое картинка должна находится непрерывно видимой чтоб начался процесс её загрузки, добавлено чтоб предотвратить загрузку картинки если пользователь слишком быстро её проскролил
        //ПРИМЕЧАНИЕ: 0 нужен чтоб корректно сравнивать миниатюры
        miniatur_sizes: [0, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1600, 1800, 2000, 2500, 3000, 4000, 5000, 6000, 7000, 8000], //это все возможные значения ширины у миниатюр
        //ПРИМЕЧАНИЕ: если вы хотите чтоб картинка не попадала в кеш при не полной загрузкк ставим значение min_anyway_load_percent = 100 и min_anyway_load_byte_size = null, а если хотите чтоб картинка попала в кеш даже если она начала грузится только на долю секунды то ставим так min_anyway_load_percent = 0 и min_anyway_load_byte_size = null
        min_anyway_load_percent: 60, //минимальный процент загрузки картинки после которого прерывание её загрузки не будет происходить, т.е. если мы начали грузить картинку для ширины экрана в 1000 пикселей и потом изменили размер экрна, то если загрузили процент картинки больше данного значения загрузка картинки будет продолжена и она сохраниться в кеш
        //ПРИМЕЧАНИЕ: если установлен минимальный размер в байтах то процентное значение будет игнорироваться, чтоб использовать процентное значение нужно установить min_anyway_load_byte_size в значение null
        min_anyway_load_byte_size: null, //минимальный скачанный размер картинки в байтах после которого прерывание её загрузки не будет происходить, т.е. если мы начали грузить картинку для ширины экрана в 1000 пикселей и потом изменили размер экрна, то если загрузили байт картинки больше данного значения загрузка картинки будет продолжена и она сохраниться в кеш, 1000000 = 1мб
        resize_delay_load: 500, //задержка в мс перед началом загрузки картинок для данного размера экрана, т.е. пока мы меняем размер экрана новые картинки не грузятся но как только мы задержались в каком-то размере экрана более чем на данной количество мс начинается процедура загрузки картинки для данного размера акна браузера
    },
    video_frames: {
        percent_frame_show_to_load: 10, //процент от размера фрейма который должен быть виден что он начал грузится
        //loader_delay_time: 500, //время которое даётся на загрузку фрейма с видео без лоадера, чтобы быстро его показать если интернет пользователя имеет хорошую скорость
        min_vsible_time: 300, //минимальное время в мс, которое фрейм должен находится непрерывно видимым чтоб начался процесс его загрузки, добавлено чтоб предотвратить загрузку фреймов если пользователь слишком быстро его проскролил
    },
};

//настройки для анимаций
GDS.anim = {
    time: 500,
    css_tf: 'ease-in-out', //для анимации через transition
    graph: 'easeInOutQuad',
};

//параметры прокрутки
GDS.scroll = {
    premission_show_scrollbar: !GDS.device.is_iOS && !GDS.device.is_Mac_OS && w.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches, //разрешает отображать скролбар толкьо если это не iOS, и не Mac OS, и это устройство с точныйм указывающим прибором способное вызывать событие hover
    dir: 'bottom', //начально направление скрола
    time: 1000, //время для анимации прокрутки в мс
    anim_tf: 'linear',
    min_distans: Math.round(GDS.win_height * 1.5) > 500 ? Math.round(GDS.win_height * 1.5) : 500, //если 150% высоты экрана больше чем 500 то используем их как минимальную дистанцию скрола, иначеи используем 500
};

GDS.scroll.premission_show_scrollbar && qs('html').setAttribute('data-premission-show-scrollbar', ''); //помечаем что можно выводить скролбар для данного пользователя

function get_divise_orientation() {
    return w.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
}

//devise высота и ширина экрана устройства и win окна браузера записываем для удобста чтоб не вычислять каждый раз, а так же обновлять при ресайзах
function get_win_and_divise_size() {
    //ПРИМЕЧАНИЕ: ширина/высота окна браузера не учитывает полосы прокрутки
    GDS.device.height = w.screen.height;
    GDS.device.width = w.screen.width;
    GDS.win.height = d.documentElement.clientHeight;
    GDS.win.width = d.documentElement.clientWidth;
    GDS.win.height_rem = d.documentElement.clientHeight / GDS.win.default_font_size;
    GDS.win.width_rem = d.documentElement.clientWidth / GDS.win.default_font_size;
}
//devise высота и ширина экрана устройства и win окна браузера записываем для удобста чтоб не вычислять каждый раз, а так же обновлять при ресайзах

w.addEventListener('DOMContentLoaded', () => {
    GDS.scroll.value = qs('html').scrollTop; //отсуп от верха страницы задаём сразу после загрузки DOM т.к. это значение используется далее в скриптах
    get_win_and_divise_size(); //пересчитываем значение высоты и ширин сразу после загрузки т.к. добавится скролл
}); //devise высота и ширина экрана устройства и win окна браузера записываем для удобста чтоб не вычислять каждый раз, вычисляем после загрузки DOM

//ждём загрузки всего чтоб точно были доступны методы _on
w.addEventListener('load', () => {
    w._on('resize_optimize', get_win_and_divise_size); //devise высота и ширина экрана устройства и win окна браузера , обновляем после каждого ресайза

    w._on('orientation_chenge', get_divise_orientation); //записываем отриентацию экрана при каждом её изменении

    //определяем направление скрола и его значение
    //перебираем все элементы которые будут прокручиваемыми и будут считаться условным телом страницы в соответствующий момент времени
    [qs('header'), w].forEach(elem => {
        let target_scroll_area = elem === w ? qs('html') : elem; //определяем элемент величина прокрутки которого будет браться для измерения для данного элемента

        //при скроле записываем направление и дистанцию скрола
        elem._on('scroll_optimize', () => {
            GDS.scroll.dir = GDS.scroll.value > target_scroll_area.scrollTop ? 'top' : 'bottom';
            GDS.scroll.value = target_scroll_area.scrollTop;
        });
        //при скроле записываем направление и дистанцию скрола
    });
    //перебираем все элементы которые будут прокручиваемыми и будут считаться условным телом страницы в соответствующий момент времени
    //определяем направление скрола и его значение
});
