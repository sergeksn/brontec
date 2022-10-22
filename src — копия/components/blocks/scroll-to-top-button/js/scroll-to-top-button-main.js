import anime from 'animejs/lib/anime.es.js';
import { wait } from '@js-libs/func-kit';
import { Header, Header_Search } from '@header-main-js';

export default new (class {
    //hide - скрыто
    //show - видно
    status = 'hide';

    lock = false;

    //инициализируем кнопку скрола, вычисляем её текущие размеры и позицию, проверяем нужно ли её показать, вычисляем минимальную высоту показа кнопки, добавляем слушатели события на скрол
    constructor() {
        //записываем все неоходимые переменные для удобства доступа
        this.button = document.querySelector('.scroll-to-top-button'); //кнопка скрола вверх
        this.header = document.getElementsByTagName('header')[0];
        //записываем все неоходимые переменные для удобства доступа

        this.toggle_show_button(); //проверяем текущуюю позиции кнопки и показываем её если нужно

        [window, this.header].forEach(elem => elem._on('scroll_throttle', this.toggle_show_button.bind(this))); //привязываем отслеживание скрола на окне и на хедере, т.к. как там будет поиск

        window._on('resize_optimize', this.toggle_show_button.bind(this)); //так же проверяем нужно ли показывать кнопку при ресайзе

        this.button._on('click tochend', this.scroll_top_action.bind(this)); //скролим вверх при клике
    }
    //инициализируем кнопку скрола, вычисляем её текущие размеры и позицию, проверяем нужно ли её показать, вычисляем минимальную высоту показа кнопки, добавляем слушатели события на скрол

    async toggle_show_button() {
        GDS.scroll.value > GDS.scroll.min_distans ? await this.show() : await this.hide();
    }

    //плавно показываем кнопку
    async show() {
        if (this.status === 'show' || this.status === 'pending to show') return;

        this.status = 'pending to show';

        this.button.style.display = 'flex';

        let style_list = window.getComputedStyle(this.button);

        await wait(() => style_list.display, 'flex', { value: 'sttb-toggle-vs' }) //нужно добалять т.к. свойство display применяя одновременно с opacity не сработает как нужно, т.к. применятся одновременно, а нам нужно по очереди чтоб было плавное появление через transition
            .then(async () => {
                this.button.style.opacity = '1';

                await wait(() => style_list.opacity, '1', { value: 'sttb-toggle-vs' })
                    .then(() => {
                        this.status = 'show';
                    })
                    .catch(() => {});
            })
            .catch(() => {});
    }
    //плавно показываем кнопку

    //плавно скрываем кнопку
    async hide() {
        if (this.status === 'hide' || this.status === 'pending to hide') return;

        this.status = 'pending to hide';

        let style_list = window.getComputedStyle(this.button);

        this.button.style.opacity = '0';

        await wait(() => style_list.opacity, '0', { value: 'sttb-toggle-vs' })
            .then(() => {
                this.button.style.display = '';
                this.status = 'hide';
            })
            .catch(() => {});
    }
    //плавно скрываем кнопку

    //проскролит вверх после нажатия на кнопку
    async scroll_top_action() {
        //ПРИМЕЧАНИЕ: если блокировать интерактивные элементы то хедер появится в самом конце что не очень красиво
        if (this.lock) return; //если кнопка заблокирована не начинам прокрутку

        this.lock = true; //блокируем кнопку

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
                targets: document.getElementsByTagName('html')[0],
                easing: GDS.scroll.anim_tf,
                duration: GDS.scroll.time,
                scrollTop: 0,
                begin: function () {
                    Header.show();
                },
            }).finished;
        }

        this.lock = false; //разблокируем кнопку
    }
    //проскролит вверх после нажатия на кнопку
})();
