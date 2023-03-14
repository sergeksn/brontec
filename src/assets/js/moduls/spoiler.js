import { wait } from '@js-libs/func-kit';
import Fade from '@js-moduls/fade';

//ПРИМЕЧАНИЕ: по умолчанию закрытые блоки спойледа должны быть скрыты с помощью класса spoiler-hidden, если изначально блок должен быть открыт то класс spoiler-hidden ставить не нужно
class Spoiler {
    constructor(el) {
        this.el = el; //записываем элемент который будем скрывать/показывать

        this.status = this.el.classList.contains('spoiler-hidden') ? 'hide' : 'show'; //устанавливаемс статус видимости в зависимости от того скрыт элемент или нет

        this.set_block_height(); //в самом начале записываем высоту открытого блока спойлера

        this.el.ksn_spoiler = this; //записываем экземпляр объекта управления данным спройлером в его свойства

        w._on('resize_throttle', this.set_block_height.bind(this)); //при ресайзе обязательно пересчитываем высоту открытого блока
    }

    //получает высоту полностью раскрытого блока для el
    set_block_height() {
        let block_was_hiddenly = this.el.classList.contains('spoiler-hidden'), //проверяем скрыт ли блок
            result;

        if (block_was_hiddenly) this.el.classList.remove('spoiler-hidden'); //если блок был скрыт, снимаем сокрытие чтоб получить нужные знаения

        result = this.el.offsetHeight; //получаем высоту полностью раскрытого блока

        if (block_was_hiddenly) this.el.classList.add('spoiler-hidden'); //если блок был скрыт, после получения нужных значение скрываем его снова

        this.block_height = result; // записываем высоту открытого блока спойлера
    }
    //получает высоту полностью раскрытого блока для el

    //получает время оставшиеся для выполянения перехода
    //т.е. если мы начали скрывать блок когда он открылася только на половину, то мы не будем использовать полное вр6емя перехода, а используем пропорционально то вреям которе нужно чтоб с той же скоростью завершить часть растояния перехода
    get_remaining_time(started_value, final_value, duration) {
        let curret_value = this.el.offsetHeight;

        if (final_value - curret_value === 0) return 0; //если финальное значение не отличается от текущего значения то ставим длительность равную нулю

        return ((final_value - curret_value) * duration) / (final_value - started_value); //получаем время которое необходимо чтоб дозавершить анимацию
    }
    //получает время оставшиеся для выполянения перехода

