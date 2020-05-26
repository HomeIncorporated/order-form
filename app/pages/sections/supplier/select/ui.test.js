import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import content from './manifest.json';

const pageUrl = 'http://localhost:1234/organisation/order-1/supplier/search/select';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113', name: 'Cool Dude', ordering: 'manage', primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const setSessionState = ClientFunction(() => {
  const cookieValue = JSON.stringify([
    { supplierId: 'supplier-1', name: 'Supplier 1' },
    { supplierId: 'supplier-2', name: 'Supplier 2' },
  ]);

  document.cookie = `suppliersFound=${cookieValue}`;
});

const pageSetup = async (t, withAuth = false, withSessionState = false) => {
  if (withAuth) await setCookies();
  if (withSessionState) await setSessionState();
};


const getLocation = ClientFunction(() => document.location.href);

fixture('Supplier select page')
  .page('http://localhost:1234/some-fake-page')
  .afterEach(async (t) => {
    const isDone = nock.isDone();
    if (!isDone) {
      nock.cleanAll();
    }

    await t.expect(isDone).ok('Not all nock interceptors were used!');
  });

test('when user is not authenticated - should navigate to the identity server login page', async (t) => {
  await pageSetup(t);
  nock('http://identity-server')
    .get('/login')
    .reply(200);

  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://identity-server/login');
});

test('should render Supplier select page', async (t) => {
  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="supplier-select-page"]');

  await t
    .expect(page.exists).ok();
});

test('should navigate to /organisation/order-1/supplier/search when click on backlink', async (t) => {
  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .click(goBackLink)
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-1/supplier/search');
});

test('should render the title', async (t) => {
  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="supplier-select-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(content.title);
});

test('should render the description', async (t) => {
  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="supplier-select-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(content.description);
});

test('should render a selectSupplier question as radio button options', async (t) => {
  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const selectSupplierRadioOptions = Selector('[data-test-id="question-selectSupplier"]');

  await t
    .expect(selectSupplierRadioOptions.exists).ok()
    .expect(await extractInnerText(selectSupplierRadioOptions.find('legend'))).eql(content.questions[0].mainAdvice)
    .expect(selectSupplierRadioOptions.find('input').count).eql(2)

    .expect(selectSupplierRadioOptions.find('input').nth(0).getAttribute('value')).eql('supplier-1')
    .expect(await extractInnerText(selectSupplierRadioOptions.find('label').nth(0))).eql('Supplier 1')

    .expect(selectSupplierRadioOptions.find('input').nth(1).getAttribute('value')).eql('supplier-2')
    .expect(await extractInnerText(selectSupplierRadioOptions.find('label').nth(1))).eql('Supplier 2');
});

test('should render the Continue button', async (t) => {
  await pageSetup(t, true, true);
  await t.navigateTo(pageUrl);

  const button = Selector('[data-test-id="continue-button"] button');

  await t
    .expect(button.exists).ok()
    .expect(await extractInnerText(button)).eql(content.continueButtonText);
});


test('should redirect back to /organisation/order-1/supplier/search no suppliers are returned', async (t) => {
  await pageSetup(t, true, false);
  await t.navigateTo(pageUrl);

  await t
    .expect(getLocation()).eql('http://localhost:1234/order/organisation/order-1/supplier/search');
});