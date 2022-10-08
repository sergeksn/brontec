import { custom_events_list } from "./custom_events.js";

//объект с основными функциями
const KSN_jQuery = {
    //метод инициализации, ищет все подходящие селекторы и возвращает результат в виде объекта с прототипом KSN_jQuery
    //obj - объект с прототипом KSN_jQuery
    init: function(selector, obj = this) {
        //если селектор $(""), $(null), $(undefined), $(false)
        if (!selector) {
            return obj; //возвращаем наш объект obj
        }
        //если селектор $(""), $(null), $(undefined), $(false)

        //для текстовых сетекторов "#test, .class_test>div.tested, header, a[href='/wefewf/ewf']"
        if (typeof selector === "string") {
            let elements = this.return_selectors_arr(selector); //возвращаем все найденые элементы в виде массива

            //перебираем все элементы elements и записываем их по порядку в объект obj
            for (let i = 0; i < elements.length; i++) {
                obj[i] = elements[i];
            }
            //перебираем все элементы elements и записываем их по порядку в объект obj

            obj.length = elements.length; //записываем в коне количество элементов объекта объекта length

            return obj; //возвращаем наш объект obj с прототипом KSN_jQuery и всеми элементами найдеными по селекторам
        }
        //для текстовых сетекторов ".class_test>div.tested"

        //для сетекторов типа DOMElement таких как window, document...
        obj[0] = selector; //записываем объект DOMElement
        obj.length = 1;
        return obj; //возвращаем наш объект obj с прототипом KSN_jQuery
        //для сетекторов типа DOMElement таких как window, document...
    },
    //метод инициализации, ищет все подходящие селекторы и возвращает результат в виде объекта с прототипом KSN_jQuery

    //метод создаёт новый объект с прототипом KSN_jQuery, и заполянет его элементами из elements
    //obj - создаём объект obj с протитипом на основе __proto__ (объект прототипа) данного объекта
    construct_new_ksn: function(elements = null, obj = Object.create(this.__proto__)) {
        //ПРИМЕЧАНИЕ: создать новый объект с заданым прототипом и записать в него занчения намного быстрее чем чистить старый объект, а потом ещё и заполянть его значениями

        //если ничего не передано для формирования нового объекта, то возвращаем новый объект с длинной в 0
        if (elements === null) {
            obj.length = 0;
            return obj;
        }
        //если ничего не передано для формирования нового объекта, то возвращаем новый объект с длинной в 0

        //перебираем все элементы elements и записываем их по порядку в объект obj
        for (let i = 0; i < elements.length; i++) {
            obj[i] = elements[i];
        }

        obj.length = elements.length; //записываем в коне количество элементов объекта объекта length

        return obj; //возвращаем наш объект obj
    },
    //метод создаёт новый объект с прототипом KSN_jQuery, и заполянет его элементами из elements

    //возвращает массив состоящий из всех элементов найденых по селекстором через запятую, примечательно что будет использован оптимальный поиск по дереву DOM для каждого типа селектора
    //selectors - строка в виде селекторов, можно несколько перечисленных через запятую, к примеру: ".test, a.web, header, nav"
    //element_fo_search - элемент в котором будет производится поиск всех элементов по селектору
    //result сюда будем записывать все элементы DOM найденые по соответствующим селекторам
    return_selectors_arr: function(selectors, element_fo_search = document, result = []) {
        let selectors_arr = this.string_to_array(selectors, ","); //массив со списком селекторов

        //перебираем все предоставленные селекторы разделённые запятой и записываем их в массив
        for (let i = 0; i < selectors_arr.length; i++) {

            //возможно селекторы разделены не только запятой но и пробелом, вот так ", ", тогда нужно удалить все пробелы из начала строки
            //удалятся первые символы будут до тех пор пока ои не перестанут быть пробелами
            while (selectors_arr[i][0] === " ") {
                selectors_arr[i] = selectors_arr[i].substring(1); //удаляем пробел вначале строки
            }
            //возможно селекторы разделены не только запятой но и пробелом, вот так ", ", тогда нужно удалить все пробелы из начала строки

            let selector = selectors_arr[i], //текущий итерируемый селектор в наборе
                proverka = /^(#([\w]+)|(\w+)|\.([\w]+))$/.test(selector); //проверяем является ли selector id, tag или class

            //если селекстор сооствествует id, тегу или одиночному классу
            if (proverka) {
                //id
                if (selector.includes("#")) {
                    let el_fo_id = element_fo_search.getElementById(selector.slice(1)); //элемент найденый по id

                    //если el_fo_id был найден и нее равен null
                    if (el_fo_id) {
                        result.push.apply(result, [el_fo_id]); //поскольку первая возможная запись в массив то просто записываем без всяких доп проверок на содержимое массива result
                    }
                    //если el_fo_id был найден и нее равен null
                }
                //id

                //class
                else if (selector.includes(".")) {
                    result = this.return_skleniy_arr(result, element_fo_search.getElementsByClassName(selector.slice(1)));
                }
                //class

                //tag
                else {
                    result = this.return_skleniy_arr(result, element_fo_search.getElementsByTagName(selector));
                }
                //tag
            }
            //если селекстор сооствествует id, тегу или одиночному классу

            //если сложный селектор
            else {
                result = this.return_skleniy_arr(result, element_fo_search.querySelectorAll(selector));
            }
            //если сложный селектор
        }
        //перебираем все предоставленные селекторы разделённые запятой и записываем их в массив

        return result; //возвращаем массив со всеми элементами
    },
    //возвращает массив состоящий из всех элементов найденых по селекстором через запятую, примечательно что будет использован оптимальный поиск по дереву DOM для каждого типа селектора

    //получает на вход два массива (массивоподобных объекта) и в результате возвращает объект в котором будут только те элементы которые встречаются в обоих массивах
    //clone_clean - если true то вернёт массив без одинаковых значений
    return_clone_elements_arr: function(arr_1, arr_2, clone_clean = true) {
        let massiv_1 = Array.isArray(arr_1) ? arr_1 : this.toArray(arr_1), //если вдруг это не массив то преобразуем в массив
            massiv_2 = Array.isArray(arr_2) ? arr_2 : this.toArray(arr_2), //если вдруг это не массив то преобразуем в массив
            //перебираем массив massiv_1 для поиска совпадающих значений с массивом massiv_2
            result = massiv_1.filter((item, index) => {
                return massiv_2.indexOf(item) !== -1; //если indexOf вернул не -1 то функция вернёт true и текущий элемнт будет добавлен в массив result так как он присутствует в обоих массивах
            });
        //перебираем массив massiv_1 для поиска совпадающих значений с массивом massiv_2

        return clone_clean ? this.return_no_clone_arr(result) : result; //удаляем повоторяющиеся элементы и возвращаем новый объект
    },
    //получает на вход два массива (массивоподобных объекта) и в результате возвращает объект в котором будут только те элементы которые встречаются в обоих массивах

    //получает на вход два массива (массивоподобных объекта) и в результате возвращает объект содержащий все элементы обеих массивов
    //clone_clean - если true то вернёт массив без одинаковых значений
    //result = [] массив в который будем записывать все элементы
    return_skleniy_arr: function(arr_1, arr_2, clone_clean = true, result = []) {
        result.push.apply(result, arr_1); //записываем данные из arr_1
        result.push.apply(result, arr_2); //записываем данные из arr_2
        return clone_clean ? this.return_no_clone_arr(result) : result;
    },
    //получает на вход два массива (массивоподобных объекта) и в результате возвращает объект содержащий все элементы обеих массивов

    //получает на вход массив (массивоподобный объект), после этого удаляет в нём одинаковые значения и возвращает результирующий объект с новой длинной
    return_no_clone_arr: function(arr) {
        //let result = this.toArray(new Set(arr));//здесь применяется метод set который возвращает только уникальные значения
        let massiv = Array.isArray(arr) ? arr : this.toArray(arr), //если вдруг это не массив то преобразуем в массив
            result = massiv.filter((item, index) => { return massiv.indexOf(item) === index }); //с помошью фильтрующего метода Array возвращаем массив в котором будт только элементы удовлетворяющие условию massiv.indexOf(item) === index, т.е. если будет повторяющееся значение его индекс будет равен не его индексу , а первому такому элементу в массиве, следовательно этот элемент повторно не будет включаться
        return result;
    },
    //получает на вход массив (массивоподобный объект), после этого удаляет в нём одинаковые значения и возвращает результирующий объект с новой длинной

    //очищает массив arr от значений values
    return_cleaned_of_values: function(values, arr) {
        let cleaned = Array.isArray(values) ? values : this.toArray(values), //если вдруг это не массив то преобразуем в массив
            massiv = Array.isArray(arr) ? arr : this.toArray(arr), //если вдруг это не массив то преобразуем в массив
            result = massiv.filter((item) => !cleaned.includes(item));
        //result = massiv.filter((item) => { return cleaned.indexOf(item) < 0 });тоже самое но с помощью метода indexOf
        return result;
    },
    //очищает массив arr от значений values

    //преобразует строку в массив разделитель separator
    //++
    string_to_array: function(string, separator = " ") {
        return string.split(separator); //возвращаем массив
    },

    //преобразуем массивоподобные объекты в separator
    //++
    toArray: function(data) {
        return Array.from(data);
    },
    //преобразуем массивоподобные объекты в массивы

    //производит итерации над объектами и для каждого итирируемого элемента объекта вызиывает функцию callback
    //callback - функция обратного вызова
    //++
    each: function(callback) {
        //перебираем массив с итерируемыми элементами
        for (let i = 0; i < this.length; i++) {
            //дял каждого итирируемого элемента вызываем функцию обратиного вызова в которую в качестве аргументов передаём значение в массиве и индекс соответственно
            if (callback(this[i], i) === false) break; //если функция обратного вызова вернула false то прерываем цык перебра элементов
        }
        //перебираем массив с итерируемыми элементами
    },
    //производит итерации над объектами и для каждого итирируемого элемента объекта вызиывает функцию callback

    //внутренняя функция возвращает объект с данным width padding border margin переданного элемента для его ширины или высоты
    getWidthOrHeight: function(element, dimension) {
        let styles = window.getComputedStyle(element);

        if (dimension === "width") {
            let padding_left = Number(styles.paddingLeft.replace("px", "")),
                padding_right = Number(styles.paddingRight.replace("px", "")),
                padding_lr = padding_left + padding_right, //общая ширина padding
                border_left = Number(styles.borderLeftWidth.replace("px", "")),
                border_right = Number(styles.borderRightWidth.replace("px", "")),
                border_lr = border_left + border_right, //общая ширина border
                margin_left = Number(styles.marginLeft.replace("px", "")),
                margin_right = Number(styles.marginRight.replace("px", "")),
                margin_lr = margin_left + margin_right, //общая ширина margin
                width = Number(styles.width.replace("px", "")) - padding_lr - border_lr;
            return {
                "width": width,
                "padding": padding_lr,
                "padding-left": padding_left,
                "padding-right": padding_right,
                "border": border_lr,
                "border-left": border_left,
                "border-right": border_right,
                "margin": margin_lr,
                "margin-left": margin_left,
                "margin-right": margin_right
            }
        } else if (dimension === "height") {
            let padding_top = Number(styles.paddingTop.replace("px", "")),
                padding_bottom = Number(styles.paddingBottom.replace("px", "")),
                padding_tb = padding_top + padding_bottom, //общая ширина padding
                border_top = Number(styles.borderTopWidth.replace("px", "")),
                border_bottom = Number(styles.borderBottomWidth.replace("px", "")),
                border_tb = border_top + border_bottom, //общая ширина border
                margin_top = Number(styles.marginTop.replace("px", "")),
                margin_bottom = Number(styles.marginBottom.replace("px", "")),
                margin_tb = margin_top + margin_bottom, //общая ширина margin
                height = Number(styles.height.replace("px", "")) - padding_tb - border_tb;
            return {
                "height": height,
                "padding": padding_tb,
                "padding-top": padding_top,
                "padding-bottom": padding_bottom,
                "border": border_tb,
                "border-top": border_top,
                "border-bottom": border_bottom,
                "margin": margin_tb,
                "margin-top": margin_top,
                "margin-bottom": margin_bottom
            }
        }
    },

    //функция для получения высот и ширин таких элементов как window и document
    //elem - передаваемый объект window или document
    //name - Width / Height
    //target_property - свойство которое нужно получить, outerHeight к примеру
    win_doc_wh: function(elem, name, target_property) {
        if (elem === window) {
            return target_property.indexOf("outer") === 0 ?
                elem["inner" + name] :
                elem.document.documentElement["client" + name];
        }
        //если это document
        if (elem.nodeType === 9) {
            let doc = elem.documentElement;

            return Math.max(
                elem.body["scroll" + name], doc["scroll" + name],
                elem.body["offset" + name], doc["offset" + name],
                doc["client" + name]
            );
        }

        return false;
    },
    //функция для получения высот и ширин таких элементов как window и document

    //получаем ширину элемента
    //type - тип высоты которую нужно получить
    //width - ширина самого элемента без учёта margin border padding
    //innerWidth - ширина элемента и padding
    //outerWidth - ширина элемента с его padding и border
    //offsetWidth - ширина элемента padding и border
    //clientWidth - ширина элемента и padding которые помещаются в видимую часть блока, т.е та ширина элемента которая видна без прокурутки, так же в это занчение не включается размер полосы прокуртки если она есть
    //scrollWidth - ширина элемента и padding, тут учитывается ширина элемента как будто у него бы не было прокрутки, т.е. сколько бы он занял места в таком случае, сюда не включается размеры полос прокурток если они есть, если элемент не имеет прокуртки по ширине то будет равно clientWidth
    //params - параметры которые нужно получить ля расчёта ширины элемента, например width({ params: ["width", "border", "padding-left", "margin"] }), те свойства которые тут будут перечислены сплюсуются и образуют конечный результат ширины
    width: function({ type = "width", params = [] } = {}) {
        let result = this.win_doc_wh(this[0], "Width", type); //проверям если это window или document
        if (result !== false) return result; //возвращаем заначение если это window или document

        let data = this.getWidthOrHeight(this[0], "width"); //получам объект с ширинами составных частей элемента таких как padding, margin и border

        //если заданны параметры которые нужно получить то находим их значения и суммируем
        if (params.length > 0) {
            let output_data = 0;
            for (let i = 0; i < params.length; i++) output_data += data[params[i]]; //суммируем значение всех нужных свойств
            return output_data; //возвращаем нужное заначение высоту элемента
        }
        //если заданны параметры которые нужно получить то находим их значения и суммируем

        if (type === "width") return data.width; //ширина самого элемента без всего лишнего

        if (type === "innerWidth") return data.width + data.padding; //ширина элемента и его padding

        if (type === "outerWidth") return data.width + data.padding + data.border; //возвращаем ширину элемента с его padding и border

        if (type === "clientWidth") return this[0].clientWidth; //ширина элемента и padding которые помещаются в видимую часть блока, т.е та ширина элемента которая видна без прокурутки, так же в это занчение не включается размер полосы прокуртки если она есть

        if (type === "scrollWidth") return this[0].scrollWidth; //ширина элемента и padding, тут учитывается ширина элемента как будто у него бы не было прокрутки, т.е. сколько бы он занял места в таком случае, сюда не включается размеры полос прокурток если они есть, если элемент не имеет прокуртки по ширине то будет равно clientWidth
    },
    //получаем ширину элемента

    //получаем высоту элемента
    //type - тип высоты которую нужно получить
    //height - высота самого элемента без учёта margin border padding
    //innerHeight - высота элемента и padding
    //outerHeight - высота элемента с его padding и border
    //offsetHeight - высота элемента padding и border
    //clientHeight - высота элемента и padding которые помещаются в видимую часть блока, т.е та высота элемента которая видна без прокурутки, так же в это занчение не включается размер полосы прокуртки если она есть
    //scrollHeight - высота элемента и padding, тут учитывается высота элемента как будто у него бы не было прокрутки, т.е. сколько бы он занял места в таком случае, сюда не включается размеры полос прокурток если они есть, если элемент не имеет прокуртки по высоте то будет равно clientHeight
    //params - параметры которые нужно получить ля расчёта высоты элемента, например height({ params: ["height", "border", "padding-top", "margin"] }), те свойства которые тут будут перечислены сплюсуются и образуют конечный результат высоты
    height: function({ type = "height", params = [] } = {}) {
        let result = this.win_doc_wh(this[0], "Height", type); //проверям если это window или document
        if (result !== false) return result; //возвращаем заначение если это window или document элементы

        let data = this.getWidthOrHeight(this[0], "height"); //получам объект с высотой составных частей элемента таких как padding, margin и border

        //если заданны параметры которые нужно получить то находим их значения и суммируем
        if (params.length > 0) {
            let output_data = 0;
            for (let i = 0; i < params.length; i++) output_data += data[params[i]]; //суммируем значение всех нужных свойств
            return output_data; //возвращаем нужное заначение высоту элемента
        }
        //если заданны параметры которые нужно получить то находим их значения и суммируем

        if (type === "height") return data.height; //высота самого элемента без всего лишнего

        if (type === "innerHeight") return data.height + data.padding; //высота элемента и его padding

        if (type === "outerHeight") return data.height + data.padding + data.border; //возвращаем высоту элемента с его padding и border

        if (type === "clientHeight") return this[0].clientHeight; //высота элемента и padding которые помещаются в видимую часть блока, т.е та высота элемента которая видна без прокурутки, так же в это занчение не включается размер полосы прокуртки если она есть

        if (type === "scrollHeight") return this[0].scrollHeight; //высота элемента и padding, тут учитывается высота элемента как будто у него бы не было прокрутки, т.е. сколько бы он занял места в таком случае, сюда не включается размеры полос прокурток если они есть, если элемент не имеет прокуртки по высоте то будет равно clientHeight
    },
    //получаем высоту элемента

    //добавляем классы class_name ко всем элементам elements
    //class_name - перечень классов разделённых пробелами
    addClass: function(class_name) {
        let classes = this.string_to_array(class_name); //преобрзуем строковый список в масив

        //перебираем все классы на добавление
        for (let i = 0; i < classes.length; i++) {
            //перебираем все элементы к которым нужно добавить классы
            for (let b = 0; b < this.length; b++) this[b].classList.add(classes[i]) //если данного класса у элемента нет, то добавим его
        }
        //перебираем все классы на добавление

        return this; //возвращаем объект this 
    },
    //добавляем классы class_name ко всем элементам elements

    //удаляем классы class_name у всех элемнтов elements
    //class_name - перечень классов разделённых пробелами
    removeClass: function(class_name) {
        let classes = this.string_to_array(class_name); //преобрзуем строковый список в массив

        //перебираем все классы не удаление
        for (let i = 0; i < classes.length; i++) {
            //перебираем все элементы классы в которых нужно удалить
            for (let b = 0; b < this.length; b++) this[b].classList.remove(classes[i]); //если у элемента есть данный клас удаляем его
        }
        //перебираем все классы не удаление

        return this; //возвращаем объект this 
    },
    //удаляем классы class_name у всех элемнтов elements

    //проверяет наличее классов у элементов elements, если хоть у одного элемента найдены все классы удовлетворяющие классам class_name значения то вернёт true
    //class_name - перечень классов разделённых пробелами
    hasClass: function(class_name) {
        let classes = this.string_to_array(class_name); //преобрзуем строковый список в масив

        //перебираем все элементы классы в которых нужно проверить на наличие
        for (let b = 0; b < this.length; b++) {
            let temp_result; //тут будет запитываться и перезаписываться наличие каждого класса у текущего элемента
            //перебираем все классы на проверку
            for (let i = 0; i < classes.length; i++) {
                //проверяет имеет ли текущий итерируемый элемент текущий проверяемый класс
                if (this[b].classList.contains(classes[i])) {
                    temp_result = true; //если текущий проверяемый класс найден у текущего проверяемого элемента помечаем во временном результате обнаружение класса
                } else {
                    temp_result = false; //если текущий проверяемый класс НЕ найден у текущего проверяемого элемент помечам во временном результате неудачу
                    break; //прекращаем дальнейший перебор классов, т.к. как киминимум один из классов у данного элемента не найден и можно переходить к проверке следующего элемента
                }
                //проверяет имеет ли текущий итерируемый элемент текущий проверяемый класс
            }
            //перебираем все классы на проверку

            if (temp_result) return true; //если temp_result будет true значит все классы из списка class_name были обнаружены в каком-то элементе и можно вернуть ответ true, который обозначит что мы найшли как минимум один элемент в котором есть все классы из списка class_name возвращаем ответ что нашли такой элемент
        }
        //перебираем все элементы классы в которых нужно проверить на наличие

        return false; //если функция дошла до этого момента и не завершилась ранее то значит не нашлось элементов в которых бы присустствовали сразу все классы из class_name и мы возвращаем false
    },
    //проверяет наличее классов у элементов elements, если хоть у одного элемента найдены все классы удовлетворяющие классам class_name значения то вернёт true

    //добавляет или удаляет класс в зависимости отр того есть он у элемента или нет
    //class_name - перечень классов разделённых пробелами
    toggleClass: function(class_name) {
        let classes = this.string_to_array(class_name); //преобрзуем строковый список в масив

        //перебираем все классы для переключения (добавить/удалить)
        for (let i = 0; i < classes.length; i++) {
            //перебираем все элементы для смены классов
            for (let b = 0; b < this.length; b++) this[b].classList.toggle(classes[i]); //добавляем или удаляем класс у элемента в завистимости от того есть он у него или нет
        }
        //перебираем все классы для переключения (добавить/удалить)

        return this; //возвращаем объект this 
    },
    //добавляет или удаляет класс в зависимости отр того есть он у элемента или нет

    //добавляет к нашему объекту this элементы найденые по selectors
    //selectors - элементы которые нужно добавить
    add: function(selectors) {
        let add_obj; //сюда будет записан ksn объект с элементами на добавление

        if (selectors === window || selectors === document) {
            add_obj = this.__proto__.init(selectors); //получаем объект с элементами найдеными по selectors 
        } else if (typeof selectors === "object") {
            add_obj = selectors;
        } else {
            add_obj = this.__proto__.init(selectors); //получаем объект с элементами найдеными по selectors 
        }

        let result = this.return_skleniy_arr(this, add_obj); //объединяем два объекта в массив
        return this.construct_new_ksn(result); //возвращаем ksn объект сформированный на основе массива result
    },
    //добавляет к нашему объекту this элементы найденые по selectors

    //добавляем стили элементам
    //styles название стиля занчение которого нужно получитть или если задано value то установить этим значением, или styles это может быть объект с формате {"стиль1":"значение", "стиль2":"значение"}
    //value - значение для стиля в styles
    //++
    css: function(styles, value = null, elements = this) {
        //переводим css название свойства в камелкейс формат
        //style_name - обычное название свойства css  к примеру border-radius
        let camal_case_css_property = function(style_name) {
                let css_property = style_name[0] === "-" ? style_name.slice(1) : style_name, //проверяем наличие префикса webkit и прочих и удаляем - в начале -webkit-border-radius или border-radius
                    arr_css_property = css_property.split("-"), //возвращаем массив ["border", "radius"]
                    property = arr_css_property[0]; //конечное имя свойства css для поиска в getComputedStyle "border"

                //если в названии свойства больше одного слова
                if (arr_css_property.length > 1) {
                    for (let i = 1; i < arr_css_property.length; i++) {
                        property = property + arr_css_property[i][0].toUpperCase() + arr_css_property[i].slice(1); //ставим первую букву слова в верхний регистр и то что получилось добавляем в конец имени свойства property  webkitBorderRadius borderRadius
                    }
                }
                //если в названии свойства больше одного слова
                
                return property; //возвращаем название css свойства в нужном виде webkitBorderRadius borderRadius
            },
            //переводим css название свойства в камелкейс формат

            //задам стиль style элементам elements со значением value
            set_style = function(style, value) {
                let property = camal_case_css_property(style); //получем название css свйства в нужном формате
                //переберам все элементы которым нужно задать стили
                for (let i = 0; i < elements.length; i++) {
                    elements[i].style[property] = value; //задаём элементу elements[i] css свойство property со значением value
                }
                //переберам все элементы которым нужно задать стили
            },
            //задам стиль style элементам elements со значением value

            //получаем стиль style у первого элемента в наборе elements
            get_style = function(style) {
                let property = camal_case_css_property(style); //получем название css свйства в нужном формате
                return window.getComputedStyle(elements[0])[property]; //возвращаем значение css property
            };
        //получаем стиль style у первого элемента в наборе elements

        //передан объект со стилями которые нужно установить для элементов
        if (typeof styles === "object") {
            //переберам все стили в объекте styles и применяем их к элементам
            for (let key in styles) {
                set_style(key, styles[key]);
            }
            //переберам все стили в объекте styles и применяем их к элементам
        }
        //передан объект со стилями которые нужно установить для элементов

        //передан один стиль для установки элементам
        else {
            //если не передано значение для стиля то просто получем его значение у элемента
            if (value === null) {
                return get_style(styles); //возвращаем полученное значение css свйства styles
            }
            //если не передано значение для стиля то просто получем его значение у элемента

            //если передано значение для установки значения стиля
            else {
                set_style(styles, value); //задаём стилю новое значение
            }
            //если передано значение для установки значения стиля
            //console.log(window.getComputedStyle(elements[0]))
        }
        //передан один стиль для установки элементам

        return this; //возвращаем объект
    },
    //добавляем стили элементам

    //возвращает элементы лежащие на одном уровне с elements и фильтруются по селектору selector, если selector будет null то венёт всех соседей
    //selector - селекторы по которым будет фильтроваться итоговоый результат соседних элементов, пример "nav" или "nav, .header_burger_button_wrap, .header_phone_mobile"
    //result = [] сюда будут записаны все соседи удовлетворяющие текущим условиям
    //++
    siblings: function(selector = null, result = []) {
        //для каждого элемента в elements ищем соседей
        for (let i = 0; i < this.length; i++) {
            let temp_arr = [], //тут будут хранится временные данные для одной итерации
                parent = this[i].parentNode; //родитель текущего итерируемого элемента
            temp_arr = this.return_skleniy_arr(temp_arr, parent.children); //записываем во временный массив всех соседей текущего итерируемого элемента включая его самого

            //если задан селектор для фильтрации соседей на выходе
            if (selector) {
                let all_children_element = this.return_selectors_arr(selector, parent); //все потомки родителя текущего итерируемого элемента
                temp_arr = this.return_clone_elements_arr(all_children_element, temp_arr); //получем элементы которые находятся во временном массиве и удовлетворяют селекторам
            }
            //если задан селектор для фильтрации соседей на выходе

            temp_arr = this.return_cleaned_of_values([this[i]], temp_arr); //удаляем из временного объекта сам итерируемый этемент, так как мы ищем его сосдей, а не его самого

            result = this.return_skleniy_arr(result, temp_arr); //записываем в конечный результирующий объект данные из временно объекта текущей итерации
        };
        //для каждого элемента в elements ищем соседей

        return this.construct_new_ksn(result); //возвращаем всех найденых соседей если selector = null, или только те которые совпали с элементами объекта filter_elements
    },
    //возвращает элементы лежащие на одном уровне с elements и фильтруются по селектору selector, если selector будет null то венёт всех соседей

    //возвращает прямых потомков элеметов elements, фильтруемых по селектору selector
    //если selector = null то вернёт всех прямых потомков элементов elements
    //отличается от find тем что ищет только на один уровень вниз элементов elements
    //result = [] сюда будут записаны все прямые потомки удовлетворяющие текущим условиям
    //++
    children: function(selector = null, result = []) {
        //для каждого элемента в elements ищем прямых потомков
        for (let i = 0; i < this.length; i++) {
            //если заданы селекторы по которому фильтровать прямых потомков
            if (selector) {
                let childrens = this[i].children, //все прямые потомки текущего элемента
                    all_elements = this.return_selectors_arr(selector, this[i]), //находим все элементы в текущем элементе которые удовлетворяют селекторам
                    filter_elements = this.return_clone_elements_arr(all_elements, childrens); //находим элементы которые находятся и в прямых потомках текущего элемента и удовлетворяют селекторам
                result = this.return_skleniy_arr(result, filter_elements); //записываем элементы в результат
            }
            //если заданы селекторы по которому фильтровать прямых потомков

            //фильтр прямых потомков не задан
            else {
                result = this.return_skleniy_arr(result, this[i].children); //записываем в результат всех прямых потомков каждого элемента
            }
            //фильтр прямых потомков не задан
        };
        //для каждого элемента в elements ищем прямых потомков

        return this.construct_new_ksn(result); //в завистимости от того установлен фильтр в виде селектора или нет возвращаем объект с отфильтрованными элементами полученнным вледствии нахождения одинаковых элементов в result и filter_elements или же просто всех найденых прямых потомков в видео объекта , если selector не был установлен
    },
    //возвращает прямых потомков элеметов elements, фильтруемых по селектору selector

    //производим поиск по DOM древу каждого элемента в elements для поиска удовлетворяющих selector елементов, если selector = "*" то верёнт всех потомков элементов elements
    //result = [] сюда будут записаны все потомки удовлетворяющие текущим условиям
    find: function(selector, result = []) {
        //перебираем все элементы elements потомков которых нужно найти
        for (let i = 0; i < this.length; i++) {
            let all_children = this.return_selectors_arr(selector, this[i]); //получаем всех потомков текущего итерируемого элемента
            result = this.return_skleniy_arr(result, all_children); //записываем в результирующий массив всех найденых и соответствующих селекторам потомков
        }
        //перебираем все элементы elements потомков которых нужно найти

        return this.construct_new_ksn(result); //возвращаем функцию для пересоздания объекта this чтоб вернуть его в новом виде
    },
    //производим поиск по DOM древу каждого элемента в elements для поиска удовлетворяющих selector елементов, если selector = "*" то верёнт всех потомков элементов elements

    //возвращает прямого родителя каждого elements, если задан selector то результат будет проверяется и на соотвествие ему
    //result = [] - сюда будут записаны все прямые родители элементов удовлетворяющих селекторам
    //++
    parent: function(selector = null, result = []) {
        //перебираем все элементы elements
        for (let i = 0; i < this.length; i++) {
            result.push(this[i].parentNode); //записываем в массив result родителей каждого элемента elements
        }
        //перебираем все элементы elements

        //если задан селектор для отбора
        if (selector) {
            let all_selectors = this.return_selectors_arr(selector), //массив со всеми элементами удовлетворяющими селектор selector
                filter_result = this.return_clone_elements_arr(result, all_selectors); //получаем массив в который будут записаны одинаковые занчения найденные в массивах result и all_selectors
            return this.construct_new_ksn(filter_result); //возвращаем объект с отфильтрованными родительскими элементами
        }
        //если задан селектор для отбора

        return this.construct_new_ksn(result); //возвращаем объект с родительскими элементами
    },
    //возвращает прямого родителя каждого elements, если задан selector то результат будет проверяется и на соотвествие ему

    //возвращает всех родителей элементов elements, удовлетворяющих selector
    //result = [] - сюда записываем всех родителей элементов удовлетворяющих селекторам
    //++
    parents: function(selector = null, result = []) {
        //перебираем все элементы elements
        for (let i = 0; i < this.length; i++) {
            let el = this[i]; //текущий итерируемый элемент родетелей которого мы ищем

            //цикл while будет выпоолняться пока мы не доберёмся до родительского элемента document
            while (el.parentNode.nodeType !== 9) {
                result.push(el.parentNode); //записываем в массив result каждого родитетя по очереди
                el = el.parentNode; //присваеваем текущему итерируемому элементу el его родителя чтоб обеспечить подъём вверх по DOM дереву элементов
            }
            //цикл while будет выпоолняться пока мы не доберёмся до родительского элемента document
            result = this.return_no_clone_arr(result); //чистим результирующий массив от повторяющихся элементов
        }
        //перебираем все элементы elements

        //если задан селектор для отбора
        if (selector) {
            return this.construct_new_ksn(this.return_clone_elements_arr(result, this.return_selectors_arr(selector))); //возвращаем объект с отфильтрованными родительскими элементами по селекторам
        }
        //если задан селектор для отбора

        return this.construct_new_ksn(result); //возвращаем объект с родительскими элементами
    },
    //возвращает всех родителей элементов elements, удовлетворяющих selector

    //удаляем атрибут
    //attributs - идин или несколько атрибутов которые нужно удалить разделённые прбелами
    removeAttr: function(attributs) {
        attributs = this.string_to_array(attributs); //преобрзуем строковый список в массив

        //перебираем атрибуты для удаления
        for (let b = 0; b < attributs.length; b++) {
            //перебираем все элементы у которых нужно удалить атрибуты
            for (let i = 0; i < this.length; i++) {
                this[i].removeAttribute(attributs[b]); //удаляем указаннй трибут у текущего итерируемого элемента
            }
            //перебираем все элементы у которых нужно удалить атрибуты
        }
        //перебираем атрибуты для удаления

        return this; //возвращаем объект this
    },
    //удаляем атрибут

    //дополняем или перезаписываем значение атрибута
    //attribut - один атирибут занчение которого нужно получить или изменить
    //value - значение которое нужно задать атрибуту
    //type - тип операции с атрибутом: "reset" - перезапишет значение атрибута, "inset" - добавит value к текущему значению атрибута
    attr: function(attribut, value = null, type = "reset") {
        //если занчение для атрибута не указано то просто возвращаем текущее значение атрибута в виде строки
        if (value === null) {
            return this[0].getAttribute(attribut); //возвращаем значение атрибута элемента, или первого из объекта с элементами
        }
        //если занчение для атрибута не указано то просто возвращаем текущее значение атрибута в виде строки   

        //перебираем все элементы у которых нжно произвести операции с атрибутами
        for (let i = 0; i < this.length; i++) {

            //перезапись атрибута со значением
            if (type === "reset") {
                this[i].setAttribute(attribut, value);
            }

            //дополняем заначение атрибута
            if (type === "inset") {
                let attr_data = this[i].getAttribute(attribut); //текущее значение атрибута
                attr_data ? this[i].setAttribute(attribut, attr_data + " " + value) : this[i].setAttribute(attribut, value); //если у атрибута уже было какое-то начение то объединяем их если не было то просто записываем новое чтоб избежать "null value"
            }
            //дополняем заначение атрибута
        }
        //перебираем все элементы у которых нжно произвести операции с атрибутами

        return this; //возвращаем объект this
    },

    //проверяем видимость элемента для заданых элементов, т.е. находится ли элемент какой-то своей частью в пределах проверяемх блоков, или в пределах окна браузера (части экра которую видит пользователь)
    //ВАЖНО:если нужно определить виден ли элемент на экране используем where_search = $(window)
    //callback - функция которая будет вызвана для каждого отслеживаемого элемента и ей в качестве параметров будут переданы два значения: 
    //1)target - текущий отслеживаемый элемент
    //2)el_fo_search - текущий элемент на границах которого зафиксированно соответствие условиям обнаружения
    //where_search - элемент или набор элементов для которых мы пытаемся обнаружить полное или частичное присутствие каждого элемента из this, если хоть один элемент не удовлетворяет условиям, приписанным в settings, присутствия в границах элемента where_search то вся функция  будет прервана и вернёт false
    //settings - настройки для управления обнаружением элементов
    check_visible: function({ callback = null, where_search = $(window), settings = {} }) {

        let target_elements = this, //эти элементы мы отслеживаем для определения пересечния границ элементов where_search

            final_result = false, //если бы передан для отслеживания более чем один элемент в target_elements то будет использовано состояние видимости послежнего их элементов target_elements, т.е. простыми словами данная функция вернёт логическое занчение видимости последнего элемента из target_elements в элементах where_search

            //настройки по умолчанию
            default_settings = {
                sensing_distance: { //растояние в пикселях на котором сработает обнаружение элемента в границах элементов where_search, может быть как положительным так и отрицательным значение, если к пример 200px то обнаружение элемента в границах элементов where_search будет сигнализированно за 200px до пересечения искомой границы элементов where_search  (простыми словами мы как бы увеличиваем или уменьшаем границы элементов where_search в пределах которых будет осуществялтся поиск элемента)
                    top: 0, //растояние в пикселях от верхней границы элементов where_search при котором произойдёт обнаружение вхождение отслеживаемого элемента в границы элементов where_search с верхнего направления
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                search_dir: { //указывает в каких направлениях мы ищем пересечение границ элементов where_search отслеживаемым элементом
                    //ПРИМЕЧАНИЕ: данные значение НЕ будут учитываться если нужно обнаружить полное присутствие элемента в элементах where_search
                    top: true, //элемент будет найден тогда когда пересечёт верхнюю границу элементов where_search, если false не учитывает пересечение границ элементов where_search в этом направлении
                    right: true,
                    bottom: true,
                    left: true
                },

                //настройки для обнаружения полного присутствия элемента в границах элементов where_search
                fully_inner_status: false, //учитывать только полное присутствие искомого элемента в границах элементов where_search 
                fully_inner_dirs: { //в каких плоскостях учитыватья полное вхождение
                    //ПРИМЕЧАНИЕ: не будет учитываться если fully_inner_status = false, т.е. не нужно обнаруживать полное вхождение
                    vertical: true, //учитывать только когда элемент находится в вертикальных предаелах обнаружения в границах элементов where_search
                    gorisontal: true
                }
                //настройки для обнаружения полного присутствия элемента в границах элементов where_search
            },
            //настройки по умолчанию

            window_pageYOffset = window.pageYOffset, //присваеваем чтоб обращаться к локальным переменным
            window_pageXOffset = window.pageXOffset;

        settings = Object.assign({}, default_settings, settings); // настройки по умолчанию объединяем и заменяем настройками пользователя

        //выполяняем проверку для каждого отслеживаемого элемента
        target_elements.each(target => {
            let result = true, //если будет false то значить элемент не удовлетворяем условиям обнаружения хотябы в одном элементе для поиска where_search

                target_position = target.getBoundingClientRect(), //получаем объект с поизициями отслеживаемого элемента

                //позиции элемента относительно всего документа
                target_data = {
                    top: window_pageYOffset + target_position.top,
                    right: window_pageXOffset + target_position.right,
                    bottom: window_pageYOffset + target_position.bottom,
                    left: window_pageXOffset + target_position.left
                };
            //позиции элемента относительно всего документа

            //перебираем все элементы в которых мы ищем пересечение границ текущего искомого элемента target
            where_search.each(el_fo_search => {
                if (!result) return false; //если было хоть одно не соответствие то прерываем дальнейший перебор и завершаем функцию

                //позиции элемента в котором будем искать пересечение границ
                let el_fo_search_position = el_fo_search === window ? {
                    top: window_pageYOffset,
                    right: window_pageXOffset + document.documentElement.clientWidth,
                    bottom: window_pageYOffset + document.documentElement.clientHeight,
                    left: window_pageXOffset
                } : {
                    top: window_pageYOffset + el_fo_search.getBoundingClientRect().top,
                    right: window_pageXOffset + el_fo_search.getBoundingClientRect().right,
                    bottom: window_pageYOffset + el_fo_search.getBoundingClientRect().bottom,
                    left: window_pageXOffset + el_fo_search.getBoundingClientRect().left
                };
                //позиции элемента в котором будем искать пересечение границ

                //условно увеличиываем/уменьшаем границы элемента where_search в пределах которых будет происходить обнаружение
                el_fo_search_position.top = el_fo_search_position.top - settings.sensing_distance.top; //меняем значение верхней позиции элемента where_search чтоб пересечение или вхождение в его границы считалось раньше или позже в зависимости от знака пользовательского значение указанного в настройках
                el_fo_search_position.right = el_fo_search_position.right + settings.sensing_distance.right;
                el_fo_search_position.bottom = el_fo_search_position.bottom + settings.sensing_distance.bottom;
                el_fo_search_position.left = el_fo_search_position.left - settings.sensing_distance.left;
                //условно увеличиываем/уменьшаем границы элемента where_search в пределах которых будет происходить обнаружение

                //если нужно определить когда элемент полностью находится в нужных плоскостях элемента where_search ++
                if (settings.fully_inner_status) {
                    if (settings.fully_inner_dirs.vertical && settings.fully_inner_dirs.gorisontal) { //элемент должен быть виден полностью и по вертикали и по горизонтали ++
                        if (el_fo_search_position.top > target_data.top ||
                            el_fo_search_position.right < target_data.right ||
                            el_fo_search_position.bottom < target_data.bottom ||
                            el_fo_search_position.left > target_data.left) return result = false; //если элемент не видно, помечаем что уже неудовлетворили хотяб одному условию и можно прерывать дальнейшие проверки и прерываем текущий цикл each
                    } else if (settings.fully_inner_dirs.vertical) { //элемент должен быть виден полностью по вертикали ++
                        if (el_fo_search_position.top > target_data.top ||
                            el_fo_search_position.bottom < target_data.bottom) return result = false; //если элемент не видно, помечаем что уже неудовлетворили хотяб одному условию и можно прерывать дальнейшие проверки и прерываем текущий цикл each
                    } else if (settings.fully_inner_dirs.gorisontal) { //элемент должен быть виден полностью по горизонтали ++
                        if (el_fo_search_position.right < target_data.right ||
                            el_fo_search_position.left > target_data.left) return result = false; //если элемент не видно, помечаем что уже неудовлетворили хотяб одному условию и можно прерывать дальнейшие проверки и прерываем текущий цикл each
                    } else return result = false; //если не заданны плоскости в которых необходимо отслеживать нахождение элемента!
                }
                //если нужно определить когда элемент полностью находится в нужных плоскостях элемента where_search

                //если нужно просто определить пересёк ли отслеживаемый элемент указанные границы элемента where_search
                else {
                    //если задано отслеживать пересечение элементом верхней границы элементов where_search
                    if (settings.search_dir.top) {
                        //если элемент не пересекал верхнюю границу элементов where_search
                        if (el_fo_search_position.top >= target_data.bottom) return result = false; //помечаем что уже неудовлетворили хотяб одному условию и можно прерывать дальнейшие проверки и прерываем текущий цикл each
                    }
                    //если задано отслеживать пересечение элементом верхней границы элементов where_search

                    //если задано отслеживать пересечение элементом правой границы элементов where_search
                    if (settings.search_dir.right) {
                        //если элемент не пересекал правую границу элементов where_search
                        if (el_fo_search_position.right <= target_data.left) return result = false;
                    }
                    //если задано отслеживать пересечение элементом правой границы элементов where_search

                    //если задано отслеживать пересечение элементом нижней границы элементов where_search
                    if (settings.search_dir.bottom) {
                        //если элемент не пересекал нижнюю границу элементов where_search
                        if (el_fo_search_position.bottom <= target_data.top) return result = false;
                    }
                    //если задано отслеживать пересечение элементом нижней границы элементов where_search

                    //если задано отслеживать пересечение элементом левой границы элементов where_search
                    if (settings.search_dir.left) {
                        //если элемент не пересекал левую границу элементов where_search
                        if (el_fo_search_position.left >= target_data.right) return result = false;
                    }
                    //если задано отслеживать пересечение элементом левой границы элементов where_search
                }
                //если нужно просто определить пересёк ли отслеживаемый элемент указанные границы элемента where_search

                if (callback) callback(target, el_fo_search); //выполняем callback на успешное обнаружение элемента при пересечении отслеживаемых границ, в параметрах передаём элемент который отследили target и элемент в котором отслеживали el_fo_search

                final_result = true; //каждый раз перезаписываем видимость текужего элемента
            });
            //перебираем все элементы в которых мы ищем пересечение границ текущего искомого элемента target

        });
        //выполяняем проверку для каждого отслеживаемого элемента

        return final_result; //данная функция вернёт логическое занчение видимости последнего элемента из target_elements в элементах where_search
    },
    //проверяем видимость элемента для заданых элементов, т.е. находится ли элемент какой-то своей частью в пределах проверяемх блоков, или в пределах окна браузера

    //добавляем слушатель события
    //events - строка событий которые нужно прослушивать на элементе, пример: "touchend click resize focus blur"
    //callback - функция которую нужно вызвать при срабатывании события из строки events, можно указать название функции, пример: touch_menu_open_close ; или указать функцию, пример: function(){console.log("Выполняем что-то, при срабатывании события из массива events")}
    //options_event - сюда нужно передать объект с обциями для данного слушателя
    //custom_settings - настрйоки которые будт переданы в кастомные события созданые пользователем такие как swipe
    on: function({ events, callback, options_event = {}, custom_settings, elements = this }) {
        let events_list = this.string_to_array(events); //преобрзуем строковый список в масив

        options_event = Object.assign({}, { //объединяем параметры пользователя с параметрами по умолчанию
            passive: true
        }, options_event);

        //перебираем все переданные элементы к которым нужно подключить слушатели
        for (let i = 0; i < elements.length; i++) {
            //перебираем все события которые нужно прослушивать
            for (let b = 0; b < events_list.length; b++) {

                //если событие кастомное
                if (custom_events_list.hasOwnProperty(events_list[b]) && events_list[b] === "swipe") {
                    custom_events_list[events_list[b]].initiator(elements[i], custom_settings, true) //запускаем соответствующую функцию для регистрации данного события
                }
                //если событие кастомное

                //если событие кастомное
                if (custom_events_list.hasOwnProperty(events_list[b]) && events_list[b] !== "swipe") {
                    //events_list[b] - кастомное имя события наприаер resize_optimize
                    //elements[i] - лемент DOM к которому нужно применить прослушку данного события
                    custom_events_list[events_list[b]].initiator({
                        custom_event_name: events_list[b],
                        el_callback: callback,
                        element: elements[i],
                        custom_settings: custom_settings,
                        listener_action: true
                    }); //запускаем соответствующую функцию для регистрации данного события
                }
                //если событие кастомное

                if (callback) elements[i].addEventListener(events_list[b], callback, options_event); //только если передан callback, т.к. при кастомных событиях он может быть неопределён
            }
            //перебираем все события которые нужно прослушивать
        }
        //перебираем все переданные элементы к которым нужно подключить слушатели
    },
    //добавляем слушатель события

    //удаляем слушатель события
    //events - строка событий которые нужно отключить от прослушивания для элемента, пример: "touchend click resize"
    //callback - функция которая должна быть отключена для данных слушателей событий
    //custom_settings - настрйоки которые будт переданы в кастомные события созданые пользователем такие как swipe
    off: function({ events, callback, options_event = {}, custom_settings, elements = this }) {
        let events_list = this.string_to_array(events); //преобрзуем строковый список в масив

        options_event = Object.assign({}, { //объединяем параметры пользователя с параметрами по умолчанию
            passive: true
        }, options_event);

        //перебираем все элементы у которых нужно отключить слушатели событий events_list
        for (let i = 0; i < elements.length; i++) {
            //перебираем все события которые нужно отключить
            for (let b = 0; b < events_list.length; b++) {

                //если событие кастомное
                if (custom_events_list.hasOwnProperty(events_list[b]) && events_list[b] === "swipe") {
                    custom_events_list[events_list[b]].initiator(elements[i], custom_settings, false) //запускаем соответствующую функцию для регистрации данного события
                }
                //если событие кастомное

                //если событие кастомное
                if (custom_events_list.hasOwnProperty(events_list[b]) && events_list[b] !== "swipe") {
                    //events_list[b] - кастомное имя события наприаер resize_optimize
                    //elements[i] - лемент DOM к которому нужно применить прослушку данного события
                    custom_events_list[events_list[b]].initiator({
                        custom_event_name: events_list[b],
                        el_callback: callback,
                        element: elements[i],
                        custom_settings: custom_settings,
                        listener_action: false
                    });
                }
                //если событие кастомное


                elements[i].removeEventListener(events_list[b], callback, options_event); //отключаем слушатель
            }
            //перебираем все события которые нужно отключить
        }
        //перебираем все элементы у которых нужно отключить слушатели событий events_list
    }
    //удаляем слушатель события

};
//объект с основными функциями


//функция инициализирует первый поиск по selector-у и возвращает сформированный объект obj с прототипом KSN_jQuery
window.$ = function(selector) {
    let obj = Object.create(KSN_jQuery); //создаём пустой объект с прототипом KSN_jQuery
    return obj.init(selector); //инициализируем, возвращаем наш объект obj с прототипом KSN_jQuery и всеми элементами найдеными по селекторам
}
//функция инициализирует первый поиск по selector-у и возвращает сформированный объект obj с прототипом KSN_jQuery