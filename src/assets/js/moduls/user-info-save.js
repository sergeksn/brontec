import { set_local_storage } from '@js-libs/func-kit';

let all_data_areas = qsa('[data-user-info]'), //все поля содержащие информацию о пользователе
    CONTROLLER = {
        init: function () {
            if (all_data_areas.length == 0) return; //если таких полей нет то прерываем иницализацию

            if (!localStorage.getItem('user-info')) set_local_storage('user-info', '{}'); //если запись в хранилеще ещё не создана то создаём пустую запись

            all_data_areas._on('input', this.chenge_user_info.bind(this)); //прослушиваем на всех полях событие изменение содержимого и записываем обновлённые данные в хранилище

            all_data_areas.forEach(input => this.set_user_info(input)); //функция заполняет поля ранее введёными данными пользователя для каждого поля с информацией пользователя
        },

        //срабатывает при изменении значения в отслеживаемых полях
        chenge_user_info: function (e) {
            let el = e.target;
            if (el.nodeName == 'INPUT' || el.nodeName == 'TEXTAREA') this.write_input_or_textarea_data(el);
        },
        //срабатывает при изменении значения в отслеживаемых полях

        //записывает данные введённые в стандартных тегах инпута и текстового поля
        write_input_or_textarea_data: function (el) {
            let key = el.dataset.userInfo,
                value = el.value;

            this.write_user_info(key, value); //записываем данные пользователя по ключу, обновляет если такой ключе если или создаёт новый если такогоключа ещё нет
        },
        //записывает данные введённые в стандартных тегах инпута и текстового поля

        //записываем данные пользователя по ключу, обновляет если такой ключе если или создаёт новый если такогоключа ещё нет
        write_user_info: function (key, value) {
            let data = JSON.parse(localStorage.getItem('user-info'));

            data[key] = value;

            set_local_storage('user-info', JSON.stringify(data));
        },
        //записываем данные пользователя по ключу, обновляет если такой ключе если или создаёт новый если такогоключа ещё нет

        //функция заполняет поля ранее введёными данными пользователя
        set_user_info: function (el) {
            if (el.nodeName == 'INPUT' || el.nodeName == 'TEXTAREA') this.set_input_or_textarea_data(el);
        },
        //функция заполняет поля ранее введёными данными пользователя

        //заполянем данные в стандартные инпуты и текстовые поля
        set_input_or_textarea_data: function (el) {
            let key = el.dataset.userInfo,
                user_data = JSON.parse(localStorage.getItem('user-info'));

            el.value = user_data[key] ?? null; //записываем в поле данные из хранилища если они есть
        },
        //заполянем данные в стандартные инпуты и текстовые поля
    };

CONTROLLER.init();

export default CONTROLLER;
