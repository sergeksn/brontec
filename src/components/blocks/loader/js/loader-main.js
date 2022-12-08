import { show, hide } from '@js-libs/func-kit';

export default class Loader {
    constructor(loader_elem) {
        if (!loader_elem) return; //если лоадера нет то прерываем дальнешие операции, и все вызываемые методы данного объекта лоадера будут просто сразу завершаться
        this.loader = loader_elem; //записываем для того чтоб из методов объекта получать доступ к элементу лоадера если он существует

        this.styles_loader = w.getComputedStyle(loader_elem); //живая колекция стилей лоадера

        this.status = this.styles_loader.display === 'none' ? ' hide' : 'show'; //стартовый статус лоадера

        this.lock = false; //польностью блокирует любые действия с лоадером
        this.permission_to_show = true; //разрешено ли показывать лоадер
        this.permission_to_hide = true; //разрешено ли скрывать лоадер
    }

    //показываем лоадер
    show() {
        if (!this.permission_to_show) throw { ksn_message: 'not permission to show' }; //запрещено показывать

        return show({
            el: this.loader,
            instance: this,
            display: 'flex',
        });
    }
    //показываем лоадер

    //скрываем лоадер
    hide() {
        if (!this.permission_to_hide) throw { ksn_message: 'not permission to hide' }; //запрещено скрывать

        return hide({
            el: this.loader,
            instance: this,
            display: 'none',
        });
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
        // this.loader.remove(); //удаляем лоадер из документа
        // this.loader = null; //помечаем что лоадера в этом блоке больше нет
    }
    //скрываем и удаляем лоадер если он есть
}
