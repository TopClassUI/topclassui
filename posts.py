import json
RAW = 'https://raw.githubusercontent.com/TopClassUI/topclassui/media-tmp'
SITE = 'https://topclassui.com'
TZ = 'Asia/Amman'

C = {
 'date-picker': dict(name='Date Picker', slug='date-picker',
   yt='Date Picker in TopClass UI: ISO value, Arabic calendar, full keyboard support #react #webdev',
   short='Date Picker, TopClass UI: ISO value, Arabic calendar, keyboard first #Shorts #react #ui',
   body='Pick a day and the form gets an ISO date. Five sizes, disabled and invalid states, and min and max limits. In Arabic you get Arabic month names, the week starts on Saturday and the calendar lines up with the right edge. Dark, light or ocean theme from the same code, full keyboard support, server rendered.',
   ig='Pick a day, the form gets an ISO date. Five sizes, min and max limits, Arabic month names with the week starting on Saturday, dark/light/ocean from the same code, full keyboard support.',
   tags=['date picker','calendar','ISO date']),
 'select': dict(name='Select', slug='select',
   yt='Select in TopClass UI: form-ready value, load more on scroll, RTL aware #react #webdev',
   short='Select, TopClass UI: form-ready value, load more, RTL aware #Shorts #react #ui',
   body='Pick an option and the form gets the value, before any script runs and after. Five sizes, plus placeholder, disabled, invalid and read-only states. In Arabic the caret and the tick move to the left and the list lines up with the right edge. Dark, light or ocean theme from the same code, and long lists load more as you scroll.',
   ig='Pick an option, the form gets the value, before any script runs and after. Five sizes, placeholder, disabled, invalid and read-only states, RTL aware, and long lists load more as you scroll.',
   tags=['select','dropdown select','form']),
 'switch': dict(name='Switch', slug='switch',
   yt='Switch in TopClass UI: a real button, 44 px touch target, form-ready, RTL aware #react #webdev',
   short='Switch, TopClass UI: 44 px touch target, form-ready, RTL aware #Shorts #react #ui',
   body='Flip it: a real button with a 44 pixel touch target, and the form gets the value. Five sizes with the same target in every size, plus disabled and invalid states. In Arabic the thumb starts at the right and slides to the left. Dark, light or ocean theme from the same code. Label it with a plain label or inside a Field.',
   ig='A real button with a 44 px touch target, and the form gets the value. Five sizes with the same target in every size, disabled and invalid states, RTL aware, dark/light/ocean from the same code.',
   tags=['switch','toggle','form']),
 'checkbox': dict(name='Checkbox', slug='checkbox',
   yt='Checkbox in TopClass UI: form-ready, indeterminate state, 44 px touch target #react #webdev',
   short='Checkbox, TopClass UI: form-ready, indeterminate, 44 px touch target #Shorts #react #ui',
   body='Tick it and the form gets the value, before any script runs and after. Five sizes, an indeterminate state and disabled, with a 44 pixel touch target. In Arabic the box sits at the right, before its label. Dark, light or ocean theme from the same code. Unchecked can send a value too, with uncheckedValue.',
   ig='Tick it, the form gets the value, before any script runs and after. Five sizes, an indeterminate state, a 44 px touch target, RTL aware, and unchecked can send a value too with uncheckedValue.',
   tags=['checkbox','indeterminate','form']),
 'input': dict(name='Input', slug='input',
   yt='Input in TopClass UI: a native input, zero client JavaScript, RTL aware #react #webdev',
   short='Input, TopClass UI: native input, zero client JavaScript, RTL aware #Shorts #react #ui',
   body='A native input, styled: focus ring, hover line, and the value goes straight to the form. Five sizes, plus disabled, read-only and invalid states. In Arabic, labels and placeholders align right and the field takes Arabic digits. Dark, light or ocean theme from the same code. It renders on the server with zero client JavaScript.',
   ig='A native input, styled: focus ring, hover line, and the value goes straight to the form. Five sizes, disabled, read-only and invalid states, Arabic digits in RTL, server rendered with zero client JavaScript.',
   tags=['input','text field','form']),
 'tabs': dict(name='Tabs', slug='tabs',
   yt='Tabs in TopClass UI: server-rendered panels, two looks, five sizes, RTL aware #react #webdev',
   short='Tabs, TopClass UI: server-rendered panels, two looks, RTL aware #Shorts #react #ui',
   body='Click a tab and the panel switches. Every panel is written on the server, so all of them are in the HTML. Two looks, line and enclosed, in five sizes. In Arabic the first tab is at the right and the arrow keys follow. Dark, light or ocean theme from the same code. Arrow keys move between tabs.',
   ig='Click a tab, the panel switches. Every panel is written on the server, so all of them are in the HTML. Two looks, line and enclosed, five sizes, RTL aware, arrow keys move between tabs.',
   tags=['tabs','tab panel','navigation']),
 'toast': dict(name='Toast', slug='toast',
   yt='Toast in TopClass UI: one call, six tones, undo actions and promises #react #webdev',
   short='Toast, TopClass UI: one call, six tones, actions and promises #Shorts #react #ui',
   body='One call, one toast. The viewport is already there: the provider mounts it. Six tones, four of them with an icon, so the meaning never rests on colour alone. In Arabic the toast reads right to left, in the page\'s own corner. Dark, light or ocean theme from the same code. Add an undo action, or wrap a promise: spinner first, then the result.',
   ig='One call, one toast. Six tones, four with an icon so the meaning never rests on colour alone. Reads right to left in Arabic, dark/light/ocean from the same code, with undo actions and promise toasts: spinner first, then the result.',
   tags=['toast','notification','snackbar']),
 'dropdown': dict(name='Dropdown', slug='dropdown',
   yt='Dropdown in TopClass UI: icons, shortcuts, danger tone, full keyboard, RTL aware #react #webdev',
   short='Dropdown, TopClass UI: icons, shortcuts, danger tone, RTL aware #Shorts #react #ui',
   body='Icons, keyboard shortcuts, a disabled row, and a danger tone for the destructive one. Compose it from parts: root, trigger, popup and items. In Arabic the icon sits at the right and the shortcut at the left, and the menu lines up with the right edge. Dark, light or ocean theme from the same code. Arrow keys move, Enter chooses, Escape closes.',
   ig='Icons, keyboard shortcuts, a disabled row and a danger tone for the destructive one. Composed from parts: root, trigger, popup and items. RTL aware, dark/light/ocean from the same code. Arrow keys move, Enter chooses, Escape closes.',
   tags=['dropdown menu','menu','context menu']),
 'combobox': dict(name='Combobox', slug='combobox',
   yt='Combobox in TopClass UI: type to filter, arrows and Enter, form-ready, RTL aware #react #webdev',
   short='Combobox, TopClass UI: type to filter, arrows and Enter, RTL aware #Shorts #react #ui',
   body='Type to filter. The arrows move, Enter chooses, and the form gets the value. Five sizes, plus placeholder, disabled and invalid states. In Arabic the caret sits at the left and the list opens at the right edge of the input. Dark, light or ocean theme from the same code. It filters as you type, however long the list.',
   ig='Type to filter. The arrows move, Enter chooses, and the form gets the value. Five sizes, placeholder, disabled and invalid states, RTL aware, and it filters as you type however long the list.',
   tags=['combobox','autocomplete','search select']),
 'slider': dict(name='Slider', slug='slider',
   yt='Slider in TopClass UI: drag, press or arrow keys, range with two thumbs, RTL aware #react #webdev',
   short='Slider, TopClass UI: drag, press or arrow keys, range, RTL aware #Shorts #react #ui',
   body='Drag the thumb, press the track, or use the arrow keys. The value is live. Five sizes, a range with two thumbs, and disabled and invalid states. In Arabic the track runs from right to left and the left arrow raises the value. Dark, light or ocean theme from the same code. Every thumb keeps a 44 pixel touch target.',
   ig='Drag the thumb, press the track, or use the arrow keys, the value is live. Five sizes, a range with two thumbs, disabled and invalid states, RTL aware, and every thumb keeps a 44 px touch target.',
   tags=['slider','range slider','form']),
 'table': dict(name='Table', slug='table',
   yt='Table in TopClass UI: real table markup, row headers, sticky first column, RTL aware #react #webdev',
   short='Table, TopClass UI: real table markup, row headers, sticky column, RTL aware #Shorts #react #ui',
   body='Real table markup: a caption for screen readers, a row header per row, and hover highlighting. Comfortable or compact density, outline or plain, with optional stripes. In Arabic, columns run right to left and numbers align to the end. Dark, light or ocean theme from the same code. Sticky first column, load more, and an empty state.',
   ig='Real table markup: a caption for screen readers, a row header per row, hover highlighting. Comfortable or compact density, outline or plain, optional stripes, RTL aware, sticky first column, load more and an empty state.',
   tags=['table','data table','accessibility']),
}

