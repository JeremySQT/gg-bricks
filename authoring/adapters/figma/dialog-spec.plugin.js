// Dialog specification page (use_figma body), 2026-11-03. Runs _Script/spec-lib (411:2, spec-lib.plugin.js) and builds
// “Dialog — Specification” on overlays/dialog (407:120), with instances of _Dialog/Backdrop (433:526). The six
// context cards wrap two by two (532 px cards, dialogs at 492 px). Rerunning replaces the frame.
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = { PAGES: { dialog: ['407:120', 'Dialog', '433:525'], button: ['144:2', 'Button', '48:1586'] } };
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, card, caption, contexts, setProps } = H;
const backdrop = await figma.getNodeByIdAsync('433:526');
// A dialog with its own body text and footer actions [intent, appearance, label] in order.
const dg = (v = {}, p = {}, opts = {}) => {
  const i = mk('dialog', v, p);
  if (opts.body)
    i.findOne((n) => n.type === 'SLOT' && n.name === 'Body').children.find((n) => n.type === 'TEXT').characters =
      opts.body;
  if (opts.actions) {
    const items = i.findOne((n) => n.type === 'SLOT' && n.name === 'Footer').findOne((n) => n.type === 'SLOT').children;
    opts.actions.forEach(
      ([intent, ap, label], k) => items[k] && setProps(items[k], { Intent: intent, Appearance: ap, Label: label })
    );
  }
  return i;
};
const spec = {
  path: 'OVERLAYS / DIALOG',
  repo: 'foundations/components/overlays/dialog',
  intro:
    'A dialog is a modal window for a short task or a decision that must be completed or abandoned before going back to the page: confirm a deletion, edit a record, choose an option. While it is open the rest of the page is inert. Free content next to a trigger that does not block the page is a Popover; a durable message in the page is an Alert.',
  hero: () => {
    const b = backdrop.createInstance();
    b.resize(900, 420);
    return [b];
  },
  anatomy: {
    intro:
      'How a dialog is built. The instance is enlarged one and a half times; the real dialogs are shown underneath.',
    zoom: 1.5,
    dashed: ['Header', 'Heading', 'Body', 'Footer', 'Close box'],
    instance: () => dg({ Size: 'sm' }),
    pins: [
      [1, 'Title', 'top', -60],
      [2, 'Description', 'left', 0],
      [3, 'Close', 'top', 0],
      [4, 'Body', 'left', 0],
      [5, 'Footer', 'bottom', 60]
    ],
    dims: [
      { k: 'y', a: ['', 't'], b: ['Header', 't'], c: 'A', side: 'right' },
      { k: 'y', a: ['Header', 'b'], b: ['Body', 't'], c: 'B', side: 'right' },
      { k: 'x', a: ['', 'l'], b: ['', 'r'], c: 'C' }
    ],
    legend: [
      ['1', 'Title: required, heading/sm in color/content/primary; it names the dialog.'],
      [
        '2',
        'Description (Show description): body/sm in color/content/secondary, under the title (gap space/content/xs); it describes the dialog.'
      ],
      [
        '3',
        'Close (Dismissible): ghost neutral IconButton sm with the close glyph, label Close, on the title line. Escape and a press on the backdrop also ask to close. A dialog that requires an explicit choice has none.'
      ],
      [
        '4',
        'Body (slot): the content in body/md; it scrolls when the dialog is taller than the viewport allows, the header and footer staying in place (Scrolled=yes shows the dividers).'
      ],
      ['5', 'Footer (slot, Show footer): one ButtonGroup aligned at the end; the primary action is the last item.'],
      [
        'A',
        'Padding: space/layout/md. Panel: color/surface/overlay, edge color/elevation/border, shadow/modal, radius/overlay.'
      ],
      ['B', 'Section gap: space/content/lg between header, body and footer.'],
      [
        'C',
        'Width: component/dialog/inline-size/{size} (400, 560, 720 px), or the viewport less space/layout/md on each side.'
      ]
    ],
    real: () => [
      [dg({ Size: 'sm' }), 'sm'],
      [dg({ Size: 'sm', Scrolled: 'yes' }), 'sm, scrolled']
    ],
    figma:
      'Place a Dialog on the internal part _Dialog/Backdrop to show the scrim (color/surface/scrim) over the viewport, the dialog centered. Alert dialogs (a decision), focus moving in and back, Escape, the inert page, stacking and the motion are behaviors of the code. The body of the code keeps a room of focus/width + focus/offset inside its scrolling area so that a focus ring at its edge is never clipped; it is invisible at rest and not drawn.'
  },
  sections: [
    [
      'Variants',
      'Size sm, md (default) or lg sets the width. Scrolled is the state of a body taller than the room: the dividers separate the header and the footer from the body. Show description, Dismissible and Show footer show the optional parts. The brand, the appearance and the density come from the modes of the frame.',
      (c) => {
        const m = card('Sizes', 'VERTICAL', 24);
        for (const s of ['sm', 'md', 'lg'])
          m.appendChild(caption(dg({ Size: s }), `${s}: ${{ sm: 400, md: 560, lg: 720 }[s]} px`));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const ctx = contexts(c, () => [dg({ Size: 'sm' }, { 'Show description': false })]);
        ctx.layoutWrap = 'WRAP';
        ctx.counterAxisSpacing = 24;
        for (const cd of ctx.children) {
          cd.layoutSizingHorizontal = 'FIXED';
          cd.resize(532, cd.height);
          for (const i of cd.children.filter((n) => n.type === 'INSTANCE')) i.resize(492, i.height);
        }
      }
    ],
    [
      'States',
      'A dialog is open or closed; Scrolled shows the dividers while its body scrolls. A dismissible dialog closes on the close button, on Escape and on a press on the backdrop; a dialog that requires a choice closes only through its footer. A dialog opened from another stacks above it.',
      (c) => {
        const m = card('Choices', 'HORIZONTAL', 24);
        m.counterAxisAlignItems = 'MIN';
        m.appendChild(
          caption(
            dg(
              { Size: 'sm' },
              { Title: 'Leave without saving?', Description: 'Your changes will be lost.', Dismissible: false },
              {
                body: 'You edited 3 fields of the billing address.',
                actions: [
                  ['neutral', 'outline', 'Keep editing'],
                  ['danger', 'solid', 'Leave']
                ]
              }
            ),
            'a required choice: no close button'
          )
        );
        m.appendChild(
          caption(
            dg(
              { Size: 'sm', Scrolled: 'yes' },
              { Title: 'Terms of service', 'Show description': false },
              {
                body: 'These terms govern the use of the service. By creating an account you agree to them. They may change; we will tell you before they do.',
                actions: [
                  ['neutral', 'outline', 'Decline'],
                  ['accent', 'solid', 'Accept']
                ]
              }
            ),
            'scrolled: the dividers show'
          )
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Behavior & sizing',
      'The panel is centered in the viewport at its size, or the viewport less space/layout/md on each side when smaller; its height follows the content up to the viewport, then the body scrolls. Focus moves into the dialog on opening and stays inside; it returns to its trigger on closing.',
      (c) => {
        const m = card('On the backdrop', 'HORIZONTAL', 24);
        const b = backdrop.createInstance();
        b.resize(960, 480);
        m.appendChild(caption(b, '_Dialog/Backdrop: the scrim and the centered dialog'));
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Usage examples',
      'Use a dialog for a short task or a decision that cannot wait: confirm a deletion, edit a record. Name the actions by what they do (Delete, not OK); put the primary action last. Do not open a dialog for a message that can stay in the page (an Alert) or for a passing confirmation (a Toast), and do not send toasts from an open dialog. The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        ex.appendChild(caption(dg({ Size: 'sm' }), 'confirm a deletion: danger last'));
        ex.appendChild(
          caption(
            dg(
              { Size: 'sm' },
              { Title: 'Edit the billing address', 'Show description': false },
              {
                body: 'The address printed on every invoice.',
                actions: [
                  ['neutral', 'ghost', 'Cancel'],
                  ['accent', 'solid', 'Save']
                ]
              }
            ),
            'edit a record'
          )
        );
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
return await H.build('dialog', spec);
