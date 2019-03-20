import { exampleSetup } from "prosemirror-example-setup";
import "prosemirror-menu/style/menu.css";
import { DOMParser, Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import "prosemirror-view/style/prosemirror.css";
import React from "react";
import "./Editor.scss";

interface Props {
	plainTextOnly?: boolean;
}

interface State {
	contentLength: number;
	text: string;
	focused: boolean;
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

export default class Editor extends React.Component<Props, State> {
	static defaultProps: Props = {
		plainTextOnly: true
	};

	private _viewHostElement!: HTMLDivElement | null;
	private _viewContentElement!: HTMLDivElement | null;

	private _view?: EditorView;
	private _editorState?: EditorState;

	constructor(props: Props) {
		super(props);
		this.state = {
			text: "",
			contentLength: 0,
			focused: false
		};
		this.rebinders();
	}

	private rebinders() {
		//this.editorViewOnDispatchTransaction = this.editorViewOnDispatchTransaction.bind(this);
	}

	componentDidMount() {
		const selectedSchema = this.props.plainTextOnly ? textOnlySchema : mySchema;
		if (this._viewHostElement && this._viewContentElement) {
			const state = EditorState.create({
				doc: DOMParser.fromSchema(selectedSchema).parse(this._viewContentElement),
				plugins: exampleSetup({ schema: selectedSchema })
			});
			this._view = new EditorView(this._viewHostElement, {
				state,
				dispatchTransaction: (transaction: Transaction) => {
					this.editorViewOnDispatchTransaction(transaction);
				},
				handleDOMEvents: {
					focus: (view, e: Event) => {
						this.setState({ focused: true });
						return true;
					},
					blur: (view, e: Event) => {
						this.setState({ focused: false });
						return true;
					}
				}
			});

			this.setState({
				editorState: state
			});
		}
	}

	componentWillUnmount() {
		if (this._view) {
			this._view.destroy();
			this._view = undefined;
		}
	}

	render() {
		const { focused, text } = this.state;

		return (
			<>
				<div
					className={`${focused ? " infocus is-focused" : ""} `}
					ref={r => {
						this._viewHostElement = r;
					}}
				/>
				<div
					style={{
						display: "none"
					}}
					ref={r => {
						this._viewContentElement = r;
					}}
				/>
				<div>{this.state.contentLength}</div>
				<pre>{text}</pre>
			</>
		);
	}

	private editorViewOnDispatchTransaction(tr: Transaction) {
		if (this.state.editorState) {
			this.setState(state => {
				const editorState = state.editorState!.apply(tr);
				this._view!.updateState(editorState);
				return {
					editorState,
					contentLength: tr.doc.content.size
				};
			});
		}
	}
}
