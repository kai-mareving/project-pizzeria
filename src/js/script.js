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

  //##### PRODUCT #####
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

      ////console.log('new Product:', thisProduct);
    }

    getElements() {
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.formInputs = thisProduct.element.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      //or thisProduct.inputAmount = thisProduct.element.querySelector(select.widgets.amount.input);
      //or thisProduct.amountDecrease = thisProduct.element.querySelector(select.widgets.amount.linkDecrease);
      //or thisProduct.amountIncrease = thisProduct.element.querySelector(select.widgets.amount.linkIncrease);
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
      //* find the clickable trigger (element that should react to clicking)
      //OR const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      //* START: add event listener to clickable trigger on event click
      //OR clickableTrigger.addEventListener('click', function(event) {
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        //* prevent default action for event
        event.preventDefault();

        //* find active product (product that has active class)
        //* select.all.menuProductsActive: '#product-list > .product.active'
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

        //* if there is active product and it's not thisProduct.element, remove class active from it
        const activated = classNames.menuProduct.wrapperActive;

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

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    }

    processOrder() {
      const thisProduct = this;
      //* convert form to object structure e.g. {sauce:['tomato'],toppings:['olives','redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //>console.log('formData: ', formData);

      //* set price to default price
      let price = thisProduct.data.price;

      //# LOOP: for every category(param)
      for (let paramId in thisProduct.data.params) {
        //* determine param value, e.g. paramId='toppings',param={label:'Toppings',type:'checkboxes'...
        const param = thisProduct.data.params[paramId];
        //>console.log(paramId, param);

        //# LOOP: for every option in this category
        for (let optionId in param.options) {
          //* determine option value, e.g. optionId='olives',option={ label:'Olives',price:2,default:true }
          const option = param.options[optionId];
          //>console.log(optionId, option);
          const isDefault = option.hasOwnProperty('default');

          //* find img in imageWrapper where class .paramId-optionId
          const optionImg = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);

          //* check if the option (optionId) of category (paramId) is selected in the form (formData)
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            //^ check is not default
            if (!isDefault) {
              //^ add option price to price variable
              price += option.price;
            }
            //* check if img with class .paramId-optionId was found (not every product has pictures for options)
            if (optionImg) {
              //^ add 'active' to that img class
              optionImg.classList.add(classNames.menuProduct.imageVisible);
            }

          } else {

            if (optionImg) {
              //^ remove 'active' to that img class
              optionImg.classList.remove(classNames.menuProduct.imageVisible);
            }
            //^ check is default
            if (isDefault) {
              //^ reduce price var
              price -= option.price;
            }
          }
        }
      }

      //* update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price; //? or: * thisProduct.inputAmount.value;
    }
  }

  //##### AMOUNT WIDGET #####
  class AmountWidget{
    constructor(element) {
      const thisWidget = this;

      thisWidget.getElements(element); // .widget-amount
      thisWidget.initActions();
      thisWidget.setValue(thisWidget.input.value);

      //// console.log('AmountWidget:', thisWidget);
      //// console.log('constructor arguments:', element);
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element; //? .widget-amount
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input); //? input[name="amount"]
      thisWidget.amountDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease); //? a[href="#less"]
      thisWidget.amountIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease); //? a[href="#more"]

      thisWidget.amountDefaultMin = settings.amountWidget.defaultMin; //? 1
      thisWidget.amountDefaulMax = settings.amountWidget.defaultMax; //? 9
    }

    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);

      //** Validation **
      //^ is value given by function different from what is already in thisWidget.value
      if (thisWidget.value !== newValue && !isNaN(newValue)) {

        thisWidget.value = newValue;

        if (thisWidget.value > thisWidget.amountDefaulMax) {
          thisWidget.value = thisWidget.amountDefaulMax;
          // thisWidget.announce();
        } else if (thisWidget.value < thisWidget.amountDefaultMin) {
          thisWidget.value = thisWidget.amountDefaultMin;
          // thisWidget.announce();
        }
      }
      thisWidget.input.value = thisWidget.value;
    }

    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
        thisWidget.announce();
      });

      thisWidget.amountDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
        thisWidget.announce();
        //// thisProduct.inputAmount.value--;
        //// thisProduct.processOrder();
      });

      thisWidget.amountIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
        thisWidget.announce();
        //// thisProduct.inputAmount.value++;
        //// thisProduct.processOrder();
      });
    }

    announce() {
      const thisWidget = this;

      const event = new Event('update');
      thisWidget.element.dispatchEvent(event);
      console.log('Event "update" dispatched!');
    }
  }

  //! ***** APP *****
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
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
