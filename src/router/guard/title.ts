import type { Router } from 'vue-router';
import { useTitle } from '@vueuse/core';
import { $t } from '@/locales';

export function createDocumentTitleGuard(router: Router) {
  router.afterEach(to => {
    const { i18nKey, title } = to.meta;

    const documentTitle = i18nKey ? $t(i18nKey) : title;

    useTitle(documentTitle ? `${documentTitle} - ${import.meta.env.VITE_APP_TITLE}` : import.meta.env.VITE_APP_TITLE);
  });
}
