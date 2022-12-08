import anime_original from 'animejs';
import Pop_Up_Message from '@pop-up-messages-main-js';

//оболочка лоя функции анимации, она добавляет длительность и график по умолчанию
function anime(params) {
    if (params.duration === undefined) params.duration = GDS.anim.time;
    if (params.easing === undefined) params.easing = GDS.anim.graph;
    return anime_original(params);
}
//оболочка лоя функции анимации, она добавляет длительность и график по умолчанию

//функция сравнивет данные из check_value с data_fo_wait и когда они будут равными завершит функцию
//ВАЖНО: возвращает Promise !!!
//check_value - функция, результат выполнение которой будет сравниватьтся с data_fo_wait дучше писать на нативном js чтоб быстрее выполнялась
//data_fo_wait - данные которые мы хотим дождаться от функции check_value
//abort_trigger - объект прерывания
//abort_trigger.func - функция которя выпоянется на каждом цыкле проверок если она задана, проверяет нужно ли делать проверки дальше или что-то поменялось и нужно прервать эти циклы поверок. Проверки будут преваны если abort_trigger вернёт при выполнении TRUE !!!
//ПРИМЕЧАНИЕ: abort_trigger используется именно в качестве функции так как ссылаться на меняющееся свойство объекта мы не можем т.к. в аргументах функции будет просто использован примитив этого значения которые не будет менятся синхронно со свойством объекта
//abort_trigger.resolved - если указан как параметр и равен TRUE то прерывание будет с помощью resolve вместо reject
// abort_trigger.message - сообщение почему прервали которое будет передано в resolve или reject в зависимости от abort_trigger.resolved
function wait(check_value, data_fo_wait, abort_trigger = {}) {
    //возвращаем промис с результатами ожидания
    return new Promise((resolve, reject) => {
        let primission = true; //указывает разрешена ли следующая проверка сравнения на следующей перерисовке кадра

        //функция сравнивает значения и выполянет другие проверки, вызывается на каждом кадре перерисовки циклически пока промис не завершится
        function check() {
            if (typeof abort_trigger.func === 'function' && abort_trigger.func()) {
                rem_lisener(); //удаляем слушатель для функции проверяющей виден документ или нет
                let message = abort_trigger.message || 'ABORT'; //если есть сообщени для данного преывания передаём его , если его нет то отправляем сообщение по умолчанию

                return abort_trigger.resolved
                    ? resolve(message)
                    : reject({
                          //передаём максимально полный объект исключения чтоб можно было получить всё необходимое
                          ksn_message: message,
                          initiator_data: {
                              func_name: 'wait',
                              check_value: check_value,
                              data_fo_wait: data_fo_wait,
                              abort_trigger,
                              abort_trigger,
                          },
                      }); //если явно не задан статус прерывания то устанавливание по умолчанию
            } //если передана функция для прерывания то мы выполянем её и в момент когда она вернёт true завершаем промис отклонением или принятие в зависимости от параметров, по умолчанию отклонением
            //console.log(check_value());
            if (check_value() === data_fo_wait) {
                rem_lisener(); //удаляем слушатель для функции проверяющей виден документ или нет
                return resolve(); //успешно заверашем промис когда сравнение вернуло положительный результат
            }

            if (primission) requestAnimationFrame(check); //если на этом кадре сравнение не верно то запускаем проверку уже на следующем кадре
        }
        //функция сравнивает значения и выполянет другие проверки, вызывается на каждом кадре перерисовки циклически пока промис не завершится

        //запускает/останавливает перерисовку кадров на время пока документ не активен
        function document_visibilitychange_pause_wait() {
            if (document.visibilityState === 'visible') {
                //страница видна пользователю
                requestAnimationFrame(check); //запускаем проверку на следующем кадре т.к. мы её остановили
                primission = true; //разрешаем сравнение на дальнейших кадрах
            } else {
                //пользователь свернул браузер или сменил вкладку
                primission = false; //запрещаем сравнение на дальнейших кадрах
            }
        }
        //запускает/останавливает перерисовку кадров на время пока документ не активен

        //удаляет слушатели на visibilitychange после завершения промиса, т.к. прослушивать эти функции нам больше не нужно
        function rem_lisener() {
            document.removeEventListener('visibilitychange', document_visibilitychange_pause_wait);
        }
        //удаляет слушатели на visibilitychange после завершения промиса, т.к. прослушивать эти функции нам больше не нужно

        document.addEventListener('visibilitychange', document_visibilitychange_pause_wait); //привязываем слушатель к событию изменения видимости докмента

        requestAnimationFrame(check); //в самом начале запускаем проверку на следующем кадре перерисовки
    });
    //возвращаем промис с результатами ожидания
}
//функция сравнивет данные из check_value с data_fo_wait и когда они будут равными завершит функцию

