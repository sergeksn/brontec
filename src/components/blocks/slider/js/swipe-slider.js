// import { get_translate, wait } from '@js-libs/func-kit';

// export default class {
//     constructor(slider) {
//         let _this = this,
//             settings = slider.settings,
//             { all_slides, next_button, prev_button } = settings;

//         _this.slider = slider; //так же записываем экземпляр слайдера в данный клас для удобства вызова методов
//         _this.settings = settings; //записываем настрйоки слайдера

//         _this.generate_events_data(); //генерируем имена событий и их функции для реализации отслеживания свайпа

//         all_slides.forEach(el => el._on(_this.events.start.name, _this.events.start.func)); //начинаем слушать событие нажатия мыши и/или касания на каждом слайде

//         if (next_button) next_button._on('click', _this.chenge_slide.bind(_this, true)); //делаем переключение
//         if (prev_button) prev_button._on('click', _this.chenge_slide.bind(_this, false)); //делаем переключение
//     }

//     //генерируем имена событий и их функции для реализации отслеживания свайпа
//     generate_events_data() {
//         let _this = this,
//             { touch_swipe, mouse_swipe } = _this.settings,
//             generate_events = {
//                 start: {
//                     func: _this.start.bind(_this),
//                     name: [], //тут будут храниться события которые будут вызываться для начала слушания свайпа mousedown touchstart
//                 },
//                 move: {
//                     func: _this.move.bind(_this),
//                     name: [], //тут будут храниться события которые будут вызываться во время движения указателя mousemove touchmove
//                 },
//                 finall: {
//                     func: _this.finall.bind(_this),
//                     name: [], //тут будут храниться события которые будут вызываться во время окончания жеста mouseup touchend
//                 },
//                 leave: {
//                     func: _this.leave.bind(_this),
//                     name: [], //тут будут храниться события которые будут вызываться в момент когда указатель покидает элемент или всевозможные ошибки mouseleave touchcancel
//                 },
//                 remove_default: {
//                     func: _this.remove_default.bind(_this),
//                 },
//             }; //содержит события нужные для генерации события свайпа

//         //формируем нужные имена событий
//         if (touch_swipe) {
//             generate_events.start.name.push('touchstart');
//             generate_events.move.name.push('touchmove');
//             generate_events.finall.name.push('touchend');
//             generate_events.leave.name.push('touchcancel');
//         }

//         if (mouse_swipe) {
//             generate_events.start.name.push('mousedown');
//             generate_events.move.name.push('mousemove');
//             generate_events.finall.name.push('mouseup');
//             generate_events.leave.name.push('mouseleave');
//         }
//         //формируем нужные имена событий

//         //генерируем имена событий для реализации отслеживания свайпа
//         generate_events.start.name = generate_events.start.name.join(' ');
//         generate_events.move.name = generate_events.move.name.join(' ');
//         generate_events.finall.name = generate_events.finall.name.join(' ');
//         generate_events.leave.name = generate_events.leave.name.join(' ');
//         generate_events.remove_default.name = `click ${generate_events.start.name} ${generate_events.move.name} ${generate_events.finall.name} ${generate_events.leave.name}`; //имена событий для отключения действий по умолчанию при кликах
//         //генерируем имена событий для реализации отслеживания свайпа

//         this.events = generate_events;
//     }
//     //генерируем имена событий и их функции для реализации отслеживания свайпа

//     //подключаем/отключаем события для роботы прокрутки слайдера
//     toggle_events(action) {
//         let _this = this,
//             { slider } = _this.settings;

//         slider[action](_this.events.move.name, _this.events.move.func, { passive: false }); //добавляем слушатель события для перемещения курсора или пальца

//         slider[action](_this.events.finall.name, _this.events.finall.func, { passive: false }); //добавляем слушатель события когда кнопка мыши отпущена или палец поднят

//         slider[action](_this.events.leave.name, _this.events.leave.func, { passive: false }); //добавляем слушатель события курсор мыши покинул элемент или палец вышел за пределы экрана или ещё какая-то ошибка на сенсоре

//         slider[action](_this.events.remove_default.name, _this.events.remove_default.func, { passive: false }); //отключаем события по умолчанию для вспомогательных событий
//     }
//     //подключаем/отключаем события для роботы прокрутки слайдера

//     //функция призвана остановить события браузера по умолчанию для click mousedown touchstart mousemove touchmove mouseup touchend mouseleave touchcancel
//     remove_default(e) {
//         e.cancelable && e.preventDefault(); //ВАЖНО: отменяем по умолчанию только если данное событие может быть отменено иначе будут предупреждения
//     }
//     //функция призвана остановить события браузера по умолчанию для click mousedown touchstart mousemove touchmove mouseup touchend mouseleave touchcancel

