import { createApp } from 'vue';
import App from './App.vue';
import router from '@/router';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';

import { useStyleStore } from '@/template/stores/style.js';
import { darkModeKey, styleKey } from '@/template/config.js';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import PanelMenu from 'primevue/panelmenu';
import Menu from 'primevue/menu';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import ContextMenu from 'primevue/contextmenu';
import Toast from 'primevue/toast';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import TreeTable from 'primevue/treetable';
import Calendar from 'primevue/calendar';
import ToastService from 'primevue/toastservice';
import Dropdown from 'primevue/dropdown';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import Breadcrumb from 'primevue/breadcrumb';
import DataView from 'primevue/dataview';
import ColorPicker from 'primevue/colorpicker';
import Divider from 'primevue/divider';
import AutoComplete from 'primevue/autocomplete';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import MultiSelect from 'primevue/multiselect';

import Papa from 'papaparse';

import SectionMain from '@/template/components/SectionMain.vue';
import LayoutAuthenticated from '@/template/layouts/LayoutAuthenticated.vue';
import SectionTitleLineWithButton from '@/template/components/SectionTitleLineWithButton.vue';
import BaseDivider from '@/template/components/BaseDivider.vue';

import './template/css/main.css';
import './template/css/maddition.css';

// import CSS resources
import 'primevue/resources/primevue.min.css'; // core
import 'primeicons/primeicons.css'; // icons
import 'primevue/resources/themes/tailwind-light/theme.css';
//import '/node_modules/primeflex/primeflex.scss'         // PrimeFlex

import '@/assets/global.css';

import { localUrl, setApiUrl, url } from './modules/api';

const app = createApp(App);

app.use(PrimeVue);
app.use(createPinia());
app.use(router);
app.use(ToastService);

// setApiUrl(localUrl);
setApiUrl(localUrl);
// if (import.meta.env.VITE_ENV == 'dev') {
//     setApiUrl(import.meta.env.VITE_APIURL);
// }

app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('PanelMenu', PanelMenu);
app.component('Menu', Menu);
app.component('Checkbox', Checkbox);
app.component('Dialog', Dialog);
app.component('InputText', InputText);
app.component('ContextMenu', ContextMenu);
app.component('Button', Button);
app.component('Toast', Toast);
app.component('Accordion', Accordion);
app.component('AccordionTab', AccordionTab);
app.component('TreeTable', TreeTable);
app.component('Calendar', Calendar);
app.component('SectionMain', SectionMain);
app.component('SectionTitleLineWithButton', SectionTitleLineWithButton);
app.component('LayoutAuthenticated', LayoutAuthenticated);
app.component('BaseDivider', BaseDivider);
app.component('Dropdown', Dropdown);
app.component('Splitter', Splitter);
app.component('SplitterPanel', SplitterPanel);
app.component('Breadcrumb', Breadcrumb);
app.component('DataView', DataView);
app.component('ColorPicker', ColorPicker);
app.component('Divider', Divider);
app.component('AutoComplete', AutoComplete);
app.component('TabView', TabView);
app.component('TabPanel', TabPanel);
app.component('PapaParse', Papa);
app.component('MultiSelect', MultiSelect);

app.mount('#app');
