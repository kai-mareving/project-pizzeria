import { select, templates /* , settings, classNames */ } from '../settings.js';
// import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

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
    thisBooking.dom = {};
    /* add a 'wrapper' property and assign it a reference to container (in methods argument) */
    thisBooking.dom.wrapper = container;
    /* change contents of wrapper (innerHTML) to HTML generated from template */
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
  }

  initWidgets() {
    const thisBooking = this;
    /* Initialise widgets */
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    /* Add event listeners to prepared inputs */
    thisBooking.dom.peopleAmount.addEventListener('update', function () {
      console.log('update on peopleAmount');
    });
    thisBooking.dom.hoursAmount.addEventListener('update', function () {
      console.log('update on hoursAmount');
    });
    thisBooking.dom.datePicker.addEventListener('update', function () {
      console.log('update on datePicker');
    });
    thisBooking.dom.hourPicker.addEventListener('update', function () {
      console.log('update on hourPicker');
    });
  }

}

export default Booking;
