//создаёт новый куки
//name - имя записываемого куки
//value - значение записываемого кукки
//options - параметры для записываемых куки
function set_cookie(name, value, options = {
    //path: '/', //базовый путь по которому куки будут доступны
    //domain: "site.com",//домен дял которого будут действовать куки
    //expires: "Tue, 19 Jan 2038 03:14:07 GMT",//дата истечения куки
    "max-age": "604800" //устанавливает время действия куки в секундах, по умолчанию 7 дней
    //secure: true //куки будут переданы только по HTTPS протоколу
}) {
    //объединяем объекты со значением по умолчанию и переданные пользователем

    let default_options = {
        path: '/'
    };

    options = Object.assign({}, default_options, options); //объединяем объекты со значением по умолчанию и переданные пользователем

    name = decodeURIComponent(name); //получаем "uswvewvc vw vw vweer" из "uswvewvc%20vw%20vw%20vweer" или "uswvewvc vw vw vweer" из "uswvewvc vw vw vweer"
    name = encodeURIComponent(name); //получаем "uswvewvc%20vw%20vw%20vweer" из "uswvewvc vw vw vweer"

    if (!options.path) { options.path = '/'; } //если явно не задан адрес дял которого работает куки то делаем его доступным для всего сайта

    //проверим соответсвует парметр expires объекта options формату даты unix
    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString(); //преобразуем значение expires в формат Mon, 03 Jul 2006 21:44:38 GMT
    }
    //проверим соответсвует парметр expires объекта options формату даты unix

    let updatedCookie = name + "=" + encodeURIComponent(value); //данные для записи в куки

    //перебираем объект options и дописываем в данные для записи в куки
    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }
    //перебираем объект options и дописываем в данные для записи в куки

    document.cookie = updatedCookie; //записываем данные в куки
}
// Пример использования:
//setCookie('user', 'John', { secure: true, 'max-age': 3600 });
//создаёт новый куки

// возвращает куки с указанным name или undefined, если ничего не найдено
//name - имя куки значение которого нужно получить
function get_cookie(name) {
    //может быть передано значение как "uswvewvc%20vw%20vw%20vweer" так и "uswvewvc vw vw vweer" , по этому сначало декодируем в строку с пробелами, а потом кодируем с заменой на соответствующие символы, тем самым мы получим надёжный вывод вне зависимости от того как запросился куки
    name = decodeURIComponent(name); //получаем "uswvewvc vw vw vweer" из "uswvewvc%20vw%20vw%20vweer" или "uswvewvc vw vw vweer" из "uswvewvc vw vw vweer"
    name = encodeURIComponent(name); //получаем "uswvewvc%20vw%20vw%20vweer" из "uswvewvc vw vw vweer"

    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));

    return matches ? decodeURIComponent(matches[1]) : undefined;
}
// возвращает куки с указанным name или undefined, если ничего не найдено

//удаляем куки по имени
//name - имя куки который нужно удалить
function delete_cookie(name) {
    set_cookie(name, "", {
        'max-age': -1
    })
}
//удаляем куки по имени

export { set_cookie, get_cookie, delete_cookie };