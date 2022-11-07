import { wait } from '@js-libs/func-kit';

export default class Loader {
    constructor(loader_elem) {
        if (!loader_elem) return; //если лоадера нет то прерываем дальнешие операции, и все вызываемые методы данного объекта лоадера будут просто сразу завершаться
        this.loader = loader_elem; //записываем для того чтоб из методов объекта получать доступ к элементу лоадера если он существует

        this.styles_loader = window.getComputedStyle(loader_elem); //живая колекция стилей лоадера

        this.status = this.styles_loader.display === 'none' ? ' hide' : 'show'; //стартовый статус лоадера

        this.lock = false; //польностью блокирует любые действия с лоадером
        this.permission_to_show = true; //разрешено ли показывать лоадер
        this.permission_to_hide = true; //разрешено ли скрывать лоадер
    }

    //показываем лоадер
    async show() {
        if (this.lock) throw { ksn_message: 'locked' }; //прерываем если заблокированная любая активность
        if (!this.permission_to_show) throw { ksn_message: 'not permission to show' }; //запрещено показывать
        if (!this.loader) throw { ksn_message: 'no loader' }; //нет лоадера

        if (this.status === 'show') return; //если кнопка уже видна сразу завершаем

        //данное ожидание будет прервано только если лоадер начнёт скрываться
        if (this.status === 'pending to show') return await wait(() => this.status, 'show', { func: () => this.status === 'pending to hide' || this.status === 'hide', message: 'ждали пока LOADER станет SHOW, но LOADER начал скрываться' }); //ждём пока лоадер не станет полностью видимым и только потом завершаем

        this.status = 'pending to show'; //помечаем что лоадер в процесе скрытия

        this.loader.style.display = 'flex'; //показываем лоадер в документе

        await wait(() => this.styles_loader.display, 'flex', { func: () => this.status !== 'pending to show', message: 'ждали пока LOADER станет FLEX, но LOADER начал скрываться' }); //дожидаемся пока лоадер не станет flex, перываем только если за время ожидания статус лоадера стал не pending to show

        this.loader.style.opacity = '1'; //после того как лоадер стал flex делаем его видимым через прозрачность

        await wait(() => this.styles_loader.opacity, '1', { func: () => this.status !== 'pending to show', message: 'ждали пока LOADER станет OPACITY 1, но LOADER начал скрываться' }); //ждём пока покажется лоадер, перерываем ожидаение только если статус лоадера сменился на отличный от pending to show

        this.status = 'show'; //после успешного появления лоадера помечаем что лоадер виден
    }
    //показываем лоадер

    //скрываем лоадер
    async hide() {
        if (this.lock) throw { ksn_message: 'locked' }; //прерываем если заблокированная любая активность
        if (!this.permission_to_hide) throw { ksn_message: 'not permission to hide' }; //запрещено скрывать
        if (!this.loader) throw { ksn_message: 'no loader' }; //нет лоадера

        if (this.status === 'hide') return; //если лоадер уже скрыт сразу завершаем

        //данное ожидание будет прервано только если лоадер начнёт появляться
        if (this.status === 'pending to hide') return await wait(() => this.status, 'hide', { func: () => this.status === 'pending to show' || this.status === 'show', message: 'ждали пока LOADER станет HIDE, но LOADER начал появляться' }); //ждём пока лоадер не станет полностью скрытым и только потом завершаем

        this.status = 'pending to hide'; //помечаем что лоадер в процессе скрытия

        this.loader.style.opacity = '0'; //делаем лоадер прозрачным

        await wait(() => this.styles_loader.opacity, '0', { func: () => this.status !== 'pending to hide', message: 'ждали пока LOADER станет OPACITY 0, но LOADER начал появляться' }); //ждём пока скроется лоадер, перерываем ожидаение только если статус лоадера сменился на отличный от pending to hide

        this.loader.style.display = 'none'; //скрываем лоадер в документе
        this.status = 'hide'; //помечаем что лоадер скрыт
    }
    //скрываем лоадер

    //скрываем и удаляем лоадер если он есть
    async hide_and_remove() {
        if (this.lock) throw { ksn_message: 'locked' }; //прерываем если заблокированная любая активность
        if (!this.loader) throw { ksn_message: 'no loader' }; //нет лоадера

        this.permission_to_show = false; //запрещаем показывать лоадер чтоб это не помещало нам его корректно скрыть и удалить

        await this.hide().catch(e => {
            //ПРИМЕЧАНИЕ: в данном случае наши исключения нас не интересуют т.к. они не смогут помещать коду в этом модуле, они нужны если код используется извне для управления состояниями элементов
            if (typeof e.ksn_message === 'undefined') console.error(e); //если ошибка не наша выводим её в консоль и завершаем функцию, это ошибка могла произойти из-за непридвиденной ошибки в коде
        }); //дожидаемся пока скроется лоадер
        this.loader.remove(); //удаляем лоадер из документа
        this.loader = null; //помечаем что лоадера в этом блоке больше нет
    }
    //скрываем и удаляем лоадер если он есть
}
