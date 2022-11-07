import anime from 'animejs';
import { wait } from '@js-libs/func-kit';
import { Header, Header_Search } from '@header-main-js';

export default new (class {
    //инициализируем кнопку скрола, вычисляем её текущие размеры и позицию, проверяем нужно ли её показать, вычисляем минимальную высоту показа кнопки, добавляем слушатели события на скрол
    constructor() {
        let d = document;
        //записываем все неоходимые переменные для удобства доступа
        this.button = d.querySelector('.scroll-to-top-button'); //кнопка скрола вверх
        this.header = d.getElementsByTagName('header')[0];
        //записываем все неоходимые переменные для удобства доступа

        this.click_lock = false; //если true то будет игнорировать любые нажатия на кнопку
        this.lock = false; //польностью блокирует любые действия с кнопкой
        this.status = 'hide'; //статус кнопки

        this.toggle_show_button(); //проверяем текущуюю позиции кнопки и показываем её если нужно

        [window, this.header].forEach(elem => elem._on('scroll_throttle', this.toggle_show_button.bind(this))); //привязываем отслеживание скрола на окне и на хедере, т.к. как там будет поиск

        window._on('resize_throttle', this.toggle_show_button.bind(this)); //так же проверяем нужно ли показывать кнопку при ресайзе

        this.button._on('click tochend', () => this.scroll_top_action()); //скролим вверх при клике
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
    async show() {
        if (this.lock) throw { ksn_message: 'locked' }; //прерываем если заблокированная любая активность

        if (this.status === 'show') return; //если кнопка уже видна сразу завершаем

        //данное ожидание будет прервано только если кнопка начнёт скрываться
        if (this.status === 'pending to show') return await wait(() => this.status, 'show', { func: () => this.status === 'pending to hide' || this.status === 'hide', message: 'ждали пока Scroll_To_Top_Button станет SHOW но начал скрываться' }); //ждём пока кнопка не станет полностью видимой и только потом завершаем

        this.status = 'pending to show'; //помечаем что кнопка начала показ

        this.button.style.display = 'flex'; //возвращаем кнопку в документ

        let sl = window.getComputedStyle(this.button); //живая колекция стилей кнопки

        await wait(() => sl.display, 'flex', { func: () => this.status !== 'pending to show', message: 'ждали пока Scroll_To_Top_Button станет FLEX но начал скрываться' }); //ждём пока кнопка не станет flex

        this.button.style.opacity = '1'; //делаем кнопку видимой

        await wait(() => sl.opacity, '1', { func: () => this.status !== 'pending to show', message: 'ждали пока Scroll_To_Top_Button станет OPACITY 1 но  начал скрываться' }); //ждём пока кнопка не станет полностью видимой

        this.status = 'show'; //помечаем что кнопка видна
    }
    //плавно показываем кнопку

    //плавно скрываем кнопку
    async hide() {
        if (this.lock) throw { ksn_message: 'locked' }; //прерываем если заблокированная любая активность
        
        if (this.status === 'hide') return; //если кнопка уже скрыта сразу завершаем

        //данное ожидание будет прервано только если кнопка начнёт появляться
        if (this.status === 'pending to hide') return await wait(() => this.status, 'hide', { func: () => this.status === 'pending to show' || this.status === 'show', message: 'ждали пока Scroll_To_Top_Button станет HIDE но начал появляться' }); //ждём пока кнопка не станет полностью скрытой и только потом завершаем

        this.status = 'pending to hide'; //помечаем что кнопка начала скрываться

        this.button.style.opacity = '0'; //делаем кнопку прозрачной

        let sl = window.getComputedStyle(this.button); //живая колекция стилей кнопки

        await wait(() => sl.opacity, '0', { func: () => this.status !== 'pending to hide', message: 'ждали пока Scroll_To_Top_Button станет OPACITY 0 но  начал появляться' }); //ждём пока кнопка не станет полностью прозрачной

        this.button.style.display = ''; //после того как кнопка полностью стала прозрачной убираем её из документа чтоб на неё прозрачную нельзя было кликнуть, т.е. чтоб она не перекрывала контент

        this.status = 'hide'; //помечаем что кнопка скрыта
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
                targets: document.getElementsByTagName('html')[0],
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
