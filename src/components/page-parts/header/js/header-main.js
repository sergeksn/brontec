import anime from "@js-libs/anime";

import Header_Poster from "./header-poster";
import Header_Menu from "./header-menu";
import Header_Toggle_Block from "./header-toggle-block";
import Header_Search from "./header-search";


let Header = new (class {
    status = "open"; //хранит текущее состояние блока хедера, свёрнут он или открыт или в процессе

    constructor() {
        //записываем все неоходимые переменные для удобства доступа
        this.top_banner_wrap = $(".top_banner_wrap");
        this.has_top_baner = this.top_banner_wrap.length > 0 ? true : false; //определяет есть ли в хедере банер
        this.header = $("header"); //хедер
        this.header_backdrop = $("#header-backdrop");
        this.header_menu_wrapper = $(".header_menu_wrapper");
        this.visible_header_part = $(".visible_header_part");
        //записываем все неоходимые переменные для удобства доступа

        //скрываем/показываем хедер при прокрутке скролл блока в body
        $(window).on({
            events: "scroll_throttle",
            callback: this.toggle_header.bind(this),
            custom_settings: {
                interval: GDS.trotling,
            },
        });
        //скрываем/показываем хедер при прокрутке скролл блока в body

        $(window).on({
            events: "resize_optimize",
            callback: () => this.header_backdrop.css("height", this.get_header_always_visible_h() + "px"),
        }); //при изменении размера экрана пересчитываем новую высоту подкладки хедера
    }

    //функция получае нужные высоты в хедере
    get_header_h() {
        let header_menu_wrapper_h = this.header_menu_wrapper.height(),
            top_banner_wrap_h = this.has_top_baner === true ? this.top_banner_wrap.height() : 0;

        return header_menu_wrapper_h + top_banner_wrap_h;
    }
    //функция получае нужные высоты в хедере

    //функция получает постоянно вилимую часть хедера состоящую из банера, если он сеть, и меню
    get_header_always_visible_h() {
        let top_baner_h = this.has_top_baner === true ? this.top_banner_wrap.height() : 0;
        return top_baner_h + this.visible_header_part.height({ type: "outerHeight" });
    }
    //функция получает постоянно вилимую часть хедера состоящую из банера, если он сеть, и меню

    //отпускает вниз и показывает блок хедера
    async open(spead = GDS.anim_time) {
        if (this.status === "open" || this.status === "pending to open") return;

        let _this = this,
            animation = anime({
                targets: this.header[0],
                top: 0,
                easing: GDS.anim_tf,
                duration: spead,
                begin: function (anim) {
                    _this.status = "pending to open";
                },
                update: function (anim) {
                    if (_this.status !== "pending to open") anim.remove();
                },
                complete: function (anim) {
                    if (_this.status === "pending to open") _this.status = "open";
                },
            });

        await animation.finished; //показываем хедер
    }
    //отпускает вниз и показывает блок хедера

    //поднимает вверх и скрывает блок хедера
    async close(spead = GDS.anim_time) {
        if (this.status === "close" || this.status === "pending to close") return; //если скрыта или в процессе скрытия то не нужно пытаться скрывать снова

        let _this = this,
            animation = anime({
                targets: this.header[0],
                top: "-" + this.get_header_h(),
                easing: GDS.anim_tf,
                duration: spead,
                begin: function (anim) {
                    _this.status = "pending to close"; //вначале анимации задём статус что стрелка в процессе скрытия
                },
                update: function (anim) {
                    if (_this.status !== "pending to close") anim.remove(); //сли в процессе анимации мы замечаем что статус не в процесе скрытия мы завершаем анимацию
                },
                complete: function (anim) {
                    if (_this.status === "pending to close") _this.status = "close";
                },
            });

        await animation.finished; //дожидаемся завершения анимации появления
    }
    //поднимает вверх и скрывает блок хедера

    //функция оправляет сворачиванием и разворачиванием хедера
    async toggle_header() {
        if (GDS.global_interactiv_lock) return; //если заблокированны интерактивные элементы на сайте мы не чего не делаем с хедером

        GDS.scroll_dir === "bottom" && GDS.scrollTop > this.get_header_h() ? await this.close() : await this.open(); //если скролим вниз и высота скрола больше высоты хедера скрываем хедер, в противном случае показываем хедер
    }
    //функция оправляет сворачиванием и разворачиванием хедера
})();

export { Header, Header_Poster, Header_Menu, Header_Toggle_Block, Header_Search };
