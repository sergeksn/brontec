'use strict'; //используем современный режим
//ПРИМЕЧАНИЕ: удаление картинки из DOM не переывает её загрузку
//ВАЖНО: нужно использовать имеено touchend, т.к. touchstart вызывает ошибки если элементы разположенны близко друг к другу
//ПРИМЕЧАНИЕ: не играет особой роли как обращаться к элементу и его свойствам при большом количестве операций, при ожидании изменение какого-то параметра элемента например, что через мою ksn библеотеку что через нативный js
//ПРИМЕЧАНИЕ: полезные команды:
//debugger приостановит выполнение скрипта в браузере на паузе можно будет происпектирвоать код
//чтоб избежать мгновенное назначение стилей или классов нужно использовать мою функцию bf.wait в async функции с парметром await
//window.getEventListeners(el) //получить список всех слушателей привязанных к элементу
//преобразует ответ в true/false  !! (выражение)
//bf.setCookie("top_baner_hide", true);
//bf.deleteCookie("top_baner_hide");

//ПРИМЕЧАНИЕ: для получения значения свойств transform из getComputedStyle
//el.transform.match(/\((?:([^\s]+\s?){5}(?:.+))\)/) для X
//el.transform.match(/\((?:(?:[^\s]+\s?){5}(.+))\)/) для Y

//ПРИМЕЧАНИЕ: bind не выполняет функцию сразу как apply и call, а возвращает копию функции которую можно вызвать позже со своим this и параметрами

//ПРИМЕЧАНИЕ: если нужно следить за определёнными элементами и не хочется кадый раз проверять наличиие их на странице то можно использовать HTMLCollection
//HTMLCollection -> getElementsByTagName, getElementsByClassName
//NodeList -> querySelectorAll

//ПРИМЕЧАНИЕ: нет смысла записывать положение каждой картинки в объект т.к. её положение может измениься и это отслеживать геморно, так что используем getBoundingClientRect пока картинок не много до 1000, а лучше до 200 для слабых устройств, при прокрутке фризов нет, а вслучае если на странице стребуется отобразить очень-очень много картинок то лучше сделать из вставку в DOM позже как количество необработынх картинок стоанет меньше

//ПРИМЕЧАНИЕ: если мы хотим передать в функцию несколько аргументов function name_fu(arg_1, arg_2 = null, arg_3 = [], arg_4, arg_5 = 99) но мы не знаем в каком порядке будут переданы аргументы, или какие-то могут просто не использоваться, для этого можно использовать такую запись function name_fu({arg_1, arg_2 = null, arg_3 = [], arg_4, arg_5 = 99}), это нам даст возможность задавать параметры функции в виде объекта, к примеру мы не хотим задавать вручную аргуметы arg_3 и arg_5, для этого просто делаем так name_fu({arg_1:"data_1",arg_2:"data_2",arg_4:"data_4"}),  этом случае функция возьмёт аргументы соотвествующие ключам в объекте, а те аргумеенты которые не заданы будут взяты из значенйи функции по умолчанию или будут undefined

//ПРИМЕЧАНИЕ: если нам нужно записать какие-то данные которые касаются определённого DOM элемента то нам не обязательно создавать новый объект в коде а потом искать на него ссылку, мы можем просто записать нужные нам данные в свойства данного DOM лемента и уже оращаться к ним, т.к. DOM элементы это обычные объекты js и мы можем записывать в них свои данные

//ВАЖНО: скорость выполнения функции зависит от её фактического размера, особенно если в ней объявляются очень большие объекты, так что чтоб увеличисть производительность нужно выносить всё большое за пределы функции
import '@js-libs/dom-add-func.js';

//@dinamic node import fils
import "@iframe-youtube-main-js";
import "@images-main-js";
import "@loader-main-js";
import "@overlays-main-js";
import "@pop-up-messages-main-js";
import "@product-small-info-block-main-js";
import "@scroll-to-top-button-main-js";
import "@block-showed-on-scroll-main-js";
import "@scrollbar-main-js";
import "@footer-main-js";
import "@glavnaya-1-blue-top-block-main-js";
import "@glavnaya-10-fqa-main-js";
import "@glavnaya-11-cars-svg-main-js";
import "@glavnaya-2-video-block-main-js";
import "@glavnaya-3-icons-grid-main-js";
import "@glavnaya-4-img-text-slider-main-js";
import "@glavnaya-5-svoystva-plenki-main-js";
import "@glavnaya-6-product-set-main-js";
import "@glavnaya-7-video-instruction-main-js";
import "@glavnaya-8-blue-block-main-js";
import "@glavnaya-9-otzivi-main-js";
import "@header-main-js";
import "@komplekt-1-full-kit-main-js";
import "@komplekt-2-select-kit-composition-main-js";
import "@komplekt-3-abaut-kit-main-js";
import "@komplekt-4-gallery-main-js";
import "@komplekt-5-video-instruction-main-js";
//@dinamic node import fils
