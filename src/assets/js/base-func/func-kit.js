//функция сравнивет данные из check_value с data_fo_wait и когда они будут равными завершит функцию
//ВАЖНО: возвращает Promise !!!
//check_value - функция, результат выполнение которой будет сравниватьтся с data_fo_wait дучше писать на нативном js чтоб быстрее выполнялась
//data_fo_wait - данные которые мы хотим дождаться от функции check_value
//track - индентификатор который позволяет понять что отслеживаемые свойства связанны так что если отслеживается изменение одного то отслеживание изменения всех прочтих нужно прервать
//abort_trigger - функция которя выпоянется на каждом цыкле проверок если она задана и проверяет нужно ли делать проверки дальше или что-то поменялось и нужно прервать эти циклы поверок. Проверки будут преваны если abort_trigger вернёт при выполнении true
//ПРИМЕЧАНИЕ: abort_trigger используется именно в качестве функции так как сслыаться на меняющееся свойство объекта мы не можем т.к. в аргументах функции будет просто использован примитив этого значения которые не будет менятся синхронно со свойством объекта
//max_time_length - максимальное время в секундах которое будет выполняться проверка
//interval - интервал в миллисекундах через котороый будет производиться проверка
/*пример использования
async function() {
    делаем что-то
    await bf.wait(() => el.css("height"), "20px"); ждём пока () => el.css("height") не вернёт нам "20px"
    делаем что-то
    await bf.wait(() => item.css("top"), "0px", ()=> GDS.test.aborted); ждём пока () => item.css("top") не вернёт нам "0px"
    делаем что-то, или ()=> GDS.test.aborted вернёт true и тогда функция будет прервана досрочно
}*/
const wait_timers = {};

function wait(check_value, data_fo_wait, track = null, abort_trigger = null, max_time_length = 10, interval = 10) {
    //возвращаем промис с результатами ожидания
    return new Promise((resolve, reject) => {
        if (typeof check_value !== "function") return reject("check_value MUST BE A FUNCTION"); //если check_value не функция

        let time_start = new Date().getTime(), //время старата в миллисекундах
            time_length = max_time_length * 1000, //время на выполнение в миллисекундах
            stop_time = time_start + time_length; //время на котором выполнение таймера будет прервано

        if (track) clearInterval(this.wait_timers[track]); //если задан track то сначало удаляем циклическую функцию по его id

        //создаём циклическую проверку соответствия check_value с data_fo_wait
        let timer_id = setInterval(() => {
            if (typeof abort_trigger === "function") {
                if (abort_trigger()) return reject("ABORT"); //если abort_trigger вернёт true прерываем функцию
            }

            if (track) this.wait_timers[track] = timer_id; //если задан track записываем id этого цикла

            if (check_value() === data_fo_wait) {
                if (track) delete this.wait_timers[track]; //если задан track то после завершения отслеживания удаляем из списка его id
                clearInterval(timer_id);
                return resolve(); //заверщаем функцию чтоб не было дальнейших проверок
            }

            if (new Date().getTime() >= stop_time) {
                if (track) delete this.wait_timers[track]; //если задан track то после завершения отслеживания удаляем из списка его id
                clearInterval(timer_id);
                return reject("TIMEOUT");
            }
        }, interval);
        //создаём циклическую проверку соответствия check_value с data_fo_wait
    });
    //возвращаем промис с результатами ожидания
}
//функция сравнивет данные из check_value с data_fo_wait и когда они будут равными завершит функцию



function request_to_server({ data_to_send, error_dop_html = null }) {
    return new Promise(async (resolve, reject) => {
        let error, //сюда будет записана ошибка если появится
            response = await fetch('/ajax.php', { //запрос на сервер
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(data_to_send)
            }).catch(() => error = `<div class="search_fail">Проблемы с доступом к серверу, проверьте подключение к сети или перезагрузите страницу. Если это не поможет подождите некоторое время вероятнее всего мы уже работаем над устранение проблемы!</div>${error_dop_html}`);

        if (error) return reject(error); //если во время запроса возникла критическая ошибка например сайт недоступен или у пользователя пропал интернет то мы выводим ошибку

        if (!response.ok) return reject(`<div class="search_fail">На стороне сервера возникла ошибка ${response.status}, мы уже работаем над её исправлением. Приносим извинения за неудобства!</div>${error_dop_html}`);

        let result = await response.json(); //ответ в формате json

        return resolve(result);
    });
}

export { wait, request_to_server };