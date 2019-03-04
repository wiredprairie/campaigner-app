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
			<Editor />
		</div>
	);
}
