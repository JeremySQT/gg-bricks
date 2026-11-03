// Spinner specification page (use_figma body), 2026-11-03. Runs the shared library _Script/spec-lib (411:2, source in
// spec-lib.plugin.js) and builds “Spinner — Specification” on feedback/spinner (407:116). Rerunning replaces the frame.
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = {
  PAGES: {
    spinner: ['407:116', 'Spinner', '408:15'],
    button: ['144:2', 'Button', '48:1586'],
    'icon-button': ['211:2', 'IconButton', '211:1167']
  }
};
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, stack, text, card, caption, contexts, surface, fill, row } = H;
const sp = (s = 'md', p = {}) => mk('spinner', { Size: s }, p);
const btn = (p = {}, v = {}) => mk('button', { State: 'loading', ...v }, p);
const spec = {
  path: 'FEEDBACK / SPINNER',
  repo: 'foundations/components/feedback/spinner',
  intro:
    'A spinner shows that something is loading or working when the time it takes is unknown and its place is small: inside a button, next to a label, in an empty panel. A known amount of progress is a Progress; a placeholder of the content to come is a Skeleton.',
  hero: () => [sp('xl'), sp('lg'), sp('md'), btn({ Label: 'Saving' }, { Size: 'lg' })],
  anatomy: {
    intro: 'How a spinner is built. The instance is enlarged eight times; the real spinners are shown underneath.',
    zoom: 8,
    dashed: [],
    instance: () => sp('lg'),
    pins: [
      [1, 'Track', 'left', 0],
      [2, 'Indicator', 'top', 0]
    ],
    dims: [{ k: 'x', a: ['', 'l'], b: ['', 'r'], c: 'A' }],
    legend: [
      ['1', 'Track: the full ring, drawn in the content color at component/spinner/track-opacity (20 %).'],
      [
        '2',
        'Indicator: a quarter of the same ring at full opacity, with rounded ends. It turns clockwise, one turn per component/spinner/duration (700 ms), linearly; three times slower when reduced motion is requested. The turn exists in the code only.'
      ],
      [
        'A',
        'Size: size/icon/{size}, 16, 20, 24 or 32 px; the stroke is 2.5/24 of the size (1.67 to 3.33 px). The density does not change it.'
      ]
    ],
    real: () => ['sm', 'md', 'lg', 'xl'].map((s) => [sp(s), s]),
    figma:
      'Figma has no inherited color: both strokes bind color/content/primary, and a host overrides them with its own content color (Button and IconButton set their label color in each variant). The Label property fills a hidden text layer: an empty label keeps the spinner decorative; a label makes it a status announced politely once.'
  },
  sections: [
    [
      'Variants',
      'Size is the only option: sm, md, lg and xl follow the icon scale, so that a spinner can stand in for an icon. The color comes from the content around it; the brand, the appearance and the density come from the modes of the frame.',
      (c) => {
        const m = card('Sizes', 'HORIZONTAL', 40);
        m.counterAxisAlignItems = 'MAX';
        for (const s of ['sm', 'md', 'lg', 'xl'])
          m.appendChild(caption(sp(s), `${s} · ${{ sm: 16, md: 20, lg: 24, xl: 32 }[s]} px`));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        contexts(c, () => [row('Spinners', 16, [sp('md'), sp('lg')])]);
      }
    ],
    [
      'States',
      'A spinner has no state: it is never focusable and emits no events. It exists while the work lasts and is removed when the work ends. In a busy Button it is centered over the content, which is hidden but keeps its room: the width does not change and the label stays the accessible name.',
      (c) => {
        const m = card('In buttons', 'HORIZONTAL', 24);
        m.counterAxisAlignItems = 'CENTER';
        for (const [i, a] of [
          ['accent', 'solid'],
          ['accent', 'outline'],
          ['neutral', 'ghost'],
          ['danger', 'solid']
        ])
          m.appendChild(caption(btn({ Label: 'Saving' }, { Intent: i, Appearance: a }), `${i} ${a}, loading`));
        m.appendChild(caption(mk('icon-button', { State: 'loading' }), 'IconButton, loading'));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Behavior & sizing',
      'The spinner is a fixed square of its size; it never stretches. Place it where the content will appear, or next to the label that names the work. It reads on any surface its parent content color is designed for, because both parts take that color.',
      (c) => {
        const m = card('On surfaces', 'HORIZONTAL', 24);
        m.counterAxisAlignItems = 'MIN';
        for (const [s, t, name] of [
          ['color/surface/default', 'color/content/primary', 'default surface'],
          ['color/status/info/surface', 'color/status/info/content', 'info surface, content color'],
          ['color/surface/inverse', 'color/content/inverse', 'inverse surface']
        ]) {
          const f = stack(name, 'HORIZONTAL', 10, 16);
          f.counterAxisAlignItems = 'CENTER';
          f.cornerRadius = 8;
          fill(f, s);
          const i = sp('md');
          for (const v of i.findAll((n) => n.type === 'VECTOR')) v.strokes = [H.paint(t)];
          f.appendChild(i);
          f.appendChild(text('Loading invoices', 'body/sm', t));
          m.appendChild(caption(f, name));
        }
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Usage examples',
      'Use a spinner for a short wait in a small place. Give it a label when nothing else says what is loading; leave it empty when the busy element already says it (a busy Button, whose label stays its name). For a wait whose length is known, use a Progress; for content that is about to appear in a known shape, use a Skeleton. The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        const empty = surface('Empty panel', 'VERTICAL', 12, 32);
        empty.counterAxisAlignItems = 'CENTER';
        empty.resize(280, 160);
        empty.primaryAxisAlignItems = 'CENTER';
        empty.appendChild(sp('lg', { Label: 'Loading invoices' }));
        empty.appendChild(text('Loading invoices…', 'body/sm', 'color/content/secondary'));
        ex.appendChild(caption(empty, 'an empty panel, labelled'));
        const inline = surface('Inline', 'HORIZONTAL', 8, 16);
        inline.counterAxisAlignItems = 'CENTER';
        inline.appendChild(sp('sm'));
        inline.appendChild(text('Checking availability', 'body/sm'));
        ex.appendChild(caption(inline, 'next to the label that names the work'));
        ex.appendChild(caption(btn({ Label: 'Sending' }), 'a busy Button: the label stays its accessible name'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
return await H.build('spinner', spec);
