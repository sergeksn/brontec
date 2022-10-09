export default class {
    render_product_block() {
        return '<div class="product_previv_block">\
                    <div class="description">\
                        <div class="title">' + this.title + '</div>\
                        <div class="small_dec">' + this.small_description + '</div>\
                        <div class="price_block">\
                            ' + this.old_price + '\
                            <div class="current_price">' + this.price + ' <span class="simvol_ruble_currency"></span></div>\
                            ' + this.discont + '\
                        </div>\
                    </div>\
                    <div class="previv_images_wraper">\
                        ' + this.img_block + '\
                    </div>\
                    <a class="arrow_link" href="' + this.page_url + '">\
                        <div class="icon_middle_arrow">\
                            <div class="svg_wrapper">\
                                <svg>\
                                    <use data-href="' + GDS.base_kit_svg_url + '#icon_middle_arrow" />\
                                </svg>\
                            </div>\
                        </div>\
                    </a>\
                </div>';
    }

    render_instruction_block() {
        return '<div class="product_previv_block">\
                    <div class="description">\
                        <div class="title">Инструкция по монтажу "' + this.title + '"</div>\
                        <div class="small_dec">' + this.small_description + '</div>\
                    </div>\
                    <div class="previv_images_wraper">\
                        ' + this.instruction_img_block + '\
                    </div>\
                    <a class="arrow_link" href="' + this.page_url + '">\
                        <div class="icon_middle_arrow">\
                            <div class="svg_wrapper">\
                                <svg>\
                                    <use data-href="' + GDS.base_kit_svg_url + '#icon_middle_arrow" />\
                                </svg>\
                            </div>\
                        </div>\
                    </a>\
                </div>';
    }

    constructor({ title, search_text, price, old_price, discont, small_description, img_block, instruction_img_block, page_url }) {
        if (!title) return;

        this.title = title;

        if (search_text) this.title = title.replace(new RegExp(search_text, 'ig'), '<span class="search_target">$&</span>'); //если есть search_text в переданном объекте с данными значит это рендер для результатов поиска и нам нужно выделить поисковые фразы, $&   вставляет всё найденное совпадение

        this.price = price;
        this.old_price = old_price == 0 ? "" : '<div class="old_price">' + old_price + '</div>';
        this.discont = discont == 0 ? "" : '<div class="discont">-' + discont + '%</div>';

        this.small_description = small_description == 0 ? "" : small_description;

        if (search_text) this.small_description = small_description == 0 ? "" : small_description.replace(new RegExp(search_text, 'ig'), '<span class="search_target">$&</span>'); //если есть search_text в переданном объекте с данными значит это рендер для результатов поиска и нам нужно выделить поисковые фразы, $&   вставляет всё найденное совпадение

        this.img_block = img_block === "" ? '<div class="product_prevu_img_block img_wrapper" data-img-type="img-kit" data-id-kit="dvernie_ruchki fary kapot krylya krysha" style="padding-top: 66.6666%;">\
                <img data-type="main" data-extension="jpg" data-src="/img/search/search.jpg">\
                <img data-type="kit" data-src="/img/search/kit.svg">\
                <div class="grad_fon"></div>\
                <div class="loader_wrap">\
                    <div class="loader"></div>\
                </div>\
            </div>' : img_block;

        this.instruction_img_block = instruction_img_block;
        this.page_url = page_url === "" ? "#test" : page_url;
    }
}