const config = {
  builder: {
    basic: false,
    advanced: false,
    data: false,
    premium: false,
    layout: false,
    customBasic: {
      title: 'Basic',
      default: true,
      weight: 0,
      components: {
        textfield: true,
        textarea: true,
        number: true,
        checkbox: true,
        selectboxes: true,
        // select: true,
        radio: true,
        email: true,
        url: true,
        tags: false,
        address: false,
        datetime: true,
        day: true,
        time: true,
        currency: true,
        phoneNumber: true,
        survey: true,
        columns: true,
        tabs: true,
        dropdown: {
          title: 'Dropdown',
          //   key: 'heLookup',
          icon: 'list',
          schema: {
            //     label: 'Heroes Lookup',
            widget: 'html5',
            //     tableView: true,
            //     dataSrc: 'url',
            //     data: { url: 'https://jsonplaceholder.typicode.com/posts', headers: [{ key: '', value: '' }] },
            //     valueProperty: 'title',
            //     dataType: 'object',
            //     template: '<span>{{ item.title }}</span>',
            //     selectThreshold: 0.3,
            //     key: 'heroesLookUpKey',
            type: 'select',
            input: true,
            //     disableLimit: false,
          },
        },
      },
    },
    // customAdvance: {
    //   title: 'Layout',
    //   default: false,
    //   weight: 0,
    //   components: {
    // columns: true,
    //   },
    // },
  },
  editForm: {
    textfield: [
      {
        key: 'display',
        ignore: false,
        components: [
          {
            key: 'placeholder',
            ignore: true,
          },
          {
            key: 'tooltip',
            ignore: true,
          },
          {
            key: 'widget',
            ignore: true,
          },
        ],
      },
    ],
  },
};

const allField = [
  {
    key: 'display',
    ignore: false,
    components: [
      { key: 'prefix', ignore: true },
      { key: 'suffix', ignore: true },
      { key: 'labelPosition', ignore: true },
      { key: 'inputMask', ignore: true },
      { key: 'allowMultipleMasks', ignore: true },
      { key: 'customClass', ignore: true },
      { key: 'tabindex', ignore: true },
      { key: 'autocomplete', ignore: true },
      { key: 'labelWidth', ignore: true },
      { key: 'labelMargin', ignore: true },
      { key: 'inputType', ignore: true },
      { key: 'hideInputLabels', ignore: true },
      { key: 'useLocaleSettings', ignore: true },
      { key: 'inputType', ignore: true },
      { key: 'shortcut', ignore: true },
      { key: 'hidden', ignore: true },
      { key: 'hideLabel', ignore: true },
      { key: 'showWordCount', ignore: true },
      { key: 'showCharCount', ignore: true },
      { key: 'mask', ignore: true },
      { key: 'autofocus', ignore: true },
      { key: 'spellcheck', ignore: true },
      { key: 'disabled', ignore: true },
      { key: 'tableView', ignore: true },
      { key: 'modalEdit', ignore: true },
      { key: 'widget.type', ignore: true },
      { key: 'widget', ignore: true },
      { key: 'uniqueOptions', ignore: true },
      { key: 'editor', ignore: true },
      { key: 'optionsLabelPosition', ignore: true },
    ],
  },
  {
    key: 'api',
    ignore: true,
  },
  {
    key: 'date',
    ignore: false,
    components: [{ key: 'panel-disable-function', ignore: true }],
  },
  {
    key: 'layout',
    ignore: true,
  },
  {
    key: 'validation',
    ignore: false,
    components: [
      { key: 'validateOn', ignore: true },
      { key: 'kickbox', ignore: true },
      { key: 'unique', ignore: true },
      { key: 'validate.pattern', ignore: true },
      { key: 'validate.minWord', ignore: true },
      { key: 'validate.minWords', ignore: true },
      { key: 'validate.maxWord', ignore: true },
      { key: 'validate.maxWords', ignore: true },
      { key: 'validate.customMessage', ignore: true },
      { key: 'errorLabel', ignore: true },
      { key: 'custom-validation-js', ignore: true },
      { key: 'json-validation-json', ignore: true },
    ],
  },
  {
    key: 'conditional',
    ignore: true,
  },
  {
    key: 'data',
    ignore: true,
  },
  {
    key: 'logic',
    ignore: true,
  },
];

const dataEnabled = {
  key: 'data',
  ignore: false,
  components: [
    { key: 'dataType', ignore: true },
    { key: 'persistent', ignore: true },
    { key: 'multiple', ignore: true },
    { key: 'protected', ignore: true },
    { key: 'dataSrc', ignore: true },
    { key: 'dbIndex', ignore: true },
    { key: 'encrypted', ignore: true },
    { key: 'redrawOn', ignore: true },
    { key: 'clearOnHide', ignore: true },
    { key: 'customDefaultValuePanel', ignore: true },
    { key: 'calculateValuePanel', ignore: true },
    { key: 'calculateServer', ignore: true },
    { key: 'allowCalculateOverride', ignore: true },
    { key: 'idPath', ignore: true },
    { key: 'refreshOn', ignore: true },
    { key: 'refreshOnBlur', ignore: true },
    { key: 'clearOnRefresh', ignore: true },
    { key: 'template', ignore: true },
    { key: 'searchEnabled', ignore: true },
    { key: 'selectThreshold', ignore: true },
    { key: 'readOnlyValue', ignore: true },
    { key: 'customOptions', ignore: true },
    { key: 'useExactSearch', ignore: true },
  ],
};

const fields = [
  'textfield',
  'textarea',
  'number',
  'checkbox',
  'selectboxes',
  'select',
  'radio',
  'email',
  'url',
  'tags',
  'address',
  'datetime',
  'day',
  'time',
  'currency',
  'phoneNumber',
  'survey',
  'columns',
  'tabs'
];

export function getConfig() {
  // remove all tabs from all fields
  fields.forEach((f) => {
    config.editForm[f] = allField;
  });
  // enable data for radio

  ['select', 'selectboxes', 'radio', 'survey'].forEach((tab) => {
    config.editForm[tab] = removeAndAddData(config.editForm[tab], dataEnabled);
  });
  return config;
}

function removeAndAddData(array, data) {
  return [...array.filter((k) => k.key !== 'data'), data];
}
