import type {
    WaldoTree,
    WaldoTreeElement,
    WaldoTreeWindow,
    WaldoVisibility,
} from './tree-types.js';
import type { SAXParser, Tag } from 'sax';
import sax from 'sax';

const { parser: saxParser } = sax;

export class WaldoTreeParsingError extends Error {
    readonly xml: string;
    readonly line: number;
    readonly column: number;

    constructor(xml: string, parser: SAXParser, message: string, options?: ErrorOptions) {
        super(`[${parser.line}:${parser.column}] ${message}`, options);
        this.name = 'WaldoTreeParsingError';
        this.xml = xml;
        this.line = parser.line;
        this.column = parser.column;
    }
}

type OptionalRootWindow = Omit<WaldoTreeWindow, 'root'> & { root: WaldoTreeElement | undefined };

function parseRoot(node: Tag, xml: string, parser: SAXParser): WaldoTree {
    if (node.name !== 'tree') {
        throw new WaldoTreeParsingError(
            xml,
            parser,
            `Expected root node to be <tree>, found <${node.name}>`,
        );
    }
    if (node.attributes.osType !== 'ios' && node.attributes.osType !== 'android') {
        throw new WaldoTreeParsingError(
            xml,
            parser,
            `Expected osType to be 'ios' or 'android', found '${node.attributes.osType}'`,
        );
    }
    const sessionId = node.attributes.sessionId ?? '';
    const osType = node.attributes.osType;
    return { treeType: 'waldo', sessionId, osType, windows: [] };
}

function getExpectedAttribute(
    attribute: string,
    node: Tag,
    xml: string,
    parser: SAXParser,
): string {
    if (!(attribute in node.attributes)) {
        throw new WaldoTreeParsingError(
            xml,
            parser,
            `Expected ${attribute} to be present on ${node.name}`,
        );
    }
    return node.attributes[attribute];
}

function parseExpectedInt(attribute: string, node: Tag, xml: string, parser: SAXParser): number {
    const rawValue = getExpectedAttribute(attribute, node, xml, parser);
    const value = parseInt(rawValue, 10);
    if (Number.isNaN(value)) {
        throw new WaldoTreeParsingError(
            xml,
            parser,
            `Expected ${attribute} to be an integer, found '${rawValue}'`,
        );
    }
    return value;
}

function parseBool(rawValue: string, attribute: string, xml: string, parser: SAXParser) {
    switch (rawValue) {
        case 'true':
            return true;
        case 'false':
            return false;
        default:
            throw new WaldoTreeParsingError(
                xml,
                parser,
                `Expected ${attribute} to be a boolean ('true' or 'false'), found '${rawValue}'`,
            );
    }
}

function parseExpectedBool(attribute: string, node: Tag, xml: string, parser: SAXParser): boolean {
    const rawValue = getExpectedAttribute(attribute, node, xml, parser);
    return parseBool(rawValue, attribute, xml, parser);
}

function parseOptionalBool(
    attribute: string,
    node: Tag,
    xml: string,
    parser: SAXParser,
): boolean | undefined {
    const rawValue = node.attributes[attribute];
    if (rawValue === undefined) {
        return undefined;
    }
    return parseBool(rawValue, attribute, xml, parser);
}

function parseWindow(node: Tag, xml: string, parser: SAXParser): OptionalRootWindow {
    return {
        packageName: getExpectedAttribute('packageName', node, xml, parser),
        type: getExpectedAttribute('type', node, xml, parser) as WaldoTreeWindow['type'],
        x: parseExpectedInt('x', node, xml, parser),
        y: parseExpectedInt('y', node, xml, parser),
        width: parseExpectedInt('width', node, xml, parser),
        height: parseExpectedInt('height', node, xml, parser),
        root: undefined,
    };
}

