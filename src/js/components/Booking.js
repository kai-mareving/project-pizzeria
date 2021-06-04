import { select, templates /* , settings, classNames */ } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(container) {
    const thisBooking = this;
    //> console.log('Booking: ', container, '. ', thisBooking);

    thisBooking.render(container);
    thisBooking.initWidgets();
  }

  render(container) {
    const thisBooking = this;
    /* generate the HTML based on template */
    const generatedHTML = templates.bookingWidget();
    /* create DOM object */
    /* add a 'wrapper' prop. to this object and assign a ref. to the container (from methods argument) */
    /* change contents of wrapper (innerHTML) to HTML generated from template */
    thisBooking.dom = {};
    thisBooking.dom.wrapper = container;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.dom.peopleAmount.addEventListener('update', function () {
      console.log('update on peopleAmount');
    });

    thisBooking.dom.hoursAmount.addEventListener('update', function () {
      console.log('update on hoursAmount');
    });

  }

}

export default Booking;
