import assert from 'node:assert';
import { parseXmlAsWaldoTree } from './tree-parser.js';
import { expect, test } from 'vitest';
import { WaldoTree } from './tree-types.js';

const emptyDoc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<tree sessionId="sess-f771fa7945302800" osType="android">
</tree>`;

test('Parses an empty tree', () => {
    const parsed = parseXmlAsWaldoTree(emptyDoc);
    expect(parsed).toStrictEqual<WaldoTree>({
        treeType: 'waldo',
        sessionId: 'sess-f771fa7945302800',
        osType: 'android',
        windows: [],
    });
});

const mainOnlyDoc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<tree sessionId="sess-63dfac6b55d0568b" osType="ios">
  <window.main type="window.main" packageName="io.waldo.SnoopLlama" x="0" y="141" width="1170" height="2391">
    <view index="0" type="view" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="base-UILayoutContainerView,hook,base-UIDropShadowView,base-UITransitionView,id-0x12963d7a0" originalBox="[0 0][1170 2532]" childrenBox="[0 141][1170 2391]" x="0" y="141" width="1170" height="2391" />
  </window.main>
</tree>`;

test('Parses a tree with a single window', () => {
    const parsed = parseXmlAsWaldoTree(mainOnlyDoc);
    expect(parsed).toStrictEqual<WaldoTree>({
        treeType: 'waldo',
        sessionId: 'sess-63dfac6b55d0568b',
        osType: 'ios',
        windows: [
            {
                type: 'window.main',
                packageName: 'io.waldo.SnoopLlama',
                x: 0,
                y: 141,
                width: 1170,
                height: 2391,
                root: {
                    type: 'view',
                    index: 0,
                    id: undefined,
                    text: undefined,
                    placeholder: undefined,
                    accessibilityId: undefined,
                    checkable: false,
                    clickable: false,
                    focusable: false,
                    longClickable: false,
                    scrollable: false,
                    checked: false,
                    focused: false,
                    password: false,
                    visibility: 'unknown',
                    x: 0,
                    y: 141,
                    width: 1170,
                    height: 2391,
                    important: undefined,
                    children: [],
                },
            },
        ],
    });
});

