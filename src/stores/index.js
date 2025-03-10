import { createPinia } from 'pinia';
import { markRaw } from 'vue';
import router from '../router';

const pinia = createPinia();

// Plugin untuk menambahkan router ke store
pinia.use(({ store }) => {
  store.router = markRaw(router);
});

export default pinia;