    //фнукция показывает элемент путём разворачивания его по высоте
    //params.duration - продолжительность перехода
    //params.delay - задержка перед началом перехода
    //params.tf - как по времени будет менться скорость анимации перехода, в css параметре
    spoiler_show(params = {}) {
        return new Promise((resolve, reject) => {
            //выполянем с задержкой если такая есть
            setTimeout(async _ => {
                let el = this.el,
                    final_value = this.block_height, //высота до которой должен раскрыться блок при полном раскрытии
                    duration = this.get_remaining_time(
                        //расчитываем оставшеся время анимации перехода
                        0, //высота с которой стартует анимация при условии чтоб блок скрыт
                        final_value,
                        params.duration ?? GDS.anim.time,
                    ),
                    tf = params.tf ?? GDS.anim.css_tf;

                if (this.lock) return reject('locked'); //прерываем если заблокированная любая активность

                if (this.status === 'show') return resolve('already to show'); //если блок уже виден

                //если попытались показать блок когда он в процеес показа возвращаем промис с процессом его показа
                if (this.status === 'pending to show') {
                    await this.pending_to_show_promise
                        .then(() => {
                            resolve();
                        })
                        .catch(() => {
                            reject('block in process hiding');
                        });
                    return;
                }
                //если попытались показать блок когда он в процеес показа возвращаем промис с процессом его показа

                this.status = 'pending to show'; //помечаем что блок в процессе появления

                el.style.overflow = 'hidden'; //нужно добавить чтоб когда покажем блок убрав spoiler-hidden класс, текс в блоке не вылез и не отобразился за его пределами
                el.style.height = el.offsetHeight + 'px'; //текущее значение высоты, если блок был скрыт то тут ноль, если же был скрыт не полностью, т.е. мы кликнули в момент закрывания, тот тут будет текщая высота блока

                //делаем все внешние и внутренние отступы блока нулевыми
                el.style.paddingTop = 0;
                el.style.paddingBottom = 0;
                el.style.marginTop = 0;
                el.style.marginBottom = 0;

                el.classList.remove('spoiler-hidden'); //делаем блок видимым

                el.offsetHeight; //делаем данный вызов для того чтоб убедится что новое значение высоты применилось к блоку

                el.style.transitionProperty = 'height margin padding'; //задём парамеры перехода
                el.style.transitionDuration = duration + 'ms';
                el.style.transitionTimingFunction = tf;

                el.style.height = final_value + 'px'; //задаём высоту блока которая должна быть при его полном раскрытии

                //убираем нулевые значения отступов
                el.style.paddingTop = '';
                el.style.paddingBottom = '';
                el.style.marginTop = '';
                el.style.marginBottom = '';

                //теперь под управлением свойтсва transition высота и все отступы будут плавно анимироваться до своих значение

                this.pending_to_show_promise = wait(() => el.offsetHeight, final_value, { func: () => this.status !== 'pending to show' }); //создаём промис для данного перехода, он выполниться когда высота блока будет равна полной высоте при открытии, данный промис будет отклонён если во время его выполнения блок сменит статус

                //дожидаемся показа блока
                await this.pending_to_show_promise
                    .then(() => {
                        //по завершении перехода чистим все стили за ненадобностью
                        el.style.height = '';
                        el.style.overflow = '';
                        el.style.transitionProperty = '';
                        el.style.transitionDuration = '';
                        el.style.transitionTimingFunction = '';

                        this.status = 'show'; //помечаем что блок виден

                        delete this.pending_to_show_promise; //удаляем уже отработаный промис

                        return resolve(); //завершаем промис успехом, после успешного завершения перехода
                    })
                    .catch(() => {
                        delete this.pending_to_show_promise; //удаляем уже отработаный промис

                        return reject('block in process hiding'); //если начали скрывать блк до окончания показа возвращаем отклонённый промис с сообщением
                    });
                //дожидаемся показа блока
            }, params.delay ?? 0);
        });
    }
    //фнукция показывает элемент путём разворачивания его по высоте

