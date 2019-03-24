import React, { useRef } from "react";
import { createPortal } from "react-dom";


export const IFrame = ({ children, ...props }: { children?: React.ReactNode }) => {
	const contentRef = useRef<HTMLIFrameElement>(null);
	const mountNode =
		contentRef &&
		contentRef.current &&
		contentRef.current.contentWindow &&
		contentRef.current.contentWindow.document.body;

	return (
		<iframe {...props} ref={contentRef} sandbox={"allow-same-origin"}>
			{mountNode && createPortal(React.Children.only(children), mountNode)}
		</iframe>
	);
};

// https://www.html5rocks.com/en/tutorials/security/sandboxed-iframes/