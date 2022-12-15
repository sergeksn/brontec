import { anime, show, hide } from '@js-libs/func-kit';
import { Header, Header_Search } from '@header-main-js';

let button = qs('.scroll-to-top-button'),
    header = qs('header'),
    CONTROLLER = {
        click_lock: false, //если true то будет игнорировать любые нажатия на кнопку
        lock: false, //польностью блокирует любые действия с кнопкой
        status: 'hide', //статус кнопки

        //показываем или скрываем кнопку в зависимости от текущейго занчения прокрутки страницы, т.е. как далеко вниз мы прокрутили
        toggle_show_button: async function () {
            if (this.lock) return; //прерываем если заблокированная любая активность

            if (GDS.scroll.value > GDS.scroll.min_distans) {
                if (this.status !== 'pending to show' && this.status !== 'show') await this.show();
            } else {
                if (this.status !== 'pending to hide' && this.status !== 'hide') await this.hide();
            }
        },
        //показываем или скрываем кнопку в зависимости от текущейго занчения прокрутки страницы, т.е. как далеко вниз мы прокрутили

        //плавно показываем кнопку
        show: function () {
            return show({
                el: button,
                instance: this,
                duration: 200,
            });
        },
        //плавно показываем кнопку

        //плавно скрываем кнопку
        hide: function () {
            return hide({
                el: button,
                instance: this,
                duration: 200,
            });
        },
        //плавно скрываем кнопку

        //проскролит вверх после нажатия на кнопку
        scroll_top_action: async function () {
            if (this.lock) return; //прерываем если заблокированная любая активность

            if (this.click_lock) return; //прерываем если заблокированны нажатия на кнопку

            this.click_lock = true; //блокируем нажатие на кнопку

            //если открыт блок с результатами поиска
            if (Header_Search.status === 'open') {
                await anime({
                    targets: header,
                    easing: GDS.scroll.anim_tf,
                    duration: GDS.scroll.time,
                    scrollTop: 0,
                }).finished; //дожидаемся завершения прокрутки
            }
            //если открыт блок с результатами поиска
            else {
                await anime({
                    targets: qs('html'),
                    easing: GDS.scroll.anim_tf,
                    duration: GDS.scroll.time,
                    scrollTop: 0,
                    begin: function () {
                        //НЕ ЗАБЫТЬ ДОБАВИТЬ ОТБРАБОТКУ ИСКЛЮЧЕНИЙ!
                        Header.show();
                    },
                }).finished;
            }

            this.click_lock = false; //разблокируем нажатие на кнопку
        },
        //проскролит вверх после нажатия на кнопку

        init: function () {
            this.toggle_show_button(); //проверяем текущуюю позиции кнопки и показываем её если нужно

            [w, header].forEach(elem => elem._on('scroll_throttle', this.toggle_show_button.bind(this))); //привязываем отслеживание скрола на окне и на хедере, т.к. как там будет поиск

            w._on('resize_throttle', this.toggle_show_button.bind(this)); //так же проверяем нужно ли показывать кнопку при ресайзе

            button._on('click', () => this.scroll_top_action()); //скролим вверх при клике
        },
    };

CONTROLLER.init(); //выполянем действия необходимые при загрузке модуля

export default CONTROLLER;
