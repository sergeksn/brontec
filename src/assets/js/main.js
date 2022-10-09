"use strict"; //используем современный режим
//ВАЖНО: нужно использовать имеено touchend, т.к. touchstart вызывает ошибки если элементы разположенны близко друг к другу
//ПРИМЕЧАНИЕ: не играет особой роли как обращаться к элементу и его свойствам при большом количестве операций, при ожидании изменение какого-то параметра элемента например, что через мою ksn библеотеку что через нативный js
//ПРИМЕЧАНИЕ: полезные команды:
//debugger приостановит выполнение скрипта в браузере на паузе можно будет происпектирвоать код
//чтоб избежать мгновенное назначение стилей или классов нужно использовать мою функцию bf.wait в async функции с парметром await
//window.getEventListeners(el) //получить список всех слушателей привязанных к элементу
//преобразует ответ в true/false  !! (выражение)
//bf.setCookie("top_baner_hide", true);
//bf.deleteCookie("top_baner_hide");

//ПРИМЕЧАНИЕ: если нужно следить за определёнными элементами и не хочется кадый раз проверять наличиие их на странице то можно использовать HTMLCollection
//HTMLCollection -> getElementsByTagName, getElementsByClassName
//NodeList -> querySelectorAll

//ПРИМЕЧАНИЕ: нет смысла записывать положение каждой картинки в объект т.к. её положение может измениься и это отслеживать геморно, так что используем getBoundingClientRect пока картинок не много до 1000, а лучше до 200 для слабых устройств, при прокрутке фризов нет, а вслучае если на странице стребуется отобразить очень-очень много картинок то лучше сделать из вставку в DOM позже как количество необработынх картинок стоанет меньше

//ПРИМЕЧАНИЕ: если мы хотим передать в функцию несколько аргументов function name_fu(arg_1, arg_2 = null, arg_3 = [], arg_4, arg_5 = 99) но мы не знаем в каком порядке будут переданы аргументы, или какие-то могут просто не использоваться, для этого можно использовать такую запись function name_fu({arg_1, arg_2 = null, arg_3 = [], arg_4, arg_5 = 99}), это нам даст возможность задавать параметры функции в виде объекта, к примеру мы не хотим задавать вручную аргуметы arg_3 и arg_5, для этого просто делаем так name_fu({arg_1:"data_1",arg_2:"data_2",arg_4:"data_4"}),  этом случае функция возьмёт аргументы соотвествующие ключам в объекте, а те аргумеенты которые не заданы будут взяты из значенйи функции по умолчанию или будут undefined

//ПРИМЕЧАНИЕ: если нам нужно записать какие-то данные которые касаются определённого DOM элемента то нам не обязательно создавать новый объект в коде а потом искать на него ссылку, мы можем просто записать нужные нам данные в свойства данного DOM лемента и уже оращаться к ним, т.к. DOM элементы это обычные объекты js и мы можем записывать в них свои данные

//ВАЖНО: скорость выполнения функции зависит от её фактического размера, особенно если в ней объявляются очень большие объекты, так что чтоб увеличисть производительность нужно выносить всё большое за пределы функции
import "./base_func/dom_helper.js"; //самописный аналог jquery с очень урезазнным функционалом, чтоб облегчить рутинную работу

import "./base_func/dom_add_func.js";

import "@js_moduls/base"; //тут будут записаны основные функции для взаимодействи я с общими элементами сайта и установленны основные слушатели и те действия которые нужно выполнять на любой странице сайта в самом начале

import "@js_moduls/media"; //КАРТИНКИ
import "@js_moduls/overlays"; //ВСЕ ПОДЛОЖКИ
import "@js_moduls/header"; //HEADER
import "@js_moduls/header_toggle_block"; //СКРЫТЫЙ БЛОК В ХЕДЕРЕ
import "@js_moduls/header_search"; //ОКНО ПОИСКА
//import '@js_moduls/cart';
//import '@js_moduls/top_poster';

import "@js_moduls/scroll_to_top"; //КНОПКА СКРОЛА ВВЕРХ
import "@js_moduls/footer"; //ФУТЕР
import "@js_moduls/small_product_previv_block"; //отвечает за рендер блоков в выдаче поиска товаров




// console.log(document.getElementsByClassName("standart_container")._siblings("div"));

// console.log(document.querySelectorAll(".standart_container")._siblings("div"));

// console.log(document.querySelectorAll("main")._childs("div.standart_container"))

// console.log(document.getElementsByTagName("main")._childs("div.standart_container"))

// console.log(document.querySelectorAll("body")._find(".standart_container, div.test_item:not(.opa)"))

// console.log(document.querySelectorAll(".standart_container")._parent("footer, .hidden_header_part"));

// console.log(document.querySelectorAll("div.img_wrapper")._parents("a, .header_logo, div.footer_item, main"));

// console.log(document.getElementById("header_overlay")._siblings("div"));

$(document).on({
    events: "DOMContentLoaded",
    callback: function () {},
});
