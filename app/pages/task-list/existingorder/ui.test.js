import nock from 'nock';
import { ClientFunction, Selector } from 'testcafe';
import { extractInnerText } from 'buying-catalogue-library';
import commonContent from '../commonManifest.json';
import existingorderPageContent from './manifest.json';
import { baseUrl, orderApiUrl } from '../../../config';

const mockExistingOrderSummary = {
  orderId: 'order-id',
  description: 'Some description',
  sections: [
    {
      id: 'description',
      status: 'complete',
    },
  ],
};

const pageUrl = 'http://localhost:1234/organisation/order-id';

const setCookies = ClientFunction(() => {
  const cookieValue = JSON.stringify({
    id: '88421113',
    name: 'Cool Dude',
    ordering: 'manage',
    primaryOrganisationId: 'org-id',
  });

  document.cookie = `fakeToken=${cookieValue}`;
});

const mocks = (data) => {
  nock(orderApiUrl)
    .get('/api/v1/orders/order-id/summary')
    .reply(200, data);
};

const pageSetup = async (t, withAuth = false, data = mockExistingOrderSummary) => {
  if (withAuth) {
    mocks(data);
    await setCookies();
  }
};

const getLocation = ClientFunction(() => document.location.href);

fixture('existingorder task-list page')
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

test('should render existingorder task-list page', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);
  const page = Selector('[data-test-id="order-id-page"]');

  await t
    .expect(page.exists).ok();
});

test(`should navigate to ${baseUrl}/organisation when click Back`, async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const goBackLink = Selector('[data-test-id="go-back-link"] a');

  await t
    .expect(goBackLink.exists).ok()
    .expect(goBackLink.getAttribute('href')).eql(`${baseUrl}/organisation`);
});

test('should render the title', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const title = Selector('h1[data-test-id="order-id-page-title"]');

  await t
    .expect(title.exists).ok()
    .expect(await extractInnerText(title)).eql(`${existingorderPageContent.title} order-id`);
});

test('should render the description', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const description = Selector('h2[data-test-id="order-id-page-description"]');

  await t
    .expect(description.exists).ok()
    .expect(await extractInnerText(description)).eql(existingorderPageContent.description);
});

test('should render the order description details', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const orderDescriptionTitle = Selector('h3[data-test-id="order-id-order-description-title"]');
  const orderDescription = Selector('h4[data-test-id="order-id-order-description"]');

  await t
    .expect(orderDescriptionTitle.exists).ok()
    .expect(await extractInnerText(orderDescriptionTitle)).eql(existingorderPageContent.orderDescriptionTitle)
    .expect(orderDescription.exists).ok()
    .expect(await extractInnerText(orderDescription)).eql(mockExistingOrderSummary.description);
});

// First Task First Item Tests
test('should render the first task and first item', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const firstTask = Selector('li[data-test-id="task-0"]');
  const firstTaskFirstItem = Selector('[data-test-id="task-0-item-0"]');

  await t
    .expect(firstTask.exists).ok()
    .expect(await extractInnerText(firstTask.find('h2 span'))).eql('1.')
    .expect(await extractInnerText(firstTask.find('h2 div'))).eql('Start your order')
    .expect(firstTaskFirstItem.exists).ok()
    .expect(await extractInnerText(firstTaskFirstItem.find('span'))).eql('Provide a description of your order');
});

test('should always render the first task and first item as a link', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const firstTaskFirstItem = Selector('li[data-test-id="task-0-item-0"]');

  await t
    .expect(firstTaskFirstItem.find('a').exists).ok()
    .click(firstTaskFirstItem.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/description`);
});

test('should always render the first task as complete for an existing order', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const firstTaskFirstItemCompleteTag = Selector('[data-test-id="task-0-item-0-complete-tag"]');

  await t
    .expect(firstTaskFirstItemCompleteTag.exists).ok();
});

// Second Task First Item Tests
test('should render the second task and first item', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const taskList = Selector('[data-test-id="task-list"]');
  const secondTask = Selector('li[data-test-id="task-1"]');
  const secondTaskFirstItem = Selector('li[data-test-id="task-1-item-0"]');

  await t
    .expect(taskList.exists).ok()
    .expect(secondTask.exists).ok()
    .expect(await extractInnerText(secondTask.find('h2 span'))).eql('2.')
    .expect(await extractInnerText(secondTask.find('h2 div'))).eql('Organisation information')
    .expect(secondTaskFirstItem.exists).ok()
    .expect(await extractInnerText(secondTaskFirstItem.find('span'))).eql('Provide Call-off Ordering Party information');
});

test('should always render the second task and first item as a link', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const secondTaskFirstItem = Selector('li[data-test-id="task-1-item-0"]');

  await t
    .expect(await extractInnerText(secondTaskFirstItem)).eql('Provide Call-off Ordering Party information')
    .expect(secondTaskFirstItem.find('a').exists).ok()
    .click(secondTaskFirstItem.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/ordering-party`);
});

test('should not render the second task and first as complete when returned as incomplete from the API', async (t) => {
  mockExistingOrderSummary.sections.push({ id: 'ordering-party', status: 'incomplete' });
  await pageSetup(t, true, mockExistingOrderSummary);
  await t.navigateTo(pageUrl);

  const secondTaskFirstItemCompleteTag = Selector('[data-test-id="task-1-item-0-complete-tag"]');

  await t
    .expect(secondTaskFirstItemCompleteTag.exists).notOk();
});

