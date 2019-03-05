import Quill, { QuillOptionsStatic, RangeStatic, Sources } from "quill";
import Delta from "quill-delta";
import "quill/dist/quill.snow.css";
import React from "react";
import "./Editor.scss";
import toMarkdown from "./utilities/quill-to-markdown";

interface Props {
	plainTextOnly?: boolean;
}

interface State {
	changeLength: number;
	text: string;
	focused: boolean;
}

export default class Editor extends React.Component<Props, State> {
	static defaultProps: Props = {
		plainTextOnly: true
	};

	private _quillHostElement!: HTMLDivElement | null;
	private _quill?: Quill;
	private _quillStandardCssNames: string = "";

	constructor(props: Props) {
		super(props);
		this.state = {
			text: "",
			changeLength: 0,
			focused: false
		};
		this.rebinders();
	}

	private rebinders() {
		this.onQuillTextChange = this.onQuillTextChange.bind(this);
		this.onQuillSelectionChange = this.onQuillSelectionChange.bind(this);
		this.onQuillFocus = this.onQuillFocus.bind(this);
		this.onQuillBlur = this.onQuillBlur.bind(this);
		this.onQuillKeyUp = this.onQuillKeyUp.bind(this);
		this.onQuillMouseUp = this.onQuillMouseUp.bind(this);
		this.onQuillMouseDown = this.onQuillMouseDown.bind(this);
		this.onQuillMouseLeave = this.onQuillMouseLeave.bind(this);
		this.onQuillTouchEnd = this.onQuillTouchEnd.bind(this);
	}

	componentDidMount() {
		if (this._quillHostElement) {
			const options: QuillOptionsStatic = {
				modules: { ...this.getToolbar() },
				theme: "snow",
				placeholder: "Compose here"
			};
			if (this.props.plainTextOnly) {
				options.formats = [];
			}

			const quill = new Quill(this._quillHostElement, options);
			this._quill = quill;
			// rather than hardcoding the Quill Element CSS class names, grab them after they've
			// been set. they'll be used later in the control
			this._quillStandardCssNames = this._quillHostElement.getAttribute("class") || "";

			this.attachQuillEvents(quill);
		}
	}

	componentWillUnmount() {
		if (this._quill) {
			this._quill.disable();
			this.detachQuillEvents(this._quill);
		}
	}

	render() {
		const { focused, text } = this.state;

		return (
			<>
				<div
					className={`Editor ${this._quillStandardCssNames}${focused ? " infocus is-focused" : ""} `}
					ref={r => {
						this._quillHostElement = r;
					}}
				/>
				<div>{this.state.changeLength}</div>
				<pre>{text}</pre>
			</>
		);
	}

	private getToolbar() {
		if (this.props.plainTextOnly) {
			// it is necessary to return null to indicate no toolbar
			return {
				toolbar: null
			};
		}
		return {
			toolbar: [
				[{ header: [1, 2, false] }],
				["bold", "italic", "underline", "strike", "blockquote"],
				[{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
				["link", "image"],
				["clean"]
			]
		};
	}

	private onQuillKeyUp(ev: KeyboardEvent) {}
	private onQuillMouseUp(ev: MouseEvent) {}
	private onQuillMouseDown(ev: MouseEvent) {}
	private onQuillMouseLeave(ev: MouseEvent) {}
	private onQuillTouchEnd(ev: TouchEvent) {}
	private onQuillFocus(ev: FocusEvent) {
		this.setState({ focused: true });
	}
	private onQuillBlur(ev: FocusEvent) {
		this.setState({ focused: false });
	}

	private onQuillSelectionChange(range: RangeStatic, oldRange: RangeStatic, source: Sources): void {}

	private onQuillTextChange(delta: Delta, oldContents: Delta, source: String) {
		this.setState({
			changeLength: delta.changeLength(),
			text: this._quill ? toMarkdown(this._quill.getContents()) : ""
		});
	}

	private detachQuillEvents(quill: Quill): void {
		quill.off("text-change", this.onQuillTextChange);
		quill.off("selection-change", this.onQuillSelectionChange);
		const host = quill.root;
		host.removeEventListener("focus", this.onQuillFocus);
		host.removeEventListener("blur", this.onQuillBlur);
		host.removeEventListener("keyup", this.onQuillKeyUp);
		host.removeEventListener("mouseup", this.onQuillMouseUp);
		host.removeEventListener("mouseleave", this.onQuillMouseLeave);
		host.removeEventListener("mousedown", this.onQuillMouseDown);
		host.removeEventListener("touchend", this.onQuillTouchEnd);
	}

	private attachQuillEvents(quill: Quill): void {
		quill.on("text-change", this.onQuillTextChange);
		quill.on("selection-change", this.onQuillSelectionChange);

		const host = quill.root;
		host.addEventListener("focus", this.onQuillFocus);
		host.addEventListener("blur", this.onQuillBlur);
		host.addEventListener("keyup", this.onQuillKeyUp);
		host.addEventListener("mouseup", this.onQuillMouseUp);
		host.addEventListener("mouseleave", this.onQuillMouseLeave);
		host.addEventListener("mousedown", this.onQuillMouseDown);
		host.addEventListener("touchend", this.onQuillTouchEnd);
	}
}
