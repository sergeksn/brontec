//скрипт находит все кастомные текстовые поля и при изменении их фокуса меняет классы у его родителя чтоб меняелся цвет бордера
let all_textarea = qsa('.custom-textarea textarea');
if (all_textarea.length > 0) {
    all_textarea.forEach(textarea => {
        textarea._on('focus', () => textarea.parentNode.classList.add('custom-textarea--focus'));
        textarea._on('blur', () => textarea.parentNode.classList.remove('custom-textarea--focus'));
    });
}
