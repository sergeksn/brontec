import Pop_Up_Message from '@pop-up-messages-main-js';
import { Header } from '@header-main-js';
import { show, hide } from '@js-libs/func-kit';

let form = qs('#otziv'),
    stars_items = qsa('.ostavit-otziv__stars-items div'),
    stars_input = qs('.ostavit-otziv__stars input'),
    input_add_images = qs('.ostavit-otziv__add-button input'),
    plusi_textarea = qs('#plusi'),
    minusi_textarea = qs('#minusi'),
    img_previv_area = qs('.ostavit-otziv__images-previv-wrap'),
    fio_input = qs('#fio'),
    city_input = qs('#city'),
    car_input = qs('#car'),
    policy_checkbox = qs('#polici-konf-checkbox'),
    button_submit = qs('.ostavit-otziv__submit-button'),
    dropbox = qs('.ostavit-otziv__dropbox'),
    CONTROLLER = {
        store: [], // хранилище файлов

        init: function () {
            if (!form) return; //если нет такой формы то прерываем инициализацию

            form._on('submit', this.form_submit.bind(this), { passive: false }); //при отправлке формы перехватываем управление

            button_submit._on('click', this.click_submit_button.bind(this)); //при клике на кнопку отправки

            stars_items.forEach(el => el._on('click', this.click_on_star.bind(this))); //срабатывает при клике на любую из звёздочек

            input_add_images._on('change', e => this.add_images([...e.target.files]));

            this.drag_init(); //инициализирует все необходимые действия для работы перетаскивания
        },

        //инициализирует все необходимые действия для работы перетаскивания
        drag_init: function () {
            let counter = 0,
                drop = e => {
                    e.stopPropagation();
                    e.preventDefault();

                    dropbox.style.opacity = '';
                    counter = 0;

                    this.add_images([...e.dataTransfer.files]);
                };

            form.addEventListener(
                'dragenter',
                e => {
                    e.stopPropagation();
                    e.preventDefault();
                    counter++;
                    dropbox.style.opacity = '1';
                },
                false,
            );
            form.addEventListener(
                'dragover',
                e => {
                    e.stopPropagation();
                    e.preventDefault();
                },
                false,
            );
            form.addEventListener(
                'dragleave',
                e => {
                    counter--;

                    if (counter === 0) {
                        dropbox.style.opacity = '';
                    }
                },
                false,
            );
            form.addEventListener(
                'dragend',
                e => {
                    e.stopPropagation();
                    e.preventDefault();
                    dropbox.style.opacity = '';
                    counter = 0;
                },
                false,
            );
            form.addEventListener('drop', drop, false);
        },
        //инициализирует все необходимые действия для работы перетаскивания

        //добавляем картинки в блок и хранилище
        add_images: function (files) {
            let ostavshesy_mesto = 10 - qsa('.ostavit-otziv__images-previv-wrap-item', img_previv_area).length; //проверяем сколько свободного места для изображений

            if (ostavshesy_mesto > 0) {
                files.length = ostavshesy_mesto; //если есть ещё свободное место то берём из передаваемых файлов только лимитированное количество
            } else {
                return; //если мест уже 6нет то ничего не загружаем
            }

            //перебираем все загружаемые картинки
            files.forEach(item => {
                if (!/image\/+./.test(item.type)) return; //если это не картинка пропускаем её

                if (item.size / 1024 / 1024 > 50) return; //пропускаем картинку т.к. её размер больше 50 мб

                this.store.push(item); //записываем файл во временное хранилище
            });
            //перебираем все загружаемые картинки

            this.render_images_from_store(); //отображаем картинки из хранилища в блоке
        },
        //добавляем картинки в блок и хранилище

        //отображаем картинки из хранилища в блоке
        render_images_from_store: function () {
            img_previv_area.style.display = this.store.length > 0 ? 'grid' : ''; //показываем блок с картинками только если есть хоть 1 картинка

            img_previv_area.innerHTML = ''; //чистим блок с картинками

            //перебираем все файлы из хранилища
            this.store.forEach((el, index) => {
                let reader = new FileReader();

                //выводим все картинки в блоке
                img_previv_area.innerHTML += `<div class="ostavit-otziv__images-previv-wrap-item" data-id="${index}">
                    <button class="ostavit-otziv__images-previv-wrap-item-delete icon--close-bold"></button>
                    <div class="ostavit-otziv__images-previv-wrap-item-img-wrap">
                    <img src="">
                    <div class="ostavit-otziv__images-previv-wrap-item-img-wrap-loader">0 %</div>
                    </div>
                    <div class="ostavit-otziv__images-previv-wrap-item-title">${el.name}</div>
                </div>`;

                reader.onload = function (e) {
                    qs('[data-id="' + index + '"] img', img_previv_area).src = e.target.result;
                };
                reader.readAsDataURL(el);
            });
            //перебираем все файлы из хранилища

            qsa('.ostavit-otziv__images-previv-wrap-item-delete', img_previv_area).forEach(el => el._on('click', this.delete_img.bind(this), { passive: false }));
        },
        //отображаем картинки из хранилища в блоке

        //срабатывает при удалении картинки
        delete_img: function (e) {
            e.preventDefault(); //отменяем действие кнопки по умолчанию иначе будет попытка отправки формы

            let item = e.target.parentNode,
                id = item.dataset.id;

            item.remove(); //удаляем блок из набора картинок

            delete this.store[id]; //удаляем данную картинку из хранилища

            //т.к. длинна массива не будет равна количеству элементов, то высчитываем количество вот так
            let counter = 0;
            this.store.forEach(_ => counter++);

            img_previv_area.style.display = counter > 0 ? 'grid' : ''; //показываем блок с картинками только если есть хоть 1 картинка
        },

        //срабатывает при клике на любую из звёздочек
        click_on_star: function (e) {
            let target_id = +e.target.dataset.id;

            stars_items.forEach(el => {
                let id = +el.dataset.id;

                id <= target_id ? el.classList.add('active-star') : el.classList.remove('active-star');
            });

            stars_input.value = target_id;
        },
        //срабатывает при клике на любую из звёздочек

        //при отправлке формы перехватываем управление
        form_submit: async function (e) {
            e.preventDefault(); //предотвращаем отправку формы стандартным образом

            button_submit.setAttribute('disabled', 'disabled'); //блокируем кнопку
            button_submit.textContent = 'Ожидайте ...';

            let all_renders = [],
                images = [];

            //записываем данные всех картинок из хранилища
            this.store.forEach(img => {
                let reader = new FileReader();

                //записываем все примисы на завершение чтение файлов
                all_renders.push(
                    new Promise(resolve => {
                        reader.onload = () => {
                            //записываем все данные картинки
                            images.push({
                                data: reader.result,
                                name: img.name,
                                type_mime: img.type,
                            });
                            //записываем все данные картинки
                            resolve();
                        };
                    }),
                );
                //записываем все примисы на завершение чтение файлов

                reader.readAsDataURL(img); //считываем картинку как строку base64
            });
            //записываем данные всех картинок из хранилища

            await Promise.all(all_renders); //ждём пока все файлы будут прочитаны и будут готовы их строковые представления

            this.all_loader_progres_counters = qsa('.ostavit-otziv__images-previv-wrap-item-img-wrap-loader', img_previv_area); //все счётчики програсса загрузки

            let all_shows = [];

            this.all_loader_progres_counters.forEach(el => all_shows.push(show({ el: el })));
            await Promise.all(all_shows); //ждём показа всех лоадеров

            let xhr = new XMLHttpRequest(); //создаём новый запрос

            xhr.upload.addEventListener('progress', this.upload_progress_listener.bind(this)); //подключаем отслеживание прогресса загрузки

            xhr.addEventListener('loadend', this.load_end.bind(this)); //отслеживанием окончание загрузки
            xhr.addEventListener('load', this.load_done.bind(this, xhr)); //после успешной загрузки
            xhr.addEventListener('error', this.error_load.bind(this)); //после ошибки загрузки

            //отправляем данные
            xhr.open('POST', GDS.ajax_url);
            xhr.send(
                JSON.stringify({
                    action: 'send_otziv',
                    rating: stars_input.value,
                    plusi: plusi_textarea.value,
                    minusi: minusi_textarea.value,
                    fio: fio_input.value,
                    city: city_input.value,
                    car: car_input.value,
                    files: images,
                }),
            );
            //отправляем данные
        },
        //при отправлке формы перехватываем управление

        //после успешной загрузки
        load_done: function (xhr) {
            let result = JSON.parse(xhr.response);

            if (result.success) {
                new Pop_Up_Message({
                    title: result.success.title,
                    message: result.success.message,
                    type: 'success',
                });
            } else {
                new Pop_Up_Message({
                    title: result.error.title,
                    message: result.error.message,
                    type: 'error',
                });
            }
        },
        //после успешной загрузки

        //после ошибки загрузки
        error_load: function () {
            new Pop_Up_Message({
                title: 'Ошибка отправки',
                message: 'Приносим извинения за доставленые неудобства, попробуйте отправить отзыв позже.',
                type: 'error',
            });
        },
        //после ошибки загрузки

        //отслеживанием окончание загрузки
        load_end: async function () {
            let all_hides = [];

            this.all_loader_progres_counters.forEach(el => all_hides.push(hide({ el: el })));
            await Promise.all(all_hides); //ждём пока скроются все лоадеры

            button_submit.removeAttribute('disabled'); //разблокируем кнопку
            button_submit.textContent = 'Отправить';

            this.all_loader_progres_counters.forEach(el => (el.textContent = '0 %')); //сбрасываем занчение счётчика
        },
        //отслеживанием окончание загрузки

        //срабатывает при изменении прогресса загрузки
        upload_progress_listener: function (e) {
            // считаем размер загруженного и процент от полного размера
            let percentLoaded = Math.round((e.loaded / e.total) * 100);
            this.all_loader_progres_counters.forEach(el => (el.textContent = percentLoaded + ' %')); //выводим програесс загрузки
        },
        //срабатывает при изменении прогресса загрузки

        //при клике на кнопку отправки
        click_submit_button: function () {
            Header.hide_and_lock_on_time(); //скрываем хедер скрываем и блокируем показ хедера на секунду чтоб он не закрывал чать экрана

            //проверит заполнено ли поля имени и чекбокса, а так же проверит корректено ли имя, если нет то сделает границы инпата красными
            fio_input.classList.add('custom-text-input--check-valid');
            policy_checkbox.parentNode.classList.add('custom-checbox--check-valid');
        },
        //при клике на кнопку отправки
    };

CONTROLLER.init();
