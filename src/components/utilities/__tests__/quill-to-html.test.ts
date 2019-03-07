import { readFileSync } from "fs";
import { join } from "path";
import { toHtml } from "../quill-to-html";

// test("adds 1+2", () => {
// 	expect(sum(1, 2)).toBe(3);
// });

test("no delta returns empty", () => {
	expect(toHtml()).toBe("");
});

test("test bold and italics.json", () => {
	const source = readFileSync(join(__dirname, "./test-data/bold-and-italics.json"), "utf-8");
	let target = readFileSync(join(__dirname, "./test-data/bold-and-italics.html.txt"), "utf-8");
	target = fixSampleFiles(target);
	let results = toHtml(JSON.parse(source));
	expect(results).toBe(target);
});

test("test simple-headings.json", () => {
	const source = readFileSync(join(__dirname, "./test-data/simple-headings.json"), "utf-8");
	let target = readFileSync(join(__dirname, "./test-data/simple-headings.html.txt"), "utf-8");
	target = fixSampleFiles(target);
	let results = toHtml(JSON.parse(source));
	expect(results).toBe(target);
});

function fixSampleFiles(target: string): string {
	target = target.replace("\n", "");
	target = target.replace("\r", "");
	target = target.trim();
	return target;
}
