import { readdirSync, readFileSync } from "fs";
import * as path from "path";
import { toHtml } from "../quill-to-html";

// test("adds 1+2", () => {
// 	expect(sum(1, 2)).toBe(3);
// });

test("no delta returns empty", () => {
	expect(toHtml()).toBe("");
});

function setupTests(folder: string) {
	const files = readdirSync(folder, { withFileTypes: true });
	for (const file of files) {
		if (file.isFile()) {
			const possibleMatch = path.parse(file.name);
			if (possibleMatch.ext === ".json") {
				const expectedDataFilename = path.join(folder, `${possibleMatch.name}.html.txt`);
				try {
					const expectedData = readFileSync(expectedDataFilename, "utf8");
					const inputData = readFileSync(path.join(folder, possibleMatch.base), "utf8");
					test(`test: ${possibleMatch.name}`, () => {
						const expected = fixSampleFiles(expectedData);
						const input = toHtml(JSON.parse(inputData));
						expect(input).toBe(expected);
					});
				} catch (ex) {
					console.error(ex);
				}
			}
		}
	}
}

setupTests(path.join(__dirname, "./__test-data__/"));

function fixSampleFiles(target: string): string {
	target = target.replace("\n", "");
	target = target.replace("\r", "");
	target = target.trim();
	return target;
}
