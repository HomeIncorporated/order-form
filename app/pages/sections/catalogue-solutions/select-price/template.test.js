import { componentTester } from '../../../../test-utils/componentTester';
import manifest from './manifest.json';

const setup = {
  template: {
    path: 'pages/sections/catalogue-solutions/select-price/template.njk',
  },
};

describe('catalogue-solutions select-price page', () => {
  it('should render a backLink', componentTester(setup, (harness) => {
    const context = {
      orderId: 'order-1',
      backLinkText: 'Go back',
      backLinkHref: '/organisation/order-1',
    };

    harness.request(context, ($) => {
      const backLink = $('[data-test-id="go-back-link"]');
      expect(backLink.length).toEqual(1);
      expect(backLink.text().trim()).toEqual('Go back');
      expect($(backLink).find('a').attr('href')).toEqual('/organisation/order-1');
    });
  }));

  it('should render the solutions price page title', componentTester(setup, (harness) => {
    const context = {
      title: 'List price fororder-1',
    };

    harness.request(context, ($) => {
      const title = $('h1[data-test-id="solutions-price-page-title"]');
      expect(title.length).toEqual(1);
      expect(title.text().trim()).toEqual(context.title);
    });
  }));

  it('should render the solutions price page description', componentTester(setup, (harness) => {
    const context = {
      description: manifest.description,
    };

    harness.request(context, ($) => {
      const description = $('h2[data-test-id="solutions-price-page-description"]');
      expect(description.length).toEqual(1);
      expect(description.text().trim()).toEqual(context.description);
    });
  }));

  it('should render the "Select list price" radio button options component', componentTester(setup, (harness) => {
    const context = {
      prices: [{
        id: 'selectSolutionPrice',
        mainAdvice: 'Select list price',
        options: [{
          value: 'price-1',
          text: 'Price 1',
        }, {
          value: 'price-2',
          text: 'Price 2',
        }],
      }],
    };

    harness.request(context, ($) => {
      const selectSolutionRadioOptions = $('[data-test-id="question-selectSolutionPrice"]');
      expect(selectSolutionRadioOptions.length).toEqual(1);
      expect(selectSolutionRadioOptions.find('legend').text().trim()).toEqual(context.questions[0].mainAdvice);
      expect(selectSolutionRadioOptions.find('input').length).toEqual(2);
      expect(selectSolutionRadioOptions.find('.nhsuk-radios__item:nth-child(1)').find('input').attr('value')).toEqual('price-1');
      expect(selectSolutionRadioOptions.find('.nhsuk-radios__item:nth-child(1)').text().trim()).toEqual('Price 1');
      expect(selectSolutionRadioOptions.find('.nhsuk-radios__item:nth-child(2)').find('input').attr('value')).toEqual('price-2');
      expect(selectSolutionRadioOptions.find('.nhsuk-radios__item:nth-child(2)').text().trim()).toEqual('Price 2');
    });
  }));

  it('should render the "Continue" button', componentTester(setup, (harness) => {
    const context = {
      continueButtonText: 'Continue',
    };

    harness.request(context, ($) => {
      const button = $('[data-test-id="continue-button"] button');
      expect(button.length).toEqual(1);
      expect(button.text().trim()).toEqual(context.continueButtonText);
    });
  }));
});
