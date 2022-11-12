export default class {
    constructor(data) {
        //создаём структуру окна и вставляем данные
        let d = document,
            body = d.body,
            wrap = d.createDocumentFragment();

        this.pop_up = d.createElement('div');
        this.close_button = d.createElement('button');
        this.title = d.createElement('div');
        this.text_block = d.createElement('div');

        this.pop_up.append(this.close_button, this.title, this.text_block);
        this.title.innerHTML = `<span class="icon--${data.type}"></span>${data.title}`;
        this.text_block.innerHTML = data.message;
        wrap.append(this.pop_up);

        if (!d.querySelector('#pop-up-message-overlay')) {
            this.overlay = d.createElement('div');
            wrap.append(this.overlay);
            this.overlay.id = 'pop-up-message-overlay';
        }

        this.pop_up.classList.add('pop-up-message', 'pop-up-message--' + data.type);
        this.close_button.classList.add('pop-up-message__close-button', 'icon--close');
        this.title.classList.add('pop-up-message__title');
        this.text_block.classList.add('pop-up-message__text');

        body.append(wrap);
        //создаём структуру окна и вставляем данные

        this.status = 'hide';
        this.lock = false; //польностью блокирует любые действия с данным блоком сообщения
    }

    //показывыаем блок сообщения
    async show() {
        if (this.lock) throw { ksn_message: 'locked' }; //прерываем если заблокированная любая активность

        if (this.status === 'show') return; //если подложка уже видна сразу завершаем

        //данное ожидание будет прервано только если подложка начнёт скрываться
        if (this.status === 'pending to show') return await wait(() => this.status, 'show', { func: () => this.status === 'pending to hide' || this.status === 'hide', message: 'ждали пока ' + this.track + ' станет SHOW но начал скрываться' }); //ждём пока подложка не станет полностью видимой и только потом завершаем

        this.status = 'pending to show'; //помечаем что подложка начала показ

        this.overlay.style.display = 'block'; //возвращаем подложку в документ

        let sl = window.getComputedStyle(this.overlay); //живая колекция стилей подложки

        await wait(() => sl.display, 'block', { func: () => this.status !== 'pending to show', message: 'ждали пока ' + this.track + ' станет BLOCK но начал скрываться' }); //ждём пока подложка не станет block

        this.overlay.style.opacity = '1'; //делаем подложку видимой

        await wait(() => sl.opacity, '1', { func: () => this.status !== 'pending to show', message: 'ждали пока ' + this.track + ' станет OPACITY 0.9 но  начал скрываться' }); //ждём пока подложка не станет видимой на 0.9

        this.status = 'show'; //помечаем что подложка видна
    }
    //показывыаем блок сообщения

    //скрываем блок сообщения
    async hide() {
        if (this.lock) throw { ksn_message: 'locked' }; //прерываем если заблокированная любая активность

        if (this.status === 'hide') return; //если подложка уже скрыта сразу завершаем

        //данное ожидание будет прервано только если подложка начнёт появляться
        if (this.status === 'pending to hide') return await wait(() => this.status, 'hide', { func: () => this.status === 'pending to show' || this.status === 'show', message: 'ждали пока ' + this.track + ' станет HIDE но начал появляться' }); //ждём пока кнопка не станет полностью скрытой и только потом завершаем

        this.status = 'pending to hide'; //помечаем что подложка начала скрываться

        this.overlay.style.opacity = '0'; //делаем подложку прозрачной

        let sl = window.getComputedStyle(this.overlay); //живая колекция стилей подложки

        await wait(() => sl.opacity, '0', { func: () => this.status !== 'pending to hide', message: 'ждали пока ' + this.track + ' станет OPACITY 0 но  начал появляться' }); //ждём пока подложка не станет полностью прозрачной

        this.overlay.style.display = ''; //после того как подложка полностью стала прозрачной убираем её из документа чтоб на неё прозрачную нельзя было кликнуть, т.е. чтоб она не перекрывала контент

        this.status = 'hide'; //помечаем что подложка скрыта
    }
    //скрываем блок сообщения
}
