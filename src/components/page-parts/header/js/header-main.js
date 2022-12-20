import { show, hide } from '@js-libs/func-kit';
import Overlay from '@overlays-main-js';

import Header_Poster from './header-poster';
import Header_Hidden from './header-hidden';
import Header_Search from './header-search';
import Header_Cart from './header-cart';

let header = qs('header'),
    header_poster = qs('.header-poster'),
    header_background = qs('#header-background'),
    header_visible = qs('.header-visible'),
    header_hidden = qs('.header-hidden'),
    CONTROLLER = {
        status: 'show', //хранит текущее состояние блока хедера, свёрнут он или открыт или в процессе
        lock: false, //польностью блокирует любые действия с хедером
        has_header_poster: header_poster ? true : false, //определяет есть ли в хедере банер
        Overlay: new Overlay({ el: qs('#header-overlay') }), //создаём экземпляр подложки хедера

        //задаёт и управляет доступностью активных элементов в хедере
        active_elements: {
            status_lock: false, //определяет заблокированны активные элементы в хедере или нет
            elements: [
                //все активные эльменты которые есть в хедере
                qs('.header-poster__close>button'),
                qs('.header-visible__burger-button'),
                qs('.header-visible__cart-button'),
                qs('.header-visible__search-button'), //кнопка поиска в хедере
                qs('.header-search__input-control-icons>button'),
                qs('.header-search__close-button'),
                qs('.cart__close-button'),
            ],
            lock: function () {
                //блокирует все интерактывные элемеры в хедере
                if (GDS.win.flicker_active_elements)
                    this.elements.forEach(elem => {
                        if (elem) elem.classList.add('disabled'); //обязательно проверяем существует ли данный элемент, т.к. может оказаться что той же кнопки зарытия банера нет, т.к. самого банера нет
                    }); //помечеам все элементы как отключенные

                this.status_lock = true; //указываем что все элементы успешно заблокированны
            },
            unlock: function () {
                //разблокирует все интерактывные элемеры в хедере
                if (GDS.win.flicker_active_elements)
                    this.elements.forEach(elem => {
                        if (elem) elem.classList.remove('disabled'); //обязательно проверяем существует ли данный элемент, т.к. может оказаться что той же кнопки зарытия банера нет, т.к. самого банера нет
                    }); //помечеам все элементы как активные

                this.status_lock = false; //указываем что все элементы успешно разблокированны
            },
        },
        //задаёт и управляет доступностью активных элементов в хедере

        //функция получае общую высоту постера + видимой части хедера +  скрытой части хедера
        //всё зависит от того что передано
        get_header_h: function (searched_height = {}) {
            searched_height = Object.assign(
                {
                    header_poster: false,
                    header_visible: false,
                    header_hidden: false,
                },
                searched_height,
            ); //получаем те данные которые нужно получить объединов объекты по умолчанию с тем что передал скрипт

            if (searched_height.header_poster === true && this.has_header_poster !== true) searched_height.header_poster = false; //если нужно включить высоту банера, но его нет в документе тогта меняем настрйку на false

            let result = 0;

            if (searched_height.header_poster) {
                let el_h = w.getComputedStyle(header_poster).height;
                result += el_h === 'auto' ? 0 : parseFloat(el_h);
            }

            if (searched_height.header_visible) {
                let el_h = w.getComputedStyle(header_visible).height;
                result += el_h === 'auto' ? 0 : parseFloat(el_h);
            }

            if (searched_height.header_hidden) {
                let el_h = w.getComputedStyle(header_hidden).height;
                result += el_h === 'auto' ? 0 : parseFloat(el_h);
            }

            return result;
        },
        //функция получае общую высоту постера + видимой части хедера +  скрытой части хедера

        //отпускает вниз и показывает блок хедера
        show: function () {
            return show({
                el: header,
                instance: this,
                property: 'translateY',
                value: 0,
                duration: 250,
                started_value: -this.get_header_h({ header_poster: true, header_visible: true }),
            });
        },
        //отпускает вниз и показывает блок хедера

        //поднимает вверх и скрывает блок хедера
        hide: function () {
            return hide({
                el: header,
                instance: this,
                property: 'translateY',
                duration: 250,
                value: -this.get_header_h({ header_poster: true, header_visible: true }),
                started_value: 0,
            });
        },
        //поднимает вверх и скрывает блок хедера

        //функция оправляет сворачиванием и разворачиванием хедера
        toggle_header: async function () {
            if (this.active_elements.status_lock) return; //если в данный момент активные элементы в хедере заблокированны то значит происходят какие-то трансформации которым не нужно мешать

            //если скролим вниз и высота скрола больше высоты хедера скрываем хедер, в противном случае показываем хедер
            GDS.scroll.dir === 'bottom' && GDS.scroll.value > this.get_header_h({ header_poster: true, header_visible: true }) ? await this.hide() : await this.show();
        },
        //функция оправляет сворачиванием и разворачиванием хедера

        init: function () {
            w._on('load', () => setTimeout(() => w._on('scroll_throttle', () => this.toggle_header()), 500)); //скрываем/показываем хедер при прокрутке, добавляем слушатель с задержкой чтоб точно избещать скролов браузера от прокуртки к текущему месту на странице, чтоб меню не скрывалось сразу после загрузки, а было видно

            w._on('resize_optimize', () => {
                this.toggle_header(); //проверяем нужно ли скрыть хедер
                header_background.style.height = `${this.get_header_h({ header_poster: true, header_visible: true })}px`; //пересчитываем высоту фона хедера
            });

            let fifst_child_main = qs('main').children[0]; //первый элемент в блоке main
            if (fifst_child_main) header_background.style.backgroundColor = w.getComputedStyle(fifst_child_main).backgroundColor; //цвет фона хедера берём такой же как и цвет первого блока в теге main
        },
    },
    Header = CONTROLLER; //нужно чтоб имена в экспортах были понятные

CONTROLLER.init(); //выполянем действия необходимые при загрузке модуля

export { Header, Header_Poster, Header_Hidden, Header_Search, Header_Cart };
