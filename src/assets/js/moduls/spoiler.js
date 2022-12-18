import { wait } from '@js-libs/func-kit';

//ПРИМЕЧАНИЕ: по умолчанию закрытые блоки спойледа должны быть скрыты с помощью атрибута hidden, если изначально блок должен быть открыт то атрибут hidden ставить не нужно, ВАЖНО!!! не нужно использовать dispaly: none
export default class {
    constructor(el) {
        this.el = el; //записываем элемент который будем скрывать/показывать

        this.status = this.el.hidden ? 'hide' : 'show'; //устанавливаемс статус видимости в зависимости от того скрыт элемент атрибутом hidden или нет

        this.block_height = this.get_block_height(this.el); //в самом начале записываем высоту открытого блока спойлера

        this.el.ksn_spoiler = this; //записываем экземпляр объекта управления данным спройлером в его свойства

        w._on('resize_throttle', () => (this.block_height = this.get_block_height(this.el)));//при ресайзе обязательно пересчитываем высоту открытого блока
    }

    //получает высоту полностью раскрытого блока для el
    get_block_height() {
        let block_was_hiddenly = this.el.hidden, //проверяем скрыт ли блок атрибутом hidden
            result;

        if (block_was_hiddenly) this.el.hidden = false; //если блок был скрыт, снимаем сокрытие чтоб получить нужные знаения

        result = this.el.offsetHeight; //получаем высоту полностью раскрытого блока

        if (block_was_hiddenly) this.el.hidden = true; //если блок был скрыт, после получения нужных значение скрываем его снова

        return result;
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
    spoiler_show(params) {
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

                el.style.overflow = 'hidden'; //нужно добавить чтоб когда покажем блок убрав hidden атрибут, текс в блоке не вылез и не отобразился за его пределами
                el.style.height = el.offsetHeight + 'px'; //текущее значение высоты, если блок был скрыт то тут ноль, если же был скрыт не полностью, т.е. мы кликнули в момент закрывания, тот тут будет текщая высота блока

                //делаем все внешние и внутренние отступы блока нулевыми
                el.style.paddingTop = 0;
                el.style.paddingBottom = 0;
                el.style.marginTop = 0;
                el.style.marginBottom = 0;

                el.hidden = false; //делаем блок видимым

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

                        return resolve(); //завершаем промис успехом, после успешного завершения перехода
                    })
                    .catch(() => {
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
    spoiler_hide(params) {
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
                        el.hidden = true; //делаем блок скрытым

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

                        return resolve(); //завершаем промис успехом, после успешного завершения перехода
                    })
                    .catch(() => {
                        return reject('block in process showed'); //если блок начали открывать не дождавщись сокрытия, то отклоняем промис с сообщением
                    });
                //дожидаемся сокрытия блока
            }, params.delay ?? 0);
        });
    }
    //фнукция скрывает элемент путём сворачивания его по высоте

    //функйция запускает spoiler_hide или spoiler_show в зависимости от статуса блока
    spoiler_toggle(params) {
        if (this.status === 'hide' || this.status === 'pending to hide') {
            return this.spoiler_show(params);
        } else if (this.status === 'show' || this.status === 'pending to show') {
            return this.spoiler_hide(params);
        }
    }
    //функйция запускает spoiler_hide или spoiler_show в зависимости от статуса блока
}