test('should only render the second task and first as complete when returned as complete from the API', async (t) => {
  mockExistingOrderSummary.sections.push({ id: 'ordering-party', status: 'complete' });
  await pageSetup(t, true, mockExistingOrderSummary);
  await t.navigateTo(pageUrl);

  const secondTaskFirstItemCompleteTag = Selector('[data-test-id="task-1-item-0-complete-tag"]');

  await t
    .expect(secondTaskFirstItemCompleteTag.exists).ok();
});

// Second Task Second Item Tests
test('should render the second task as "Organisation information" and "supplier" as link not text', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const taskList = Selector('[data-test-id="task-list"]');
  const secondTask = Selector('li[data-test-id="task-1"]');
  const secondTaskSecondItem = Selector('li[data-test-id="task-1-item-1"]');

  await t
    .expect(taskList.exists).ok()
    .expect(secondTask.exists).ok()
    .expect(await extractInnerText(secondTask.find('h2 span'))).eql('2.')
    .expect(await extractInnerText(secondTask.find('h2 div'))).eql('Organisation information')
    .expect(secondTaskSecondItem.exists).ok()
    .expect(await extractInnerText(secondTaskSecondItem)).eql('Provide Supplier information')
    .expect(secondTaskSecondItem.find('a').exists).ok()
    .click(secondTaskSecondItem.find('a'))
    .expect(getLocation()).eql(`http://localhost:1234${baseUrl}/organisation/order-id/supplier`);
});

// Third Task First Item Tests
test('should render the third task as "Commencement date" and "data" as text not link', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const taskList = Selector('[data-test-id="task-list"]');
  const thirdTask = Selector('li[data-test-id="task-2"]');
  const thirdTaskFirstItem = Selector('li[data-test-id="task-2-item-0"]');

  await t
    .expect(taskList.exists).ok()
    .expect(thirdTask.exists).ok()
    .expect(await extractInnerText(thirdTask.find('h2 span'))).eql('3.')
    .expect(await extractInnerText(thirdTask.find('h2 div'))).eql('Commencement date')
    .expect(thirdTaskFirstItem.exists).ok()
    .expect(await extractInnerText(thirdTaskFirstItem)).eql('Provide commencement date for this agreement')
    .expect(thirdTaskFirstItem.find('a').exists).notOk();
});

// Forth Task First Item Tests
test('should render the fourth task as "Service recipients" and "data" as text not link', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const taskList = Selector('[data-test-id="task-list"]');
  const fourthTask = Selector('li[data-test-id="task-3"]');
  const fourthTaskFirstItem = Selector('li[data-test-id="task-3-item-0"]');

  await t
    .expect(taskList.exists).ok()
    .expect(fourthTask.exists).ok()
    .expect(await extractInnerText(fourthTask.find('h2 span'))).eql('4.')
    .expect(await extractInnerText(fourthTask.find('h2 div'))).eql('Select Service Recipients')
    .expect(fourthTaskFirstItem.exists).ok()
    .expect(await extractInnerText(fourthTaskFirstItem)).eql('Select the organisations you are ordering for')
    .expect(fourthTaskFirstItem.find('a').exists).notOk();
});

// Buttons tests
test('should render the "Delete order" button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const deleteOrderButton = Selector('[data-test-id="delete-order-button"]');

  await t
    .expect(deleteOrderButton.exists).ok()
    .expect(await extractInnerText(deleteOrderButton)).eql(commonContent.deleteOrderButton.text)
    .expect(deleteOrderButton.getAttribute('aria-label')).eql(commonContent.deleteOrderButton.text)
    .expect(deleteOrderButton.find('a').hasClass('nhsuk-button--secondary')).eql(true)
    .expect(deleteOrderButton.find('a').hasClass('nhsuk-button--disabled')).eql(false);
});

test('should render the "Preview order summary" button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const previewOrderButton = Selector('[data-test-id="preview-order-button"]');

  await t
    .expect(previewOrderButton.exists).ok()
    .expect(await extractInnerText(previewOrderButton)).eql(commonContent.previewOrderButton.text)
    .expect(previewOrderButton.getAttribute('aria-label')).eql(commonContent.previewOrderButton.text)
    .expect(previewOrderButton.find('a').hasClass('nhsuk-button--secondary')).eql(true)
    .expect(previewOrderButton.find('a').hasClass('nhsuk-button--disabled')).eql(false);
});

test('should render the "Submit order" button', async (t) => {
  await pageSetup(t, true);
  await t.navigateTo(pageUrl);

  const submitOrderButton = Selector('[data-test-id="submit-order-button"]');

  await t
    .expect(submitOrderButton.exists).ok()
    .expect(await extractInnerText(submitOrderButton)).eql(commonContent.submitOrderButton.text)
    .expect(submitOrderButton.getAttribute('aria-label')).eql(commonContent.submitOrderButton.disabledAltText)
    .expect(submitOrderButton.find('a').hasClass('nhsuk-button--secondary')).eql(false)
    .expect(submitOrderButton.find('a').hasClass('nhsuk-button--disabled')).eql(true);
});
