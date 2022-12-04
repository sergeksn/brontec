import { show, hide } from '@js-libs/func-kit';
import Overlay from '@overlays-main-js';

import Header_Poster from './header-poster';
import Header_Hidden from './header-hidden';
import Header_Search from './header-search';
import Header_Cart from './header-cart';

let Header = new (class {
    constructor() {
        //записываем все неоходимые переменные для удобства доступа
        this.header = d.getElementsByTagName('header')[0]; //хедер
        this.header_poster = d.querySelector('.header-poster');
        this.has_header_poster = this.header_poster ? true : false; //определяет есть ли в хедере банер
        this.header_background = d.getElementById('header-background');
        this.header_visible = d.querySelector('.header-visible');
        this.header_hidden = d.querySelector('.header-hidden');
        //записываем все неоходимые переменные для удобства доступа

        this.Overlay = new Overlay({ el: d.getElementById('header-overlay') }); //создаём экземпляр подложки хедера

        this.lock = false; //польностью блокирует любые действия с хедером
        this.status = 'show'; //хранит текущее состояние блока хедера, свёрнут он или открыт или в процессе

        this.header_active_elements_set_data(); //задаёт и управляет доступностью активных элементов в хедере

        w.addEventListener('load', () => setTimeout(() => w._on('scroll_throttle', () => this.toggle_header()), 500)); //скрываем/показываем хедер при прокрутке, добавляем слушатель с задержкой чтоб точно избещать скролов браузера от прокуртки к текущему месту на странице, чтоб меню не скрывалось сразу после закгрузки, а было видно

        w._on('resize_optimize', () => {
            this.toggle_header(); //проверяем нужно ли скрыть хедер
            this.header_background.style.height = `${this.get_header_h({ header_poster: true, header_visible: true })}px`; //пересчитываем высоту фона хедера
        });
    }

    //устанавливает список активных элементов и функции их включени/отключения
    header_active_elements_set_data() {
        this.active_elements = {
            status_lock: false, //определяет заблокированны активные элементы в хедере или нет
            elements: [
                //все активные эльменты которые есть в хедере
                d.querySelector('.header-poster__close>button'),
                d.querySelector('.header-visible__burger-button'),
                d.querySelector('.header-visible__cart-button'),
                d.querySelector('.header-visible__search-button'), //кнопка поиска в хедере
                d.querySelector('.header-search__input-control-icons>button'),
                d.querySelector('.header-search__close-button'),
                d.querySelector('.cart__close-button'),
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
        };
    }
    //устанавливает список активных элементов и функции их включени/отключения

    //функция получае общую высоту постера + видимой части хедера +  скрытой части хедера
    //всё зависит от того что передано
    get_header_h(searched_height = {}) {
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

        for (let el in searched_height) {
            if (searched_height[el]) {
                //если нужно получить высоту текущего элемента
                let el_h = w.getComputedStyle(this[el]).height; //получаем высоту
                if (el_h === 'auto') continue; //auto высота только если блок скрыт, в этом случаем мы пропускае его добавление в итоговую высоту
                result += parseFloat(el_h); //добавляем высоту в результат
            }
        }

        return result;
    }
    //функция получае общую высоту постера + видимой части хедера +  скрытой части хедера

    //отпускает вниз и показывает блок хедера
    show() {
        return show.call(this, {
            el: this.header,
            property: 'translateY',
            value: 0,
            started_value: -this.get_header_h({ header_poster: true, header_visible: true }),
            display: null,
        });
    }
    //отпускает вниз и показывает блок хедера

    //поднимает вверх и скрывает блок хедера
    hide() {
        return hide.call(this, {
            el: this.header,
            property: 'translateY',
            value: -this.get_header_h({ header_poster: true, header_visible: true }),
            started_value: 0,
            display: null,
        });
    }
    //поднимает вверх и скрывает блок хедера

    //функция оправляет сворачиванием и разворачиванием хедера
    async toggle_header() {
        if (this.active_elements.status_lock) return; //если в данный момент активные элементы в хедере заблокированны то значит происходят какие-то трансформации которым не нужно мешать

        if (this.lock) return; //прерываем если заблокированная любая активность

        try {
            //если скролим вниз и высота скрола больше высоты хедера скрываем хедер, в противном случае показываем хедер
            if (GDS.scroll.dir === 'bottom' && GDS.scroll.value > this.get_header_h({ header_poster: true, header_visible: true })) {
                if (this.status !== 'pending to hide' && this.status !== 'hide') await this.hide();
            } else {
                if (this.status !== 'pending to show' && this.status !== 'show') await this.show();
            }
        } catch (e) {
            if (typeof e.ksn_message === 'undefined') console.error(e);
        }
    }
    //функция оправляет сворачиванием и разворачиванием хедера
})();

export { Header, Header_Poster, Header_Hidden, Header_Search, Header_Cart };
