/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      //!thisProduct.processOrder();

      //>console.log('new Product:', thisProduct);
    }

    getElements() {
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.formInputs = thisProduct.element.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.inputAmount = thisProduct.element.querySelector(select.widgets.amount.input);
      thisProduct.amountDecrease = thisProduct.element.querySelector(select.widgets.amount.linkDecrease);
      thisProduct.amountIncrease = thisProduct.element.querySelector(select.widgets.amount.linkIncrease);
    }

    renderInMenu() {
      const thisProduct = this;

      //* generate the HTML based on template
      const generatedHTML = templates.menuProduct(thisProduct.data);
      ////console.log('generatedHTML: ', generatedHTML);
      //* create a DOMelement using utils.createElementFromHTML
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      ////console.log(thisProduct.element);
      //* find the menu container
      const menuContainer = document.querySelector(select.containerOf.menu);
      ////console.log(menuContainer);
      //* insert the created DOMelement into menu container
      menuContainer.appendChild(thisProduct.element);
    }

    initAccordion() {
      const thisProduct = this;
      //* find the clickable trigger (element that should react to clicking)
      //OR const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      //* START: add event listener to clickable trigger on event click
      //OR clickableTrigger.addEventListener('click', function(event) {
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        //* prevent default action for event
        event.preventDefault();

        //* find active product (product that has active class)
        //^ select.all.menuProductsActive: '#product-list > .product.active'
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

        //* if there is active product and it's not thisProduct.element, remove class active from it
        const activated = classNames.menuProduct.wrapperActive;

        for (let activeProduct of activeProducts) {
          if (activeProduct !== thisProduct.element) {
            //// console.log('deactivated::', activeProduct.childNodes[3].innerText);
            activeProduct.classList.remove(activated);
          }
        }
        //* toggle active class on thisProduct.element
        thisProduct.element.classList.toggle(activated);
        //// console.log('active::', thisProduct.data.name);
      });
    }

    initOrderForm() {
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.amountDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.inputAmount.value --;
        thisProduct.processOrder();
      });

      thisProduct.amountIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.inputAmount.value ++;
        thisProduct.processOrder();
      });

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    processOrder() {
      const thisProduct = this;
      //^ convert form to object structure e.g. {sauce:['tomato'],toppings:['olives','redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //>console.log('formData: ', formData);

      //* set price to default price
      let price = thisProduct.data.price;

      //# LOOP: for every category(param)
      for (let paramId in thisProduct.data.params) {
        //^ determine param value, e.g. paramId='toppings',param={label:'Toppings',type:'checkboxes'...
        const param = thisProduct.data.params[paramId];
        console.log(paramId, param);

        //# LOOP: for every option in this category
        for (let optionId in param.options) {
          //^ determine option value, e.g. optionId='olives',option={ label:'Olives',price:2,default:true }
          const option = param.options[optionId];
          console.log(optionId, option);
          const isDefault = option.hasOwnProperty('default');

          //* check if the option (optionId) of category (paramId) is selected in the form (formData)
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            //^ check is not default
            if (!isDefault) {
              //* add option price to price variable
              price += option.price;
            }
          } else {
            //^ check is default
            if (isDefault) {
              //* reduce price var
              price -= option.price;
            }
          }
          const actived = classNames.menuProduct.wrapperActive;

          console.log('image:', thisProduct.imageWrapper.querySelectorAll('img'));
          //todo find img where class="paramId-optionId"
          //thisProduct.imageWrapper.querySelector('')
          //todo toggle 'active' in that img class
        }
      }

      console.log('quantity:', thisProduct.inputAmount.value);
      //* update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price * thisProduct.inputAmount.value;
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;
      ////console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