//функция получет значение translate свойства transform элемента
//style_list - это живая колекция стилей window.getComputedStyle
function get_translate(style_list) {
    let matrix = new WebKitCSSMatrix(style_list.transform); //создаём объект матицы для получения из него значений

    return {
        //возвращаем объект со значениями translate
        x: matrix.m41,
        y: matrix.m42,
        z: matrix.m43,
    };
}
//функция получет значение translate свойства transform элемента

//получает время оставшиеся для выполянения анимации
function get_remaining_time({ el, started_value, final_value, property, duration }) {
    let curret_value;
    if (duration === undefined) duration = GDS.anim.time; //если не задано вреям перехода берём по умолчанию

    if (['translateX', 'translateY', 'translateZ'].includes(property)) {
        //если анимируем translate
        curret_value = get_translate(w.getComputedStyle(el))[property.replace('translate', '').toLowerCase()]; //текущее знчение анимируемого свойства
    } else {
        //если анимируем opacity
        curret_value = parseFloat(w.getComputedStyle(el).opacity); //текущее знчение анимируемого свойства
    }

    if (final_value - curret_value === 0) return 0; //если финальное значение не отличается от текущего значения то ставим длительность равную нулю

    return ((final_value - curret_value) * duration) / (final_value - started_value); //получаем время которое необходимо чтоб дозавершить анимацию
}
//получает время оставшиеся для выполянения анимации

//проверяем доступность локального хранилища и записываем данные
function set_localStorage(key, value) {
    try {
        w.localStorage.setItem(key, value); //пытаемся записать в хранилище
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.name === 'QUOTA_EXCEEDED_ERR' || e.name === 'W3CException_DOM_QUOTA_EXCEEDED_ERR') {
            new Pop_Up_Message({
                title: 'Не достаточно свободного места в локальном хранилище!',
                message: 'Не достаточно места в локальном хранилище, пожалуйста очистите место для файлов браузера!\nЕсли не помоголо то возможно Вы используете приватный режим (режим инкогнито, режим частного просмотра), перейдите в обычный режим для использования сайтом!<br><br><span class="red">ВАЖНО</span>: для работы сайта требуется доступ к локальному хранилищу браузера!',
                type: 'fatal-error',
            });
            console.error({ ksn_message: 'Не доступно локальное хранилище', error: e, name: e.name });
        } else {
            new Pop_Up_Message({
                title: 'Не доступно локальное хранилище!',
                message: 'При попытке записи в локальное хранилище произошла ошибка!<br><br><span class="red">ВАЖНО</span>: для работы сайта требуется доступ к локальному хранилищу браузера!',
                type: 'fatal-error',
            });
            console.error(e);
        }
        return false;
    }
}
//проверяем доступность локального хранилища и записываем данные

//позволяет отправлять запросы на сервер и обрабатывать ответ и ошибки
//request_data - все данные для запроса включая мотод, заголовки, тели запроса и другое
//url - адрес для запроса
async function request_to_server(request_data, url = GDS.ajax_url) {
    return new Promise((resolve, reject) => {
        fetch(url, request_data)
            .then(response => {
                if (!response.ok) reject({ ksn_message: 'server-error', status: response.status }); //ошибка на строне сервера коды серии 4хх и 5хх

                return response.json(); //преобразуем поток в формат json
            })
            .then(output_data => resolve(output_data)) //возвращаем ответ в формате json
            .catch(e => {
                if (e.name === 'AbortError') return reject({ ksn_message: 'AbortError' }); //'AbortError' - в случае прерывания запроса с помощью signal

                if (e.message === 'Failed to fetch') return reject({ ksn_message: 'Failed to fetch' }); //не удалось подключиться к GDS.ajax_url ресурсу

                if (typeof e.ksn_message === 'undefined') return console.error(e); //если ошибка не наша и не вышеперечисленная выводим её в консоль
                //ПРИМЕЧАНИЕ: return reject() тут можно не втсавлять т.к. ошибка выведенная в консоль уже сообщает что скрипт сломан и на продакшене её быть не должно
            });
    });
}
//позволяет отправлять запросы на сервер и обрабатывать ответ и ошибки

