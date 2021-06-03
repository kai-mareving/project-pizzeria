import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navlinks = document.querySelectorAll(select.nav.links);
    /* activate page [order] */
    const idFromHash = window.location.hash.replace('#/','');
    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) { pageMatchingHash = page.id; break; }
    }

    thisApp.activatePage(idFromHash);

    for (let link of thisApp.navlinks) {
      link.addEventListener('click', function (event) {
        const clickedElem = this;
        event.preventDefault();
        /* get page id from href attribute */
        const id = clickedElem.getAttribute('href').replace('#', '');
        /* run thisApp.activatePage with this id */
        thisApp.activatePage(id);
        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;

    /* add class "active" to matching [pages], remove from non-matching */
    for (let page of thisApp.pages) {
      // or if (page.id === pageId)
      page.classList.toggle( classNames.pages.active, page.id == pageId );
    }
    /* add class "active" to matching [links], remove from non-matching */
    for (let link of thisApp.navlinks) {
      link.classList.toggle( classNames.nav.active, link.getAttribute('href') == '#' + pageId );
    }
  },

  initMenu: function () {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      //or new Product(productData, thisApp.data.products[productData]);
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      ////console.log('new Product(data):', thisApp.data.products[productData]);
    }
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
    //or cartElem.addEventListener('update',function(event){app.cart.update();}); -> working in Cart.initActions()
  },

  initBooking: function () {
    const thisApp = this;

    /* find container of booking widget (select.containerOf.booking) */
    const bookingWrapper = document.querySelector(select.containerOf.booking);
    /* create new instance of class Booking and pass booking container to it */
    thisApp.bookingPage = new Booking(bookingWrapper);
  },

  initData: function(){
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(rawResponse => rawResponse.json())
      .then(parsedResponse => {
        /* save parsedResponse as thisApp.data.products + execute initMenu() */
        thisApp.data.products = parsedResponse;
        //// console.log('fetch() done:', thisApp.data);
        //// console.log('fetch() done:', JSON.stringify(thisApp.data));
        thisApp.initMenu();
      });
    //// console.log('fetch() still working');
  },

  init: function(){
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp in app.init():', thisApp);
    //// console.log('thisApp.data:', thisApp.data);
    //// console.log('classNames:', classNames);
    //// console.log('settings:', settings);
    //// console.log('templates:', templates);
    thisApp.initPages();
    thisApp.initData();
    /* thisApp.initMenu(); -> in app.initData */
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();