    //фнукция скрывает элемент путём сворачивания его по высоте
    //params.duration - продолжительность перехода
    //params.delay - задержка перед началом перехода
    //params.tf - как по времени будет менться скорость анимации перехода, в css параметре
    spoiler_hide(params = {}) {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                let el = this.el,
                    duration = this.get_remaining_time(
                        //расчитываем оставшеся время анимации перехода
                        this.block_height, //высота до которой должен раскрыться блок при полном раскрытии
                        0, //высота до которой должен свернуться блок при полном закрытии
                        params.duration ?? GDS.anim.time,
                    ),
                    tf = params.tf ?? GDS.anim.css_tf;

                if (this.lock) return reject('locked'); //прерываем если заблокированная любая активность

                if (this.status === 'hide') return resolve('already to hide'); //если блок уже скрыт

                if (this.status === 'pending to hide') {
                    await this.pending_to_hide_promise
                        .then(() => {
                            resolve();
                        })
                        .catch(() => {
                            reject('block in process showed');
                        });
                    return;
                }

                this.status = 'pending to hide'; //помечаем что блок в процессе сокрытия

                el.style.height = el.offsetHeight + 'px'; //до начала перехода нужно явно задать стартовую высоту, если болок разкрыт полностью тут будет его максимальная высота в раскрытом состоянии this.block_height, если же он раскрыт не полностью то тут будет текущая высота блока
                el.offsetHeight; //нужно чтоб быть уверенными что нове значение высоты применилось

                //задаём параметры перехода
                el.style.transitionProperty = 'height margin padding';
                el.style.transitionDuration = duration + 'ms';
                el.style.transitionTimingFunction = tf;

                el.style.overflow = 'hidden'; //нужно чтоб содержимое блока скрывалось вместе с ним иначе оно будет видно за его пределами

                el.style.height = '0px'; //скрываем уменьшая высоту переходом transition
                el.offsetHeight; //нужно чтоб быть уверенными что нове значение высоты применилось

                //скрываем уменьшая отступы переходом transition
                el.style.paddingTop = 0;
                el.style.paddingBottom = 0;
                el.style.marginTop = 0;
                el.style.marginBottom = 0;

                this.pending_to_hide_promise = wait(() => el.offsetHeight, 0, { func: () => this.status !== 'pending to hide' }); //записываем в свойства промис, он будет выполнен когад блок полностью свернётся, и будет отклонён если статуст блока измениться, т.е. если он начнёт открываться до окончания скрытия

                //дожидаемся сокрытия блока
                await this.pending_to_hide_promise
                    .then(() => {
                        el.classList.add('spoiler-hidden'); //делаем блок скрытым

                        //чистим стили
                        el.style.height = '';
                        el.style.overflow = '';
                        el.style.paddingTop = '';
                        el.style.paddingBottom = '';
                        el.style.marginTop = '';
                        el.style.marginBottom = '';
                        el.style.transitionProperty = '';
                        el.style.transitionDuration = '';
                        el.style.transitionTimingFunction = '';

                        this.status = 'hide'; //помечаем что блок скрыт

                        delete this.pending_to_hide_promise; //удаляем уже отработаный промис

                        return resolve(); //завершаем промис успехом, после успешного завершения перехода
                    })
                    .catch(() => {
                        delete this.pending_to_hide_promise; //удаляем уже отработаный промис

                        return reject('block in process showed'); //если блок начали открывать не дождавщись сокрытия, то отклоняем промис с сообщением
                    });
                //дожидаемся сокрытия блока
            }, params.delay ?? 0);
        });
    }
    //фнукция скрывает элемент путём сворачивания его по высоте

    //функйция запускает spoiler_hide или spoiler_show в зависимости от статуса блока
    spoiler_toggle(params = {}) {
        if (this.status === 'hide' || this.status === 'pending to hide') {
            return this.spoiler_show(params);
        } else if (this.status === 'show' || this.status === 'pending to show') {
            return this.spoiler_hide(params);
        }
    }
    //функйция запускает spoiler_hide или spoiler_show в зависимости от статуса блока
}

