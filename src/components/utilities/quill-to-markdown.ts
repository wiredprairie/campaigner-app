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
								yield mdText(op, text);
								yield "\n\n";
							}
						}
					} catch (ex) {
						console.error(ex);
					}
				}
			} else {
				yield mdText(op, op.insert);
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

function mdText(op: Op, text: string): string {
	if (op.attributes) {
		let trailingSpaces = "";
		let index = text.length;
		while (--index > 0 && text[index] === " ") {
			trailingSpaces += " ";
		}
		text = text.slice(0, index + 1);
		const bold = op.attributes.bold === true;
		const italic = op.attributes.italic === true;
		const strikethru = op.attributes.strike === true;
		const forecolor = op.attributes.color || "";
		const background = op.attributes.background || "";
		const script = op.attributes.script || "";
		const align = op.attributes.align || "";
		const header = op.attributes.header || "";
		const link = op.attributes.link || "";

		// if we're beyond first line feed, add a paragraph break

		if (strikethru) {
			text = `~~${text}~~`;
		}

		if (italic) {
			text = `_${text}_`;
		}

		if (bold) {
			text = `**${text}**`;
		}

		text += trailingSpaces;
	}

	text = text.replace("\n", "\n\n");

	return text;
}
