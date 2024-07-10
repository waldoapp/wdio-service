export type WaldoOs = 'android' | 'ios';

export type WaldoVisibility = 'visible' | 'transparent' | 'hidden' | 'unknown';

export type WaldoTreeElement = {
    index: number;
    /**
     * The type of element
     */
    type: string;
    /**
     * The id of the element
     */
    id: string | undefined;
    text: string | undefined;
    /**
     * Placeholder text for input elements
     */
    placeholder: string | undefined;
    accessibilityId: string | undefined;
    checkable: boolean;
    clickable: boolean;
    focusable: boolean;
    longClickable: boolean;
    scrollable: boolean;
    checked: boolean;
    /**
     * Whether the element is in focus
     */
    focused: boolean;
    /**
     * Whether the element is of type password
     */
    password: boolean;
    /**
     * The visibility of the element
     */
    visibility: WaldoVisibility;
    x: number;
    y: number;
    width: number;
    height: number;
    important: boolean | undefined;

    children: WaldoTreeElement[];
};

export type WaldoTreeWindow = {
    type: 'window.status' | 'window.navigation' | 'window.keyboard' | 'window.main';
    /**
     * Package name related to the window
     */
    packageName: string;
    x: number;
    y: number;
    width: number;
    height: number;

    root: WaldoTreeElement;
};

export type WaldoTree = {
    treeType: 'waldo';

    sessionId: string;
    osType: WaldoOs;

    /**
     * Array of windows composing the view hierarchy of the screen
     */
    windows: WaldoTreeWindow[];
};