//     //по нажатию на слайдер начинаем отслеживать свайп
//     start(e) {
//         let _this = this,
//             settings = _this.settings,
//             { slider_wrap, vertical_slider, lock } = settings;

//         if (lock) return; //прерываем если слайдер заблокирован

//         if (e.touches && (e.touches.length > 1 || e.targetTouches.length > 1)) return; //если экран сенсорный экран и если на экране сейчас более одного касания или на данном элементе уже есть касание то мы игнорируем все остальные касание по данному элементу

//         _this.toggle_events('_on'); //подключаем все слушатели для работы свайпа слайдера

//         settings.start_point = vertical_slider ? e.pageY : e.pageX; //точка нажатия чтоб определять на сколько сдвигать слайдер
//         settings.current_sgvig = get_translate(w.getComputedStyle(slider_wrap))[vertical_slider ? 'y' : 'x']; //получаем текущие параметры трансформации
//     }
//     //по нажатию на слайдер начинаем отслеживать свайп

//     //срабатывает при движении активного указателя по слайдеру
//     move(e) {
//         e = e.touches === undefined ? e : e.changedTouches[0]; //для touchend определяем данные события первого касания

//         let _this = this,
//             settings = _this.settings,
//             { slider_wrap, vertical_slider, lock } = settings,
//             sdvig = settings.current_sgvig + (vertical_slider ? e.pageY : e.pageX) - settings.start_point; //получаем нужный сдвиг

//         if (lock) return; //прерываем если слайдер заблокирован

//         slider_wrap.style.transform = 'translate' + (vertical_slider ? 'Y' : 'X') + '(' + sdvig + 'px)'; //задаём смещение
//     }
//     //срабатывает при движении активного указателя по слайдеру

//     finall() {
//         let _this = this;

//         _this.toggle_events('_off'); //откючаем все слушатели для отслеживания сайпа по сладеру
//     }

//     leave() {
//         let _this = this;

//         _this.toggle_events('_off'); //откючаем все слушатели для отслеживания сайпа по сладеру
//     }

//     //переключаем слайд
//     async chenge_slide(next_slide) {
//         if (this.settings.lock) return; //прерываем если слайдер заблокирован

//         let _this = this,
//             settings = _this.settings,
//             { slider, slide_width, slide_height, slider_wrap, slider_wrap_sl, vertical_slider, slide_delay, slide_duration, slide_tf, all_slides, space_between, slider_base_translate } = settings,
//             slide_prop = vertical_slider ? slide_height : slide_width, //css свойство слайда в зависимости от типа слайдера
//             translate = get_translate(slider_wrap_sl)[vertical_slider ? 'y' : 'x'], //получаем текущие параметры трансформации
//             clone,
//             clean_transition_anim = () => {
//                 slider_wrap.style.transition = ''; //чистим парамеры перехода
//                 settings.lock = false; //снимаем блокировку слайдера
//                 slider_wrap._off('transitionend', clean_transition_anim); //удаляем слушатель

//                 if (next_slide) {
//                     slider_wrap.append(all_slides[0]);
//                 } else {
//                     clone.remove();

//                     slider_wrap.prepend(all_slides[all_slides.length - 1]);
//                 }

//                 slider_wrap.style.transform = 'translate' + (vertical_slider ? 'Y' : 'X') + '(' + slider_base_translate + 'px)'; //возвращаем слайдер в исходное положение по смещению

//                 slider.ksn_slider.write_all_slides();//записываем все слайды по новой т.к. мы сейчас удаляли и добавляли слайды
//             };

//         settings.lock = true; //блокируем слайдер

//         if (next_slide) {
//             translate = translate - slide_prop - space_between; //вычисляем смещение

//             clone = all_slides[0].cloneNode(true);

//             slider_wrap.append(clone);
//         } else {
//             clone = all_slides[all_slides.length - 1].cloneNode(true);

//             slider_wrap.prepend(clone);

//             let start_translate = +(translate - slide_prop - space_between).toFixed(2);
     

//             slider_wrap.style.transform = 'translate' + (vertical_slider ? 'Y' : 'X') + '(' + start_translate + 'px)'; //задаём смещение

//             await wait(() => get_translate(slider_wrap_sl)[vertical_slider ? 'y' : 'x'], start_translate); //чтоб всё сработало правильно нужно дождаться применениния данной трансформации
//         }

//         slider_wrap.style.transition = `transform ${slide_duration}ms ${slide_tf} ${slide_delay}ms`; //задём парамеры перехода

//         slider_wrap._on('transitionend', clean_transition_anim); //ждём окончания перехода

//         slider_wrap.style.transform = 'translate' + (vertical_slider ? 'Y' : 'X') + '(' + translate + 'px)'; //задаём смещение
//     }
//     //переключаем слайд
// }
