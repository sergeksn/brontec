import Pop_Up_Message from '@pop-up-messages-main-js';

let form = qs('form.vybrat-komplekt-3__forma');

if (form) {
    //при отправлке формы перехватываем управление
    form._on(
        'submit',
        async function (e) {
            e.preventDefault();

            let button = qs('button[type="submit"]', form),
                button_text = button.innerText,
                email = qs('input', form),
                message = qs('textarea', form),
                request_data = {
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
            button.innerText = 'Ожидайте ...';

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
            button.innerText = button_text;
        },
        { passive: false },
    );
    //при отправлке формы перехватываем управление
}