BASE_TAGS = ['TopClass UI','topclassui','React','React components','UI library','Tailwind CSS','RTL','server components','accessibility','frontend']

def yt_desc(c):
    return (f"{c['name']} from TopClass UI, a React component library built server-first.\n\n{c['body']}\n\n"
            f"Docs: {SITE}/en/docs/components/{c['slug']}\nInstall: npx topclassui add {c['slug']}\n"
            f"Website: {SITE}\nnpm: https://www.npmjs.com/package/topclassui\nGitHub: https://github.com/TopClassUI/topclassui\n\n"
            f"#TopClassUI #React #TailwindCSS #WebDev #UILibrary #RTL #{c['name'].replace(' ','')}")

def short_desc(c):
    return (f"{c['name']} from TopClass UI, a React component library built server-first.\n\n{c['body']}\n\n"
            f"Docs: {SITE}/en/docs/components/{c['slug']}\nInstall: npx topclassui add {c['slug']}\n\n"
            f"#Shorts #TopClassUI #React #TailwindCSS #WebDev #UILibrary #RTL #{c['name'].replace(' ','')}")

def ig_caption(c):
    return (f"{c['name']} · TopClass UI\n\n{c['ig']}\n\nnpx topclassui add {c['slug']}\nDocs: topclassui.com (link in bio)\n\n"
            f"#topclassui #react #reactjs #tailwindcss #webdev #frontend #uidesign #uilibrary #rtl #{c['slug'].replace('-','')}")

