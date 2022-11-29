import { show, hide } from '@js-libs/func-kit';

export default class {
    //data.el - элмент подложки
    //data.status - начальный статус видимости подложки
    //data.lock - начальный статус блокировки изменения видимости подложки
    constructor(data) {
        if (!data.el) return; //если передан несуществующий элемент подложки завершам создание экземпляра

        this.el = data.el;
        this.status = data.status === undefined ? 'hide' : data.status; //статус видимости подложки
        this.lock = data.lock === undefined ? false : data.lock; //разрешает/запрещает менять видимость подложки
        this.show_v = data.show_v === undefined ? 0.9 : data.show_v; //значение прозрачности при полной видимости
        this.hide_v = data.hide_v === undefined ? 0 : data.hide_v; //значение прозрачности при полном скрытии

        if (data.click_fu) {
            this.click_fu = data.click_fu; //если передана функция для вызова при клеке на подложку записываем её
            this.el._on('click', this.click_fu); //так же вызываем эту функцию при клике
        }
        //показывыаем подложку
        this.show = () =>
            show.call(this, {
                el: this.el,
                value: this.show_v,
                started_value: this.hide_v,
            });
        //показывыаем подложку

        //скрываем подложку
        this.hide = () =>
            hide.call(this, {
                el: this.el,
                value: this.hide_v,
                started_value: this.show_v,
            });
        //скрываем подложку
    }
}
