import { anime, show, hide } from '@js-libs/func-kit';
import { Header, Header_Search } from '@header-main-js';

export default new (class {
    //инициализируем кнопку скрола, вычисляем её текущие размеры и позицию, проверяем нужно ли её показать, вычисляем минимальную высоту показа кнопки, добавляем слушатели события на скрол
    constructor() {
        //записываем все неоходимые переменные для удобства доступа
        this.button = d.querySelector('.scroll-to-top-button'); //кнопка скрола вверх
        this.header = d.getElementsByTagName('header')[0];
        //записываем все неоходимые переменные для удобства доступа

        this.click_lock = false; //если true то будет игнорировать любые нажатия на кнопку
        this.lock = false; //польностью блокирует любые действия с кнопкой
        this.status = 'hide'; //статус кнопки

        this.toggle_show_button(); //проверяем текущуюю позиции кнопки и показываем её если нужно

        [w, this.header].forEach(elem => elem._on('scroll_throttle', this.toggle_show_button.bind(this))); //привязываем отслеживание скрола на окне и на хедере, т.к. как там будет поиск

        w._on('resize_throttle', this.toggle_show_button.bind(this)); //так же проверяем нужно ли показывать кнопку при ресайзе

        this.button._on('click', () => this.scroll_top_action()); //скролим вверх при клике
    }
    //инициализируем кнопку скрола, вычисляем её текущие размеры и позицию, проверяем нужно ли её показать, вычисляем минимальную высоту показа кнопки, добавляем слушатели события на скрол

    //показываем или скрываем кнопку в зависимости от текущейго занчения прокрутки страницы, т.е. как далеко вниз мы прокрутили
    async toggle_show_button() {
        if (this.lock) return; //прерываем если заблокированная любая активность

        try {
            if (GDS.scroll.value > GDS.scroll.min_distans) {
                if (this.status !== 'pending to show' && this.status !== 'show') await this.show();
            } else {
                if (this.status !== 'pending to hide' && this.status !== 'hide') await this.hide();
            }
        } catch (e) {
            if (typeof e.ksn_message === 'undefined') console.error(e);
        }
    }
    //показываем или скрываем кнопку в зависимости от текущейго занчения прокрутки страницы, т.е. как далеко вниз мы прокрутили

    //плавно показываем кнопку
    show() {
        return show({
            el: this.button,
            instance: this,
        });
    }
    //плавно показываем кнопку

    //плавно скрываем кнопку
    hide() {
        return hide({
            el: this.button,
            instance: this,
        });
    }
    //плавно скрываем кнопку

    //проскролит вверх после нажатия на кнопку
    async scroll_top_action() {
        if (this.lock) return; //прерываем если заблокированная любая активность

        if (this.click_lock) return; //прерываем если заблокированны нажатия на кнопку

        this.click_lock = true; //блокируем нажатие на кнопку

        //если открыт блок с результатами поиска
        if (Header_Search.status === 'open') {
            await anime({
                targets: this.header,
                easing: GDS.scroll.anim_tf,
                duration: GDS.scroll.time,
                scrollTop: 0,
            }).finished; //дожидаемся завершения прокрутки
        }
        //если открыт блок с результатами поиска
        else {
            await anime({
                targets: d.getElementsByTagName('html')[0],
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
    }
    //проскролит вверх после нажатия на кнопку
})();
