
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-3FDK3XZJ.js"
    ],
    "route": "/auth"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-PSBYCJON.js"
    ],
    "route": "/home"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-52AAKHJC.js"
    ],
    "route": "/catalog"
  },
  {
    "renderMode": 2,
    "preload": [
      "chunk-55IIYGCZ.js"
    ],
    "route": "/loans"
  },
  {
    "renderMode": 2,
    "redirectTo": "/home",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 2003, hash: 'b3d71181cfb1d082687d17f037c0dfdff7789b6bdf65d2e506b9e4968221ebcd', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 996, hash: '5d22897dac2445b71ea0da57c9047e4cb281e0a5ad1f7eb05a4bc4f276c44d9f', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 237, hash: 'dcbbd3d1ba769acac38b5122765d43caf9a118a8df7b190acb864c3a5928b47b', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'auth/index.html': {size: 2363, hash: '6bf966249937ad986d20a0feb0e1c7c42fc633b14a0cc5ef3f009b03a59c9c31', text: () => import('./assets-chunks/auth_index_html.mjs').then(m => m.default)},
    'loans/index.html': {size: 17225, hash: '8e89f9260cbdf3906dc2ed3a908ca70521d5cde6c5600d0aa6d7b55b3bcc1cb1', text: () => import('./assets-chunks/loans_index_html.mjs').then(m => m.default)},
    'catalog/index.html': {size: 17223, hash: '6bebd65206ecd5d410a49ec57a84a66e16f909cd5dcfa855cc20c0f3f7927372', text: () => import('./assets-chunks/catalog_index_html.mjs').then(m => m.default)},
    'home/index.html': {size: 17752, hash: 'c6235fa8caf82b78d27de4aa8e9a64955ecd31b46d95d466d59b2c7f8b2fa6e2', text: () => import('./assets-chunks/home_index_html.mjs').then(m => m.default)},
    'styles-ENP7LCRP.css': {size: 32188, hash: 'M2C0NddFxeY', text: () => import('./assets-chunks/styles-ENP7LCRP_css.mjs').then(m => m.default)}
  },
};
