new (class {
    //инициализируем настрйоку базовых параметров
    constructor() {
        //записываем все неоходимые переменные для удобства доступа
        this.body = document.getElementsByTagName('body')[0];
        //записываем все неоходимые переменные для удобства доступа

        this.set_base_params(); //станавливаем базовые параметры для работы скриптов

        this.get_win_and_divise_size(); //devise высота и ширина экрана устройства и win окна браузера записываем для удобста чтоб не вычислять каждый раз

        window._on('resize_optimize', this.get_win_and_divise_size); //devise высота и ширина экрана устройства и win окна браузера , обновляем после каждого ресайза

        window._on('orientation_chenge', () => (GDS.device.orientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape')); //записываем отриентацию экрана при каждом её изменении

        this.scroll_data(); //определяем направление скрола и его значение, а также функции блокироваки прокуртки
    }
    //инициализируем настрйоку базовых параметров

    //станавливаем базовые параметры для работы скриптов
    set_base_params() {
        //параметры устройства
        GDS.device = {
            is_touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0, //определяем сенсорный экран или нет
            dpr: window.devicePixelRatio, //записываем плотность пикселей экрана устройства
            orientation: window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape', //узнаём стартовую отриентацию экрана
        };

        //параметры окна браузера
        GDS.win = {
            default_font_size: window.getComputedStyle(document.getElementsByTagName('html')[0]).fontSize.replace('px', ''),
            flicker_active_elements: true,//определяет будут ли тускнет активные элементы на время отключения
        };

        //параметры прокрутки
        GDS.scroll = {
            value: document.getElementsByTagName('html')[0].scrollTop, //отсуп от верха страницы
            dir: 'bottom', //начально направление скрола
            time: 500, //время для анимации прокрутки в мс
            anim_tf: 'linear',
            min_distans: Math.round(GDS.win_height * 0.7) > 500 ? Math.round(GDS.win_height * 0.7) : 500, //если 75% высоты экрана больше чем 500 то используем их как минимальную дистанцию скрола, иначеи используем 500
        };

        //настройки для анимаций
        GDS.anim = {
            time: 500,
            graph: 'easeInOutQuad',
        };
    }
    //станавливаем базовые параметры для работы скриптов

    //devise высота и ширина экрана устройства и win окна браузера записываем для удобста чтоб не вычислять каждый раз, а так же обновлять при ресайзах
    get_win_and_divise_size() {
        //ПРИМЕЧАНИЕ: ширина/высота окна браузера не учитывает полосы прокрутки
        GDS.device.height = window.screen.height;
        GDS.device.width = window.screen.width;
        GDS.win.height = document.documentElement.clientHeight;
        GDS.win.width = document.documentElement.clientWidth;
    }
    //devise высота и ширина экрана устройства и win окна браузера записываем для удобста чтоб не вычислять каждый раз, а так же обновлять при ресайзах

    //определяем направление скрола и его значение
    scroll_data() {
        //перебираем все элементы которые будут прокручиваемыми и будут считаться условным телом страницы в соответствующий момент времени
        [document.getElementsByTagName('header')[0], window].forEach(elem => {
            let target_scroll_area = elem === window ? document.getElementsByTagName('html')[0] : elem; //определяем элемент величина прокрутки которого будет браться для измерения для данного элемента

            //при скроле записываем направление и дистанцию скрола
            elem._on('scroll_optimize', () => {
                GDS.scroll.dir = GDS.scroll.value > target_scroll_area.scrollTop ? 'top' : 'bottom';
                GDS.scroll.value = target_scroll_area.scrollTop;
            });
            //при скроле записываем направление и дистанцию скрола
        });
        //перебираем все элементы которые будут прокручиваемыми и будут считаться условным телом страницы в соответствующий момент времени

        //ПРИМЕЧАНИЕ: по умолчанию прокрутка блокируется/разблокируется для body
        GDS.scroll.lock = (target = this.body) => target.classList.add('lock-scroll'); //блокирует прокуртку указанного элемента
        GDS.scroll.unlock = (target = this.body) => target.classList.remove('lock-scroll'); //разблокирует прокрутку указанного элемента
    }
    //определяем направление скрола и его значение
})();
