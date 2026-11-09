// Progress specification page (use_figma body), 2026-11-03. Runs _Script/spec-lib (411:2, spec-lib.plugin.js) and
// builds “Progress — Specification” on feedback/progress (407:114). Rerunning replaces the frame.
const libNode = await figma.getNodeByIdAsync('411:2');
const CFG = { PAGES: { progress: ['407:114', 'Progress', '413:147'] } };
const H = await eval('(' + libNode.characters + ')')(figma, CFG);
const { mk, stack, text, card, caption, matrix, contexts, surface, densities } = H;
// An instance at a width, with the Value of its exposed Track.
const pr = (v = {}, p = {}, w = 320, val) => {
  const i = mk('progress', v, p);
  if (val !== undefined) i.findOne((n) => n.name === 'Track').setProperties({ Value: val });
  i.resize(w, i.height);
  return i;
};
const spec = {
  path: 'FEEDBACK / PROGRESS',
  repo: 'foundations/components/feedback/progress',
  intro:
    'A progress bar shows how far a task of known size has gone (an upload, a multi-step import) or, when indeterminate, that a longer task is under way without a known end. A short wait in a small place is a Spinner.',
  hero: () => {
    const s = stack('Bars', 'VERTICAL', 20);
    s.appendChild(
      pr({ Size: 'lg' }, { 'Show value': true, Label: 'Uploading quarterly-report.pdf', 'Value text': '60%' }, 420)
    );
    s.appendChild(
      pr(
        { Intent: 'success', Size: 'lg' },
        { 'Show value': true, Label: 'Import complete', 'Value text': '100%' },
        420,
        '100'
      )
    );
    s.appendChild(pr({ Size: 'lg' }, { Label: 'Preparing the export' }, 420, 'indeterminate'));
    return [s];
  },
  anatomy: {
    intro: 'How a progress bar is built. The instance is enlarged twice; the real bars are shown underneath.',
    zoom: 2,
    dashed: ['First line'],
    instance: () => pr({ Size: 'lg' }, { 'Show value': true, Label: 'Uploading report.pdf' }, 380),
    pins: [
      [1, 'Label', 'top', 0],
      [2, 'Value', 'top', 0],
      [3, 'Track', 'bottom', 120],
      [4, 'Indicator', 'bottom', -40]
    ],
    dims: [
      { k: 'y', a: ['Track', 't'], b: ['Track', 'b'], c: 'A', side: 'left' },
      { k: 'y', a: ['First line', 'b'], b: ['Track', 't'], c: 'B', side: 'right' }
    ],
    legend: [
      [
        '1',
        'Label: required, the accessible name even when hidden (Show label). label/md in the primary content color, one line, truncated with an ellipsis.'
      ],
      [
        '2',
        'Value (Show value): the whole percentage in numeral/sm, secondary content color, tabular figures. Not shown when indeterminate.'
      ],
      [
        '3',
        'Track (internal part _Progress/Track): the full width, color/surface/muted, corners component/progress/radius (fully rounded in base; a brand may square them).'
      ],
      [
        '4',
        'Indicator: from the start edge over the fraction value ÷ max, in color/status/{intent}/icon, same corners; a fraction of 0 shows none.'
      ],
      ['A', 'Thickness: component/progress/thickness/{size}, 4, 6 or 8 px. The density does not change it.'],
      [
        'B',
        'Label gap: space/content/xs (2, 4, 6 px by density). Show label off removes the first line, label and value, with this gap.'
      ]
    ],
    real: () => [
      [pr({ Size: 'sm' }, {}, 200), 'sm'],
      [pr({}, {}, 200), 'md'],
      [pr({ Size: 'lg' }, {}, 200), 'lg']
    ],
    figma:
      'The fraction is the Value property of the exposed Track (0 to 100 % in steps of 10; the code takes any value). Indeterminate is a state, not a variant: Value=indeterminate on the Track shows a still of the sweep (one third of the track), so a bar can start indeterminate and take a value later; the sweep (motion/duration/loop) and the value transition are animations of the code. Tabular figures of the value are switched on by hand (the Plugin API cannot set them).'
  },
  sections: [
    [
      'Variants',
      'Intent names the meaning of the indicator color: accent for an ordinary task, success for a completed one, warning for one that needs attention, danger for a failed one; the label also says it in words. Size changes only the thickness. Indeterminate, a task under way without a known end, is a state chosen by the Value of the Track, not a variant.',
      (c) => {
        const m = matrix(
          'Intent × size',
          ['accent', 'success', 'warning', 'danger'],
          ['sm', 'md', 'lg'],
          (i, s) => pr({ Intent: i, Size: s }, { 'Show label': false }, 220),
          240
        );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
        const t = card('Determinate and indeterminate', 'HORIZONTAL', 40);
        t.counterAxisAlignItems = 'MIN';
        t.appendChild(caption(pr({}, { 'Show value': true }, 300), 'determinate, 60 %, value shown'));
        t.appendChild(
          caption(
            pr({}, { Label: 'Preparing the export' }, 300, 'indeterminate'),
            'Track Value=indeterminate: a still of the sweep'
          )
        );
        c.appendChild(t);
        t.layoutSizingHorizontal = 'FILL';
        contexts(c, () => [
          pr({}, { Label: 'Uploading' }, 150),
          pr({ Intent: 'danger' }, { Label: 'Upload failed' }, 150, '30')
        ]);
      }
    ],
    [
      'States',
      'A progress bar has no interaction state: it is never focusable and emits no events. What changes is the fraction (0 to full; a value above max shows a full track) and whether it is indeterminate. A change of value moves the end of the indicator over motion/duration/base, not under reduced motion.',
      (c) => {
        const m = card('Fractions', 'HORIZONTAL', 32);
        m.counterAxisAlignItems = 'MIN';
        for (const [val, t] of [
          ['0', '0%'],
          ['20', '20%'],
          ['60', '60%'],
          ['100', '100%']
        ])
          m.appendChild(
            caption(
              pr({}, { 'Show value': true, 'Value text': t, Label: 'Import' }, 220, val),
              t === '0%' ? '0: no indicator' : t
            )
          );
        c.appendChild(m);
        m.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Behavior & sizing',
      'The bar fills the width it is given; the label truncates on one line and the value stays at the end. Show label off removes the whole first line, leaving no empty band above the track, and keeps the label as the accessible name. To show the percentage without a visible label, keep Show label on and empty the Label text. The density changes only the gap between the first line and the track.',
      (c) => {
        densities(c, () => [pr({}, { 'Show value': true }, 260)], {
          compact: 'label gap 2 px',
          standard: 'label gap 4 px',
          comfortable: 'label gap 6 px'
        });
        const w = card('Long label', 'HORIZONTAL', 32);
        w.counterAxisAlignItems = 'MIN';
        w.appendChild(
          caption(
            pr({}, { 'Show value': true, Label: 'Uploading quarterly-financial-statements-final-v3.pdf' }, 260),
            '260 px: the label truncates, the value stays'
          )
        );
        w.appendChild(
          caption(
            pr({}, { 'Show label': false }, 260),
            'label hidden: the first line goes, the label stays the accessible name'
          )
        );
        w.appendChild(
          caption(pr({}, { 'Show value': true, Label: '' }, 260), 'value without a visible label: Label text emptied')
        );
        c.appendChild(w);
        w.layoutSizingHorizontal = 'FILL';
      }
    ],
    [
      'Usage examples',
      'Use a progress bar when the size of the task is known; state its meaning in words next to the color. Use the indeterminate state only for a longer task whose end is unknown; for a short wait in a small place, use a Spinner. The full guidance will be in the documentation page of the component.',
      (c) => {
        const ex = card('Examples', 'HORIZONTAL', 24);
        ex.counterAxisAlignItems = 'MIN';
        const up = surface('Upload', 'VERTICAL', 14, 20);
        up.appendChild(text('Uploads', 'heading/sm'));
        for (const [l, val, i, t] of [
          ['invoice-0412.pdf', '100', 'success', '100%'],
          ['quarterly-report.pdf', '60', 'accent', '60%'],
          ['scan-2026.tiff', '30', 'danger', '30%']
        ])
          up.appendChild(pr({ Intent: i }, { 'Show value': true, Label: l, 'Value text': t }, 280, val));
        up.appendChild(
          text('scan-2026.tiff failed: the file is larger than 50 MB.', 'body/sm', 'color/status/danger/content', 280)
        );
        ex.appendChild(caption(up, 'uploads, the failure stated in words'));
        const idx = surface('Export', 'VERTICAL', 12, 20);
        idx.appendChild(text('Preparing the export', 'heading/sm'));
        idx.appendChild(pr({}, { 'Show label': false, Label: 'Preparing the export' }, 280, 'indeterminate'));
        idx.appendChild(text('This can take a few minutes.', 'body/sm', 'color/content/secondary'));
        ex.appendChild(caption(idx, 'indeterminate, the heading names the task'));
        c.appendChild(ex);
        ex.layoutSizingHorizontal = 'FILL';
      }
    ]
  ]
};
return await H.build('progress', spec);
