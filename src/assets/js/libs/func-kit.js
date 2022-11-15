import anime from 'animejs';
import Pop_Up_Message from '@pop-up-messages-main-js';

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

//проверяем доступность локального хранилища и записываем данные
function set_localStorage(key, value) {
    try {
        window.localStorage.setItem(key, value); //пытаемся записать в хранилище
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
//params.display - какое свойство дисплея должно быть у видимого элемента
//params.el - сам элемент изменения свойств которого мы быдем отслеживать
//params.property - css свойство для анимации
//params.value - значение до которого должно измениться css свойство
//params.duration - пример 500мс
//params.tf - пример ease
async function show(params) {
    if (this.lock) throw { ksn_message: 'locked' }; //прерываем если заблокированная любая активность

    if (this.status === 'show') return; //если блок уже виден

    if (this.status === 'pending to show') return this.pending_to_show_promise; //если попытались показать блок когда он в процеес показа возвращаем промис с процессом его показа

    this.status = 'pending to show'; //помечаем что блок в процессе появления

    //ПРИМЕЧАНИЕ: если params.display === null то значение останется тем что есть у данного блока по умолчанию
    if (params.display !== null) params.el.style.display = params.display || 'block'; //задаём дисплей значение перед показом

    let property = params.property || 'opacity'; //определяем свойство для анимации, по умолчанию opacity

    //анимируем показ блока
    this.pending_to_show_promise = anime({
        targets: params.el,
        [property]: params.value !== undefined ? params.value : 1,
        duration: params.duration || GDS.anim.time,
        easing: params.tf || GDS.anim.graph,
        update: anim => this.status !== 'pending to show' && anim.remove(), //принцип такой будет возвращать первое ложное выражение this.status !== 'pending to show', но как только он станет true что вернёт и одновременно выполнит в нашем случае anim.remove()
    }).finished;

    //дожидаемся показа блока
    await this.pending_to_show_promise.then(() => {
        if (this.status !== 'pending to show') throw { ksn_message: 'block in process hiding' }; //если анимация завершилась но статус блока не в процессе показа это значит что блок начал процесс скрытия в момент показа, и нам нужно выдать исключение в этом случае

        this.status = 'show'; //помечаем что блок виден
    });
}
//данная функция показывает блок увеличивая значение его css свойства

//данная функция скрывает блок уменьшая значение его css свойства
//params.el - сам элемент изменения свойств которого мы быдем отслеживать
//params.display - какое свойство дисплея должно быть у скрытого элемента
//params.property - css свойство для анимации
//params.value - значение до которого должно измениться css свойство
//params.duration - пример 500мс
//params.tf - пример ease
async function hide(params) {
    if (this.lock) throw { ksn_message: 'locked' }; //прерываем если заблокированная любая активность

    if (this.status === 'hide') return; //если блок уже скрыт

    if (this.status === 'pending to hide') return this.pending_to_hide_promise; //если попытались скрыть блок когда он в процеес скрытия возвращаем промис с процессом его скрытия

    this.status = 'pending to hide'; //помечаем что блок начал скрываться

    let property = params.property || 'opacity'; //определяем свойство для анимации, по умолчанию opacity

    //анимаруем скрытие
    this.pending_to_hide_promise = anime({
        targets: params.el,
        [property]: params.value !== undefined ? params.value : 0,
        duration: params.duration || GDS.anim.time,
        easing: params.tf || GDS.anim.graph,
        update: anim => this.status !== 'pending to hide' && anim.remove(), //принцип такой будет возвращать первое ложное выражение this.status !== 'pending to hide', но как только он станет true что вернёт и одновременно выполнит в нашем случае anim.remove()
    }).finished;

    //дожидаемся скрытия блока
    await this.pending_to_hide_promise.then(() => {
        if (this.status !== 'pending to hide') throw { ksn_message: 'block in process showed' }; //если анимация завершилась но статус блока не в процессе сокрытия это значит что блок начал процесс появления в момент скрытия, и нам нужно выдать исключение в этом случае

        //ПРИМЕЧАНИЕ: если params.display === null то значение останется тем что есть у данного блока по умолчанию
        if (params.display !== null) params.el.style.display = params.display || 'none'; //после того как блок пролностью скроется мы ставим ему новый дисплай, по умолчанию none

        this.status = 'hide'; //помечаем что блок скрыт
    });
}
//данная функция скрывает блок уменьшая значение его css свойства

export { wait, get_translate, request_to_server, show, hide, set_localStorage };
