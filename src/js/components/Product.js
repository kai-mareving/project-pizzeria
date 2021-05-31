import { select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{
  constructor(id, data){
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    //& console.log('new Product(data):', thisProduct.data);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.dom = {};
    thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.dom.formInputs = thisProduct.element.querySelectorAll(select.all.formInputs);
    thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  renderInMenu() {
    const thisProduct = this;

    //* generate the HTML based on template
    const generatedHTML = templates.menuProduct(thisProduct.data);
    //* create a DOMelement using utils.createElementFromHTML
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    //* find the menu container
    const menuContainer = document.querySelector(select.containerOf.menu);
    //* insert the created DOMelement into menu container
    menuContainer.appendChild(thisProduct.element);
  }

  initAccordion() {
    const thisProduct = this;

    //* find the clickable trigger & add listener on click
    thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
      //* prevent default action for event
      event.preventDefault();

      //* find active product: '#product-list > .product.active'
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

      //* if there is active product and it's not thisProduct.element, remove class active from it
      const activated = classNames.menuProduct.wrapperActive; // class active selector
      for (let activeProduct of activeProducts) {
        if (activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(activated);
        }
      }
      //* toggle active class on thisProduct.element
      thisProduct.element.classList.toggle(activated);
    });
  }

  initOrderForm() {
    const thisProduct = this;

    thisProduct.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.dom.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.dom.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
    thisProduct.dom.amountWidgetElem.addEventListener('update', function () {
      thisProduct.processOrder();
    });
  }

  processOrder() {
    const thisProduct = this;

    //* convert form to object structure e.g. {sauce:['tomato'],toppings:['olives','redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    let price = thisProduct.data.price; //* set price to default price

    //* LOOP: for every category(param)
    for (let paramId in thisProduct.data.params) {
      //* determine param value, e.g. paramId='toppings',param={label:'Toppings',type:'checkboxes'...
      const param = thisProduct.data.params[paramId];

      //* LOOP: for every option in this category
      for (let optionId in param.options) {
        //* determine option value, e.g. optionId='olives',option={ label:'Olives',price:2,default:true }
        const option = param.options[optionId];
        const isDefault = option.hasOwnProperty('default');

        //* find img in imageWrapper where class .paramId-optionId
        const optionImg = thisProduct.dom.imageWrapper.querySelector('.' + paramId + '-' + optionId);

        //* check if the option (optionId) of category (paramId) is selected in the form (formData)
        if (formData[paramId] && formData[paramId].includes(optionId)) {
          if (!isDefault) {
            price += option.price; //^ add option price to price variable
          }
          //* check if img with class .paramId-optionId was found (not every product has pictures for options)
          if (optionImg) {
            optionImg.classList.add(classNames.menuProduct.imageVisible);
          }

        } else {

          if (optionImg) {
            optionImg.classList.remove(classNames.menuProduct.imageVisible);
          }
          if (isDefault) {
            price -= option.price; //^ reduce price var
          }
        }
      }
    }
    thisProduct.priceSingle = price; //* add prop priceSingle to thisProduct
    thisProduct.dom.priceElem.innerHTML = price * thisProduct.amountWidget.value; //* update calculated price in HTML
  }

  addToCart() {
    const thisProduct = this;
    app.cart.add(thisProduct.prepareCartProduct());
  }

  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSingle * thisProduct.amountWidget.value,
      params: thisProduct.prepareCartProductParams(),
    };
    return productSummary;
  }

  prepareCartProductParams() {
    const thisProduct = this;

    const formData = utils.serializeFormToObject(thisProduct.dom.form);
    const params = {};

    //* LOOP: for every category(param)
    for (let paramId in thisProduct.data.params) {
      const param = thisProduct.data.params[paramId];

      params[paramId] = {
        label: param.label,
        options: {}, //* options[optionId] = {id, label}
      };

      //* LOOP: for every option in this category(param)
      for (let optionId in param.options) {
        const option = param.options[optionId];

        if (formData[paramId] && formData[paramId].includes(optionId)) {
          params[paramId].options[optionId] = option.label;
        }
      }
    }
    return params;
  }
}

export default Product;