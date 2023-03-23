let all_textarea = qsa('.custom-textarea textarea'),
    CONTROLLER = {
        init: function () {
            if (all_textarea.length == 0) return; //прерываем если на странице нет кастомных текстовых полей

            //находит все кастомные текстовые поля и при изменении их фокуса меняет классы у его родителя чтоб меняелся цвет бордера
            all_textarea.forEach(textarea => {
                textarea._on('focus', () => textarea.parentNode.classList.add('custom-textarea--focus'));
                textarea._on('blur', () => textarea.parentNode.classList.remove('custom-textarea--focus'));
            });
            //находит все кастомные текстовые поля и при изменении их фокуса меняет классы у его родителя чтоб меняелся цвет бордера
        },

        //проверяет валидность значения в текстовом поле и если не валидно то помечаем это класом у родителя
        check_valid: function (textarea, min_text_length = 1, max_text_length = null) {
            let carrent_text_length = textarea.value.length;

            //если не переадны пределы длинны текста то берём из атрибутов
            min_text_length = textarea.getAttribute('minlength') ?? min_text_length;
            max_text_length = textarea.getAttribute('maxlength') ?? max_text_length;

            //если длинна текстового поля не в пределах заданых значений то помечаем ошибку
            if (carrent_text_length >= min_text_length && carrent_text_length <= max_text_length) {
                textarea.parentNode.classList.remove('custom-textarea--not-valid');
            } else {
                textarea.parentNode.classList.add('custom-textarea--not-valid');
            }
        },
        //проверяет валидность значения в текстовом поле и если не валидно то помечаем это класом у родителя
    };

CONTROLLER.init();

export default CONTROLLER;
