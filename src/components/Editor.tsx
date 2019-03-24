import { exampleSetup } from "prosemirror-example-setup";
import "prosemirror-menu/style/menu.css";
import { DOMParser, Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import "prosemirror-view/style/prosemirror.css";
import React, { useEffect, useRef, useState } from "react";
import "./Editor.scss";
import { IFrame } from "./IFrame";

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

const mySchema = schema;

// function useProseMirror(isPlainText: boolean) {
// 	const viewHostElement = useRef<HTMLDivElement>(null);
// 	const viewContentElement = useRef<HTMLDivElement>(null);

// 	const [view, setView] = useState<EditorView>();
// 	const [editorState, setEditorState] = useState<EditorState>();

// 	useEffect(() => {
// 		const selectedSchema = isPlainText ? textOnlySchema : mySchema;
// 		if (viewHostElement.current && viewContentElement.current) {
// 			const doc = DOMParser.fromSchema(selectedSchema).parse(viewContentElement.current);

// 			const initialState = EditorState.create({
// 				doc,
// 				plugins: exampleSetup({ schema: selectedSchema })
// 			});
// 			setEditorState(initialState);
// 			setView(
// 				new EditorView(viewHostElement.current, {
// 					state: initialState,
// 					dispatchTransaction: (transaction: Transaction) => {
// 						if (editorState) {
// 							const { state, contentLength } = editorViewOnDispatchTransaction(transaction, editorState);
// 							if (view) {
// 								view.updateState(state);
// 							}
// 							setEditorState(state);
// 							setContentLength(contentLength);
// 						}
// 					},
// 					handleDOMEvents: {
// 						focus: (view, e: Event) => {
// 							setFocused(true);
// 							return true;
// 						},
// 						blur: (view, e: Event) => {
// 							setFocused(false);
// 							return true;
// 						}
// 					}
// 				})
// 			);
// 		}

// 		return () => {
// 			if (view) {
// 				view.destroy();
// 				setView(undefined);
// 			}
// 		};
// 	});

// 	return [viewHostElement, viewContentElement];
// }

export default function Editor(props: Props) {
	const viewHostElement = useRef<HTMLDivElement>(null);
	const viewContentElement = useRef<HTMLDivElement>(null);

	const [view, setView] = useState<EditorView>();
	const [editorState, setEditorState] = useState<EditorState>();
	const [contentLength, setContentLength] = useState(0);
	const [text, setText] = useState("");
	const [focused, setFocused] = useState(false);

	useEffect(() => {
		function dispatchTransaction(transaction: Transaction) {
			const { state, contentLength } = editorViewOnDispatchTransaction(transaction, editorState!);
			view!.updateState(state);
			setEditorState(state);
			setContentLength(contentLength);
		}

		if (!view) {
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
			setView(newView);
			setEditorState(initialState);
		}

		return () => {
			if (view) {
				view.destroy();
			}
		};
	});

	return (
		<>
			<div className={`${focused ? " infocus is-focused" : ""} `} ref={viewHostElement} />
			<div
				style={{
					display: "block"
				}}
				ref={viewContentElement}
			/>
			<div>{contentLength}</div>
			<pre>{text}</pre>

			<IFrame>
				<h1>hello</h1>
			</IFrame>
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

// export class Editor3 extends React.Component<Props, State> {
// 	static defaultProps: Props = {
// 		plainTextOnly: true
// 	};

// 	private _viewHostElement!: HTMLDivElement | null;
// 	private _viewContentElement!: HTMLDivElement | null;

// 	private _view?: EditorView;
// 	private _editorState?: EditorState;

// 	constructor(props: Props) {
// 		super(props);
// 		this.state = {
// 			contentLength: 0,
// 			focused: false,
// 			text: ""
// 		};
// 		this.rebinders();
// 	}

// 	private rebinders() {
// 		//this.editorViewOnDispatchTransaction = this.editorViewOnDispatchTransaction.bind(this);
// 	}

// 	componentDidMount() {
// 		const selectedSchema = this.props.plainTextOnly ? textOnlySchema : mySchema;
// 		if (this._viewHostElement && this._viewContentElement) {
// 			const doc = DOMParser.fromSchema(selectedSchema).parse(this._viewContentElement);

// 			const state = EditorState.create({
// 				doc,
// 				plugins: exampleSetup({ schema: selectedSchema })
// 			});
// 			this._view = new EditorView(this._viewHostElement, {
// 				state,
// 				dispatchTransaction: (transaction: Transaction) => {
// 					this.editorViewOnDispatchTransaction(transaction);
// 				},
// 				handleDOMEvents: {
// 					focus: (view, e: Event) => {
// 						this.setState({ focused: true });

// 						return true;
// 					},
// 					blur: (view, e: Event) => {
// 						this.setState({ focused: false });
// 						return true;
// 					}
// 				}
// 			});

// 			this.setState({
// 				editorState: state
// 			});
// 		}
// 	}

// 	componentWillUnmount() {
// 		if (this._view) {
// 			this._view.destroy();
// 			this._view = undefined;
// 		}
// 	}

// 	render() {
// 		const { focused, text } = this.state;

// 		return (
// 			<>
// 				<div
// 					className={`${focused ? " infocus is-focused" : ""} `}
// 					ref={r => {
// 						this._viewHostElement = r;
// 					}}
// 				/>
// 				<div
// 					style={{
// 						display: "block"
// 					}}
// 					ref={r => {
// 						this._viewContentElement = r;
// 					}}
// 				/>
// 				<div>{this.state.contentLength}</div>
// 				<pre>{text}</pre>

// 				<IFrame>
// 					<h1>hello</h1>
// 				</IFrame>
// 			</>
// 		);
// 	}

// 	private editorViewOnDispatchTransaction(tr: Transaction) {
// 		if (this.state.editorState) {
// 			// const s = DOMSerializer.fromSchema(mySchema);
// 			// const json =

// 			//const text = tr.doc.content
// 			//const json = JSON.stringify(tr.doc.content.toJSON(), undefined, 2);
// 			this.setState(state => {
// 				const editorState = state.editorState!.apply(tr);
// 				this._view!.updateState(editorState);
// 				return {
// 					editorState,
// 					//					text: json,
// 					contentLength: tr.doc.content.size
// 				};
// 			});
// 		}
// 	}
// }
