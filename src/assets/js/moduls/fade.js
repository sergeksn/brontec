import { wait } from '@js-libs/func-kit';

export default class {
    constructor(el) {
        this.el = el; //записываем элемент который будем скрывать/показывать

        this.sl = w.getComputedStyle(this.el); //живая коллекция стилей для нашего элемента

        this.status = this.sl.opacity !== '0' ? 'show' : 'hide'; //устанавливаемс статус видимости в зависимости от того скрыт элемент или нет

        this.el.ksn_fade = this; //записываем экземпляр объекта управления данным прозрачности в его свойства
    }

    //получает время оставшиеся для выполянения перехода
    //т.е. если мы начали скрывать блок когда он открылася только на половину, то мы не будем использовать полное вр6емя перехода, а используем пропорционально то вреям которе нужно чтоб с той же скоростью завершить часть растояния перехода
    get_remaining_time(started_value, final_value, duration) {
        let curret_value = this.sl.opacity;

        if (final_value - curret_value === 0) return 0; //если финальное значение не отличается от текущего значения то ставим длительность равную нулю

        return ((final_value - curret_value) * duration) / (final_value - started_value); //получаем время которое необходимо чтоб дозавершить анимацию
    }
    //получает время оставшиеся для выполянения перехода

    //фнукция показывает элемент путём увеличения его прозрачности
    //params.minmax - массива вида [0.1, 0.75] где первое значение это минимальное значение прозрачности, а второе это максимальное значение
    //params.duration - продолжительность перехода
    //params.delay - задержка перед началом перехода
    //params.tf - как по времени будет менться скорость анимации перехода, в css параметре
    fade_show(params) {
        return new Promise((resolve, reject) => {
            //выполянем с задержкой если такая есть
            setTimeout(async _ => {
                let el = this.el,
                    minmax = params.minmax ?? [0, 1],
                    duration = this.get_remaining_time(
                        //расчитываем оставшеся время анимации перехода
                        minmax[0],
                        minmax[1],
                        params.duration ?? GDS.anim.time,
                    ),
                    tf = params.tf ?? GDS.anim.css_tfж;

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
                } //если попытались показать блок когда он в процеес показа возвращаем промис с процессом его показа

                this.status = 'pending to show'; //помечаем что блок в процессе появления

                //задём парамеры перехода
                el.style.transitionProperty = 'opacity';
                el.style.transitionDuration = duration + 'ms';
                el.style.transitionTimingFunction = tf;

                this.sl.transitionTimingFunction; //нужно чтоб убедится что стили перехода применились

                el.style.opacity = minmax[1]; //применяем к элементу значение минимальной прозрачности

                this.sl.opacity; //нужно чтоб убедится что стили прозрачности применились

                this.pending_to_show_promise = wait(() => parseFloat(this.sl.opacity), minmax[1], { func: () => this.status !== 'pending to show' });

                //дожидаемся показа блока
                await this.pending_to_show_promise
                    .then(() => {
                        //чистим стили
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
    //фнукция показывает элемент путём увеличения его прозрачности

    //фнукция скрывает элемент путём уменшения его прозрачности
    //params.minmax - массива вида [0.1, 0.75] где первое значение это минимальное значение прозрачности, а второе это максимальное значение
    //params.duration - продолжительность перехода
    //params.delay - задержка перед началом перехода
    //params.tf - как по времени будет менться скорость анимации перехода, в css параметре
    fade_hide(params) {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                let el = this.el,
                    minmax = params.minmax ?? [0, 1],
                    duration = this.get_remaining_time(
                        //расчитываем оставшеся время анимации перехода
                        minmax[1], //начальное значеное прозрачности, при начале перехода когад другие переходы не выполянются
                        minmax[0], //конечное значеное прозрачности
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

                //задаём параметры перехода
                el.style.transitionProperty = 'opacity';
                el.style.transitionDuration = duration + 'ms';
                el.style.transitionTimingFunction = tf;

                this.sl.transitionTimingFunction; //нужно чтоб убедится что стили перехода применились

                el.style.opacity = minmax[0]; //применяем к элементу значение максимальной прозрачности

                this.sl.opacity; //нужно чтоб убедится что стили прозрачности применились

                this.pending_to_hide_promise = wait(() => parseFloat(this.sl.opacity), minmax[0], { func: () => this.status !== 'pending to hide' });

                //дожидаемся скрытия блока
                await this.pending_to_hide_promise
                    .then(() => {
                        //чистим стили
                        el.style.transitionProperty = '';
                        el.style.transitionDuration = '';
                        el.style.transitionTimingFunction = '';

                        this.status = 'hide'; //помечаем что блок скрыт

                        return resolve(); //завершаем промис успехом, после успешного завершения перехода
                    })
                    .catch(() => {
                        return reject('block in process showed');
                    });
                //дожидаемся скрытия блока
            }, params.delay ?? 0);
        });
    }
    //фнукция скрывает элемент путём уменшения его прозрачности

    //функйция запускает fade_show или fade_hide в зависимости от статуса блока
    fade_toggle(params) {
        if (this.status === 'hide' || this.status === 'pending to hide') {
            return this.fade_show(params);
        } else if (this.status === 'show' || this.status === 'pending to show') {
            return this.fade_hide(params);
        }
    }
    //функйция запускает fade_show или fade_hide в зависимости от статуса блока
}
