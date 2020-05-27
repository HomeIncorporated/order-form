import express from 'express';
import { ErrorContext } from 'buying-catalogue-library';
import { logger } from '../../../logger';
import config from '../../../config';
import { withCatch, extractAccessToken } from '../../../helpers/routerHelper';
import {
  getSupplierSearchPageContext,
  validateSupplierSearchForm,
  getSupplierSearchPageErrorContext,
  findSuppliers,
} from './search/controller';
import {
  getSupplierSelectPageContext,
  validateSupplierSelectForm,
  getSupplierSelectErrorPageContext,
} from './select/controller';
import {
  getSupplierPageContext,
} from './supplier/controller';

const router = express.Router({ mergeParams: true });

export const supplierRoutes = (authProvider, addContext, sessionManager) => {
  router.get('/', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const selectedSupplier = sessionManager.getFromSession({ req, key: 'selectedSupplier' });

    if (selectedSupplier) {
      const context = await getSupplierPageContext({ orderId, selectedSupplier, accessToken: extractAccessToken({ req, tokenType: 'access' }) });
      return res.render('pages/sections/supplier/supplier/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
    }

    logger.info('redirecting to suppliers search page');
    return res.redirect(`${config.baseUrl}/organisation/${orderId}/supplier/search`);
  }));

  router.get('/search', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const context = await getSupplierSearchPageContext({ orderId });
    logger.info(`navigating to order ${orderId} suppliers search page`);
    res.render('pages/sections/supplier/search/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.post('/search', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;

    const response = validateSupplierSearchForm({ data: req.body });

    if (response.success) {
      const accessToken = extractAccessToken({ req, tokenType: 'access' });

      const suppliersFound = await findSuppliers({
        name: req.body.supplierName, accessToken,
      });

      if (suppliersFound.length > 0) {
        sessionManager.saveToSession({ req, key: 'suppliersFound', value: suppliersFound });
        logger.info('redirecting suppliers select page');
        return res.redirect(`${config.baseUrl}/organisation/${orderId}/supplier/search/select`);
      }

      throw new ErrorContext({
        status: 404,
        title: 'No Supplier found',
        description: "There are no suppliers that match the search terms you've provided. Try searching again.",
        backLinkText: 'Go back to search',
        backLinkHref: `${config.baseUrl}/organisation/${orderId}/supplier/search`,
      });
    }

    const context = await getSupplierSearchPageErrorContext({
      orderId,
      validationErrors: response.errors,
    });

    return res.render('pages/sections/supplier/search/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
  }));

  router.get('/search/select', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;

    const suppliersFound = sessionManager.getFromSession({ req, key: 'suppliersFound' });
    if (suppliersFound) {
      const context = getSupplierSelectPageContext({ orderId, suppliers: suppliersFound });
      logger.info(`navigating to order ${orderId} suppliers select page`);
      return res.render('pages/sections/supplier/select/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
    }
    logger.info('no suppliers found in session redirecting suppliers search page');
    return res.redirect(`${config.baseUrl}/organisation/${orderId}/supplier/search`);
  }));

  router.post('/search/select', authProvider.authorise({ claim: 'ordering' }), withCatch(authProvider, async (req, res) => {
    const { orderId } = req.params;
    const suppliersFound = sessionManager.getFromSession({ req, key: 'suppliersFound' });

    if (suppliersFound) {
      const response = validateSupplierSelectForm({ data: req.body });

      if (response.success) {
        sessionManager.saveToSession({ req, key: 'selectedSupplier', value: req.body.selectSupplier });
        logger.info('redirecting supplier section page');
        return res.redirect(`${config.baseUrl}/organisation/${orderId}/supplier`);
      }

      const context = await getSupplierSelectErrorPageContext({
        orderId,
        suppliers: suppliersFound,
        validationErrors: response.errors,
      });

      return res.render('pages/sections/supplier/select/template.njk', addContext({ context, user: req.user, csrfToken: req.csrfToken() }));
    }
    logger.info('no suppliers found in session redirecting suppliers search page');
    return res.redirect(`${config.baseUrl}/organisation/${orderId}/supplier/search`);
  }));

  return router;
};
