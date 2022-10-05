import anime from "./../base_func/anime.js";
import Header_Search_Block from "./header_search.js";
import Header from "./header.js";

export default new class {

    //pending to hide - в процессе скрытия
    //hide - скрыто
    //pending to show - в процессе появления
    //show - видно
    status = "hide"

    scroll_top_button = $(".scroll_to_top_wrapper") //оболочка кнопки скрола вверх

    time_for_scroll = 500 //время для анимации прокрутки в мс

    min_scroll_to_show_button_distans = Math.round(GDS.win_height * 0.7) > 500 ? Math.round(GDS.win_height * 0.7) : 500 //если 75% высоты экрана больше чем 500 то используем их как минимальную дистанцию скрола, иначеи используем 500

    //инициализируем кнопку скрола, вычисляем её текущие размеры и позицию, проверяем нужно ли её показать, вычисляем минимальную высоту показа кнопки, добавляем слушатели события на скрол
    constructor() {
        this.toggle_show_button(); //проверяем текущуюю позиции кнопки и показываем её если нужно

        //привязываем отслеживание скрола на окне и на хедере, т.к. как там будет поиск
        GDS.header_scroll_wrap.add(GDS.body_scroll_wrap).on({
            events: "scroll_throttle",
            callback: this.toggle_show_button.bind(this),
            custom_settings: {
                interval: GDS.trotling
            }
        });
        //привязываем отслеживание скрола на окне и на хедере, т.к. как там будет поиск

        $(window).on({
            events: "resize_optimize",
            callback: this.toggle_show_button.bind(this)
        }); //так же проверяем нужно ли показывать кнопку при ресайзе

        this.scroll_top_button.on({
            events: "click tochend",
            callback: this.scroll_top_action.bind(this)
        }); //скролим вверх при клике
    }
    //инициализируем кнопку скрола, вычисляем её текущие размеры и позицию, проверяем нужно ли её показать, вычисляем минимальную высоту показа кнопки, добавляем слушатели события на скрол

    async toggle_show_button() {
        GDS.scrollTop > this.min_scroll_to_show_button_distans ? await this.show() : await this.hide();
    }

    //плавно показываем кнопку
    async show(spead = GDS.anim_time) {
        if (this.status === "show" || this.status === "pending to show") return; //если видна или в процессе показа то не нужно снова начинать показывать

        let _this = this,
            animation = anime({
                targets: this.scroll_top_button[0],
                opacity: 1,
                easing: GDS.anim_tf,
                duration: spead,
                begin: function(anim) {
                    _this.status = "pending to show";
                    _this.scroll_top_button.css("display", "flex"); //добаляем в документ
                },
                update: function(anim) {
                    if (_this.status !== "pending to show") anim.remove();
                },
                complete: function(anim) {
                    if (_this.status === "pending to show") _this.status = "show";
                }
            });

        await animation.finished; //дожидаемся завершения анимации появления
    }
    //плавно показываем кнопку

    //плавно скрываем кнопку
    async hide(spead = GDS.anim_time) {
        if (this.status === "hide" || this.status === "pending to hide") return; //если скрыта или в процессе скрытия то не нужно пытаться скрывать снова

        let _this = this,
            animation = anime({
                targets: this.scroll_top_button[0],
                opacity: 0,
                easing: GDS.anim_tf,
                duration: spead,
                begin: function(anim) {
                    _this.status = "pending to hide"; //вначале анимации задём статус что стрелка в процессе скрытия
                },
                update: function(anim) {
                    if (_this.status !== "pending to hide") anim.remove(); //сли в процессе анимации мы замечаем что статус не в процесе скрытия мы завершаем анимацию
                },
                complete: function(anim) {
                    if (_this.status === "pending to hide") { //после завершения анимации мы смотрим какой был статус стрелки в момент завершения анимации и если он был в процессе сокрытия то убираем стрелку из  документа и ставим её статус скрыта
                        _this.scroll_top_button.css("display", "");
                        _this.status = "hide";
                    }
                }
            });

        await animation.finished; //дожидаемся завершения анимации появления
    }
    //плавно скрываем кнопку

    //проскролит вверх после нажатия на кнопку
    async scroll_top_action() {
        //ПРИМЕЧАНИЕ: если блокировать интерактивные элементы то хедер появится в самом конце что не очень красиво
        if (GDS.global_interactiv_lock) return; //если кнопка заблокирована не начинам прокрутку

        GDS.lock_all_interactive(); //блокируем кнопку

        //если открыт блок с результатами поиска
        if (Header_Search_Block.status === "open") {
            await anime({
                targets: GDS.header_scroll_wrap[0],
                easing: 'linear',
                duration: this.time_for_scroll,
                scrollTop: 0
            }).finished; //дожидаемся завершения прокрутки
        }
        //если открыт блок с результатами поиска
        else {
            await anime({
                targets: GDS.body_scroll_wrap[0],
                easing: 'linear',
                duration: this.time_for_scroll,
                scrollTop: 0,
                begin: function() {
                    Header.open();
                }
            }).finished;
        }

        GDS.unlock_all_interactive(); //разблокируем кнопку
    }
    //проскролит вверх после нажатия на кнопку
};