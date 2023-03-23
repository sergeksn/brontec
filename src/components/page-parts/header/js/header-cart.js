import { anime, show, hide, set_local_storage, wait } from '@js-libs/func-kit';
import Overlay from '@overlays-main-js';
import Scroll_To_Top_Button from '@scroll-to-top-button-main-js';
import { Header, Header_Hidden } from '@header-main-js';
import { base_spoiler_fade } from '@js-moduls/spoiler';
import Fade from '@js-moduls/fade';

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
    cart_loader = qs('.cart__wrap-update-loader'), //лоадер корзины
    cart_body_nothing = qs('.cart__body-nothing'), //блок отображаемый в пустой корзине с кнопкой перехода к выбору комплекта
    cart_order_button = qs('.cart__footer-design-order'), //кнопка для перехода на страницу оформления заказа
    cart_final_price = qs('.cart__footer-final-price-value'), //поле с финальной ценой в корзине
    fade_params_for_delete = { duration: 350 }, //время для сокрытия элементов управленяи товаров в корзине во вреям его удаленяи
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

                if (!location.href.includes('oformit_zakaz')) this.check_actual_cart_data(); //если мы на странице оформленяи заказа то при открытии корзины не нужно выполянть провеку актуальности товаров в базе т.к. это проверка выполняется после сама сразу после полной загрузки страницы оформления заказа
            }
            //если ещё не было рендера

            this.size_recalculate(); //пересчитываем верхний отступ корзины и опускаем подложку корзины так чтоб всегода было видно постер и верхнюю часть хедера

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
            overlay.style.top = header_visible.getBoundingClientRect().bottom + 'px'; //опускаем подложку корзины так чтоб всегда было видно постер и верхнюю часть хедера

            if (Header.status != 'show' && Header.status != 'pending to show') {
                cart.style.top = '0'; //если хедер свёрнут и не в процесе появленяи то мы не делаем верхний отступ для корзины
            } else {
                cart.style.top = GDS.win.width_rem < 40 ? Header.get_header_h({ header_poster: true, header_visible: true }) + 'px' : Header.get_header_h({ header_poster: true }) + 'px'; //при экранах меньше 640 корзину опускеаем к низу видимой части хедера, а если шире то поднимаем к верху видимрой части
            }
        },
        //пересчитываем верхний отступ корзины пре ресайзе

        //добавляет товар в локальное хранилище корзины
        //data_obj - объект с данными товара для добавления в корзину
        add_in_cart_localStorage_data: function (id, data) {
            let cart_data = localStorage.getItem('cart-data'), //пытаемся получить данные товаров в корзине
                add_data = JSON.stringify({ [id]: data }).slice(1, -1); //превращаем данные в строку удалял по краям фигурные скобки

            //если корзина пуста
            if (!cart_data || cart_data === '{}') {
                cart_data = '{' + add_data + '}'; //просто записываем данные первого товара
            }
            //если корзина пуста

            //если в корзине уже есть товары
            else {
                cart_data = `${cart_data.slice(0, -1)},${add_data}}`; //дописываем новый товар
            }
            //если в корзине уже есть товары

            set_local_storage('cart-data', cart_data); //записываем обновлённые данные в хранилище

            this.run_event_update_cart_data(); //вызываем событие обновление данных корзины
        },
        //добавляет товар в локальное хранилище корзины

        //рендерит html корзины
        render_cart: function () {
            //сравнимать массивы приводя их в строковый вид и стравнивать равны ли их строковые версии и если равны то это одинаковые комплектации товара для данной марки и модели
            let wrap = d.createDocumentFragment(), //оболочка в которую будем добавлять все товары перед вставков в корзину дял увеличеняи производительности
                cart_data = localStorage.getItem('cart-data'); //пытаемся получить данные для корзины

            if (!cart_data) return; //если нет записи о корзине прерываем

            this.clean_cart_html(); //чистим html код корзины от товаров

            //если корзина пустая
            if (cart_data === '{}') {
                this.disable_cart_order_button(); //блокируем кнопку оформления заказа
                this.show_empty_cart_block(); //показываем блок соощающий что корзина пуста
                this.set_cart_counter(); //меняем счётчик корзины
                this.calculate_common_price_in_cart(); //функция высчитывает общую сумму товаров в корзине
                return;
            }
            //если корзина пустая

            cart_data = JSON.parse(cart_data); //превращаяем в объект

            this.hide_empty_cart_block(); //функция скрывает блок сообщающий что корзина пуста

            //рендерим каждый товар
            for (let item_id in cart_data) {
                wrap.append(this.render_cart_product_item(item_id, cart_data[item_id]));
            }
            //рендерим каждый товар

            cart_body.append(wrap); //вставляем результат в корзину

            this.calculate_common_price_in_cart(); //функция высчитывает общую сумму товаров в корзине

            this.set_cart_counter(); //меняем счётчик корзины

            [...qsa('.cart__body-product-spoiler-wrap', cart_body)].forEach(el => el.ksn_spoiler.set_block_height()); //во вреям рендера товаров у них не определялась высота т.к. они были вне документа так что сейчас пересчитываем высоту чтоб корректно работал спойлер

            this.check_if_anyone_input_checked(); //проверяем активен ли хоть один чекбокс хоть у какого-то товара в корзине и в зависимости от результата выполянем разыне функциии
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
                spoiler_hide = data.spoiler_hide,
                spoiler_class = spoiler_hide ? ' spoiler-hidden' : '', //скрываем/показываем спойлер у товара
                spoilet_content_style = spoiler_hide ? '' : ' style="opacity:1;"', //если нужно показать спойлер делаем его контент видимым
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
                    return result_price * amount;
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
            <div class="cart__body-product-prices-old-price ruble-price old-price" data-price="${full_price}">${(full_price * amount).toLocaleString('ru')}</div>
            <div class="cart__body-product-prices-kit ruble-price" data-price="${price}">${(price * amount).toLocaleString('ru')}</div>
            <div class="cart__body-product-prices-parts ruble-price">${all_added_detals_price.toLocaleString('ru')}</div>
          </div>
        </div>
        <button class="cart__body-product-toggle-composition set-min-interactive-size"></button>
        <div class="cart__body-product-spoiler-wrap${spoiler_class}">
          <div class="cart__body-product-spoiler-wrap-content"${spoilet_content_style}>`;

            for (let detal in data.composition) {
                let is_checked = data.composition[detal].add ? 'checked' : '';

                content += `
            <div class="cart__body-product-spoiler-wrap-content-item">
              <div class="custom-checbox custom-checbox--cart" data-price="${data.composition[detal].price}">
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
                detete_block = qs('.cart__body-product-delete', product_body), //блок удаления товара
                delete_abort_button = qs('.cart__body-product-delete-abort-button', product_body), //кнопка прерывания удаленяи товара из корзины
                all_current_inputs = qsa('input', product_body), //все инпуты для данного товара
                spoiler_content_wrap = qs('.cart__body-product-spoiler-wrap', product_body), //оболочка контента спойлера
                spoiler_content = qs('.cart__body-product-spoiler-wrap-content', product_body), //контент спойлера
                spoiler_title_block = qs('.cart__body-product-toggle-composition', product_body), //кнопка для открытия/закрытия спойлера
                product_quantity_price_wrap = qs('.cart__body-product-quantity-price-wrap', product_body), //оболочка для блока цен и управленяи количеством
                chenge_visible_action = () => spoiler_title_block.classList.toggle('cart__body-product-toggle-composition--open'); //при скрытии/показе спойлера переключаем класс, чтоб менялся поворот стрелочки и текст

            //создайм спойлер с прозрачный появленяием контента
            base_spoiler_fade({
                spoiler_content_wrap: spoiler_content_wrap,
                spoiler_content: spoiler_content,
                spoiler_toggle_button: spoiler_title_block,
                open_start_func: chenge_visible_action,
                close_start_func: chenge_visible_action,
                open_end_func: this.update_cart_localStorage_data.bind(this, false), //обновляет данные товаров в корзине, используется для обновляени после изменения состояния спойлера
                close_end_func: this.update_cart_localStorage_data.bind(this, false), //обновляет данные товаров в корзине, используется для обновляени после изменения состояния спойлера
            });
            //создайм спойлер с прозрачный появленяием контента

            //создаём контролеры прозрачности
            new Fade(product_quantity_price_wrap);
            new Fade(spoiler_title_block);
            new Fade(detete_block);
            //создаём контролеры прозрачности

            if (!spoiler_hide) chenge_visible_action(); //переворачиваем стрелочку если спойлер нужно показать

            spoiler_content_wrap.ksn_spoiler.status = spoiler_hide ? 'hide' : 'show'; //задаём статус спойлера

            //вручную меняем статус ksn_fade т.к. сейчас элемент не вставлен в документ и у него не могут быть определены стили через getComputedStyle
            spoiler_content.ksn_fade.status = spoiler_hide ? 'hide' : 'show';
            product_quantity_price_wrap.ksn_fade.status = 'show';
            spoiler_title_block.ksn_fade.status = 'show';
            //вручную меняем статус ksn_fade т.к. сейчас элемент не вставлен в документ и у него не могут быть определены стили через getComputedStyle

            button_increase._on('click', this.increase_amount.bind(this, product_body)); //увеличивает количество единиц данного товара
            button_decrease._on('click', this.decrease_amount.bind(this, product_body)); //уменьшаем количество единиц данного товара
            delete_abort_button._on('click', this.abort_delete_product.bind(this, product_body)); //прерывает удаление товара из корзины

            all_current_inputs.forEach(input => input._on('change', this.cart_input_chenge.bind(this, product_body))); //срабатывает при взаимодействии с инпутами в корзине

            return product_body;
        },
        //рендерить html отдельного товара

        //увеличивает количество единиц товара в корзине
        increase_amount: function (product_body) {
            let amount_el = qs('.cart__body-product-quantity', product_body);

            amount_el.textContent = +amount_el.textContent + 1; //увеличиваем количество

            product_body.classList.remove('cart__body-product--single'); //убираем пометку о том что товар один

            this.update_cart_localStorage_data(); //обновляет данные товаров в корзине, используется для обновляени после взаимодествия с чекбоксом в корзине

            this.set_product_cart_price(product_body); //функция задаёт цену продукта в корзине опираясь на заполненые чекбоксы комплектации данного товара и его количество

            this.calculate_common_price_in_cart(); //при каждом изменении количества товаров в корзине пересчитываем итоговую сумму
        },
        //увеличивает количество единиц товара в корзине

        //уменьшаем количество единиц товара в корзине
        decrease_amount: async function (product_body) {
            let amount_el = qs('.cart__body-product-quantity', product_body),
                old_amount = amount_el.textContent, //старое количество
                new_amount = +old_amount - 1; //новое количество

            if (new_amount > 1) {
                amount_el.textContent = new_amount; //записываем новое количество
            } else if (new_amount == 1) {
                amount_el.textContent = new_amount; //записываем новое количество
                product_body.classList.add('cart__body-product--single'); //добавляем пометку о том что товар один
            } else {
                let spoiler_wrap = qs('.cart__body-product-spoiler-wrap', product_body), //оболочка спойлера
                    spoiler_data = spoiler_wrap.ksn_spoiler, //контролер спойлера
                    fade_data = qs('.cart__body-product-spoiler-wrap-content', product_body).ksn_fade, //контролер сокрытия контента прозрачностью
                    spoiler_toggle_button = qs('.cart__body-product-toggle-composition', product_body), //кнопка сворачивания/разворачивания спойлера
                    detete_block = qs('.cart__body-product-delete', product_body), //блок удаления товара
                    cart_detete_timer_counter = qs('.cart__body-product-delete-timer', product_body), //счётчик секунд до удаления
                    product_quantity_price_wrap = qs('.cart__body-product-quantity-price-wrap', product_body); //оболочка для блока цен и управленяи количеством

                [product_quantity_price_wrap, spoiler_toggle_button, spoiler_wrap].forEach(el => (el.style.pointerEvents = 'none')); //блокируем для взаимоействия все блоки которые могут помешать

                //тут важно не сипользовать тригер клика т.к. если мы нажмём на удаление в момент сворачивания спойлера он просто раскроется но не начнёт удаление
                spoiler_toggle_button.classList.remove('cart__body-product-toggle-composition--open'); //переворачиваем стрелочку

                await fade_data.fade_hide(fade_params_for_delete); //ждём окончания соркытия контента прозрачностью
                await spoiler_data.spoiler_hide({ duration: 150 }); //ждём пока закроется спойлер

                await Promise.all([product_quantity_price_wrap.ksn_fade.fade_hide(fade_params_for_delete), spoiler_toggle_button.ksn_fade.fade_hide(fade_params_for_delete)]); //ждём пока скорется кнопка открытия состава комплекта и блок с ценами и количеством товаров

                detete_block.style.pointerEvents = 'auto'; //разблокируем блок удаляения чтоб была доступна для взаимодействия кнопрка отмены удаления
                cart_detete_timer_counter.textContent = 5; //ставим 5 сек по умолчанию

                await detete_block.ksn_fade.fade_show(fade_params_for_delete); //дожидаемся показа блока удаления

                //с интервалом секунду уменьшаем таймер секунд
                product_body.cart_detete_timer = setInterval(() => {
                    cart_detete_timer_counter.textContent = +cart_detete_timer_counter.textContent - 1;
                }, 1000);
                //с интервалом секунду уменьшаем таймер секунд

                //создаём таймаут после которого товар будет удалён
                product_body.cart_detete_timeout = setTimeout(async () => {
                    await this.delete_product(product_body); //дожидаемся уждаяени товара из корзины

                    if (localStorage.getItem('cart-data') == '{}') this.show_empty_cart_block(true); //если в корзине больше нет товаров плавно показываем блок что корзина пуста
                }, 5000);
                //создаём таймаут после которого товар будет удалён

                return; //прерываем дальнейшие выполнение
            }

            this.update_cart_localStorage_data(); //обновляет данные товаров в корзине, используется для обновляени после взаимодествия с чекбоксом в корзине

            this.set_product_cart_price(product_body); //функция задаёт цену продукта в корзине опираясь на заполненые чекбоксы комплектации данного товара и его количество

            this.calculate_common_price_in_cart(); //при каждом изменении количества товаров в корзине пересчитываем итоговую сумму
        },
        //уменьшаем количество единиц товара в корзине

        //прерывает удаление товара из корзины
        abort_delete_product: async function (product_body) {
            clearTimeout(product_body.cart_detete_timeout); //удаляем таймаут для удаляени товара
            clearInterval(product_body.cart_detete_timer); //удаляем функцию интервала обратного отсчёта до удаления

            let spoiler_wrap = qs('.cart__body-product-spoiler-wrap', product_body), //оболочка спойлера
                spoiler_toggle_button = qs('.cart__body-product-toggle-composition', product_body), //кнопка сворачивания/разворачивания спойлера
                detete_block = qs('.cart__body-product-delete', product_body), //блок удаления товара
                product_quantity_price_wrap = qs('.cart__body-product-quantity-price-wrap', product_body); //оболочка для блока цен и управленяи количеством

            detete_block.style.pointerEvents = ''; //блокируем кнопку отмены удаляения чтоб не мешала повторрными нажатиями

            await detete_block.ksn_fade.fade_hide(fade_params_for_delete); //дожидаемся сокрытия блока удаления

            [product_quantity_price_wrap, spoiler_toggle_button, spoiler_wrap].forEach(el => (el.style.pointerEvents = '')); //разрешаем для взаимоействия все блоки которые ранее блокировали при подготовке к удалению товара

            await Promise.all([product_quantity_price_wrap.ksn_fade.fade_show(fade_params_for_delete), spoiler_toggle_button.ksn_fade.fade_show(fade_params_for_delete)]); //ждём пока появится кнопка открытия состава комплекта и блок с ценами и количеством товаров
        },
        //прерывает удаление товара из корзины

        //функция запускет кастомное событие на корзине сообщаюшуе что её данные обновлены
        //important_chenge - указывает произошло важное изменение или просто обновилось состояние спойлера состава комплекта в корзине
        //data_base_update - сообщаетчто событие было вызвано после изменений из-за отличия товаров в базе и корзине
        run_event_update_cart_data: function (important_chenge = true, data_base_update = false) {
            //вызываем событие обновление данных корзины
            cart.dispatchEvent(
                new CustomEvent('update-cart-cata', {
                    detail: {
                        important: important_chenge,
                        data_base_update: data_base_update,
                    },
                }),
            );
            //вызываем событие обновление данных корзины
        },
        //функция запускет кастомное событие на корзине сообщаюшуе что её данные обновлены

        //полностью удлаяет товар из корзины и хранилища корзины
        delete_product: async function (product_body) {
            clearInterval(product_body.cart_detete_timer); //удаляем функцию интервала обратного отсчёта до удаления
            product_body.style.pointerEvents = 'none'; //делаем чтоб нельзя было взаимодействовать и нажать кнопку отмены удаления

            let id = product_body.dataset.productCartId, //идентификатор товара в корзине
                cart_data = JSON.parse(localStorage.getItem('cart-data'));

            delete cart_data[id]; //удаляем данные этого товара из хранилища корзины

            set_local_storage('cart-data', JSON.stringify(cart_data)); //записываем обновлённые данные в хранилище сразу чтоб если удалаяли одновременно нескольког товаров то всё работало корректно

            this.run_event_update_cart_data(); //вызываем событие обновление данных корзины

            if (localStorage.getItem('cart-data') == '{}') this.disable_cart_order_button(); //если в корзине больше нет товаров делает НЕ активной кнопку оформления заказа в корзине

            this.set_cart_counter(); //уменьшаем счётчик товаров в корзине на один

            this.calculate_common_price_in_cart(); //при каждом изменении количества товаров в корзине пересчитываем итоговую сумму

            ksn_product_configurator_func.check_cart_composition_and_edit_buttons_action(); //меняет функции кнопок связанных с удаляемым комплектом на "Добавить в корзину"

            //в общем тут куча проверок на существование данного товара, т.к может прозойти что мы нажали удалить товар до того как с базы пришёл ответ после синхронизации и тогда корзина обновить если были изменения и данный товар перерендерится по новой и дальнейшие функции уже будут вызывать ошибки т.к. прежний элемент товар абыл удалён и создан по новой, тоже касается и удаленяи при синхронизации вкладок
            let carrent_product_body = qs('[data-product-cart-id="' + id + '"]', cart_body);
            if (!carrent_product_body) return;

            await anime({
                targets: carrent_product_body,
                opacity: 0,
            }).finished; //дожидаемся скрытия товара

            carrent_product_body = qs('[data-product-cart-id="' + id + '"]', cart_body);
            if (!carrent_product_body) return;

            await anime({
                targets: carrent_product_body,
                height: 0,
            }).finished; //дожидаемся сворачивания товара

            carrent_product_body?.remove(); //удаляем данный товар из корзины именно так поиском через всю корзину, т.к. могло произойти изменение в корзине на другой вкладке и это бы пререндерело корзину в текущей вкладке тем самым товары удалились бы их зранилища но остались бы визуально в корзине
        },
        //полностью удлаяет товар из корзины и хранилища корзины

        //срабатывает при взаимодействии с инпутами в корзине
        cart_input_chenge: function (product_body) {
            this.update_cart_localStorage_data(); //обновляет данные товаров в корзине, используется для обновляени после взаимодествия с чекбоксом в корзине

            this.set_product_cart_price(product_body); //функция задаёт цену продукта в корзине опираясь на заполненые чекбоксы комплектации данного товара

            this.calculate_common_price_in_cart(); //при каждом изменении чекбокса детали комплекта в корзине пересчитываем итоговую сумму

            this.check_if_anyone_input_checked(); //проверяем активен ли хоть один чекбокс хоть у какого-то товара в корзине и в зависимости от результата выполянем разыне функциии

            ksn_product_configurator_func.check_cart_composition_and_edit_buttons_action(); //проверяем наличие в корзине полного комплекта и текущей конфигурации для данного товара, если такие есть меняем функции кнопок
        },
        //срабатывает при взаимодействии с инпутами в корзине

        //обновляет данные товаров в корзине, используется для обновляени после взаимодествия с чекбоксом в корзине
        //important_chenge - указывает произошло важное изменение или просто обновилось состояние спойлера состава комплекта в корзине
        update_cart_localStorage_data: function (important_chenge = true) {
            let product_in_cart = qsa('.cart__body-product', cart_body),
                result = '{';

            product_in_cart.forEach(product => {
                let id = product.dataset.productCartId,
                    amount = qs('.cart__body-product-quantity', product).textContent,
                    spoiler_hide = qs('.cart__body-product-spoiler-wrap', product).classList.contains('spoiler-hidden'),
                    marka_model = product.dataset.markaModel,
                    price = qs('.cart__body-product-prices-kit', product).dataset.price,
                    full_price = qs('.cart__body-product-prices-old-price', product).dataset.price,
                    composition = (() => {
                        let all_inputs = qsa('input', product),
                            composition_text = '';
                        all_inputs.forEach(input => {
                            let detal = input.id.replace('cart-' + id + '-', '').replace('-checkbox', ''),
                                price = input.parentNode.dataset.price,
                                add = input.checked;

                            composition_text += `"${detal}":{"price":${price},"add":${add}},`;
                        });
                        return composition_text.slice(0, -1); //удаляет запятую после последней детали;
                    })();

                result += `"${id}":{"amount":${amount},"spoiler_hide":${spoiler_hide},"marka_model":"${marka_model}","price":${price},"full_price":${full_price},"composition":{${composition}}},`;
            });

            result = result.slice(0, -1) + '}'; //удаляет запятую после последней детали;

            set_local_storage('cart-data', result); //записываем обновлённые данные в хранилище

            this.run_event_update_cart_data(important_chenge); //вызываем событие обновление данных корзины
        },
        //обновляет данные товаров в корзине, используется для обновляени после взаимодествия с чекбоксом в корзине

        //добавляет товар в корзину
        add_single_product_to_cart: function (id, data) {
            this.add_in_cart_localStorage_data(id, data); //добавляет товар в локальное хранилище корзины

            ksn_product_configurator_func.check_cart_composition_and_edit_buttons_action(); //проверяем наличие в корзине полного комплекта и текущей конфигурации для данного товара, если такие есть меняем функции кнопок

            this.set_cart_counter(); //задём значение счётчика корзины в хедере ив самой корзине

            //если уже был выполнен первый рендер корзины то мы должны все следующие добавленяи в корзину рендерить и добавлять без глобального перерендера корзины
            if (this.was_first_render) {
                let product = this.render_cart_product_item(id, data); //получаем элемент для вставки товара в корзину
                cart_body.append(product); //вставляем новый товар в html корзины
                this.calculate_common_price_in_cart(); //функция высчитывает общую сумму товаров в корзине

                qs('.cart__body-product-spoiler-wrap', cart_body.lastChild).ksn_spoiler.set_block_height(); //во вреям рендера товаров у них не определялась высота т.к. они были все документа так что сейчас пересчитываем высоту чтоб корректно работал спойлер
            }
            //если уже был выполнен первый рендер корзины то мы должны все следующие добавленяи в корзину рендерить и добавлять без глобального перерендера корзины

            this.hide_empty_cart_block(); //функция скрывает блок сообщающий что корзина пуста
            this.enable_cart_order_button(); //делает активной кнопку оформления заказа в корзине
        },
        //добавляет товар в корзину

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

        //функция высчитывает общую сумму товаров в корзине основываясь на данных в хранилище
        calculate_common_price_in_cart: function () {
            cart_final_price.textContent = w.ksn_order_controler.calculate_common_order_prise().toLocaleString('ru');
        },
        //функция высчитывает общую сумму товаров в корзине основываясь на данных в хранилище

        //задём значение счётчика корзины в хедере ив самой корзине
        set_cart_counter: async function () {
            let cart_data = localStorage.getItem('cart-data');

            if (!cart_data) return; //если в хранилище нет данных корзины прерываем

            let old_value = +inner_cart_counter.textContent, //старое значение количества товаров, даже если там пустота мы преобразуем её в 0
                new_value = Object.keys(JSON.parse(cart_data)).length, //берём текущее количество товаров в корзине чтоб избежать багов при синхронизации вкладок браузера
                inner_cart_counter_fade_controller = inner_cart_counter.ksn_fade, //контролер прозрачности
                header_cart_counter_fade_controller = header_cart_counter.ksn_fade, //контролер прозрачности
                set_actual_cart_count = () => {
                    //функция записывает актуальные данные в счётчики корзины на основе данных из хранилища, т.к. за вреям паузы анимаций при неактивных вкладках состав корзины мог обновитья, и данные нужно брать из хранилища
                    let actual_cart_value = Object.keys(JSON.parse(localStorage.getItem('cart-data'))).length; //за время выполнения анимаций, или анимации могли быть на паузе из-за того что вкладка неактивна. в обще в конце мы обновляем счётчики ещё раз уже актуальными данными корзины

                    inner_cart_counter.textContent = actual_cart_value; //меняем значение счётчика в корзине
                    header_cart_counter.textContent = actual_cart_value; //меняем значение счётчика в хедере
                };

            if (old_value === 0 && new_value !== 0) await inner_cart_counter_fade_controller.fade_show(); //если до этого в корзине не было товаров то мы можем их только добавлять так что если прежние значение 0 то новое будет больше нуля и мы должны показать счётчик

            if (new_value === 0) await inner_cart_counter_fade_controller.fade_hide(); //если новое значение количества товаров в корзине 0 то мы скрываем счётчик

            //если добавился один товар
            if (new_value - old_value === 1) {
                await Header.show(); //ждём пока опустится хедер

                //запустится после анимации +1 для корзины в хедере
                let after_anim = () => {
                    set_actual_cart_count(); //вставляем в счётчики актуальные данные о количество товаров в корзине

                    if (old_value === 0) header_cart_counter_fade_controller.fade_show(); //если до этого в корзине не было товаров то мы можем их только добавлять так что если прежние значение 0 то новое будет больше нуля и мы должны показать счётчик

                    animation_cart_increase.removeAttribute('data-init-anim'); //убираем атрибут отвечающий за анимацию
                    animation_cart_increase._off('animationend', after_anim); //после анимации удаляем слушатель
                };
                //запустится после анимации +1 для корзины в хедере

                animation_cart_increase._on('animationend', after_anim); //добавляем случшатель на окончание анимации
                animation_cart_increase.setAttribute('data-init-anim', ''); //задаём атибут чтоб началась анимация
            }
            //если добавился один товар

            //если количество товаров в корзине изменилось на другое значение или количество увеличилось на 1 но НЕ нужна анимация
            else {
                if (old_value === 0 && new_value !== 0) await header_cart_counter_fade_controller.fade_show(); //если до этого в корзине не было товаров то мы можем их только добавлять так что если прежние значение 0 то новое будет больше нуля и мы должны показать счётчик

                if (new_value === 0) await header_cart_counter_fade_controller.fade_hide(); //если новое значение количества товаров в корзине 0 то мы скрываем счётчик

                set_actual_cart_count(); //вставляем в счётчики актуальные данные о количество товаров в корзине
            }
            //если количество товаров в корзине изменилось на другое значение или количество увеличилось на 1 но НЕ нужна анимация
        },
        //задём значение счётчика корзины в хедере ив самой корзине

        //функция показывает блок сообщающий что корзина пуста
        //fast_show - показывает блок с анимацией прозрачности
        show_empty_cart_block: async function (fade_show = false) {
            this.clean_cart_html(); //чистим html код корзины от товаров т.к. если на этой вкладке мы запустим удаление товара, а на другой вкладке добавим количество данного товара то будет баг чтов  корзину запишется несколько единиц удаляемого товара, так что это мы фиксим удаленим всего содержимого корзины перед показаом данного блока

            if (fade_show) cart_body_nothing.style.opacity = '0'; //если нужно показать плавно то сначало делаем блок прозрачным

            cart_body.classList.add('cart__body--empty-cart'); //отображаем в документе блок сообщения что корзина пуста

            //дожидаемся показа сообщения что корзина пуста если нужно плавно показать
            if (fade_show)
                await anime({
                    targets: cart_body_nothing,
                    opacity: 1,
                }).finished;
            //дожидаемся показа сообщения что корзина пуста  если нужно плавно показать
        },
        //функция показывает блок сообщающий что корзина пуста

        //функция скрывает блок сообщающий что корзина пуста
        hide_empty_cart_block: function () {
            cart_body.classList.remove('cart__body--empty-cart'); //скрываем блок сообщения что корзина пуста
        },
        //функция скрывает блок сообщающий что корзина пуста

        //делает активной кнопку оформления заказа в корзине
        enable_cart_order_button: function () {
            cart_order_button.disabled = false; //разблокируем кнопку оформления заказа
        },
        //делает активной кнопку оформления заказа в корзине

        //делает НЕ активной кнопку оформления заказа в корзине
        disable_cart_order_button: function () {
            cart_order_button.disabled = true; //блокируем кнопку оформления заказа
        },
        //делает НЕ активной кнопку оформления заказа в корзине

        //проверяем активен ли хоть один чекбокс хоть у какого-то товара в корзине и в зависимости от результата выполянем разыне функциии
        check_if_anyone_input_checked: function () {
            //если все чекбоксы не активны то блокируем кнопку оформления заказа если хоть 1 активен то разблокируем
            if ([...qsa('input', cart_body)].find(input => input.checked)) {
                this.enable_cart_order_button(); //делает активной кнопку оформления заказа в корзине
            } else {
                this.disable_cart_order_button(); //делает НЕ активной кнопку оформления заказа в корзине
            }
            //если все чекбоксы не активны то блокируем кнопку оформления заказа если хоть 1 активен то разблокируем
        },
        //проверяем активен ли хоть один чекбокс хоть у какого-то товара в корзине и в зависимости от результата выполянем разыне функциии

        //функция задаёт цену продукта в корзине опираясь на заполненые чекбоксы комплектации данного товара и его количество
        //product_body - сам текущий товар в корзине
        set_product_cart_price: function (product_body) {
            //убираем классы если они были
            product_body.classList.remove('cart__body-product--full-kit');

            let all_current_inputs = qsa('input', product_body), //все инпуты текущего товара
                product_detals_price_block = qs('.cart__body-product-prices-parts', product_body), //блок с ценами всех отмеченых деталей в товаре
                amount = qs('.cart__body-product-quantity', product_body).textContent, //количество данных комплектов
                old_pise = qs('.cart__body-product-prices-old-price', product_body),
                kit_price = qs('.cart__body-product-prices-kit', product_body);

            //в любом случае считыем цены полного комплекта
            old_pise.textContent = old_pise.dataset.price * amount;
            kit_price.textContent = kit_price.dataset.price * amount;

            //если отмечены все инпуты пкоазываем скидку и полную цену с ценой по скидке
            if ([...all_current_inputs].every(input => input.checked)) {
                product_body.classList.add('cart__body-product--full-kit');
            }
            //если отмечены все инпуты пкоазываем скидку и полную цену с ценой по скидке

            //если не отмечен ни один инпут то делаем кнопку неактивной ВИЗУАЛЬНО меняем цвета чекбоксов, выводим предупреждающий текст и ставим цену в 0 руб
            else if ([...all_current_inputs].every(input => !input.checked)) {
                product_detals_price_block.textContent = 0;
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

                result_price = result_price * amount;

                product_detals_price_block.textContent = result_price.toLocaleString('ru');
            }
            //если просто отмечены какие-то инпуты, но не все
        },
        //функция задаёт цену продукта в корзине опираясь на заполненые чекбоксы комплектации данного товара и его количество

        //функция полностью удаляет все товары из корзины но НЕ из хранилища
        clean_cart_html: function () {
            [...qsa('.cart__body-product', cart_body)].forEach(el => el.remove()); //удаляет все товары
        },
        //функция полностью удаляет все товары из корзины но НЕ из хранилища

        //синхронизирует корзины в разных вкладках браузера
        cart_browser_tabs_sinhronization: function (e) {
            //только если изменения касались корзины
            if (e.key === 'cart-data') {
                ksn_product_configurator_func.check_cart_composition_and_edit_buttons_action(); //проверяем наличие в корзине полного комплекта и текущей конфигурации для данного товара, если такие есть меняем функции кнопок

                if (this.was_first_render) {
                    this.render_cart(); //если уже был первый рендер функция проверяет локальное хранилище и если там что-то записано для корзины то ренедерт эти товары
                } else {
                    this.set_cart_counter(); //просто меняем счётчик корзины если корзина ещё не рендерилась
                }
            }
            //только если изменения касались корзины
        },
        //синхронизирует корзины в разных вкладках браузера

        //переводит нас на страницу оформления заказа
        transition_to_order_page: function () {
            d.location.href = '/oformlenie-zakaza/';
        },
        //переводит нас на страницу оформления заказа

        //функция проверят данные в корзине на актуальнось данных в базе
        check_actual_cart_data: async function () {
            //ВАЖНО: пока сделаю проверку при каждом первом открытии корзины после перезагрузки страницы, если нагрузка на базу будет большая то сделать ограничение что проверка должна быть не чаще чем раз в час

            let carrent_cart_data = localStorage.getItem('cart-data'), //записываем данные корзины до отправки чтоб если что-то поменяли за время выполнения запроса это не повлияло на исход проверки
                request_data = {
                    //запрос на сервер
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'check_actual_cart_data',
                        data: localStorage.getItem('cart-data'),
                    }),
                };

            //отправляем запрос на сервер что отправить сообщение и выводим соответсвующие всплывающие окна

            if (!carrent_cart_data || carrent_cart_data == '{}') return; //если данных корзины нет или корзина пуста то не выполянем проверку

            await fetch(GDS.ajax_url, request_data)
                .then(response => response.json()) //считываем переданные данные
                .then(result => {
                    let update_cart_data = this.compare_cart_and_base_data(result); //сравнивает данные полученые после проверки в базе и текущие данные в корзине и если они отличаются составом и/или ценами то обновляем корзину

                    //если нужно обновлять данные т.к. произошли изменения в базе
                    if (update_cart_data !== false) {
                        set_local_storage('cart-data', update_cart_data); //обновляем данные

                        this.run_event_update_cart_data(true, true); //вызываем событие обновление данных корзины

                        ksn_product_configurator_func.check_cart_composition_and_edit_buttons_action(); //проверяем наличие в корзине полного комплекта и текущей конфигурации для данного товара, если такие есть меняем функции кнопок

                        if (this.was_first_render) {
                            this.puls_cart_update_loader(); //покажет и сразу скроет лоадер корзины для того чтоб пользователь понял что-то что-то в корзине обновилось
                            this.render_cart(); //если уже был первый рендер функция проверяет локальное хранилище и если там что-то записано для корзины то ренедерт эти товары
                        } else {
                            this.set_cart_counter(); //просто меняем счётчик корзины если корзина ещё не рендерилась
                        }
                    }
                    //если нужно обновлять данные т.к. произошли изменения в базе
                })
                .catch(e => console.error(e));
        },
        //функция проверят данные в корзине на актуальнось данных в базе

        //сравнивает данные полученые после проверки в базе и текущие данные в корзине и если они отличаются составом и/или ценами то обновляем корзину
        compare_cart_and_base_data: function (response) {
            //в теории сюда можно ещё прикрутить промерку в момент открытия корзины которая проверить текущую страницу комплекта и удалит ненужные чекбоксы, но тут много проблем возникает, а что делать на странице детали и что делать если появилась новая деталь и что делать с svg иконками новых и удалёных деталей в общем пок это не трогаю, учитывая высокую скорость работы сервера вероятность этого мала, разве что юзер долго будет на странице потом спустя какое-то время добавит товар и откроет корзину и этот как раз таки товар и должен быть изменён, учитывая что у нас всё обновлятся будет очень редко это сейчас делать не критично

            let carrent_cart = JSON.parse(localStorage.getItem('cart-data')), //парсим текущие данные корзины
                nead_cart_update = false; //тригер что нужно обновить корзину по умолчанию это false если не найдено отличий в ценах и комплектации, но если отличния будут найдены то станет true

            //ПРИМЕЧАНИЕ: не стоит забывать что мы можем получить товаров столько же или меньше чем сейчас в корзине, если какие-то товар ыне прошли проверку и были удалены или за врем проверки товар был удалён из корзины пользователм, но НЕ можем получить больше!

            if (Object.keys(response).length == 0 || Object.keys(carrent_cart).length == 0) return '{}'; //если в отовет пришёл пустой объект значит не один товар в корзине не прошёл проверку и мы записываем в корзину пустой объект в виде строки, или же корзина пустая, такое может быть если за вреям проверки мы всё из неё удалили

            //перебираем все товары присланые после проверки с сервера
            for (let id in response) {
                let response_data = response[id],
                    carrent_cart_data = carrent_cart[id];

                //если мы обнаружили что данного товара не оказалось в корзине то ничего страшного мы просто его пропускаем т.к. удаление этого товара могла только что завершится на соседней вкладке
                if (!carrent_cart_data) {
                    delete response[id]; //удаляем данный товар из ответа чтоб если не совпадут комплектации или цены в дальнейшем этот това, удаляыё пользователем, не вставлялся в корзину
                    continue;
                }
                //если мы обнаружили что данного товара не оказалось в корзине то ничего страшного мы просто его пропускаем т.к. удаление этого товара могла только что завершится на соседней вкладке

                //определять переменные ниже, после проверки !carrent_cart_data иначе будет ошибка если товар будет удалён во время проверки в базе
                let response_data_composition = response_data.composition, //состав текужего товара после проверки
                    carrent_cart_data_composition = carrent_cart_data.composition; //состав текущего комплекта в корзине

                //если у товаров отличается количество или статус спройлера комплектации то берём текущие данные корзины т.к. за время запроса актуальных данных пользователь мог изменить эти параметры
                response_data.amount = carrent_cart_data.amount;
                response_data.spoiler_hide = carrent_cart_data.spoiler_hide;
                //если у товаров отличается количество или статус спройлера комплектации то берём текущие данные корзины т.к. за время запроса актуальных данных пользователь мог изменить эти параметры

                if (response_data.marka_model != carrent_cart_data.marka_model || response_data.price != carrent_cart_data.price || response_data.full_price != carrent_cart_data.full_price) nead_cart_update = true; //если у товаром отличается марка-модель, цена и цена без скидки то пмечаем что корзину нужно обновлять и пропускаем  дальнейшие проверки

                let response_data_composition_length = Object.keys(response_data_composition).length; //количество деталей полученное из базы у товара

                if (response_data_composition_length != Object.keys(carrent_cart_data_composition).length || Object.keys({ ...response_data_composition, ...carrent_cart_data_composition }).length != response_data_composition_length) nead_cart_update = true; //проверяем отличаются ли объекты комплектации по количеству деталей или нет, но может так случится что мы одновременно удалили и добавили другую деталь в таком случае объекты будут одинаковой длины, так что для точности проверки мы делаем их слияние одинаковые ключи сольются и если в объектах есть отличия то мы увидим это т.к. различные ключи запишутся и длинна объединённого объекта увеличится

                let is_full_kit = true; //проверяем в корзине полный комплект или нет, т.к. за время пока было обновление мы могли сделать из конфигурации полный комплект и наоборот

                //проверяем все детали комплекта в корзине чтоб поянт это полный комплект или нет
                for (let detal in carrent_cart_data_composition) {
                    if (!carrent_cart_data_composition[detal].add) {
                        is_full_kit = false; //если хоть одна деталь неотмечена помечаем что это неполный помплекект и завершаем проверку на полный комплект
                        break;
                    }
                }
                //проверяем все детали комплекта в корзине чтоб поянт это полный комплект или нет

                //перебираем все детали комплекта полученые после проверки, проверяем у них цену и если отличается статуст активности меняем его на тот который сейчас в корзине
                for (let detal in response_data_composition) {
                    let response_detal_data = response_data_composition[detal], //данные для текущей детали товара после проверки в базе
                        carrent_cart_detal_data = carrent_cart_data_composition[detal]; //данные для текущей детали товара из корзины

                    if (is_full_kit) response_detal_data.add = true; //отмечаем каждую деталь если это полный комплект

                    if (!carrent_cart_detal_data) continue; //если мы при обновлении нашли у комплекта новую деталь в базе то тут мы её в корзине на найдём и следовательно проверять и сравнивать её данные нет смысла так что просто её пропускаем

                    if (response_detal_data.price != carrent_cart_detal_data.price) nead_cart_update = true; //если удеталей отлиаются цены помечаем что нужно обновлять корзину

                    if (!is_full_kit && response_detal_data.add != carrent_cart_detal_data.add) response_detal_data.add = carrent_cart_detal_data.add; //если неполный комплект и если у деталей отличается статус отметки чекбокса, т.е. статус того что деталь входит в состав комплекта как выбраная, то мы берём данные из корзины , т.к. за время проверки в базе пользователь мог выделить какой-то чекбокс
                }
                //перебираем все детали комплекта полученые после проверки, проверяем у них цену и если отличается статуст активности меняем его на тот который сейчас в корзине
            }
            //перебираем все товары присланые после проверки с сервера

            return nead_cart_update ? JSON.stringify(response) : false; //если за время проверки мы поняли что нужно обновить корзину возвращаем данные корзины в виде строки, если же ничего обновлять не нужно возвращам false
        },
        //сравнивает данные полученые после проверки в базе и текущие данные в корзине и если они отличаются составом и/или ценами то обновляем корзину

        //покажет и сразу скроет лоадер корзины
        puls_cart_update_loader: async function () {
            await this.show_cart_update_loader(); //функция покажет лоадер корзины
            await this.hide_cart_update_loader(); //функция скроет лоадер корзины
        },
        //покажет и сразу скроет лоадер корзины

        //функция покажет лоадер корзины
        show_cart_update_loader: async function () {
            cart_loader.style.pointerEvents = 'auto'; //делаем лодаер кликабельным чтоб пока он на экране мы ни с чем не взаимодействовали
            await cart_loader.ksn_fade.fade_show(); //ждём показа лоадера
        },
        //функция покажет лоадер корзины

        //функция скроет лоадер корзины
        hide_cart_update_loader: async function () {
            await cart_loader.ksn_fade.fade_hide(); //ждём скрытия лоадера
            cart_loader.style.pointerEvents = ''; //делаем лоадер снова некликабельным чтоб он не мешал пользовтаься корзиноу
        },
        //функция скроет лоадер корзины

        init: function () {
            [
                qs('.header-hidden__menu-cart-button'), //кнопка корзины в мобильном меню
                qs('.footer__menu-cart-button'), //кнопка корзины в меню футера
                qs('.header-visible__cart-button'), //кнопка корзины в хедере
                overlay, //положка корзины на сайте
                close_button, //кнопка закрытия корзины
            ].forEach(item => item._on('click', this.toggle_cart.bind(this))); //показываем/скрываем корзину при клике

            //создаём контролеры прозрачности для счётчиков корзины и её лоадера
            new Fade(inner_cart_counter);
            new Fade(header_cart_counter);
            new Fade(cart_loader);
            //создаём контролеры прозрачности для счётчиков корзины и её лоадера

            w._on('resize_throttle load', this.size_recalculate.bind(this)); //пересчитываем верхний отступ корзины пре ресайзе и при первой загрузке

            w._on('storage', this.cart_browser_tabs_sinhronization.bind(this)); //синхронизирует корзины в разных вкладках браузера

            cart_order_button._on('click', this.transition_to_order_page); //переводит нас на страницу оформления заказа
        },
    };

CONTROLLER.init(); //выполянем действия необходимые при загрузке модуля

export default CONTROLLER;
