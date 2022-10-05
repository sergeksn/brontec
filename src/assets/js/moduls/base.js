new class {
    //инициализируем настрйоку базовых параметров
    constructor() {
        this.set_base_params(); //станавливаем базовые параметры для работы скриптов

        this.get_win_and_divise_size(); //devise высота и ширина экрана устройства и win окна браузера записываем для удобста чтоб не вычислять каждый раз

        this.interactive_elements_set_data(); //устанавливает список интерактивных элементов и функции их включени/отключения

        $(window).on({
            events: "resize_optimize",
            callback: this.get_win_and_divise_size
        }); //devise высота и ширина экрана устройства и win окна браузера , обновляем после каждого ресайза

        $(window).on({
            events: "orientation_chenge",
            callback: () => GDS.orientation = window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape"
        }); //записываем отриентацию экрана при каждом её изменении
    }
    //инициализируем настрйоку базовых параметров

    //станавливаем базовые параметры для работы скриптов
    set_base_params() {
        //значение для js анимаций по умочанию
        GDS.anim_time = 500;
        GDS.anim_tf = "linear";

        GDS.trotling = 100; //стандартная задержка между страбатыванием функций слушателей событий с установленным тротлингом

        GDS.devise_touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0; //определяем сенсорный экран или нет

        GDS.dpr = window.devicePixelRatio; //записываем плотность пикселей экрана устройства

        GDS.orientation = window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape"; //узнаём стартовую отриентацию экрана

        GDS.global_interactiv_lock = false; //определяяет заблокированны/разблокированны интерактивые элементы на сайте

        if (GDS.devise_touch) document.getElementsByTagName("body")[0].classList.add("touch_devise"); //делаем пометку дял удобства стилизации сенсорный экран или нет
    }
    //станавливаем базовые параметры для работы скриптов

    //devise высота и ширина экрана устройства и win окна браузера записываем для удобста чтоб не вычислять каждый раз
    get_win_and_divise_size() {
        //ПРИМЕЧАНИЕ: ширина/высота окна браузера не учитывает полосы прокрутки
        GDS.devise_height = window.screen.height;
        GDS.devise_width = window.screen.width;
        GDS.win_height = document.documentElement.clientHeight;
        GDS.win_width = document.documentElement.clientWidth;
    }
    //devise высота и ширина экрана устройства и win окна браузера записываем для удобста чтоб не вычислять каждый раз

    //устанавливает список интерактивных элементов и функции их включени/отключения
    interactive_elements_set_data() {
        //все интерактивные эльменты которые есть на сайте
        const interactive_elements = [
            $(".search_wrapper .close_search"),
            $(".header_search_button_wrap"),
            $(".header_search_bold_button_wrap"),
            $(".header_burger_button_wrap"),
            $(".top_banner_wrap .close_banner_wrap"),
            $(".header_cart .img_cart"),
            $(".scroll_to_top_wrapper")
        ];
        //все интерактивные эльменты которые есть на сайте

        //блокирует все интерактывные элемеры на сайте
        GDS.lock_all_interactive = function() {
            interactive_elements.forEach((elem) => elem.addClass("disabled")); //помечеам все элементы как отключенные
            GDS.global_interactiv_lock = true; //указываем что все элементы успешно заблокированны
        };
        //блокирует все интерактывные элемеры на сайте

        //разблокирует все интерактывные элемеры на сайте
        GDS.unlock_all_interactive = function() {
            interactive_elements.forEach((elem) => elem.removeClass("disabled")); //помечеам все элементы как активные
            GDS.global_interactiv_lock = false; //указываем что все элементы успешно разблокированны
        };
        //разблокирует все интерактывные элемеры на сайте
    }
    //устанавливает список интерактивных элементов и функции их включени/отключения
}