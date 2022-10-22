import { custom_events_list } from "./custom-events.js";

(() => {
    //возвращает массив состоящий из всех элементов найденых по селекстором через запятую, примечательно что будет использован оптимальный поиск по дереву DOM для каждого типа селектора
    //selectors - строка в виде селекторов, можно несколько перечисленных через запятую, к примеру: ".test, a.web, header, nav"
    //element_fo_search - элемент в котором будет производится поиск всех элементов по селектору
    function return_selectors_arr(selectors, element_fo_search = document) {
        let result = [], //сюда будем записывать все элементы DOM найденые по соответствующим селекторам
            selectors_arr = selectors.split(","); //перебираем все предоставленные селекторы разделённые запятой и записываем их в массив

        selectors_arr.forEach(selector => {
            //возможно селекторы разделены не только запятой но и пробелом, вот так ", ", тогда нужно удалить все пробелы из начала строки, удалятся первые символы будут до тех пор пока ои не перестанут быть пробелами
            while (selector[0] === " ") selector = selector.substring(1); //удаляем пробел вначале строки

            let proverka = /^(#([\w]+)|(\w+)|\.([\w]+))$/.test(selector); //проверяем является ли selector id, tag или class

            //если селекстор сооствествует id, тегу или одиночному классу
            if (proverka) {
                //id
                if (selector.includes("#")) {
                    let el_fo_id = element_fo_search.getElementById(selector.slice(1)); //элемент найденый по id
                    if (el_fo_id) result.push([el_fo_id]); //если el_fo_id был найден, поскольку первая возможная запись в массив то просто записываем без всяких доп проверок на содержимое массива result
                    return;
                }
                //id

                //class
                if (selector.includes(".")) return (result = return_skleniy_arr(result, element_fo_search.getElementsByClassName(selector.slice(1))));
                //class

                //tag
                return (result = return_skleniy_arr(result, element_fo_search.getElementsByTagName(selector)));
                //tag
            }
            //если селекстор сооствествует id, тегу или одиночному классу

            return (result = return_skleniy_arr(result, element_fo_search.querySelectorAll(selector))); //если сложный селектор
        });

        return result; //возвращаем массив со всеми элементами
    }
    //возвращает массив состоящий из всех элементов найденых по селекстором через запятую, примечательно что будет использован оптимальный поиск по дереву DOM для каждого типа селектора

    //получает на вход два массива (массивоподобных объекта) и в результате возвращает объект содержащий все элементы обеих массивов
    function return_skleniy_arr(arr_1, arr_2) {
        arr_1 = [...arr_1]; //преобразуем в массив
        arr_2 = [...arr_2]; //преобразуем в массив
        let result = new Set(arr_1);
        arr_2.forEach(item => result.add(item)); //превращаем в массивоподобный объект и каждый его элемент добавляем в набор, используем Set чтоб избавиться от дублей
        return [...result]; //возвращаем преобрзованный в массив набор
    }
    //получает на вход два массива (массивоподобных объекта) и в результате возвращает объект содержащий все элементы обеих массивов

    //получает на вход два массива (массивоподобных объекта) и в результате возвращает объект в котором будут только те элементы которые встречаются в обоих массивах
    function return_clone_elements_arr(arr_1, arr_2) {
        arr_1 = [...arr_1]; //преобразуем в массив
        arr_2 = [...arr_2]; //преобразуем в массив
        //перебираем массив massiv_1 для поиска совпадающих значений с массивом massiv_2
        let result = arr_1.filter(item => {
            return arr_2.indexOf(item) !== -1; //если indexOf вернул не -1 то функция вернёт true и текущий элемнт будет добавлен в массив result так как он присутствует в обоих массивах
        });
        //перебираем массив massiv_1 для поиска совпадающих значений с массивом massiv_2

        return [...new Set(result)]; //удаляем повоторяющиеся элементы и возвращаем новый объект
    }
    //получает на вход два массива (массивоподобных объекта) и в результате возвращает объект в котором будут только те элементы которые встречаются в обоих массивах

    //хранит функции для поиска элементов
    let search_methods = {
        //возвращает массив с элементами лежащими на одном уровне с elements и фильтруются по селектору selector, если selector будет не задан то венёт всех соседей
        get_siblings_elems: function (element, selector) {
            let parent = element.parentNode, //родитель текущего итерируемого элемента
                temp_elems_list = new Set(parent.children); //список всех соседей этого элемента включая его самого

            temp_elems_list.delete(element); //удаляем целевой элемент

            if (!selector) return [...temp_elems_list]; //если не задан селектор для фильтации соседий, возвращаем всех соседей кроме сомого целевого элемента

            let all_children_element = return_selectors_arr(selector, parent); //все потомки родителя текущего итерируемого элемента удовлетворяющие слекторам поиска

            temp_elems_list = return_clone_elements_arr(all_children_element, temp_elems_list); //получем элементы которые находятся во временном массиве и удовлетворяют селекторам

            return temp_elems_list; //возвращаем массив с нужными элементами
        },
        //возвращает массив с элементами лежащими на одном уровне с elements и фильтруются по селектору selector, если selector будет не задан то венёт всех соседей

        //возвращает массив прямых потомков элеметов elements, фильтруемых по селектору selector
        get_children_elems: function (element, selector) {
            if (!selector) return [...element.children];

            return return_clone_elements_arr(return_selectors_arr(selector, element), element.children); //находим элементы которые находятся и в прямых потомках текущего элемента и удовлетворяют селекторам
        },
        //возвращает массив прямых потомков элеметов elements, фильтруемых по селектору selector
        //производим поиск по DOM древу каждого элемента в elements для поиска удовлетворяющих selector елементов, если selector = "*" то верёнт всех потомков элементов elements
        get_find_elems: function (element, selector) {
            return return_selectors_arr(selector, element);
        },
        //производим поиск по DOM древу каждого элемента в elements для поиска удовлетворяющих selector елементов, если selector = "*" то верёнт всех потомков элементов elements

        //возвращает прямого родителя каждого elements, если задан selector то результат будет проверяется и на соотвествие ему
        get_parent_elem: function (element, selector, result) {
            result = return_skleniy_arr(result, [element.parentNode]);

            if (!selector) return result;

            return return_clone_elements_arr(result, return_selectors_arr(selector));
        },
        //возвращает прямого родителя каждого elements, если задан selector то результат будет проверяется и на соотвествие ему

        //возвращает всех родителей элементов elements, удовлетворяющих selector
        get_parents_elem: function (element, selector, result) {
            //цикл while будет выпоолняться пока мы не доберёмся до родительского элемента document
            while (element.parentNode.nodeType !== 9) {
                result = return_skleniy_arr(result, [element.parentNode]); //записываем в массив result каждого родитетя по очереди
                element = element.parentNode; //присваеваем текущему итерируемому элементу element его родителя чтоб обеспечить подъём вверх по DOM дереву элементов
            }
            //цикл while будет выпоолняться пока мы не доберёмся до родительского элемента document

            if (!selector) return result;

            return return_clone_elements_arr(result, return_selectors_arr(selector));
        },
        //возвращает всех родителей элементов elements, удовлетворяющих selector
    };
    //хранит функции для поиска элементов

    //функция получает нужные элементы в зависимости от функции поиска и возвращает их в виде массива
    //elements - элменты в которых нужно осуществять поиск
    //selector - селектры для фильтрации результатов
    //func - функция которая должан быть вызвана для данного вида поиска к примеру get_siblings_elems или get_children_elems или другие
    function get_elems_from_search_method(elements, selector, func) {
        let result = [];
        if (elements instanceof HTMLElement) return func(elements, selector, result); //если одиночный элемент
        //ПРИМЕЧАНИЕ: нужно обязательно преобразовать поступивший массивоподобный или итерируемый объект в массив, т.к. HTMLCollection к примеру не имеет метода forEach
        [...elements].forEach(elem => (result = return_skleniy_arr(result, func(elem, selector, result)))); //для каждого элемента ищем элементы по методу поиска func и записываем подходящих в результат
        return result; //возвращаем всех найденых соседей если selector = null, или только те которые совпали с элементами объекта filter_elements
    }
    //функция получает нужные элементы в зависимости от функции поиска и возвращает их в виде массива

    //action - true/false дабавлить или удалить слушатель
    function toggle_listener_events_func(elem, events, callback, options_event, custom_settings, action) {
        let events_list = events.split(" "); //преобрзуем строковый список в масив

        options_event = Object.assign({ passive: true }, options_event); //объединяем параметры пользователя с параметрами по умолчанию

        events_list.forEach(event => {
            //если событие кастомное
            if (custom_events_list.hasOwnProperty(event) && event === "swipe") {
                custom_events_list[event].initiator(elem, custom_settings, action); //запускаем соответствующую функцию для регистрации данного события
            }
            //если событие кастомное

            //если событие кастомное
            if (custom_events_list.hasOwnProperty(event) && event !== "swipe") {
                //event - кастомное имя события наприаер resize_optimize
                //elem - лемент DOM к которому нужно применить прослушку данного события
                custom_events_list[event].initiator({
                    custom_event_name: event,
                    el_callback: callback,
                    element: elem,
                    custom_settings: custom_settings,
                    listener_action: action,
                }); //запускаем соответствующую функцию для регистрации данного события
            }
            //если событие кастомное

            action ? elem.addEventListener(event, callback, options_event) : elem.removeEventListener(event, callback, options_event); //в зависимоти от параметра action включаем или отключаем слушатель на элементе
        });
    }

    //функции которые будут добавлены как методы для объектов dom_obj_list таких как HTMLElement, NodeList, HTMLCollection для удобста взаимодествия с этими элементами
    let dom_added_func = {
        //возвращает массив с элементами лежащими на одном уровне с elements и фильтруются по селектору selector, если selector будет не задан то венёт всех соседей
        //selector - селекторы по которым будет фильтроваться итоговоый результат соседних элементов, пример "nav" или "nav, .header_burger_button_wrap, .header_phone_mobile"
        siblings: function (selector = null) {
            return get_elems_from_search_method(this, selector, search_methods.get_siblings_elems);
        },
        //возвращает элементы лежащие на одном уровне с elements и фильтруются по селектору selector, если selector будет null то венёт всех соседей

        //возвращает массив прямых потомков элеметов elements, фильтруемых по селектору selector
        //если selector = null то вернёт всех прямых потомков элементов elements
        //отличается от find тем что ищет только на один уровень вниз элементов elements
        childs: function (selector = null) {
            return get_elems_from_search_method(this, selector, search_methods.get_children_elems);
        },
        //возвращает массив прямых потомков элеметов elements, фильтруемых по селектору selector

        //производим поиск по DOM древу каждого элемента в elements для поиска удовлетворяющих selector елементов, если selector = "*" то верёнт всех потомков элементов elements
        find: function (selector) {
            return get_elems_from_search_method(this, selector, search_methods.get_find_elems);
        },
        //производим поиск по DOM древу каждого элемента в elements для поиска удовлетворяющих selector елементов, если selector = "*" то верёнт всех потомков элементов elements

        //возвращает прямого родителя каждого elements, если задан selector то результат будет проверяется и на соотвествие ему
        parent: function (selector = null) {
            return get_elems_from_search_method(this, selector, search_methods.get_parent_elem);
        },
        //возвращает прямого родителя каждого elements, если задан selector то результат будет проверяется и на соотвествие ему

        //возвращает всех родителей элементов elements, удовлетворяющих selector
        parents: function (selector = null) {
            return get_elems_from_search_method(this, selector, search_methods.get_parents_elem);
        },
        //возвращает всех родителей элементов elements, удовлетворяющих selector

        //добавляем слушатель события
        //events - строка событий которые нужно прослушивать на элементе, пример: "touchend click resize focus blur"
        //callback - функция которую нужно вызвать при срабатывании события из строки events, можно указать название функции, пример: touch_menu_open_close ; или указать функцию, пример: function(){console.log("Выполняем что-то, при срабатывании события из массива events")}
        //options_event - сюда нужно передать объект с обциями для данного слушателя
        //custom_settings - настрйоки которые будт переданы в кастомные события созданые пользователем такие как swipe
        on: function (events, callback, options_event = {}, custom_settings) {
            if (this instanceof HTMLElement || this === window) return toggle_listener_events_func(this, events, callback, options_event, custom_settings, true); //если одиночный элемент
            //ПРИМЕЧАНИЕ: нужно обязательно преобразовать this в массив, т.к. HTMLCollection к примеру не имеет метода forEach
            [...this].forEach(elem => toggle_listener_events_func(elem, events, callback, options_event, custom_settings, true)); //для каждого элемента ищем элементы по методу поиска func и записываем подходящих в результат
        },
        //добавляем слушатель события

        //удаляем слушатель события
        //events - строка событий которые нужно прослушивать на элементе, пример: "touchend click resize focus blur"
        //callback - функция которую нужно вызвать при срабатывании события из строки events, можно указать название функции, пример: touch_menu_open_close ; или указать функцию, пример: function(){console.log("Выполняем что-то, при срабатывании события из массива events")}
        //options_event - сюда нужно передать объект с обциями для данного слушателя
        //custom_settings - настрйоки которые будт переданы в кастомные события созданые пользователем такие как swipe
        off: function (events, callback, options_event = {}, custom_settings) {
            if (this instanceof HTMLElement || this === window) return toggle_listener_events_func(this, events, callback, options_event, custom_settings, false); //если одиночный элемент
            //ПРИМЕЧАНИЕ: нужно обязательно преобразовать this в массив, т.к. HTMLCollection к примеру не имеет метода forEach
            [...this].forEach(elem => toggle_listener_events_func(elem, events, callback, options_event, custom_settings, false)); //для каждого элемента ищем элементы по методу поиска func и записываем подходящих в результат
        },
        //удаляем слушатель события
    };
    //функции которые будут добавлены как методы для объектов dom_obj_list таких как HTMLElement, NodeList, HTMLCollection для удобста взаимодествия с этими элементами

    let dom_obj_list = [HTMLElement, NodeList, HTMLCollection]; //к каким объектам добавлять новые методы для взаимодействия

    //ПРИМЕЧАНИЕ: приписка _ перед функциями необходима для того чтоб избежать возможной перезаписи метода в исходном объекте
    //добавляем новые методы в объекты для взаиможействия с элементоми
    dom_obj_list.forEach(item => {
        for (let func in dom_added_func) item.prototype["_" + func] = dom_added_func[func];
    });
    //добавляем новые методы в объекты для взаиможействия с элементом

    window._on = dom_added_func.on;
    window._off = dom_added_func.off;
})();
