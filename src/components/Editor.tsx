import { setBlockType, toggleMark, wrapIn } from "prosemirror-commands";
import { exampleSetup } from "prosemirror-example-setup";
import "prosemirror-menu/style/menu.css";
import { DOMParser, Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { EditorState, Plugin, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import "prosemirror-view/style/prosemirror.css";
import React, { useEffect, useRef, useState } from "react";
import "./Editor.scss";

interface Props {
	plainTextOnly?: boolean;
	initialText?: string;
}

interface State {
	contentLength: number;
	focused: boolean;
	text: string;
	editorState?: EditorState;
}

// const mySchema = new Schema({
// 	nodes: addListNodes(schema.spec.nodes as any, "paragraph block*", "block"),
// 	marks: schema.spec.marks
// });
const textOnlySchema = new Schema({
	nodes: {
		text: {},
		doc: { content: "text*" }
	}
});

const mySchema = new Schema({
	nodes: addListNodes(schema.spec.nodes as any, "paragraph block*", "block"),
	marks: schema.spec.marks
});

export default function Editor(props: Props) {
	const viewHostElement = useRef<HTMLDivElement>(null);
	const viewContentElement = useRef<HTMLDivElement>(null);

	const view = useRef<EditorView>();

	const editorState = useRef<EditorState>();
	const [contentLength, setContentLength] = useState(0);
	const [text, setText] = useState("");
	const [focused, setFocused] = useState(false);

	// useEffect captures the closured variables in the first pass and always
	// executes with that context
	useEffect(() => {
		function dispatchTransaction(transaction: Transaction) {
			if (view.current && editorState.current) {
				const { state, contentLength } = editorViewOnDispatchTransaction(transaction, editorState.current);
				view.current.updateState(state);
				editorState.current = state;
				setContentLength(contentLength);
			}
		}

		if (!view.current) {
			const selectedSchema = props.plainTextOnly ? textOnlySchema : mySchema;
			const doc = DOMParser.fromSchema(selectedSchema).parse(viewContentElement.current!);

			const initialState = EditorState.create({
				doc,
				plugins: exampleSetup({ schema: selectedSchema })
			});

			const newView = new EditorView(viewHostElement.current!, {
				state: initialState,
				dispatchTransaction,
				handleDOMEvents: {
					focus: (view, e: Event) => {
						setFocused(true);
						return true;
					},
					blur: (view, e: Event) => {
						setFocused(false);
						return true;
					}
				}
			});
			view.current = newView;
			editorState.current = initialState;
		}
	}, [contentLength]);

	// by referencing the empty array as the dependencies, it's saying that it has none
	// so, it only executes when the current component needs to unload
	useEffect(() => {
		return () => {
			if (view.current) {
				view.current.destroy();
			}
		};
	}, []);

	return (
		<>
			<div className="ProseMirror-host" ref={viewHostElement} />
			<div
				style={{
					display: "block"
				}}
			/>
			<div>{contentLength}</div>
			<pre>{text}</pre>
			{!view.current && (
				<iframe sandbox={""}>
					<div ref={viewContentElement}>
						<h1>Heading 1</h1>
						<p>
							something great! <b>And bolded</b>
						</p>
						<ul>
							<li>
								First, first, first, first, first, first, first, first, first, first, first, first,{" "}
								first, first, first, first, first, first, first, first, first, first, and first,{" "}
							</li>
							<li>Second</li>
						</ul>
						<ol>
							<li>One</li>
							<li>Two</li>
							<li>Three</li>
						</ol>
					</div>
				</iframe>
			)}{" "}
			{/* <IFrame ref={viewContentElement}>
				<h1>hello</h1>
			</IFrame> */}
		</>
	);
}

function editorViewOnDispatchTransaction(tr: Transaction, inComingState: EditorState) {
	const state = inComingState.apply(tr);
	return {
		state,
		contentLength: tr.doc.content.size
	};
}

class MenuView {
	private _dom: HTMLDivElement;
	private items: MenuItem[];
	private editorView: EditorView;

	constructor(items: MenuItem[], editorView: EditorView) {
		this.items = items;
		this.editorView = editorView;

		this._dom = document.createElement("div");
		this._dom.className = "menubar";
		items.forEach(({ dom }) => this._dom.appendChild(dom));
		this.update();

		this.dom.addEventListener("mousedown", e => {
			e.preventDefault();
			editorView.focus();
			items.forEach(({ command, dom }) => {
				if (e && dom.contains(e.target as any)) {
					command(editorView.state, editorView.dispatch, editorView);
				}
			});
		});
	}

	public get dom(): HTMLDivElement {
		return this._dom;
	}

	update() {
		this.items.forEach(({ command, dom }) => {
			let active = command(this.editorView.state, undefined, this.editorView);
			dom.style.display = active ? "" : "none";
		});
	}

	destroy() {
		this.dom.remove();
	}
}

function menuPlugin(items: MenuItem[]) {
	return new Plugin({
		view(editorView: EditorView) {
			let menuView = new MenuView(items, editorView);
			editorView.dom!.parentNode!.insertBefore(menuView.dom, editorView.dom);
			return menuView;
		}
	});
}

// Helper function to create menu icons
function icon(text: string, name: string) {
	const span = document.createElement("span");
	span.className = "menuicon " + name;
	span.title = name;
	span.textContent = text;
	return span;
}

// Create an icon for a heading at the given level
function heading(level: number) {
	return {
		command: setBlockType(schema.nodes.heading, { level }),
		dom: icon("H" + level, "heading")
	};
}

// (state: EditorState<S>, dispatch?: (tr: Transaction<S>) => void) => boolean;
interface MenuItem {
	// command: (...args: any[]) => boolean;
	command: Command;
	dom: HTMLElement;
}

interface Command<S extends Schema<any, any> = Schema<any, any>> extends ReturnType<typeof toggleMark> {
	(state: EditorState<S>, dispatch?: (tr: Transaction<S>) => void, extra?: unknown): boolean;
}

let menu = menuPlugin([
	{ command: toggleMark(schema.marks.strong), dom: icon("B", "strong") },
	{ command: toggleMark(schema.marks.em), dom: icon("i", "em") },
	{ command: setBlockType(schema.nodes.paragraph), dom: icon("p", "paragraph") },
	heading(1),
	heading(2),
	heading(3),
	{ command: wrapIn(schema.nodes.blockquote), dom: icon(">", "blockquote") }
]);