function parseElement(node: Tag, xml: string, parser: SAXParser): WaldoTreeElement {
    return {
        index: parseExpectedInt('index', node, xml, parser),
        type: getExpectedAttribute('type', node, xml, parser),
        id: node.attributes.id,
        accessibilityId: node.attributes.accessibilityId,
        text: node.attributes.text,
        placeholder: node.attributes.placeholder,
        checkable: parseExpectedBool('checkable', node, xml, parser),
        clickable: parseExpectedBool('clickable', node, xml, parser),
        focusable: parseExpectedBool('focusable', node, xml, parser),
        longClickable: parseExpectedBool('long-clickable', node, xml, parser),
        scrollable: parseExpectedBool('scrollable', node, xml, parser),
        checked: parseExpectedBool('checked', node, xml, parser),
        focused: parseExpectedBool('focused', node, xml, parser),
        password: parseExpectedBool('password', node, xml, parser),
        visibility: (node.attributes.visibility ?? 'unknown') as WaldoVisibility,
        x: parseExpectedInt('x', node, xml, parser),
        y: parseExpectedInt('y', node, xml, parser),
        width: parseExpectedInt('width', node, xml, parser),
        height: parseExpectedInt('height', node, xml, parser),
        important: parseOptionalBool('important', node, xml, parser),
        children: [],
    };
}

export function parseXmlAsWaldoTree(xml: string): WaldoTree {
    let nestingLevel = 0;
    let currentTree: WaldoTree | undefined;
    let currentWindow: OptionalRootWindow | undefined;
    const elementStack: WaldoTreeElement[] = [];

    const assertCurrentTree = (): WaldoTree => {
        if (currentTree === undefined) {
            throw new WaldoTreeParsingError(xml, parser, 'Expected root node <tree>');
        }
        return currentTree;
    };

    const assertCurrentWindow = (): OptionalRootWindow => {
        if (currentWindow === undefined) {
            throw new WaldoTreeParsingError(xml, parser, 'Expected a current window');
        }
        return currentWindow;
    };

    const assertCurrentElement = (): WaldoTreeElement => {
        if (elementStack.length === 0) {
            throw new WaldoTreeParsingError(xml, parser, 'Expected element in stack');
        }
        return elementStack[elementStack.length - 1];
    };

    const parser = saxParser(true, { trim: true });

    parser.onerror = (e) => {
        throw new WaldoTreeParsingError(xml, parser, e.message, { cause: e });
    };

    parser.ontext = (text) => {
        throw new WaldoTreeParsingError(xml, parser, `Unexpected text: ${text}`);
    };

    parser.oncdata = (text) => {
        throw new WaldoTreeParsingError(xml, parser, `Unexpected CDATA: ${text}`);
    };

    parser.onopentag = (node: Tag) => {
        switch (nestingLevel) {
            case 0: {
                if (currentTree !== undefined) {
                    throw new WaldoTreeParsingError(
                        xml,
                        parser,
                        `Unexpected second root node: <${node.name}>`,
                    );
                }

                currentTree = parseRoot(node, xml, parser);
                break;
            }
            case 1: {
                currentWindow = parseWindow(node, xml, parser);
                break;
            }
            case 2: {
                const assertedWindow = assertCurrentWindow();
                if (assertedWindow.root !== undefined) {
                    throw new WaldoTreeParsingError(
                        xml,
                        parser,
                        `Expected only one root element in window ${assertedWindow.type}`,
                    );
                }
                const element = parseElement(node, xml, parser);
                elementStack.push(element);
                assertedWindow.root = element;
                break;
            }

            default: {
                const element = parseElement(node, xml, parser);
                const currentElement = assertCurrentElement();
                currentElement.children.push(element);
                elementStack.push(element);
                break;
            }
        }

        nestingLevel += 1;
    };

    parser.onclosetag = () => {
        nestingLevel -= 1;

        switch (nestingLevel) {
            case 0:
                break;
            case 1: {
                const assertedWindow = assertCurrentWindow();
                if (assertedWindow.root === undefined) {
                    throw new WaldoTreeParsingError(xml, parser, 'Expected root element in window');
                }

                assertCurrentTree().windows.push({ ...assertedWindow, root: assertedWindow.root });
                currentWindow = undefined;
                break;
            }
            default:
                elementStack.pop();
                break;
        }
    };

    parser.write(xml);
    parser.close();

    return assertCurrentTree();
}
