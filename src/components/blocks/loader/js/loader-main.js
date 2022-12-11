import { show, hide } from '@js-libs/func-kit';

export default class Loader {
    constructor(loader_elem) {
        if (!loader_elem) return; //если лоадера нет то прерываем дальнешие операции, и все вызываемые методы данного объекта лоадера будут просто сразу завершаться
        this.loader = loader_elem; //записываем для того чтоб из методов объекта получать доступ к элементу лоадера если он существует

        this.styles_loader = w.getComputedStyle(loader_elem); //живая колекция стилей лоадера

        this.status = this.styles_loader.display === 'none' ? ' hide' : 'show'; //стартовый статус лоадера

        this.lock = false; //польностью блокирует любые действия с лоадером
        this.generate_throws = false; //в случае неудачного выполнения сокрытия или появления нужно ли генерировать исключения
        this.permission_to_show = true; //разрешено ли показывать лоадер
        this.permission_to_hide = true; //разрешено ли скрывать лоадер
    }

    //показываем лоадер
    async show() {
        //если запрещено показывать прерываем
        if (!this.permission_to_show) {
            if (this.generate_throws) {
                throw { ksn_message: 'not permission to show' };
            } else {
                return 'not permission to show';
            }
        }
        //если запрещено показывать прерываем

        await show({
            el: this.loader,
            instance: this,
            display: 'flex',
        });
    }
    //показываем лоадер

    //скрываем лоадер
    async hide() {
        //если запрещено скрывать прерываем
        if (!this.permission_to_hide) {
            if (this.generate_throws) {
                throw { ksn_message: 'not permission to hide' };
            } else {
                return 'not permission to hide';
            }
        }
        //если запрещено скрывать прерываем

        await hide({
            el: this.loader,
            instance: this,
            display: 'none',
        });
    }
    //скрываем лоадер

    //скрываем и удаляем лоадер если он есть
    async hide_and_remove() {
        //прерываем если заблокированная любая активность
        if (this.lock) {
            if (this.generate_throws) {
                throw { ksn_message: 'locked' };
            } else {
                return 'locked';
            }
        }
        //прерываем если заблокированная любая активность

        //если нет лоадера прерываем
        if (!this.loader) {
            if (this.generate_throws) {
                throw { ksn_message: 'no loader' };
            } else {
                return 'no loader';
            }
        }
        //если нет лоадера прерываем

        this.permission_to_show = false; //запрещаем показывать лоадер чтоб это не помещало нам его корректно скрыть и удалить

        await this.hide(); //дожидаемся пока скроется лоадер

        this.loader.remove(); //удаляем лоадер из документа
        this.loader = null; //помечаем что лоадера в этом блоке больше нет
    }
    //скрываем и удаляем лоадер если он есть
}