//данная функция показывает блок увеличивая значение его css свойства
//params.el - сам элемент изменения свойств которого мы быдем отслеживать
//params.instance - для передачи объекта хранящего в себе состояние перехода и его настройки
//params.generate_throws - если true то будет выбрасывать исключения когда элемент заблокирован или если появление прерванно из начала сокрытия, по умолчанию false и вместо throw будет просто завершать функцию с помощью return передав туда значение исключения
//params.display - значение которое будет использоваться скриптом как значение свойства display, если ничего не переданно ничего не будет установленно
//params.property - css свойство для анимации
//params.value - значение до которого должно измениться css свойство
//params.started_value - значение от которого ничинается анимация при стартовых условиях
//params.duration - пример 500мс
//params.tf - пример ease
//params.units - единицы измерения для значения
async function show(params) {
    let instance = params.instance, //объект который хранит в себе состояние элемента и его настройки
        generate_throws = params.generate_throws; //нужно ли генерировать исключения

    //если не переданн объект с данными
    if (!instance) {
        if (!params.el.toggle_data) params.el.toggle_data = {}; //создаём у элемента свойство с объектом если его нет

        instance = params.el.toggle_data; //используем созданное свойство как объект для хранения текущих значений состояния перехода, нужно чтоб если мы попытаемся скрывать элемент до того как он окончательно скрылся ему вернулся промис ожидания вместо запуса новой анимации
    }
    //если не переданн объект с данными

    //прерываем если заблокированная любая активность
    if (instance.lock) {
        if (generate_throws) {
            throw { ksn_message: 'locked' };
        } else {
            return 'locked';
        }
    }
    //прерываем если заблокированная любая активность

    if (instance.status === 'show') return; //если блок уже виден

    if (instance.status === 'pending to show') return instance.pending_to_show_promise; //если попытались показать блок когда он в процеес показа возвращаем промис с процессом его показа

    instance.status = 'pending to show'; //помечаем что блок в процессе появления

    params.el.style.pointerEvents = 'auto'; //разрешаем взаимодействовать сразу как началось появление

    if (params.display) params.el.style.display = params.display; //только если параметр передат меняем значение display элмента

    let el = params.el,
        property = params.property || 'opacity', //определяем свойство для анимации, по умолчанию opacity
        value = params.value !== undefined ? params.value : property === 'opacity' ? 1 : undefined, //по умолчанию конечное значение 1 для opacity и undefined для других свойств
        started_value = params.started_value !== undefined ? params.started_value : property === 'opacity' ? 0 : undefined, //по умолчанию начальное значение 0 для opacity и undefined для других свойств
        duration =
            started_value === undefined
                ? params.duration //если не определено значение для отсчёта то вреям анимации берём из параметров без измений
                : get_remaining_time({
                      //расчитываем оставшеся время анимации
                      el: el,
                      started_value: started_value,
                      final_value: value,
                      property: property,
                      duration: params.duration,
                  }),
        units = params.units !== undefined ? params.units : ''; //единицы измерения анимируемого свойства

    //анимируем показ блока
    instance.pending_to_show_promise = anime({
        targets: el,
        [property]: value + units,
        duration: duration,
        easing: params.tf,
        update: anim => instance.status !== 'pending to show' && anim.remove(el), //принцип такой будет возвращать первое ложное выражение this.status !== 'pending to show', но как только он станет true что вернёт и одновременно выполнит в нашем случае anim.remove()
    }).finished;

    //дожидаемся показа блока
    await instance.pending_to_show_promise.then(() => {
        //если анимация завершилась но статус блока не в процессе показа это значит что блок начал процесс скрытия в момент показа, и нам нужно выдать исключение в этом случае
        if (instance.status !== 'pending to show') {
            if (generate_throws) {
                throw { ksn_message: 'block in process hiding' };
            } else {
                return 'block in process hiding';
            }
        }
        //если анимация завершилась но статус блока не в процессе показа это значит что блок начал процесс скрытия в момент показа, и нам нужно выдать исключение в этом случае

        instance.status = 'show'; //помечаем что блок виден

        delete params.el.toggle_data; //по завершению промиса чистим свойства объекта от временного свойства содержащего данные перехода
    });
}
//данная функция показывает блок увеличивая значение его css свойства

