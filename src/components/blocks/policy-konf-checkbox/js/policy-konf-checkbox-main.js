import { set_local_storage } from '@js-libs/func-kit';

let policy_checkbox = qs('#polici-konf-checkbox'),
    CONTROLLER = {
        init: function () {
            if (w.location.href.search('politika-konfidenczialnosti') != -1) this.add_accept_button(); //добавляем кнопку для согласия с политикой конфиденциальности внизу страницы политики

            if (!policy_checkbox) return;

            policy_checkbox._on('input', this.write_checkbox_status); //записываем состояние чекбокса в хранилище

            this.set_checkbox_status(); //задаём отметку чекбокса из данных в хранилище если они есть
        },

        //записываем состояние чекбокса в хранилище
        write_checkbox_status: function () {
            set_local_storage('polici-konf-checkbox-active-status', policy_checkbox.checked);
        },
        //записываем состояние чекбокса в хранилище

        //задаём отметку чекбокса из данных в хранилище если они есть
        set_checkbox_status: function () {
            let status = localStorage.getItem('polici-konf-checkbox-active-status') == 'true' ? true : false ?? false;
            policy_checkbox.checked = status;
        },
        //задаём отметку чекбокса из данных в хранилище если они есть

        //добавляем кнопку для согласия с политикой конфиденциальности внизу страницы политики
        add_accept_button: function () {
            let referrer = document.referrer,
                button = qs('.politika-konfidenczialnosti__button'),
                description = qs('.politika-konfidenczialnosti__description'),
                all_nead_pages = ['vybrat-komplekt', 'oformlenie-zakaza', 'ostavit-otzyv'];

            //если мы попали на страницу политики со страниц где есть чекбоксы то мы кпоказываем кнопку и вслучае нажатия на нё перенаправляем на исходную страницы с чекбоксом и записываем в хранилище статус
            if (all_nead_pages.find(el => referrer.search(el) != -1)) {
                button.style.display = 'flex';
                description.style.display = 'block';

                button._on('click', () => {
                    set_local_storage('polici-konf-checkbox-active-status', 'true');
                    w.location.href = referrer;
                });
            }
        },
        //добавляем кнопку для согласия с политикой конфиденциальности внизу страницы политики
    };

CONTROLLER.init();
