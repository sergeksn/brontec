import { show, hide } from '@js-libs/func-kit';
import Overlay from '@overlays-main-js';

export default class {
    //data - объект с данными для сообщения
    //fast_show - если true то сообщени будет сразу показано
    constructor(data, fast_show = true) {
        //создаём структуру окна и вставляем данные
        let wrap = d.createDocumentFragment(),
            overlay = d.querySelector('#pop-up-message-overlay'); //будет содержать элемент подложки или null

        if (d.querySelector('.pop-up-message--fatal-error')) return; //если уже есть критическая ошибка далее ничего не выводим

        this.is_fatal = data.type === 'fatal-error' || false; //определяет фатльная ошибка или нет
        this.body = d.body;

        this.pop_up = d.createElement('div');
        this.close_button = this.is_fatal ? '' : d.createElement('button'); //если ошибка фатальная то кнопку закрытия мы не показываем
        this.content_wrap = d.createElement('div');
        this.title = d.createElement('div');
        this.text_block = d.createElement('div');

        this.pop_up.append(this.close_button, this.content_wrap);
        this.content_wrap.append(this.title, this.text_block);
        this.title.innerHTML = `<span class="icon--${this.is_fatal ? 'error' : data.type}"></span>${data.title}`;
        this.text_block.innerHTML = data.message;
        wrap.append(this.pop_up);

        //создаём или записываем уже имеющуюся подложку
        if (!overlay) {
            this.overlay = d.createElement('div');
            wrap.append(this.overlay);
            this.overlay.id = 'pop-up-message-overlay';
            this.overlay.classList.add('overlay');
            this.overlay.overlay_controler = new Overlay({ el: this.overlay, show_v: 0.5 }); //при первом создании записываем в свойста элемента подложки её контролер
        } else {
            this.overlay = overlay;
        }
        //создаём или записываем уже имеющуюся подложку

        this.pop_up.classList.add('pop-up-message', 'pop-up-message--' + data.type, 'custom-scrollbar');
        this.content_wrap.classList.add('pop-up-message__content-wrap');
        !this.is_fatal && this.close_button.classList.add('pop-up-message__close-button', 'icon--close'); //если ошибка фатальная то кнопки не будет
        this.title.classList.add('pop-up-message__title');
        this.text_block.classList.add('pop-up-message__text');

        this.body.append(wrap);
        //создаём структуру окна и вставляем данные

        this.status = 'hide';
        this.lock = false; //польностью блокирует любые действия с данным блоком сообщения

        !this.is_fatal && this.close_button.addEventListener('click', this.close_window_message.bind(this)); //закрываем окно сообщения по клику на кнопку закрытия, если она есть

        fast_show && this.show(); //если true то сообщени будет сразу показано
    }

    //клик по кнопке закрытия сообщения
    close_window_message() {
        let full_close = d.querySelectorAll('.pop-up-message').length < 2; //полностью закрываем все элементы вплывающего сообщения или нет, если сообщений больше чем одно то при закрытии одного (если оно не критическое) не нужно скрывать подложку и разблокировать прокрутку

        full_close && this.overlay.overlay_controler.hide(); //если активных окон сейчас меньше 2-х то скрываем и подложку

        this.hide(full_close); //скрываем сообщение

        this.pop_up.remove(); //удаляем сообщение
    }
    //клик по кнопке закрытия сообщения

    //показывыаем блок сообщения
    async show() {
        this.body.classList.add('lock-scroll'); //блокируем прокрутку документа
        let opacity;

        if (this.is_fatal) {
            //если ошибка критическая делаем подложку не прозрачной и меняем статус видимости подложки что ещё раз её показать но уже сделать полностью непрозрачной
            opacity = 1;
            this.overlay.overlay_controler.status = null;
        }

        await Promise.all([
            this.overlay.overlay_controler.show({ show_v: opacity }), //показываем подложку
            show({
                //показываем блок сообщения
                el: this.pop_up,
                instance: this,
            }),
        ]);

        if (this.is_fatal) this.overlay.overlay_controler.lock = true;// если фатальная ошибка после показа сообщени и подложки блокируем подложку
    }
    //показывыаем блок сообщения

    //скрываем блок сообщения
    async hide(unlock = true) {
        await hide({
            //скрываем блок сообщения
            el: this.pop_up,
            instance: this,
        });

        unlock && this.body.classList.remove('lock-scroll'); //разблокируем прокрутку документа
    }
    //скрываем блок сообщения
}
