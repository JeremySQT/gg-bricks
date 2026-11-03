// Skeleton specification page (use_figma body), 2026-11-03. Runs _Script/spec-lib (411:2, spec-lib.plugin.js) and
// builds “Skeleton — Specification” on feedback/skeleton (407:115). Rerunning replaces the frame; the six context
// cards were then fitted to their width (instances resized to the card's inner width, 121 px).
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = { PAGES: { skeleton: ['407:115', 'Skeleton', '417:74'] } };
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, card, caption, contexts, surface, row, col_ } = H;
const sk = (v = {}, w = 320, h) => {
  const i = mk('skeleton', v);
  i.resize(w, h ?? i.height);
  return i;
};
const avatarRow = (w) => {
  const r = row('Item', 12, [sk({ Shape: 'circle' }, 40, 40)], 'CENTER');
  r.appendChild(col_('Text', 6, [sk({ Size: 'md' }, w), sk({ Size: 'sm' }, w * 0.6)]));
  return r;
};
const spec = {
  path: 'FEEDBACK / SKELETON',
  repo: 'foundations/components/feedback/skeleton',
  intro:
    'A skeleton stands in for content that is loading, with the shape and size of that content, so that the layout does not move when it arrives. Use it for the first load of a region; a short action on existing content is a Spinner, a known amount of progress a Progress.',
  hero: () => {
    const c = surface('Card', 'VERTICAL', 16, 20);
    c.appendChild(sk({ Shape: 'block' }, 360, 140));
    c.appendChild(sk({ Size: 'lg' }, 360));
    c.appendChild(sk({ Lines: '3' }, 360));
    c.appendChild(avatarRow(200));
    return [c];
  },
  anatomy: {
    intro: 'How a text skeleton is built. The instance is enlarged twice; the three shapes are shown underneath.',
    zoom: 2,
    dashed: ['Line'],
    instance: () => sk({ Lines: '3', Size: 'lg' }, 360),
    pins: [
      [1, 'Line', 'left', 0],
      [2, 'Bar', 'top', 0]
    ],
    dims: [
      { k: 'y', a: ['Line', 't'], b: ['Line', 'b'], c: 'A', side: 'right' },
      { k: 'y', a: ['Bar', 't'], b: ['Bar', 'b'], c: 'B', side: 'left' }
    ],
    legend: [
      [
        '1',
        'Line: one per line of the text to come, as tall as the line box of typography/body/{size}; the lines fill the width.'
      ],
      [
        '2',
        'Bar: the font size of the text, centered in its line, corners radius/indicator, color/surface/muted. With more than one line, the last bar covers 60 % of the width.'
      ],
      ['A', 'Line height: typography/body/{size}/lineHeight (21, 24, 28.8 px).'],
      ['B', 'Bar height: typography/body/{size}/fontSize (14, 16, 18 px).']
    ],
    real: () => [
      [sk({ Lines: '2' }, 220), 'text, 2 lines'],
      [sk({ Shape: 'block' }, 160, 96), 'block'],
      [sk({ Shape: 'circle' }, 48, 48), 'circle']
    ],
    figma:
      'Size and Lines apply to the text shape only; block takes the width and height the layout gives it (radius/container), circle a diameter (radius/full). The pulse (opacity from 1 to opacity/muted and back, once per motion/duration/loop, all skeletons in phase, none under reduced motion) is an animation of the code. The skeleton is hidden from assistive technology: the region that loads is the busy element.'
  },
  sections: [
    [
      'Variants',
      'Shape text, block or circle; for text, Size matches the body text to come (sm, md, lg) and Lines the number of lines. The brand, the appearance and the density come from the modes of the frame; the density does not change a skeleton.',
      (c) => {
        const m = card('Text', 'HORIZONTAL', 32);
        m.counterAxisAlignItems = 'MIN';
        for (const s of ['sm', 'md', 'lg'])
          m.appendChild(caption(sk({ Size: s, Lines: '3' }, 260), `text ${s}, 3 lines`));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const o = card('Block and circle', 'HORIZONTAL', 32);
        o.counterAxisAlignItems = 'MIN';
        o.appendChild(caption(sk({ Shape: 'block' }, 260, 120), 'block: the size the layout gives it'));
        o.appendChild(caption(sk({ Shape: 'circle' }, 48, 48), 'circle: a 48 px avatar'));
        c.appendChild(o);
        o.layoutSizingHorizontal = 'FILL';
        contexts(c, () => [sk({ Lines: '2' }, 121), sk({ Shape: 'block' }, 121, 48)]);
      }
    ],
    [
      'States',
      'A skeleton has no state: it is never focusable and emits no events. It pulses while the region loads and is replaced by the content when it arrives; under reduced motion it stays still. The skeleton itself is hidden from assistive technology.',
      (c) => {
        const m = card('Pulse', 'HORIZONTAL', 32);
        m.counterAxisAlignItems = 'MIN';
        m.appendChild(caption(sk({ Lines: '2' }, 220), 'opacity 1 (start of the pulse)'));
        const b = sk({ Lines: '2' }, 220);
        b.opacity = 0.7;
        m.appendChild(caption(b, 'opacity/muted, 70 % (middle of the pulse)'));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Behavior & sizing',
      'Give each skeleton the size of the content it stands for: the text skeleton fills the width of the column and takes the height of its lines; block and circle take the size of the image, card or avatar. When the content arrives, nothing moves.',
      (c) => {
        const m = card('Widths', 'VERTICAL', 16);
        for (const w of [480, 320, 200])
          m.appendChild(caption(sk({ Lines: '3' }, w), `${w} px: the last line covers 60 %`));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Usage examples',
      'Compose skeletons in the layout of the content that will replace them: a list of avatars and names, a card with an image and a title. Do not use a skeleton for an action on content already shown (a Spinner in the button) or for a wait of known length (a Progress). The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        const list = surface('List', 'VERTICAL', 16, 20);
        for (let k = 0; k < 3; k++) list.appendChild(avatarRow(200));
        ex.appendChild(caption(list, 'a list of people loading'));
        const cardS = surface('Card', 'VERTICAL', 12, 16);
        cardS.appendChild(sk({ Shape: 'block' }, 240, 120));
        cardS.appendChild(sk({ Size: 'lg' }, 240));
        cardS.appendChild(sk({ Size: 'sm', Lines: '2' }, 240));
        ex.appendChild(caption(cardS, 'a card: image, title, two lines'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
return await H.build('skeleton', spec);