//стандартный спойлер в котором скрывается/показывается контент прозрачностью и плано скрывается/раскрывается спойлер при нажатии
//spoiler_content_wrap - оболочка скрываемого контента именно к ней нужно добавить класс spoiler-hidden чтоб спойлер был скрыт по умолчанию
//spoiler_content - скрываемый контент
//spoiler_toggle_button - элемент по нажатию на которйы будет откарываться/закрыватьяс спойлер
//остальные параметры , название говорит само за себя
function base_spoiler_fade({ spoiler_content_wrap, spoiler_content, spoiler_toggle_button, open_start_func, open_end_func, close_start_func, close_end_func, spoiler_open_settings, spoiler_close_settings, fade_show_settings, fade_hide_settings } = {}) {
    if (!spoiler_content_wrap || !spoiler_content) return console.error('Для функции base_spoiler_fade не указаны обязательные параметры!'); //если не заданы основные параметры то прерываем выполнение и выводим в консоль ошибку

    new Spoiler(spoiler_content_wrap);
    new Fade(spoiler_content);

    //задаём параметры по умолчанию если он не заданы
    spoiler_open_settings = spoiler_open_settings ?? { duration: 300, tf: 'ease-out' };
    spoiler_close_settings = spoiler_close_settings ?? { duration: 300, tf: 'ease-out' };
    fade_show_settings = fade_show_settings ?? { duration: 350, tf: 'ease-out' };
    fade_hide_settings = fade_hide_settings ?? { duration: 350, tf: 'ease-out' };
    open_start_func = open_start_func ?? function () {};
    open_end_func = open_end_func ?? function () {};
    close_start_func = close_start_func ?? function () {};
    close_end_func = close_end_func ?? function () {};
    //задаём параметры по умолчанию если он не заданы

    //получаем контролеры спойлера и сокрытия прозрачностью
    let spoiler_controller = spoiler_content_wrap.ksn_spoiler,
        fade_controller = spoiler_content.ksn_fade;

    function toggle_spoiler() {
        return new Promise((resolve, reject) => {
            //если спройлер закрыт или в процессе закрытия
            if (spoiler_controller.status === 'hide' || spoiler_controller.status === 'pending to hide') {
                open_start_func(); //калбек начало открытия спойлера

                spoiler_controller
                    .spoiler_show(spoiler_open_settings) //ждём открытия спойлера
                    .then(() => {
                        fade_controller
                            .fade_show(fade_show_settings) //ждём показа содержимого
                            .then(() => {
                                open_end_func(); //калбек окончания открытия спойлера
                                resolve(); //завенршаем промис успехом
                            })
                            .catch(() => reject()); //промис завершён неудачей
                    })
                    .catch(() => reject()); //промис завершён неудачей
            }
            //если спройлер закрыт или в процессе закрытия

            //если спройлер открыт
            else if (spoiler_controller.status === 'show') {
                //если контент скрыт или в процесе скрытия
                if (fade_controller.status === 'hide' || fade_controller.status === 'pending to hide') {
                    open_start_func(); //калбек начало открытия спойлера

                    fade_controller
                        .fade_show(fade_show_settings) //ждём показа контента
                        .then(() => {
                            open_end_func(); //калбек окончания открытия спойлера
                            resolve(); //завенршаем промис успехом
                        })
                        .catch(() => reject()); //промис завершён неудачей
                }
                //если контент скрыт или в процесе скрытия

                //если контент виден или в процессе появления
                else if (fade_controller.status === 'show' || fade_controller.status === 'pending to show') {
                    close_start_func(); //калбек начала закрытия спойлера

                    fade_controller
                        .fade_hide(fade_hide_settings) //ждём сокрытия контента
                        .then(() => {
                            spoiler_controller
                                .spoiler_hide(spoiler_close_settings) //закрываем спойлер
                                .then(() => {
                                    close_end_func(); //калбек окончания закрытия спойлера
                                    resolve(); //завенршаем промис успехом
                                })
                                .catch(() => reject()); //промис завершён неудачей
                        })
                        .catch(() => reject()); //промис завершён неудачей
                }
                //если контент виден или в процессе появления
            }
            //если спройлер открыт

            //если спройлер в процессе открытия
            else if (spoiler_controller.status === 'pending to show') {
                close_start_func(); //калбек начала закрытия спойлера

                spoiler_controller
                    .spoiler_hide(spoiler_close_settings) //закрываем спойлер
                    .then(() => {
                        close_end_func(); //калбек окончания закрытия спойлера
                        resolve(); //завенршаем промис успехом
                    })
                    .catch(() => reject()); //промис завершён неудачей
            }
            //если спройлер в процессе открытия
        });
    }
    //функция управляет открытием и закрытием спойлера в зависимости от его состояния

    //записываем в своства оболочки спойлера для удобства контроля програмныйм путём
    spoiler_content_wrap.ksn_base_spoiler_fade = {
        toggle_spoiler: toggle_spoiler,
        spoiler_controller: spoiler_controller,
        fade_controller: fade_controller,
    };
    //записываем в своства оболочки спойлера для удобства контроля програмныйм путём

    //открываем/закрываем спойлеры по клику или нажатию кнопки энтера
    if (spoiler_toggle_button) {
        spoiler_toggle_button._on('click keydown', async e => {
            if (e.type === 'keydown' && e.keyCode !== 13) return; //если мы выбрали спойлер через таб то мы его открываем только при нажатом энтере
            toggle_spoiler().catch(() => {}); //catch нужно добавить чтоб в консоль не сыпались исключения когда открываем/закрываем не полностью открытый/закрытый спойлер
        });
    }

    //открываем/закрываем спойлеры по клику или нажатию кнопки энтера

    spoiler_content_wrap.ksn_spoiler.toggle_spoiler = toggle_spoiler; //в объект настройек и состояния спойлера обавляем функцияю котрая должна показывать/скрывать спойлер
}
//стандартный спойлер в котором скрывается/показывается контент прозрачностью и плано скрывается/раскрывается спойлер при нажатии

export { Spoiler, base_spoiler_fade };
