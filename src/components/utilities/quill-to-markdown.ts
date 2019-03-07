import Delta from "quill-delta";
import AttributeMap from "quill-delta/dist/AttributeMap";
import Op from "quill-delta/dist/Op";

const HEADER = ["#", "##", "###", "####", "######", "######"];

export default function toMarkdown(delta?: Delta): string {
	const results: string[] = [];

	if (!delta) {
		return "";
	}
	for (let text of eachRun(delta.ops)) {
		results.push(text);
	}
	return results.join("");
}

function* eachRun(ops: Op[]): IterableIterator<string> {
	for (let line = 0; line < ops.length; line++) {
		const op = ops[line];
		const opNext = line + 1 < ops.length ? ops[line + 1] : {};
		if (typeof op.insert === "string") {
			if (op.insert === "\n") {
				yield "\n\n";
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
										console.log(`header: ${splitIndx} = ${text}`);
										const header = parseInt(lineAttrs.header, 10);
										//yield "\n\n";
										yield `${HEADER[header - 1]} `;
										yield mdText(op, text);
										// yield "\n\n";
									}
								}
							}
						} else {
							if (text !== "") {
								yield mdText(op, text, opNext);
								yield "\n\n";
							}
						}
					} catch (ex) {
						console.error(ex);
					}
				}
			} else {
				yield mdText(op, op.insert, opNext);
			}
		}
	}
}

// look one forward to see if there's a line indicator
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

// https://commonmark.org/help/
function mdText(op: Op, text: string, nextOp?: Op): string {
	if (op.attributes) {
		let trailingSpaces = "";
		let index = text.length;
		while (--index > 0 && text[index] === " ") {
			trailingSpaces += " ";
		}
		text = text.slice(0, index + 1);
		const opAttrs = getOpDetails(op.attributes);
		const prevAttrs = nextOp ? getOpDetails(nextOp.attributes) : {};

		const formats = [];

		if (opAttrs.strikethru) {
			formats.push(mdTextStrikethru);
		}

		if (opAttrs.italic) {
			formats.push(mdTextItalic);
		}

		if (opAttrs.bold) {
			formats.push(mdTextBold);
		}

		if (
			(opAttrs.strikethru && prevAttrs.strikethru) ||
			(opAttrs.italic && prevAttrs.italic) ||
			(opAttrs.bold && prevAttrs.bold)
		) {
			formats.reverse();
		}

		for (let formatIndx = 0; formatIndx < formats.length; formatIndx++) {
			text = formats[formatIndx](text);
		}

		text += trailingSpaces;
	}

	text = text.replace("\n", "\n\n");

	return text;
}

const mdTextBold = (text: string) => `**${text}**`;
const mdTextItalic = (text: string) => `_${text}_`;
const mdTextStrikethru = (text: string) => `~~${text}~~`;

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
		header: attr.header || "",
		link: attr.link || ""
	};
}