const bigTree = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<tree sessionId="sess-f771fa7945302800" osType="android">
  <window.main type="window.main" packageName="io.waldo.snoopllama" x="0" y="63" width="1080" height="2337">
    <android.widget.FrameLayout index="0" type="android.widget.FrameLayout" accessibilityId="" id="" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-29--2147455746" originalBox="[0 0][1080 2400]" childrenBox="[0 63][1080 2337]" x="0" y="63" width="1080" height="2337">
      <android.view.ViewGroup index="0" type="android.view.ViewGroup" accessibilityId="" id="io.waldo.snoopllama:id/decor_content_parent" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-32-32707" originalBox="[0 63][1080 2274]" childrenBox="[0 63][1080 2274]" x="0" y="63" width="1080" height="2274">
        <android.view.ViewGroup index="0" type="android.view.ViewGroup" accessibilityId="" id="io.waldo.snoopllama:id/container" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-37-34629" originalBox="[0 210][1080 2127]" childrenBox="[0 210][1080 2127]" x="0" y="210" width="1080" height="2127">
          <android.widget.ListView index="0" type="android.widget.ListView" accessibilityId="" id="io.waldo.snoopllama:id/list_test" checkable="false" clickable="false" focusable="true" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" actions="FOCUS" extra="enabled,id-40-58654" originalBox="[0 210][1080 2127]" childrenBox="[0 210][1080 2127]" x="0" y="210" width="1080" height="2127">
            <android.widget.RelativeLayout index="0" type="android.widget.RelativeLayout" accessibilityId="" id="" checkable="false" clickable="true" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" actions="CLICK" extra="enabled,id-41-65381" originalBox="[0 210][1080 148]" childrenBox="[0 210][1080 148]" x="0" y="210" width="1080" height="148">
              <android.widget.TextView index="0" type="android.widget.TextView" accessibilityId="" id="io.waldo.snoopllama:id/list_item_title" text="Browse Web" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-42-66342" originalBox="[0 210][996 84]" childrenBox="[0 210][996 84]" x="0" y="210" width="996" height="84" />
              <android.widget.TextView index="1" type="android.widget.TextView" accessibilityId="" id="io.waldo.snoopllama:id/list_item_subtitle" text="https://www.google.com" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-43-67303" originalBox="[0 294][996 64]" childrenBox="[0 294][996 64]" x="0" y="294" width="996" height="64" />
              <android.widget.ImageButton index="2" type="android.widget.ImageButton" accessibilityId="[info]" id="io.waldo.snoopllama:id/list_item_button" checkable="false" clickable="true" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" actions="CLICK" extra="enabled,id-44-68264" originalBox="[996 242][84 84]" childrenBox="[996 242][84 84]" x="996" y="242" width="84" height="84" />
            </android.widget.RelativeLayout>
            <android.widget.TextView index="1" type="android.widget.TextView" accessibilityId="" id="io.waldo.snoopllama:id/list_item_title" text="Display Map" checkable="false" clickable="true" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" important="true" visibility="unknown" actions="CLICK" extra="enabled,id-46-70186" originalBox="[0 361][1080 105]" childrenBox="[0 361][1080 105]" x="0" y="361" width="1080" height="105" />
            <android.widget.TextView index="2" type="android.widget.TextView" accessibilityId="" id="io.waldo.snoopllama:id/list_item_title" text="Take Photo" checkable="false" clickable="true" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" important="true" visibility="unknown" actions="CLICK" extra="enabled,id-48-72108" originalBox="[0 469][1080 105]" childrenBox="[0 469][1080 105]" x="0" y="469" width="1080" height="105" />
            <android.widget.TextView index="3" type="android.widget.TextView" accessibilityId="" id="io.waldo.snoopllama:id/list_item_title" text="Crash app" checkable="false" clickable="true" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" important="true" visibility="unknown" actions="CLICK" extra="enabled,id-50-74030" originalBox="[0 577][1080 105]" childrenBox="[0 577][1080 105]" x="0" y="577" width="1080" height="105" />
            <android.widget.TextView index="4" type="android.widget.TextView" accessibilityId="" id="io.waldo.snoopllama:id/list_item_title" text="Display SVG" checkable="false" clickable="true" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" important="true" visibility="unknown" actions="CLICK" extra="enabled,id-52-75952" originalBox="[0 685][1080 105]" childrenBox="[0 685][1080 105]" x="0" y="685" width="1080" height="105" />
            <android.widget.TextView index="5" type="android.widget.TextView" accessibilityId="" id="io.waldo.snoopllama:id/list_item_title" text="Various text input" checkable="false" clickable="true" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" important="true" visibility="unknown" actions="CLICK" extra="enabled,id-54-77874" originalBox="[0 793][1080 105]" childrenBox="[0 793][1080 105]" x="0" y="793" width="1080" height="105" />
            <android.widget.TextView index="6" type="android.widget.TextView" accessibilityId="" id="io.waldo.snoopllama:id/list_item_title" text="React activity" checkable="false" clickable="true" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" important="true" visibility="unknown" actions="CLICK" extra="enabled,id-56-79796" originalBox="[0 901][1080 105]" childrenBox="[0 901][1080 105]" x="0" y="901" width="1080" height="105" />
            <android.widget.TextView index="7" type="android.widget.TextView" accessibilityId="" id="io.waldo.snoopllama:id/list_item_title" text="React SVG" checkable="false" clickable="true" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" important="true" visibility="unknown" actions="CLICK" extra="enabled,id-58-81718" originalBox="[0 1009][1080 105]" childrenBox="[0 1009][1080 105]" x="0" y="1009" width="1080" height="105" />
            <android.widget.TextView index="8" type="android.widget.TextView" accessibilityId="" id="io.waldo.snoopllama:id/list_item_title" text="Dialog fragment" checkable="false" clickable="true" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" important="true" visibility="unknown" actions="CLICK" extra="enabled,id-60-83640" originalBox="[0 1117][1080 105]" childrenBox="[0 1117][1080 105]" x="0" y="1117" width="1080" height="105" />
            <android.widget.TextView index="9" type="android.widget.TextView" accessibilityId="" id="io.waldo.snoopllama:id/list_item_title" text="Video fragment" checkable="false" clickable="true" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" important="true" visibility="unknown" actions="CLICK" extra="enabled,id-62-85562" originalBox="[0 1225][1080 105]" childrenBox="[0 1225][1080 105]" x="0" y="1225" width="1080" height="105" />
          </android.widget.ListView>
        </android.view.ViewGroup>
        <android.view.ViewGroup index="1" type="android.view.ViewGroup" accessibilityId="" id="io.waldo.snoopllama:id/action_bar" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-34-60576" originalBox="[0 63][1080 147]" childrenBox="[0 63][1080 147]" x="0" y="63" width="1080" height="147">
          <android.widget.TextView index="0" type="android.widget.TextView" accessibilityId="" id="" text="Test" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-35-61537" originalBox="[42 101][103 71]" childrenBox="[42 101][103 71]" x="42" y="101" width="103" height="71" />
        </android.view.ViewGroup>
      </android.view.ViewGroup>
      <android.view.View index="1" type="android.view.View" accessibilityId="" id="android:id/navigationBarBackground" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-78-63459" originalBox="[0 2337][1080 63]" childrenBox="[0 2337][1080 63]" x="0" y="2337" width="1080" height="63" />
    </android.widget.FrameLayout>
  </window.main>
  <window.status type="window.status" packageName="com.android.systemui" x="0" y="0" width="1080" height="63">
    <android.widget.FrameLayout index="0" type="android.widget.FrameLayout" accessibilityId="" id="" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-0-233548" originalBox="[0 0][1080 63]" childrenBox="[0 0][1080 63]" x="0" y="0" width="1080" height="63">
      <android.widget.FrameLayout index="0" type="android.widget.FrameLayout" accessibilityId="" id="com.android.systemui:id/status_bar" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-4-1089799" originalBox="[0 0][1080 63]" childrenBox="[0 0][1080 63]" x="0" y="0" width="1080" height="63">
        <android.widget.LinearLayout index="0" type="android.widget.LinearLayout" accessibilityId="" id="com.android.systemui:id/status_bar_contents" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-5-1091721" originalBox="[0 0][1027 63]" childrenBox="[0 0][1027 63]" x="0" y="0" width="1027" height="63">
          <android.widget.FrameLayout index="0" type="android.widget.FrameLayout" accessibilityId="" id="com.android.systemui:id/status_bar_start_side_container" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-6-1092682" originalBox="[21 0][492 63]" childrenBox="[21 0][492 63]" x="21" y="0" width="492" height="63">
            <android.widget.LinearLayout index="0" type="android.widget.LinearLayout" accessibilityId="" id="com.android.systemui:id/status_bar_start_side_except_heads_up" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-8-1097487" originalBox="[21 0][272 63]" childrenBox="[21 0][272 63]" x="21" y="0" width="272" height="63">
              <android.widget.TextView index="0" type="android.widget.TextView" accessibilityId="11:07 AM" id="com.android.systemui:id/clock" text="11:07" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-9-1099409" originalBox="[21 0][98 63]" childrenBox="[21 0][98 63]" x="21" y="0" width="98" height="63" />
              <android.view.ViewGroup index="1" type="android.view.ViewGroup" accessibilityId="" id="com.android.systemui:id/notificationIcons" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-11-251807" originalBox="[119 0][174 63]" childrenBox="[119 0][174 63]" x="119" y="0" width="174" height="63">
                <android.widget.ImageView index="0" type="android.widget.ImageView" accessibilityId="Android Setup notification: App updates are ready" id="" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-12-1607778" originalBox="[119 0][58 63]" childrenBox="[119 0][58 63]" x="119" y="0" width="58" height="63" />
                <android.widget.ImageView index="1" type="android.widget.ImageView" accessibilityId="Google Play Protect notification: Google Play Protect is turned on" id="" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-13-1684658" originalBox="[177 0][58 63]" childrenBox="[177 0][58 63]" x="177" y="0" width="58" height="63" />
                <android.widget.ImageView index="2" type="android.widget.ImageView" accessibilityId="Android System notification: Certificate authority installed" id="" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-14-1887429" originalBox="[235 0][58 63]" childrenBox="[235 0][58 63]" x="235" y="0" width="58" height="63" />
              </android.view.ViewGroup>
            </android.widget.LinearLayout>
          </android.widget.FrameLayout>
        </android.widget.LinearLayout>
      </android.widget.FrameLayout>
      <android.widget.FrameLayout index="1" type="android.widget.FrameLayout" accessibilityId="" id="com.android.systemui:id/container" checkable="false" clickable="false" focusable="false" long-clickable="false" scrollable="false" checked="false" focused="false" password="false" visibility="unknown" extra="enabled,id-2-1792290" originalBox="[0 0][1080 63]" childrenBox="[0 0][1080 63]" x="0" y="0" width="1080" height="63" />
    </android.widget.FrameLayout>
  </window.status>
</tree>`;

test('Parses a bigger, more complex tree', () => {
    const parsed = parseXmlAsWaldoTree(bigTree);
    expect(parsed.windows.length).toBe(2);
    const statusWindow = parsed.windows.find((w) => w.type === 'window.status');
    assert.ok(statusWindow);
    const iconContainer =
        statusWindow.root.children[0].children[0].children[0].children[0].children[1];
    expect(iconContainer.type).toBe('android.view.ViewGroup');
    expect(iconContainer.children.length).toBe(3);
});
