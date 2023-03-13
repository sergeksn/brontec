import { anime, show, hide, set_localStorage } from '@js-libs/func-kit';
import Overlay from '@overlays-main-js';
import Scroll_To_Top_Button from '@scroll-to-top-button-main-js';
import { Header, Header_Hidden } from '@header-main-js';
import Pop_Up_Message from '@pop-up-messages-main-js';
import { base_spoiler_fade } from '@js-moduls/spoiler';

let cart = qs('.cart'),
    header_visible = qs('.header-visible'),
    body = qs('body'),
    header = qs('header'),
    overlay = qs('#cart-overlay'),
    close_button = qs('.cart__header-close-button'),
    inner_cart_counter = qs('.cart__header-counter'), //счётчик корзины внутри окна корзины
    header_cart_counter = qs('.header-visible__cart-counter'), //счётчик корзины в хедере
    animation_cart_increase = qs('.header-visible__animation-cart-increase'), //анимационный блок +1 для счётчика корзины
    cart_body = qs('.cart__body'), //тело с товарами корзины
    cart_order_button = qs('.cart__footer-design-order'), //кнопка для перехода на страницу оформления заказа
    CONTROLLER = {
        status: 'hide',
        lock: false,
        Overlay: new Overlay({ el: overlay }), //создаём экземпляр подложки корзины для всего контента сайта

        was_first_render: false, //сообщает о том что корзину открывали прошёл первый рендер

        //открываем/закрываем корзину
        toggle_cart: async function () {
            if (Header.active_elements.status_lock) return; //если в данный момент активные элементы в хедере заблокированны то значит происходят какие-то трансформации которым не нужно мешать

            if (this.lock) return; //прерываем возможность показывать/скрывать корзину если она заблокированна

            Header.active_elements.lock();

            if (this.status === 'hide') {
                await this.open();
            } else if (this.status === 'show') {
                await this.close();
            }

            Header.active_elements.unlock();
        },
        //открываем/закрываем корзину

        //выпоялняем все действия для открытия корзины
        open: async function () {
            //если ещё не было рендера
            if (!this.was_first_render) {
                this.render_cart(); //функция проверяет локальное хранилище и если там что-то записано для корзины то ренедерт эти товары
                this.was_first_render = true; //помечаем что рендер выполнен
            }
            //если ещё не было рендера

            overlay.style.top = header_visible.getBoundingClientRect().bottom + 'px'; //опускаем подложку корзины так чтоб всегода было видно постер и верхнюю часть хедера

            body.scrollbar.lock(); //блокируем прокуртку документа
            body.scrollbar.show_scrollbar_space(); //добавляем пространство имитирующее скролбар

            //если открыт блок хедера
            if (Header_Hidden.status === 'open') {
                header.scrollbar.lock(); //блокируем прокуртку хедера перед показом корзины если открыт скрытый блок хедера
            }
            //если открыт блок хедера

            //если закрыт блок хедера
            else {
                header.scrollbar.show_scrollbar_space(); //добавляем пространство имитирующее скролбар
            }
            //если закрыт блок хедера

            let cart_data = w.localStorage.getItem('cart'); //получаем данные карзины

            //если корзина пуста
            if (cart_data === null) {
            }
            //если корзина пуста

            cart.style.transform = 'translateX(100%)'; //для корректной работы анимаци приходится явно задавать смещение т.к. почему-то скрипт не видит значение transform в стилях из таблиц css

            await Promise.all([
                show({
                    el: cart,
                    instance: this,
                    property: 'translateX',
                    value: 0,
                    started_value: cart.clientWidth,
                    units: '%',
                }),
                this.Overlay.show(),
                Scroll_To_Top_Button.hide(),
            ]); //дожидаемся показа корзины и подложки, а так же скрытия кнопки скрола вверх
        },
        //выпоялняем все действия для открытия корзины

        //выпоялняем все действия для закрытия корзины
        close: async function () {
            await Promise.all([
                hide({
                    el: cart,
                    instance: this,
                    property: 'translateX',
                    value: 100,
                    started_value: 0,
                    units: '%',
                }),
                this.Overlay.hide(),
            ]); //дожидаемся скрытия корзины и подложки

            //если закрыт блок хедера
            if (Header_Hidden.status === 'close') {
                body.scrollbar.unlock(); //разблокируем прокуртку документа
                body.scrollbar.hide_scrollbar_space(); //убираем пространство имитирующее скролбар
            }
            //если закрыт блок хедера

            Scroll_To_Top_Button.toggle_show_button(); //показываем кнопку если нужно, этого не обязательно дожидаться

            header.scrollbar.unlock(); //разблокируем прокуртку хедера
            header.scrollbar.hide_scrollbar_space(); //убираем пространство имитирующее скролбар
        },
        //выпоялняем все действия для закрытия корзины

        //пересчитываем верхний отступ корзины пре ресайзе
        size_recalculate: function () {
            cart.style.top = GDS.win.width_rem < 40 ? Header.get_header_h({ header_poster: true, header_visible: true }) + 'px' : Header.get_header_h({ header_poster: true }) + 'px'; //при экранах меньше 640 корзину опускеаем к низу видимой части хедера, а если шире то поднимаем к верху видимрой части

            overlay.style.top = header_visible.getBoundingClientRect().bottom + 'px'; //опускаем подложку корзины так чтоб всегода было видно постер и верхнюю часть хедера
        },
        //пересчитываем верхний отступ корзины пре ресайзе

        //добавляет товар в локальное хранилище корзины и в саму корзину
        add_in_cart_localStorage_data: function (full_kit) {
            let cart_data = JSON.parse(localStorage.getItem('cart-data')) ?? {}, //пытаемся получить данные товаров в корзине если их нет то по умолчанию берём пустой объект
                composition = GDS.product.composition,
                composition_data = {}, //сюда будет записан состав текущего комплекта
                timestamp = new Date().getTime(), //метка времени являющаяся уникальным идентификатором товара
                check_add_status = detal => {
                    //функция помечает какие делали в конфигурации данного комплекта выбраны
                    if (full_kit) return true; //если это полный комплект то выбраны все детали комплекта

                    let target_input = [...qsa('.komplekt-configurator input')].find(el => el.id === detal + '-checkbox'); //проверяем соответсвующие чекбоксы деталей и если они активны то помечаем что данная деталь добавлена

                    return target_input.checked;
                };

            //перебираем все детали комплекта
            for (let detal in composition) {
                composition_data[detal] = {
                    price: composition[detal], //цена детали
                    add: check_add_status(detal), //добавлена данная деталь в комплект или нет
                };
            }
            //перебираем все детали комплекта

            //дописываем в данные товаров в корзине новый товар
            let data = {
                amount: 1,
                marka_model: GDS.product.marka_model,
                price: GDS.product.price,
                full_price: GDS.product.full_price,
                composition: composition_data,
            };
            cart_data[timestamp] = data;
            //дописываем в данные товаров в корзине новый товар

            set_localStorage('cart-data', JSON.stringify(cart_data)); //записываем обновлённые данные в хранилище

            //если уже был выполнен первый рендер корзины то мы должны все следующие добавленяи в корзину рендерить и добавлять без глобального перерендера корзины
            if (this.was_first_render) {
                cart_body.append(this.render_cart_product_item(timestamp, data)); //вставляем новый товар в html корзины
                this.recalculate_common_price_in_cart(); //функция высчитывает общую сумму товаров в корзине

                qs('.cart__body-product-spoiler-wrap', cart_body.lastChild).ksn_spoiler.set_block_height(); //во вреям рендера товаров у них не определялась высота т.к. они были все документа так что сейчас пересчитываем высоту чтоб корректно работал спойлер
            }
            //если уже был выполнен первый рендер корзины то мы должны все следующие добавленяи в корзину рендерить и добавлять без глобального перерендера корзины
        },
        //добавляет товар в локальное хранилище корзины и в саму корзину

        //рендерит html корзины
        render_cart: function () {
            //сравнимать массивы приводя их в строковый вид и стравнивать равны ли их строковые версии и если равны то это одинаковые комплектации товара для данной марки и модели
            let wrap = d.createDocumentFragment(), //оболочка в которую будем добавлять все товары перед вставков в корзину дял увеличеняи производительности
                cart_data = JSON.parse(localStorage.getItem('cart-data')); //пытаемся получить данные для корзины

            if (!cart_data || JSON.stringify(cart_data) == '{}') return; //если нет данных в корзине прерываем

            cart_body.classList.remove('cart__body--empty-cart'); //скрываем блок сообщения что корзина пуста

            //рендерим кадждый товар
            for (let item_id in cart_data) {
                wrap.append(this.render_cart_product_item(item_id, cart_data[item_id]));
            }
            //рендерим кадждый товар

            cart_body.append(wrap); //вставляем результат в корзину

            this.recalculate_common_price_in_cart(); //функция высчитывает общую сумму товаров в корзине

            [...qsa('.cart__body-product-spoiler-wrap', cart_body)].forEach(el => el.ksn_spoiler.set_block_height()); //во вреям рендера товаров у них не определялась высота т.к. они были все документа так что сейчас пересчитываем высоту чтоб корректно работал спойлер

            cart_order_button.disabled = [...qsa('input', cart_body)].find(input => input.checked) ? false : true; //если все чекбоксы не активны то блокируем кнопку оформления заказа
        },
        //рендерит html корзины

        //рендерить html отдельного товара
        render_cart_product_item: function (id, data) {
            let is_full_kit = (() => {
                    //проверяем полный ли комплект
                    for (let detal in data.composition) {
                        if (!data.composition[detal].add) return false;
                    }
                    return true;
                })(),
                amount = data.amount,
                marka_model = data.marka_model,
                price = data.price,
                full_price = data.full_price,
                product_body = d.createElement('div'),
                all_added_detals_price = (() => {
                    //сумма всех добавленых деталей
                    let result_price = 0;
                    for (let detal in data.composition) {
                        if (data.composition[detal].add) result_price += data.composition[detal].price;
                    }
                    return result_price;
                })();

            product_body.classList.add('cart__body-product');
            if (is_full_kit) product_body.classList.add('cart__body-product--full-kit');
            if (amount === 1) product_body.classList.add('cart__body-product--single');
            product_body.dataset.markaModel = marka_model;
            product_body.dataset.productCartId = id;

            let content = `
        <div class="cart__body-product-title">${marka_model.replace('@@', ' ')}</div>
        <div class="cart__body-product-delete">
            <div class="cart__body-product-delete-timer"></div>
            <button class="cart__body-product-delete-abort-button">Отменить удаление</button>
        </div>
        <div class="cart__body-product-quantity-price-wrap">
          <div class="cart__body-product-change-quantity">
            <button data-decrease></button>
            <button data-increase class="icon--plus"></button>
          </div>
          <div class="cart__body-product-quantity">${amount}</div>
          <div class="cart__body-product-prices">
            <div class="cart__body-product-prices-old-price ruble-price old-price">${full_price.toLocaleString('ru')}</div>
            <div class="cart__body-product-prices-kit ruble-price">${price.toLocaleString('ru')}</div>
            <div class="cart__body-product-prices-parts ruble-price">${all_added_detals_price.toLocaleString('ru')}</div>
          </div>
        </div>
        <button class="cart__body-product-toggle-composition set-min-interactive-size">Состав комплекта</button>
        <div class="cart__body-product-spoiler-wrap spoiler-hidden">
          <div class="cart__body-product-spoiler-wrap-content">`;

            for (let detal in data.composition) {
                let is_checked = data.composition[detal].add ? 'checked' : '';

                content += `
            <div class="cart__body-product-spoiler-wrap-content-item">
              <div class="custom-checbox custom-checbox--cart" data-price="${data.composition[detal].price.toLocaleString('ru')}">
                <input id="cart-${id}-${detal}-checkbox" type="checkbox" ${is_checked}>
                <label for="cart-${id}-${detal}-checkbox" class="icon--check-mark"></label>
                <div class="cart__body-product-spoiler-wrap-content-item-title">${GDS.products_detal_types[detal]}</div>
              </div>
            </div>`;
            }

            content += `
            </div>
        </div>`;

            product_body.innerHTML += content; //записываем полыченый html код

            let button_decrease = qs('button[data-decrease]', product_body), //кнопка уменьшить количества товаров
                button_increase = qs('button[data-increase]', product_body), //кнопка увеличить количества товаров
                delete_abort_button = qs('.cart__body-product-delete-abort-button', product_body), //кнопка прерывания удаленяи товара из корзины
                all_current_inputs = qsa('input', product_body), //все инпуты для данного товара
                spoiler_content = qs('.cart__body-product-spoiler-wrap-content', product_body), //контент спойлера
                spoiler_title_block = qs('.cart__body-product-toggle-composition', product_body), //кнопка для открытия/закрытия спойлера
                rotate_arrow = () => spoiler_title_block.classList.toggle('cart__body-product-toggle-composition--open'); //при скрытии/показе спойлера переключаем класс, чтоб менялся поворот стрелочки

            //создайм спойлер с прозрачный появленяием контента
            base_spoiler_fade({
                spoiler_content_wrap: qs('.cart__body-product-spoiler-wrap', product_body),
                spoiler_content: spoiler_content,
                spoiler_toggle_button: spoiler_title_block,
                open_start_func: () => {
                    rotate_arrow();
                    spoiler_title_block.textContent = 'Свернуть';
                },
                close_start_func: () => {
                    rotate_arrow();
                    spoiler_title_block.textContent = 'Состав комплекта';
                },
            });
            //создайм спойлер с прозрачный появленяием контента

            spoiler_content.ksn_fade.status = 'hide'; //вручную меняем статус ksn_fade т.к. сейчас элемент не вставлен в документ и у него не могут быть определены стили через getComputedStyle

            button_increase._on('click', this.increase_amount.bind(this, product_body)); //увеличивает количество единиц товара в корзине
            button_decrease._on('click', this.decrease_amount.bind(this, product_body)); //уменьшаем количество единиц товара в корзине
            delete_abort_button._on('click', this.abort_delete_product.bind(this, product_body)); //прерывает удаление товара из корзины

            all_current_inputs.forEach(input =>
                input._on('change', () => {
                    this.cart_input_chenge(all_current_inputs, product_body); //срабатывает при взаимодействии с инпутами в корзине
                }),
            );

            return product_body;
        },
        //рендерить html отдельного товара

        //увеличивает количество единиц товара в корзине
        increase_amount: function (product_body) {
            let amount_el = qs('.cart__body-product-quantity', product_body),
                new_cart_count = +localStorage.getItem('cart-count') + 1; //обновлённое количество товаров в корзине
            amount_el.textContent = +amount_el.textContent + 1;

            //обновляем значения в счётчиках
            inner_cart_counter.textContent = new_cart_count;
            header_cart_counter.textContent = new_cart_count;
            set_localStorage('cart-count', new_cart_count); //записываем количество в хранилище

            product_body.classList.remove('cart__body-product--single'); //убираем пометку о том что товар один
            this.update_cart_localStorage_data(); //обновляет данные товаров в корзине, используется для обновляени после взаимодествия с чекбоксом в корзине
            this.recalculate_common_price_in_cart(); //при каждом изменении количества товаров в корзине пересчитываем итоговую сумму
        },
        //увеличивает количество единиц товара в корзине

        //уменьшаем количество единиц товара в корзине
        decrease_amount: function (product_body) {
            let amount_el = qs('.cart__body-product-quantity', product_body),
                amount = amount_el.textContent,
                new_amount = +amount - 1,
                update_cart_count = () => {
                    //обновляем счётчики и значение в хранилище о количестве товаров в корзине
                    let new_cart_count = +localStorage.getItem('cart-count') - 1; //обновлённое количество товаров в корзине

                    //если мы удалили последний товар в корзине
                    if (new_cart_count == 0) {
                        //скрываем счётчики
                        inner_cart_counter.style.opacity = '0';
                        header_cart_counter.style.opacity = '0';
                    }
                    //если мы удалили последний товар в корзине
                    else {
                        //обновляем значения в счётчиках
                        inner_cart_counter.textContent = new_cart_count;
                        header_cart_counter.textContent = new_cart_count;
                    }

                    set_localStorage('cart-count', new_cart_count); //записываем количество в хранилище
                };

            if (new_amount > 1) {
                amount_el.textContent = new_amount;
                update_cart_count(); //обновляем счётчики и значение в хранилище о количестве товаров в корзине
            } else if (new_amount == 1) {
                amount_el.textContent = new_amount;
                product_body.classList.add('cart__body-product--single'); //добавляем пометку о том что товар один
                update_cart_count(); //обновляем счётчики и значение в хранилище о количестве товаров в корзине
            } else {
                product_body.classList.add('cart__body-product--wait-fo-delete'); //показываем интерфейс удаленяи скрывая всё лишнее

                let cart_detete_timer_counter = qs('.cart__body-product-delete-timer', product_body); //счётчик секунд до удаления
                cart_detete_timer_counter.textContent = 5; //ставим 5 сек по умолчанию

                //с интервалом секунду уменьшаем таймер секунд
                product_body.cart_detete_timer = setInterval(() => {
                    cart_detete_timer_counter.textContent = +cart_detete_timer_counter.textContent - 1;
                }, 1000);
                //с интервалом секунду уменьшаем таймер секунд

                //создаём таймаут после которого товар будет удалён
                product_body.cart_detete_timeout = setTimeout(async () => {
                    await this.delete_product(product_body); //дожидаемся уждаяени товара из корзины
                    this.recalculate_common_price_in_cart(); //при каждом изменении количества товаров в корзине пересчитываем итоговую сумму
                    update_cart_count(); //обновляем счётчики и значение в хранилище о количестве товаров в корзине
                    this.update_cart_localStorage_data(); //обновляет данные товаров в корзине, используется для обновляени после взаимодествия с чекбоксом в корзине

                    if (localStorage.getItem('cart-count') == 0) {
                        let cart_body_nothing = qs('.cart__body-nothing', cart_body);
                        cart_body_nothing.style.opacity = '0';
                        cart_body.classList.add('cart__body--empty-cart'); //показываем блок сообщения что корзина пуста
                        cart_order_button.disabled = true; //блокируем кнопку оформления заказа

                        await anime({
                            targets: cart_body_nothing,
                            opacity: 1,
                        }).finished; //дожидаемся показа сообщения что корзина пуста
                    }
                }, 2000);
                //создаём таймаут после которого товар будет удалён
                
                return;//прерываем дальнейшие выполнение






//при удалении нескольких товаров происходит ошибка что в локальное хранииже записывается фигурная скобка всесто данных















            }

            this.update_cart_localStorage_data(); //обновляет данные товаров в корзине, используется для обновляени после взаимодествия с чекбоксом в корзине
            this.recalculate_common_price_in_cart(); //при каждом изменении количества товаров в корзине пересчитываем итоговую сумму
        },
        //уменьшаем количество единиц товара в корзине

        //прерывает удаление товара из корзины
        abort_delete_product: function (product_body) {
            clearTimeout(product_body.cart_detete_timeout); //удаляем таймаут для удаляени товара
            clearInterval(product_body.cart_detete_timer); //удаляем функцию интервала обратного отсчёта до удаления
            product_body.classList.remove('cart__body-product--wait-fo-delete'); //скрываем интерфейс удаления и показываем всё остальное
        },
        //прерывает удаление товара из корзины

        //полностью удлаяет товар из корзины и хранилища корзины
        delete_product: async function (product_body) {
            clearInterval(product_body.cart_detete_timer); //удаляем функцию интервала обратного отсчёта до удаления
            product_body.style.pointerEvents = 'none'; //делаем чтоб нельзя было взаимодействовать и нажать кнопку отмены удаления

            let id = product_body.dataset.productCartId, //идентификатор товара в корзине
                cart_data = JSON.parse(localStorage.getItem('cart-data'));

            await anime({
                targets: product_body,
                opacity: 0,
            }).finished; //дожидаемся скрытия товара

            await anime({
                targets: product_body,
                height: 0,
            }).finished; //дожидаемся сворачивания товара

            product_body.remove(); //удаляем данный товар из корзины

            delete cart_data[id]; //удаляем данные этого товара из хранилища корзины

            set_localStorage('cart-data', JSON.stringify(cart_data)); //записываем обновлённые данные в хранилище
        },
        //полностью удлаяет товар из корзины и хранилища корзины

        //срабатывает при взаимодействии с инпутами в корзине
        cart_input_chenge: function (all_current_inputs, product_body) {
            //убираем классы если они были
            product_body.classList.remove('cart__body-product--full-kit');

            //если отмечены все инпуты пкоазываем скидку и полную цену с ценой по скидке
            if ([...all_current_inputs].every(input => input.checked)) {
                product_body.classList.add('cart__body-product--full-kit');
            }
            //если отмечены все инпуты пкоазываем скидку и полную цену с ценой по скидке

            //если не отмечен ни один инпут то делаем кнопку неактивной ВИЗУАЛЬНО меняем цвета чекбоксов, выводим предупреждающий текст и ставим цену в 0 руб
            else if ([...all_current_inputs].every(input => !input.checked)) {
                qs('.cart__body-product-prices-parts', product_body).textContent = 0;
            }
            //если не отмечен ни один инпут то делаем кнопку неактивной ВИЗУАЛЬНО меняем цвета чекбоксов, выводим предупреждающий текст и ставим цену в 0 руб

            //если просто отмечены какие-то инпуты, но не все
            else {
                let result_price = 0;

                //получаем цену для каждой активныой детали и формируем из их суммы цены для текущей конфигурации комплекта
                all_current_inputs.forEach(input => {
                    if (input.checked) {
                        result_price += +input.parentNode.getAttribute('data-price').replace('\u00A0', '');
                    }
                });

                qs('.cart__body-product-prices-parts', product_body).textContent = result_price.toLocaleString('ru');
            }
            //если просто отмечены какие-то инпуты, но не все

            this.recalculate_common_price_in_cart(); //при каждом изменении чекбокса детали комплекта в корзине пересчитываем итоговую сумму

            cart_order_button.disabled = [...qsa('input', cart_body)].find(input => input.checked) ? false : true; //если все чекбоксы не активны то блокируем кнопку оформления заказа

            this.update_cart_localStorage_data(); //обновляет данные товаров в корзине, используется для обновляени после взаимодествия с чекбоксом в корзине

            ksn_product_configurator_func.check_cart_composition_and_edit_buttons_action(); //проверяем наличие в корзине полного комплекта и текущей конфигурации для данного товара, если такие есть меняем функции кнопок
        },
        //срабатывает при взаимодействии с инпутами в корзине

        //обновляет данные товаров в корзине, используется для обновляени после взаимодествия с чекбоксом в корзине
        update_cart_localStorage_data: function () {
            let add_product_in_cart = qsa('.cart__body-product', cart_body),
                result = '{';

            add_product_in_cart.forEach(product => {
                let id = product.dataset.productCartId,
                    amount = qs('.cart__body-product-quantity', product).textContent,
                    marka_model = product.dataset.markaModel,
                    price = qs('.cart__body-product-prices-kit', product).textContent.replace('\u00A0', ''),
                    full_price = qs('.cart__body-product-prices-old-price', product).textContent.replace('\u00A0', ''),
                    composition = (() => {
                        let all_inputs = qsa('input', product),
                            composition_text = '';
                        all_inputs.forEach(input => {
                            let detal = input.id.replace('cart-' + id + '-', '').replace('-checkbox', ''),
                                price = input.parentNode.dataset.price.replace('\u00A0', ''),
                                add = input.checked;

                            composition_text += `"${detal}":{"price":${price},"add":${add}},`;
                        });
                        return composition_text.slice(0, -1); //удаляет запятую после последней детали;
                    })();

                result += `"${id}":{"amount":${amount},"marka_model":"${marka_model}","price":${price},"full_price":${full_price},"composition":{${composition}}},`;
            });

            result = result.slice(0, -1) + '}'; //удаляет запятую после последней детали;

            set_localStorage('cart-data', result); //записываем обновлённые данные в хранилище
        },
        //обновляет данные товаров в корзине, используется для обновляени после взаимодествия с чекбоксом в корзине

        //функция получает id товара до которого нужно достролить чтоб он был в фокусе
        scroll_to_the_traget_product: async function (id) {
            let target_product = qs('[data-product-cart-id="' + id + '"]', cart_body), //находим нужный товар в корзине
                top_offset = target_product.offsetTop; //получаем нужное смещение чтоб он был чётко сверху окна корзины

            await anime({
                targets: cart_body,
                scrollTop: top_offset,
            }).finished; //дожидаемся завершения прокрутки
        },
        //функция получает id товара до которого нужно достролить чтоб он был в фокусе

        //функция высчитывает общую сумму товаров в корзине
        recalculate_common_price_in_cart: function () {
            let result = 0,
                final_price = qs('.cart__footer-final-price-value'),
                all_products = qsa('.cart__body-product', cart_body);

            all_products.forEach(el => {
                let value,
                    amount = +qs('.cart__body-product-quantity', el).textContent; //количество штук данного товара

                if (el.classList.contains('cart__body-product--full-kit')) {
                    value = +qs('.cart__body-product-prices-kit', el).textContent.replace('\u00A0', ''); // \u00A0 - это неразрывный проблел который получается после toLocaleString('ru')
                } else {
                    value = +qs('.cart__body-product-prices-parts', el).textContent.replace('\u00A0', '');
                }

                result += value * amount;
            });

            final_price.textContent = result.toLocaleString('ru');
        },
        //функция высчитывает общую сумму товаров в корзине

        //меяняет значение счётчиков корзины в хедере и в самой корзине
        chenge_cart_counters: async function () {
            let cart_count = localStorage.getItem('cart-count'); //текущее записанное в хранилище количество товаров в корзине

            //если ещё ничего не добавлено
            if (!cart_count) {
                cart_count = 1; //отмечаем что там уже есть 1 товар которые только что добавили
                set_localStorage('cart-count', '1'); //записываем количество в хранилище
            }
            //если ещё ничего не добавлено

            //еслив  корзине уже есть товары
            else {
                cart_count = +cart_count + 1;
                set_localStorage('cart-count', cart_count);
            }
            //еслив  корзине уже есть товары

            inner_cart_counter.textContent = cart_count; //увеличиваем счётчик в корзине
            inner_cart_counter.style.opacity = '1';

            //запустится после анимации +1 для корзины в хедере
            let after_anim = () => {
                header_cart_counter.textContent = cart_count; //увеличиваем счётчик в хедере
                header_cart_counter.style.opacity = '1';

                animation_cart_increase.removeAttribute('data-init-anim'); //убираем атрибут отвечающий за анимацию
                animation_cart_increase._off('animationend', after_anim); //после анимации удаляем слушатель
            };
            //запустится после анимации +1 для корзины в хедере

            await Header.show(); //ждём пока опустится хедер

            animation_cart_increase._on('animationend', after_anim); //добавляем случшатель на окончание анимации
            animation_cart_increase.setAttribute('data-init-anim', ''); //задаём атибут чтоб началась анимация
        },
        //меяняет значение счётчиков корзины в хедере и в самой корзине

        //добавляет товар в корзину
        add_to_cart: function (full_kit) {
            this.chenge_cart_counters(); //меяняет значение счётчиков корзины в хедере и в самой корзине
            this.add_in_cart_localStorage_data(full_kit); //добавляет товар в локальное хранилище корзины и в саму корзину
            cart_body.classList.remove('cart__body--empty-cart'); //скрываем блок сообщения что корзина пуста
            cart_order_button.disabled = false; //разблокируем кнопку оформления заказа
        },
        //добавляет товар в корзину

        init: function () {
            [
                qs('.header-hidden__menu-cart-button'), //кнопка корзины в мобильном меню
                qs('.footer__menu-cart-button'), //кнопка корзины в меню футера
                qs('.header-visible__cart-button'), //кнопка корзины в хедере
                overlay, //положка корзины на сайте
                close_button, //кнопка закрытия корзины
            ].forEach(item => item._on('click', _ => this.toggle_cart())); //показываем/скрываем корзину при клике

            w._on('resize_throttle load', _ => this.size_recalculate()); //пересчитываем верхний отступ корзины пре ресайзе и при первой загрузке
        },
    };

CONTROLLER.init(); //выполянем действия необходимые при загрузке модуля

export default CONTROLLER;