//данная функция скрывает блок уменьшая значение его css свойства
//params.el - сам элемент изменения свойств которого мы быдем отслеживать
//params.instance - для передачи объекта хранящего в себе состояние перехода и его настройки
//params.generate_throws - если true то будет выбрасывать исключения когда элемент заблокирован или если появление прерванно из начала сокрытия, по умолчанию false и вместо throw будет просто завершать функцию с помощью return передав туда значение исключения
//params.display - значение которое будет использоваться скриптом как значение свойства display, если ничего не переданно ничего не будет установленно
//params.property - css свойство для анимации
//params.value - значение до которого должно измениться css свойство
//params.started_value - значение от которого ничинается анимация при стартовых условиях
//params.duration - пример 500мс
//params.tf - пример ease
//params.units - единицы измерения для значения
async function hide(params) {
    let instance = params.instance, //объект который хранит в себе состояние элемента и его настройки
        generate_throws = params.generate_throws; //нужно ли генерировать исключения

    //если не переданн объект с данными
    if (!instance) {
        if (!params.el.toggle_data) params.el.toggle_data = {}; //создаём у элемента свойство с объектом если его нет

        instance = params.el.toggle_data; //используем созданное свойство как объект для хранения текущих значений состояния перехода, нужно чтоб если мы попытаемся скрывать элемент до того как он окончательно скрылся ему вернулся промис ожидания вместо запуса новой анимации
    }
    //если не переданн объект с данными

    //прерываем если заблокированная любая активность
    if (instance.lock) {
        if (generate_throws) {
            throw { ksn_message: 'locked' };
        } else {
            return 'locked';
        }
    }
    //прерываем если заблокированная любая активность

    if (instance.status === 'hide') return; //если блок уже скрыт

    if (instance.status === 'pending to hide') return instance.pending_to_hide_promise; //если попытались скрыть блок когда он в процеес скрытия возвращаем промис с процессом его скрытия

    instance.status = 'pending to hide'; //помечаем что блок начал скрываться

    params.el.style.pointerEvents = 'none'; //запрещаем взаимодействовать сразу после начала скрытия

    let el = params.el,
        property = params.property || 'opacity', //определяем свойство для анимации, по умолчанию opacity
        value = params.value !== undefined ? params.value : property === 'opacity' ? 0 : undefined, //по умолчанию конечное значение 0 для opacity и undefined для других свойств
        started_value = params.started_value !== undefined ? params.started_value : property === 'opacity' ? 1 : undefined, //по умолчанию начальное значение 1 для opacity и undefined для других свойств
        duration =
            started_value === undefined
                ? params.duration //если не определено значение для отсчёта то вреям анимации берём из параметров без измений
                : get_remaining_time({
                      //расчитываем оставшеся время анимации
                      el: el,
                      started_value: started_value,
                      final_value: value,
                      property: property,
                      duration: params.duration,
                  }),
        units = params.units !== undefined ? params.units : ''; //единицы измерения анимируемого свойства

    //анимаруем скрытие
    instance.pending_to_hide_promise = anime({
        targets: params.el,
        [property]: value + units,
        duration: duration,
        easing: params.tf,
        update: anim => {
            instance.status !== 'pending to hide' && anim.remove(params.el);
        }, //принцип такой будет возвращать первое ложное выражение instance.status !== 'pending to hide', но как только он станет true что вернёт и одновременно выполнит в нашем случае anim.remove()
    }).finished;

    //дожидаемся скрытия блока
    await instance.pending_to_hide_promise.then(() => {
        //если анимация завершилась но статус блока не в процессе сокрытия это значит что блок начал процесс появления в момент скрытия, и нам нужно выдать исключение в этом случае
        if (instance.status !== 'pending to hide') {
            if (generate_throws) {
                throw { ksn_message: 'block in process showed' };
            } else {
                return 'block in process showed';
            }
        }
        //если анимация завершилась но статус блока не в процессе сокрытия это значит что блок начал процесс появления в момент скрытия, и нам нужно выдать исключение в этом случае

        if (params.display) params.el.style.display = params.display; //только если параметр передат меняем значение display элмента

        instance.status = 'hide'; //помечаем что блок скрыт

        delete params.el.toggle_data; //по завершению промиса чистим свойства объекта от временного свойства содержащего данные перехода
    });
}
//данная функция скрывает блок уменьшая значение его css свойства

export { wait, request_to_server, show, hide, set_localStorage, anime, get_translate };
