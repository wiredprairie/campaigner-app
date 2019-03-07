import Delta from "quill-delta";
import AttributeMap from "quill-delta/dist/AttributeMap";
import Op from "quill-delta/dist/Op";

export function sum(a: number, b: number): number {
	return a + b;
}

const htmlBold = (text: string) => `<strong>${text}</strong>`;
const htmlItalic = (text: string) => `<em>${text}</em>`;
const htmlStrikethru = (text: string) => `<s>${text}<s>`;
const htmlSuperscript = (text: string) => `<sup>${text}</sup>`;
const htmlSubscript = (text: string) => `<sub>${text}</sub>`;
const htmlParagraph = (text: string) => `<p>${text}</p>`;
const makeHeader = (level: number, text: string) => `<h${level}>${text}</h${level}>`;
const htmlHeader = (level: number) => (text: string) => makeHeader(level, text);

export function toHtml(delta?: Delta): string {
	const results: string[] = [];
	if (!delta) {
		return "";
	}

	return eachRun(delta.ops);
}

function eachRun(ops: Op[]): string {
	const results: string[] = [];
	const elementStack: string[] = [];
	for (let line = 0; line < ops.length; line++) {
		const op = ops[line];
		if (typeof op.insert === "string") {
			if (op.insert === "\n") {
				if (elementStack.length > 0) {
					results.push(elementStack.pop() as string);
				}

				continue;
			}
			if (op.insert.indexOf("\n") >= 0) {
				const splits = op.insert.split("\n");
				for (let splitIndx = 0; splitIndx < splits.length; splitIndx++) {
					let text = splits[splitIndx];

					try {
						if (splitIndx === splits.length - 1) {
							// last text run
							if (text !== "") {
								const lineAttrs = getLineAttributes(ops, line);
								if (lineAttrs) {
									if (lineAttrs.header) {
										const header = parseInt(lineAttrs.header, 10);
										results.push(`<h${header}>`);
										elementStack.push(`</h${header}>`);
										results.push(htmlText(op, text));
										delete lineAttrs.header;
									}
								}
							}
						} else {
							if (text !== "") {
								results.push(htmlText(op, text));
							}
						}
					} catch (ex) {
						console.error(ex);
					}
				}
			} else {
				const lineAttrs = getLineAttributes(ops, line);
				if (lineAttrs) {
					if (lineAttrs.header) {
						const header = parseInt(lineAttrs.header, 10);
						results.push(`<h${header}>`);
						elementStack.push(`</h${header}>`);
						delete lineAttrs.header;
					}
				}
				results.push(htmlText(op, op.insert));
			}
		}
	}
	for (let i = 0; i < elementStack.length; i++) {
		results.push(elementStack.pop() as string);
	}
	return results.join("");
}

// look forward to see if there's a line indicator
function getLineAttributes(ops: Op[], index: number): AttributeMap | undefined {
	++index;

	for (let i = index; i < ops.length; i++) {
		const op = ops[i];
		if (op.insert === "\n") {
			return op.attributes;
		}

		if (typeof op.insert === "string") {
			if (op.insert.indexOf("\n") >= 0) {
				return; // we found something that isn't a line attribute but has
				// a line break
			}
		}
	}

	return;
}

function htmlText(op: Op, text: string): string {
	let trailingSpaces = "";
	let leadingSpaces = "";

	// translate leading spaces into &nbsp; entities
	let index = 0;
	while (index < text.length && text[index] === " ") {
		leadingSpaces += "&nbsp;";
		index++;
	}
	text = text.slice(index);

	// keep track of trailing spaces
	index = text.length - 1;
	while (index >= 0 && text[index] === " ") {
		trailingSpaces += " ";
		--index;
	}
	text = text.slice(0, index + 1);

	if (op.attributes) {
		const opAttrs = getOpDetails(op.attributes);

		const formats = [];

		if (opAttrs.header) {
			console.log(`header: ${opAttrs.header}`);
			const header = parseInt(opAttrs.header, 10);
			formats.push(htmlHeader(header));
		}

		if (opAttrs.strikethru) {
			formats.push(htmlStrikethru);
		}

		if (opAttrs.italic) {
			formats.push(htmlItalic);
		}

		if (opAttrs.bold) {
			formats.push(htmlBold);
		}

		for (let formatIndx = 0; formatIndx < formats.length; formatIndx++) {
			text = formats[formatIndx](text + trailingSpaces);
			trailingSpaces = "";
		}
	}
	text = leadingSpaces + text + trailingSpaces;

	return text;
}

function getOpDetails(attr?: AttributeMap) {
	if (!attr) {
		return {};
	}

	return {
		bold: attr.bold === true,
		italic: attr.italic === true,
		strikethru: attr.strike === true,
		forecolor: attr.color || "",
		background: attr.background || "",
		script: attr.script || "",
		align: attr.align || "",
		header: attr.header || undefined,
		link: attr.link || ""
	};
}
