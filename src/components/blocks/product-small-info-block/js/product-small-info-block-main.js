export default class {
    constructor({ search_text, marka, model, type, name, ms_title, ms_desctiption, price, full_price, discont, wp_link, main_img, svg_parts, instruction_img }) {
        this.ms_title = ms_title;

        if (search_text) this.ms_title = ms_title.replace(new RegExp(search_text, 'ig'), '<span class="product-info__searched-text">$&</span>'); //если есть search_text в переданном объекте с данными значит это рендер для результатов поиска и нам нужно выделить поисковые фразы, $&   вставляет всё найденное совпадение

        this.price = price;
        this.full_price = full_price ? '<div class="product-info__old-price old-price">' + full_price + '</div>' : '';
        this.discont = discont ? '<div class="product-info__discont discont-price">' + discont + '</div>' : '';

        this.ms_desctiption = ms_desctiption ?? '';

        if (search_text && ms_desctiption) this.ms_desctiption = ms_desctiption.replace(new RegExp(search_text, 'ig'), '<span class="product-info__searched-text">$&</span>'); //если есть search_text в переданном объекте с данными значит это рендер для результатов поиска и нам нужно выделить поисковые фразы, $&   вставляет всё найденное совпадение

        main_img = JSON.parse(main_img);
        this.main_img = {
            url: GDS.wp_img_url_prefix + main_img.url,
            pt: ((main_img.original_height / main_img.original_width) * 100).toFixed(5),
            ow: main_img.original_width,
            oh: main_img.original_height,
        };

        this.svg_parts_html = type === 'kit' ? '<div data-img-type="svg-kit-items" data-all-active>' : '<div data-img-type="svg-kit-items">';

        svg_parts.forEach(img => {
            let status = '';

            if (type === img.type && type !== 'kit') {
                status = 'data-active';
            }

            this.svg_parts_html += `<object ${status} data-src="${GDS.wp_img_url_prefix + img.url}"></object>`;
        });

        this.svg_parts_html += '</div>';

        if (instruction_img) {
            instruction_img = JSON.parse(instruction_img);

            this.instruction_img = {
                url: GDS.wp_img_url_prefix + instruction_img.url,
                ow: instruction_img.original_width,
                oh: instruction_img.original_height,
            };

            if (type === 'kit') {
                this.instruction_text = 'Инструкция по монтажу ' + marka + ' ' + model;
            } else {
                name = name.toLowerCase();
                this.instruction_text = 'Инструкция по монтажу ' + marka + ' ' + model + ' на ' + name;
            }

            this.instruction_link = '/instrukczii/?marka=' + marka + '&model=' + model;
        }

        this.wp_link = wp_link;
    }

    render_product_block() {
        return `<a href="${this.wp_link}">
          <div class="product-info product-info--header-search">
          <div class="product-info__description">
            <div class="product-info__title">${this.ms_title}</div>
            <div class="product-info__small-description">${this.ms_desctiption}</div>
            <div class="product-info__price-block">
              ${this.full_price}
              <div class="product-info__current-price ruble-price">${this.price}</div>
              ${this.discont}
            </div>
          </div>
          <div class="product-info__img-wrap">
            <div class="product-info__gradient-fon"></div>
              <div class="image" style="padding-top: ${this.main_img.pt}%">
                <img data-img-type="img" data-main data-src="${this.main_img.url}" data-original-w="${this.main_img.ow}" data-original-h="${this.main_img.oh}" />
                ${this.svg_parts_html}
                <div class="loader">
                    <div class="loader__circle"></div>
                </div>
              </div>
          </div>
          <div class="product-info__arrow icon--arrow-middle"></div>
        </div>
      </a>`;
    }

    render_instruction_block() {
        if (!this.instruction_img) return ''; //если для данного продукта не передана картинка инструкций значит для этого блока инструкции показывать неужно

        return `<a href="${this.instruction_link}">
        <div class="product-info product-info--header-search">
            <div class="product-info__description">
                <div class="product-info__title">${this.instruction_text}</div>
                <div class="product-info__small-description">${this.ms_desctiption}</div>
            </div>
            <div class="product-info__img-wrap">
                <div class="product-info__gradient-fon"></div>
                <div class="image" style="padding-top: ${this.main_img.pt}%">
                  <img data-img-type="img" data-main data-src="${this.main_img.url}" data-original-w="${this.main_img.ow}" data-original-h="${this.main_img.oh}" />
                  ${this.svg_parts_html}
                  <div class="image product-info__img-wrap-instruction-img">
                    <div data-img-type="bg" data-src="${this.instruction_img.url}" data-original-w="${this.instruction_img.ow}" data-original-h="${this.instruction_img.oh}"></div>
                  </div>
                  <div class="loader">
                      <div class="loader__circle"></div>
                  </div>
                </div>
            </div>
            <div class="product-info__arrow icon--arrow-middle"></div>
        </div>
      </a>`;
    }
}
