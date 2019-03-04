import Quill from "quill";
import Delta from "quill-delta";
import "quill/dist/quill.snow.css";
import React from "react";

interface Props {}
interface State {
	changeLength: number;
	text: string;
}
export default class Editor extends React.Component<Props, State> {
	private _quillHostElement!: HTMLDivElement | null;

	private _quill?: Quill;
	constructor(props: Props) {
		super(props);
		this.state = {
			text: "",
			changeLength: 0
		}; // You can also pass a Quill Delta here
		this.onQuillTextChange = this.onQuillTextChange.bind(this);
	}

	componentDidMount() {
		if (this._quillHostElement) {
			const quill = new Quill(this._quillHostElement, {
				modules: {
					toolbar: [
						[{ header: [1, 2, false] }],
						["bold", "italic", "underline", "strike", "blockquote"],
						[{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
						["link", "image"],
						["clean"]
					]
				},
				theme: "snow",
				placeholder: "Compose here"
			});
			this._quill = quill;

			this.attachQuillEvents(quill);
		}
	}

	private attachQuillEvents(quill: Quill): void {
		quill.on("text-change", this.onQuillTextChange);
	}

	private detachQuillEvents(quill: Quill): void {
		quill.off("text-change", this.onQuillTextChange);
	}

	componentWillUnmount() {
		if (this._quill) {
			this._quill.disable();
		}
	}

	private onQuillTextChange(delta: Delta, oldContents: Delta, source: String) {
		this.setState({
			changeLength: delta.changeLength()
		});
	}

	render() {
		return (
			<div>
				<div
					ref={r => {
						this._quillHostElement = r;
					}}
				/>
				<div>{this.state.changeLength}</div>
			</div>
		);
	}
}
