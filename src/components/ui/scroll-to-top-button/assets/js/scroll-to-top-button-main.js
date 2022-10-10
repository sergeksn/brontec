import anime from "@js-base-func/anime.js";
//import Header_Search_Block from "./header-search.js";
import Header from "@header-main-js";

export default new (class {
    //hide - скрыто
    //show - видно
    status = "hide";

    //инициализируем кнопку скрола, вычисляем её текущие размеры и позицию, проверяем нужно ли её показать, вычисляем минимальную высоту показа кнопки, добавляем слушатели события на скрол
    constructor() {
        //записываем все неоходимые переменные для удобства доступа
        this.button = document.querySelector(".scroll_to_top_button"); //кнопка скрола вверх
        this.header = document.getElementsByTagName("header");
        //записываем все неоходимые переменные для удобства доступа

        this.toggle_show_button(); //проверяем текущуюю позиции кнопки и показываем её если нужно

        [window, this.header].forEach(elem => elem._on("scroll_throttle", this.toggle_show_button.bind(this))); //привязываем отслеживание скрола на окне и на хедере, т.к. как там будет поиск

        window._on("resize_optimize", this.toggle_show_button.bind(this)); //так же проверяем нужно ли показывать кнопку при ресайзе

        this.button._on("click tochend", this.scroll_top_action.bind(this)); //скролим вверх при клике
    }
    //инициализируем кнопку скрола, вычисляем её текущие размеры и позицию, проверяем нужно ли её показать, вычисляем минимальную высоту показа кнопки, добавляем слушатели события на скрол

    toggle_show_button() {
        GDS.scroll.value > GDS.scroll.min_distans ? this.show() : this.hide();
    }

    //плавно показываем кнопку
    show() {
        if (this.status === "show") return;

        this.status = "show";

        clearTimeout(this.button.hide_timer); //удаляем возможную функцию таймаута которая должна скрыть кнопку

        this.button.style.cssText = "x-index:-1; opacity:1;"; //показываем кнопку
    }
    //плавно показываем кнопку

    //плавно скрываем кнопку
    hide() {
        if (this.status === "hide") return;

        this.status = "hide";

        this.button.style.opacity = "0"; //скрываем кнопку

        //сохраняем id этого таймаута в свойтсва dom элеманта кнопки для того чтоб в случае необходимости можно было его удалить и предотвратить мигание кноки при запоздалом выолнении таймаута с сокрытием когда кнопка запрошена к показу
        this.button.hide_timer = setTimeout(() => {
            this.button.style.zIndex = "-1"; //если таймаут не был удалён, т.е. кнопка не была запрошена к показу, то прячем кнопку с помощью z-index чтоб на неё нельяз было навестить когда она невидимая
        }, GDS.scroll.time);
    }
    //плавно скрываем кнопку

    //проскролит вверх после нажатия на кнопку
    async scroll_top_action() {
        //ПРИМЕЧАНИЕ: если блокировать интерактивные элементы то хедер появится в самом конце что не очень красиво
        if (GDS.win.interact_elems.status_lock) return; //если кнопка заблокирована не начинам прокрутку

        GDS.win.interact_elems.lock(); //блокируем кнопку

        //если открыт блок с результатами поиска
        if (Header_Search_Block.status === "open") {
            await anime({
                targets: this.header[0],
                easing: "linear",
                duration: GDS.scroll.time,
                scrollTop: 0,
            }).finished; //дожидаемся завершения прокрутки
        }
        //если открыт блок с результатами поиска
        else {
            await anime({
                targets: document.getElementsByTagName("html")[0],
                easing: "linear",
                duration: GDS.scroll.time,
                scrollTop: 0,
                begin: function () {
                    Header.open();
                },
            }).finished;
        }

        GDS.win.interact_elems.unlock(); //разблокируем кнопку
    }
    //проскролит вверх после нажатия на кнопку
})();
