// Alert specification page (use_figma body), 2026-11-03. Runs _Script/spec-lib (411:2, spec-lib.plugin.js) and builds
// “Alert — Specification” on feedback/alert (407:113). After the run the five alerts of the Anatomy real parts were
// set to 182 px with a 24 px gap, so that nothing overflows the frame. 2026-11-04: Show actions became the Actions
// variant Show actions (yes pads the bottom with space/content/lg; a variant property cannot share the name of the
// Actions slot). Rerunning replaces the frame.
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = { PAGES: { alert: ['407:113', 'Alert', '422:715'], button: ['144:2', 'Button', '48:1586'] } };
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, stack, text, card, caption, contexts, surface, setProps } = H;
// An alert at a width; items replace the two buttons of its ButtonGroup ([intent, appearance, label], null hides one).
const al = (v = {}, p = {}, w = 480, items) => {
  const i = mk('alert', v, p);
  i.resize(w, i.height);
  if (items) {
    const btns = i.findAll((n) => n.type === 'INSTANCE' && n.name === 'Button');
    items.forEach((it, k) => {
      if (!btns[k]) return;
      if (it === null) {
        btns[k].visible = false;
        return;
      }
      const [intent, ap, label] = it;
      btns[k].swapComponent(
        H.SETS.button.children.find((ch) => ch.name === `Intent=${intent}, Appearance=${ap}, Size=sm, State=default`)
      );
      setProps(btns[k], { Label: label });
      btns[k].setBoundVariable('minHeight', null);
      btns[k].minHeight = null;
    });
  }
  return i;
};
const spec = {
  path: 'FEEDBACK / ALERT',
  repo: 'foundations/components/feedback/alert',
  intro:
    'An alert is a durable message in the flow of the page about the page, a section or a task: a failed save, an expiring plan, a successful import. It stays until the situation changes or the user dismisses it. A brief confirmation that leaves by itself is a Toast; a message that must be answered first is a Dialog; an error on one field belongs to Field.',
  hero: () => {
    const s = stack('Alerts', 'VERTICAL', 16);
    s.appendChild(al({ Intent: 'danger', 'Show actions': 'yes' }, { Dismissible: true }, 560));
    s.appendChild(
      al(
        { Intent: 'success', Title: 'no' },
        { Content: 'Import complete: 1,204 contacts were added.', Dismissible: true },
        560
      )
    );
    return [s];
  },
  anatomy: {
    intro:
      'How an alert is built. The instance is enlarged one and a half times; the real alerts are shown underneath.',
    zoom: 1.5,
    dashed: ['Body', 'Text', 'Actions', 'Icon box', 'Dismiss box'],
    instance: () =>
      al(
        { Intent: 'info', 'Show actions': 'yes' },
        {
          Dismissible: true,
          'Title text': 'Scheduled maintenance',
          Content: 'Exports are unavailable on Saturday night between two and four.'
        },
        520
      ),
    pins: [
      [1, 'Icon', 'left', 0],
      [2, 'Title', 'top', -80],
      [3, 'Content', 'right', 0],
      [4, 'Actions', 'bottom', -60],
      [5, 'Dismiss', 'top', 0]
    ],
    dims: [
      { k: 'y', a: ['', 't'], b: ['Text', 't'], c: 'A', side: 'left' },
      { k: 'x', a: ['Icon', 'r'], b: ['Text', 'l'], c: 'B' },
      { k: 'y', a: ['Text', 'b'], b: ['Actions', 't'], c: 'C', side: 'right' },
      { k: 'y', a: ['Actions', 'b'], b: ['', 'b'], c: 'D', side: 'right' }
    ],
    legend: [
      [
        '1',
        'Icon: the intrinsic glyph of the intent (info, check-circle, warning, warning-circle) at size/icon/md in color/status/{intent}/icon, centered on the first line; hidden from assistive technology. Swap the Icon layer to replace it.'
      ],
      ['2', 'Title (Title=yes): label/md in color/status/{intent}/content.'],
      [
        '3',
        'Content: body/sm in the same color; free text that wraps. Links inside follow the content color (Link tone inherit in the code).'
      ],
      [
        '4',
        'Actions (Show actions=yes, the slot Actions): one ButtonGroup of sm buttons under the content. Accent and neutral buttons take the action family of the intent; danger keeps its own.'
      ],
      [
        '5',
        'Dismiss (Dismissible): a small ghost IconButton with the close glyph, its label is the accessible name; it follows the intent too.'
      ],
      [
        'A',
        'Padding: space/content/md; edge border/width/default in color/status/{intent}/border inside the radius/container corners; surface color/status/{intent}/surface.'
      ],
      ['B', 'Icon gap: space/content/sm, also before the dismiss button. Title gap: space/content/xs.'],
      ['C', 'Actions gap: space/content/md.'],
      [
        'D',
        'Block-end padding with actions: space/content/lg (actionsPaddingEnd: 12, 16, 24 px by density) instead of space/content/md, so that the buttons do not sit tight against the edge.'
      ]
    ],
    real: () =>
      ['neutral', 'info', 'success', 'warning', 'danger'].map((i) => [
        al({ Intent: i, Title: 'no' }, { Content: `${i[0].toUpperCase()}${i.slice(1)} alert.` }, 182),
        i
      ]),
    figma:
      'Each variant sets the mode of the hidden collection Components · action family to its intent, so that the accent and neutral Buttons and IconButtons it holds (the dismiss button and the slot content) resolve to the action family of the intent, as the code points the accent and neutral action tokens in its subtree. Title is a variant (yes, no) because the first line that aligns the icon and the dismiss button is the title line or the content line; Show actions is a variant (yes, no) because with actions the block-end padding is space/content/lg. Live announcements are behaviors of the code.'
  },
  sections: [
    [
      'Variants',
      'Intent names the color family and the default icon: neutral for a remark without valence, info, success, warning and danger; the words always state the meaning. Title is optional; the content is required when there is no title. The brand, the appearance and the density come from the modes of the frame.',
      (c) => {
        const m = card('Intents', 'VERTICAL', 16);
        for (const i of ['neutral', 'info', 'success', 'warning', 'danger'])
          m.appendChild(
            al(
              { Intent: i },
              {
                'Title text': `${i[0].toUpperCase()}${i.slice(1)}`,
                Content: 'A sentence that explains the situation and what to do next.'
              },
              640
            )
          );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        contexts(c, () => [al({ Intent: 'warning', Title: 'no' }, { Content: 'Your plan expires in 3 days.' }, 121)]);
      }
    ],
    [
      'States',
      'An alert has no interaction state: it is never focusable. Its buttons keep their own states. Dismissible adds the close button; activating it emits dismiss and the application removes the alert (it never removes itself). An alert present at load is plain content; with live, the code announces it when it appears: assertively for danger and warning, politely otherwise.',
      (c) => {
        const m = card('Actions in every intent', 'VERTICAL', 16);
        for (const i of ['neutral', 'info', 'success', 'warning', 'danger'])
          m.appendChild(
            al(
              { Intent: i, Title: 'no', 'Show actions': 'yes' },
              {
                Content: 'Accent solid, neutral outline: both take the family of the alert.',
                Dismissible: true
              },
              640,
              [
                ['accent', 'solid', 'Primary'],
                ['neutral', 'outline', 'Secondary']
              ]
            )
          );
        m.appendChild(
          caption(
            al(
              { Intent: 'warning', Title: 'no', 'Show actions': 'yes' },
              { Content: 'A danger button keeps its own family.' },
              640,
              [
                ['danger', 'solid', 'Delete'],
                ['neutral', 'ghost', 'Cancel']
              ]
            ),
            'danger keeps its own'
          )
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Behavior & sizing',
      'The alert takes the full width it is given and its text wraps; the icon and the dismiss button stay on the first line. With no title, the first line is the first line of the content.',
      (c) => {
        const m = card('Widths', 'HORIZONTAL', 32);
        m.counterAxisAlignItems = 'MIN';
        m.appendChild(
          caption(
            al(
              { Intent: 'info' },
              {
                'Title text': 'Scheduled maintenance on Saturday night between two and four',
                Content:
                  'Exports, imports and the public API are unavailable during the window; everything else keeps working.',
                Dismissible: true
              },
              300
            ),
            '300 px: title and content wrap'
          )
        );
        m.appendChild(
          caption(
            al({ Intent: 'success', Title: 'no' }, { Content: 'Saved.', Dismissible: true }, 300),
            'no title: the first line is the content'
          )
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Usage examples',
      'Place an alert next to what it is about, at the top of the page or of the section; say what happened and what to do. Keep at most one ButtonGroup of small buttons. Do not use an alert for a passing confirmation (a Toast) or for a question that must be answered first (a Dialog). The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        const form = surface('Form', 'VERTICAL', 16, 20);
        form.appendChild(text('Billing address', 'heading/sm'));
        form.appendChild(
          al({ Intent: 'danger', 'Show actions': 'yes' }, { Dismissible: true }, 420, [
            ['accent', 'solid', 'Try again'],
            null
          ])
        );
        ex.appendChild(caption(form, 'a failed save, with a retry'));
        const plan = surface('Plan', 'VERTICAL', 16, 20);
        plan.appendChild(
          al(
            { Intent: 'warning', 'Show actions': 'yes' },
            {
              'Title text': 'Your plan expires in 3 days',
              Content: 'Renew it to keep your projects and members.'
            },
            360,
            [
              ['accent', 'solid', 'Renew'],
              ['neutral', 'ghost', 'Remind me later']
            ]
          )
        );
        ex.appendChild(caption(plan, 'an expiring plan, two actions'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
return await H.build('alert', spec);