def posts(comp, day, hour):
    c = C[comp]; dt = f"{day}T{hour:02d}:00:00"; date = dt + '+03:00'
    v169 = f"{RAW}/videos/topclassui-{comp}-cover.mp4"; v916 = f"{RAW}/videos/topclassui-{comp}-9x16-cover.mp4"
    t169 = f"{RAW}/thumbs/thumb-{comp}-1080p.jpg"; t916 = f"{RAW}/thumbs/thumb-{comp}-9x16.jpg"
    common = dict(autoPublish=True, draft=False, descendants=[], firstCommentText='', hasNotReadNotes=False, mediaAltText=[], shortener=False, smartLinkData={'ids': []}, publicationDate={'dateTime': dt, 'timezone': TZ})
    yt_video = dict(common, text=yt_desc(c), media=[v169], videoThumbnailUrl=t169, providers=[{'network': 'youtube'}],
                    youtubeData={'title': c['yt'], 'type': 'video', 'privacy': 'public', 'tags': BASE_TAGS + c['tags'], 'category': 'SCIENCE_TECHNOLOGY', 'madeForKids': False, 'isAiGeneratedContent': False})
    yt_short = dict(common, text=short_desc(c), media=[v916], videoThumbnailUrl=t916, providers=[{'network': 'youtube'}],
                    youtubeData={'title': c['short'], 'type': 'short', 'privacy': 'public', 'tags': BASE_TAGS + c['tags'], 'category': 'SCIENCE_TECHNOLOGY', 'madeForKids': False, 'isAiGeneratedContent': False})
    ig_reel = dict(common, text=ig_caption(c), media=[v916], videoThumbnailUrl=t916, providers=[{'network': 'instagram'}],
                   instagramData={'type': 'REEL', 'collaborators': [], 'showReelOnFeed': True, 'isAiGenerated': True})
    return date, {'yt_video': yt_video, 'yt_short': yt_short, 'ig_reel': ig_reel}

SCHEDULE = [('date-picker','2026-10-26',10),('select','2026-10-26',13),('switch','2026-10-26',16),('checkbox','2026-10-26',19),('input','2026-10-26',22),
            ('tabs','2026-10-27',10),
            ('toast','2026-11-01',10),('dropdown','2026-11-01',13),('combobox','2026-11-01',16),('slider','2026-11-01',19),('table','2026-11-01',22)]

if __name__ == '__main__':
    import sys
    for k, c in C.items():
        for key in ('yt', 'short'):
            assert len(c[key]) <= 100, (k, key, len(c[key]))
        print(k, len(c['yt']), len(c['short']), len(ig_caption(c)))
    out = {}
    for comp, day, hour in SCHEDULE:
        date, p = posts(comp, day, hour); out[comp] = {'date': date, **{k: json.dumps(v, ensure_ascii=False) for k, v in p.items()}}
    json.dump(out, open('/home/claude/tc-media/posts.json', 'w'), ensure_ascii=False, indent=1)
    if len(sys.argv) > 1:
        comp, kind = sys.argv[1], sys.argv[2]; print(out[comp]['date']); print(out[comp][kind])
