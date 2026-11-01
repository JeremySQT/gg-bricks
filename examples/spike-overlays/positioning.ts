// `?positioning=measured` forces the JavaScript fallback of the floating attachment, so that the review page and the
// browser tests exercise both engines in a browser that supports CSS anchor positioning.
export const positioning: 'auto' | 'measured' =
  typeof location !== 'undefined' && new URLSearchParams(location.search).get('positioning') === 'measured'
    ? 'measured'
    : 'auto';
