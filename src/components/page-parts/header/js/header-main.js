import { wait, get_translate } from '@js-libs/func-kit';

import Header_Poster from './header-poster';
import Header_Hidden from './header-hidden';
import Header_Search from './header-search';

import Pop_Up_Message from '@pop-up-messages-main-js';

console.log(
    new Pop_Up_Message({
        title: "Заголовок сообщения нескольок слов",
        message: 'Текст сообщения',
        type: 'warning',
        lock_document: false,
    }),
);

let Header = new (class {
    constructor() {
        let d = document;
        //записываем все неоходимые переменные для удобства доступа
        this.header = d.getElementsByTagName('header')[0]; //хедер
        this.header_poster = d.querySelector('.header-poster');
        this.has_header_poster = this.header_poster ? true : false; //определяет есть ли в хедере банер
        this.header_background = d.getElementById('header-background');
        this.header_visible = d.querySelector('.header-visible');
        this.header_hidden = d.querySelector('.header-hidden');
        //записываем все неоходимые переменные для удобства доступа

        this.lock = false; //польностью блокирует любые действия с хедером
        this.status = 'show'; //хранит текущее состояние блока хедера, свёрнут он или открыт или в процессе

        this.header_active_elements_set_data(); //задаёт и управляет доступностью активных элементов в хедере

        window.addEventListener('load', () => setTimeout(() => window._on('scroll_throttle', () => this.toggle_header()), 500)); //скрываем/показываем хедер при прокрутке, добавляем слушатель с задержкой чтоб точно избещать скролов браузера от прокуртки к текущему месту на странице, чтоб меню не скрывалось сразу после закгрузки, а было видно

        window._on('resize_optimize', () => {
            this.toggle_header(); //проверяем нужно ли скрыть хедер
            this.header_background.style.height = `${this.get_header_h({ header_poster: this.has_header_poster, header_visible: true })}px`; //пересчитываем высоту фона хедера
        });
    }

    //устанавливает список активных элементов и функции их включени/отключения
    header_active_elements_set_data() {
        let d = document;
        this.active_elements = {
            status_lock: false, //определяет заблокированны активные элементы в хедере или нет
            elements: [
                //все активные эльменты которые есть в хедере
                d.querySelector('.header-poster__close>button'),
                d.querySelector('.header-visible__burger>button'),
                d.querySelector('.header-visible__cart-button>button'),
                d.querySelector('.header-visible__search-button>button'),
                d.querySelector('.header-search__close-button'),
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

        let result = 0;

        for (let el in searched_height) {
            if (searched_height[el]) {
                //если нужно получить высоту текущего элемента
                let el_h = window.getComputedStyle(this[el]).height; //получаем высоту
                if (el_h === 'auto') continue; //auto высота только если блок скрыт, в этом случаем мы пропускае его добавление в итоговую высоту
                result += +el_h.replace('px', ''); //добавляем высоту в результат
            }
        }

        return result;
    }
    //функция получае общую высоту постера + видимой части хедера +  скрытой части хедера

    //отпускает вниз и показывает блок хедера
    async show() {
        if (this.lock) throw { ksn_message: 'locked' }; //прерываем если заблокированная любая активность

        if (this.status === 'show') return; //если хедер уже видн сразу завершаем

        //данное ожидание будет прервано только если хедер начнёт скрываться
        if (this.status === 'pending to show') return await wait(() => this.status, 'show', { func: () => this.status === 'pending to hide' || this.status === 'hide', message: 'ждали пока HEADER станет SHOW, но HEADER начал скрываться' }); //ждём пока хедер полностью не покажется и только потом завершаем

        this.status = 'pending to show'; //помечаем что начал показываться

        let sl = window.getComputedStyle(this.header); //живая колекция стилей хедера

        this.header.style.transform = 'translateY(0)'; //начинаем показывать хедер опуская его

        await wait(() => get_translate(sl).y, 0, { func: () => this.status !== 'pending to show', message: 'ждали когда HEADER появится опустившись вниз, но HEADER начал скрываться поднимаясь вверх' }); //дожидаемся полного показа хедера, когда он полностью опустится

        this.status = 'show'; //помечаем что полность виден
    }
    //отпускает вниз и показывает блок хедера

    //поднимает вверх и скрывает блок хедера
    async hide() {
        if (this.lock) throw { ksn_message: 'locked' }; //прерываем если заблокированная любая активность

        if (this.status === 'hide') return; //если хедер уже скрыт сразу завершаем

        //данное ожидание будет прервано только если хедер начнёт появляться
        if (this.status === 'pending to hide') return await wait(() => this.status, 'hide', { func: () => this.status === 'pending to show' || this.status === 'show', message: 'ждали пока HEADER станет HIDE, но HEADER начал появляться' }); //ждём пока хедер полностью скроется и только потом завершаем

        this.status = 'pending to hide'; //помечаем что начал скрываться

        let y = this.get_header_h({ header_poster: this.has_header_poster, header_visible: true }).toFixed(3), //ВАЖНО: откруглять до 3-х знаков после запятой так как матрикс не выводит более 3-х знаков после запятой, а нам нужно сравнивать эти числа
            sl = window.getComputedStyle(this.header); //живая колекция стилей хедера

        this.header.style.transform = `translateY(-${y}px)`; //начинаем поднимать хедер вверх

        await wait(() => get_translate(sl).y, -y, { func: () => this.status !== 'pending to hide', message: 'ждали когда HEADER скроется вверх, но HEADER начал показываться опускаясь вниз' }); //дожидаемся полного скрытия хедера вверх

        this.status = 'hide'; //помечаем что скрыт
    }
    //поднимает вверх и скрывает блок хедера

    //функция оправляет сворачиванием и разворачиванием хедера
    async toggle_header() {
        if (this.active_elements.status_lock) return; //если в данный момент активные элементы в хедере заблокированны то значит происходят какие-то трансформации которым не нужно мешать

        if (this.lock) return; //прерываем если заблокированная любая активность

        try {
            //если скролим вниз и высота скрола больше высоты хедера скрываем хедер, в противном случае показываем хедер
            if (GDS.scroll.dir === 'bottom' && GDS.scroll.value > this.get_header_h({ header_poster: this.has_header_poster, header_visible: true })) {
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

export { Header, Header_Poster, Header_Hidden, Header_Search };
