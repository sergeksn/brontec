import Pop_Up_Message from '@pop-up-messages-main-js';
import { Header } from '@header-main-js';
import TEXTAREA from '@js-moduls/textarea.js'; //блок управление кастомными текстовыми полями

let form = qs('.vybrat-komplekt-3__forma'),
    button = qs('.vybrat-komplekt-3__forma button[type="submit"]'),
    button_text,
    email_input = qs('.vybrat-komplekt-3__forma input'),
    message_textarea = qs('.vybrat-komplekt-3__forma textarea'),
    policy_checkbox = qs('#polici-konf-checkbox'),
    to_form_url_string = '#send-request-for-new-car',
    CONTROLLER = {
        init: function () {
            if (!form) return; //если нет такой формы то прерываем инициализацию

            button_text = button.textContent; //записываем исходный текст кнопки

            form._on('submit', this.form_submit.bind(this), { passive: false }); //при отправлке формы перехватываем управление

            button._on('click', this.click_submit_button.bind(this)); //при клике на кнопку отправки

            //при каждом взаимодействии с инпутом проверяем его валидность
            email_input._on('input', this.check_validation.bind(null, { email: true }));
            message_textarea._on('input', this.check_validation.bind(null, { message: true }));
            policy_checkbox._on('input', this.check_validation.bind(null, { policy: true }));
            //при каждом взаимодействии с инпутом проверяем его валидность

            //если мы перешли на страницу целенаправлино на форму отбратной связи
            if (location.hash == to_form_url_string) {
                Header.hide_and_lock_on_time(); //скрываем хедер скрываем и блокируем показ хедера на секунду чтоб он не закрывал часть экрана
                history.pushState(null, '', location.href.replace(to_form_url_string, '')); //делаем в истории браузера ссылку на эту страницу но уже без примиски #send-request-for-new-car чтоб при обновлении не перекидывало на форму, хз обязательно это или нет не тестил во всех браузерах, пусть лучше будет =)
            }
            //если мы перешли на страницу целенаправлино на форму отбратной связи
        },

        //при отправлке формы перехватываем управление
        form_submit: async function (e) {
            e.preventDefault(); //предотвращаем отправку формы стандартным образом

            let request_data = {
                //запрос на сервер
                method: 'POST',
                headers: { 'Content-Type': 'application/json;charset=utf-8' },
                body: JSON.stringify({
                    action: 'send_email_zayavka_na_complect',
                    email: email.value,
                    message: message.value,
                    send_emails: form.getAttribute('data-emails'),
                }),
            };

            button.setAttribute('disabled', 'disabled'); //блокируем кнопку
            button.textContent = 'Ожидайте ...';

            //отправляем запрос на сервер что отправить сообщение и выводим соответсвующие всплывающие окна
            await fetch(GDS.ajax_url, request_data)
                .then(response => response.json()) //считываем переданные данные
                .then(result => {
                    if (result.success) {
                        new Pop_Up_Message({
                            title: result.success.title,
                            message: result.success.message,
                            type: 'success',
                        });
                        return;
                    }

                    if (result.error) {
                        new Pop_Up_Message({
                            title: result.error.title,
                            message: result.error.message,
                            type: 'error',
                        });
                        return;
                    }
                })
                .catch(e => {
                    if (e.message === 'Failed to fetch') {
                        new Pop_Up_Message({
                            title: 'Ошибка подключения',
                            message: 'Не удалось подключиться к ' + GDS.ajax_url,
                            type: 'error',
                        });
                        return;
                    }

                    new Pop_Up_Message({
                        title: 'Ошибка запроса',
                        message: 'Не удалось выполнить запрос =(',
                        type: 'error',
                    });
                });
            //отправляем запрос на сервер что отправить сообщение и выводим соответсвующие всплывающие окна

            button.removeAttribute('disabled'); //блокируем кнопку
            button.textContent = button_text;
        },
        //при отправлке формы перехватываем управление

        //проверяет валидность заполненых полей
        //settings - объект с настрйоками какие поля проверять на валидность в данной проверке
        check_validation: function (settings = {}) {
            let default_setings = { email: false, policy: false, message: false }; //по умолчанию мы не проверяем ни какие поля
            settings = { ...default_setings, ...settings }; //вписываем наши настрйоки заменяя настройки по умолчанию

            if (settings.email) email_input.classList.add('custom-text-input--check-valid'); //делает пометку что нужно провеять валидность и применять соответствующие стили для инпута почты

            if (settings.policy) policy_checkbox.parentNode.classList.add('custom-checbox--check-valid'); //делает пометку что нужно провеять активен ли чекбокс политики конфиденциальности и в соответствии с этим применять соответствующие стили

            if (settings.message) TEXTAREA.check_valid(message_textarea); //првоеряет количество символов в поле если меньше или больше ограничений выводит стили не валидного поля
        },
        //проверяет валидность заполненых полей

        //при клике на кнопку отправки
        click_submit_button: function () {
            Header.hide_and_lock_on_time(); //скрываем хедер скрываем и блокируем показ хедера на секунду чтоб он не закрывал чать экрана
            this.check_validation({ email: true, policy: true, message: true }); //проверяет валидность заполненых полей
        },
        //при клике на кнопку отправки
    };

CONTROLLER.init();
