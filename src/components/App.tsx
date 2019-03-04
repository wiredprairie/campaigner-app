import React from "react";
import "../style/main.scss";
import Editor from "./Editor";

export default function App() {
	return (
		<div>
			<div className="field">
				<label className="label">Name</label>
				<div className="control">
					<input className="input" type="text" placeholder="Text input" />
				</div>
			</div>
			<button className="button is-primary">Click!</button>
			<h2>Plain Text</h2>
			<Editor />
			<h2>Rich text</h2>
			<Editor plainTextOnly={false} />
		</div>
	);
}
