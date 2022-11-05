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

        //после того как переход transition с прозрачность в кнопке скрола вверх завершится
        this.button.addEventListener('transitionend', e => {
            if (e.propertyName !== 'opacity') return; //если произошёл любой другой переход кроме прозрачности прерываем функцию
            this.status = this.status === 'pending to show' ? 'show' : 'hide'; //устанавливаем статус видимости кнопки
            if (this.status === 'hide') this.button.style.display = ''; //если кнопка была скрыта то скрываем её в документе, чтоб на неё прозрачную нельзя было навестись и она не мешала
        });
        //после того как переход transition с прозрачность в кнопке скрола вверх завершится
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

        let sl = window.getComputedStyle(this.button);

        await wait(() => sl.display, 'flex', { func: () => this.status !== 'pending to show' })
            .then(() => (this.button.style.opacity = '1')) //если всё хорошо меняем прозрачность кнопки
            .catch(() => {}); //функция будет прервана если вдруг за время ожидания кнопка скрола вверх начала скрываться т.е. её статус видимости уже не  'pending to show'
    }
    //плавно показываем кнопку

    //плавно скрываем кнопку
    async hide() {
        if (this.status === 'hide' || this.status === 'pending to hide') return;

        this.status = 'pending to hide';

        this.button.style.opacity = '0';
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
