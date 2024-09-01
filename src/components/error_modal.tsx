interface Props{
	title: string,
	content: string,
	visible: boolean
}


function ErrorPopup({title, visible, content}: Props) {
	return (
		<div
			className="modal fade"
			id="exampleModal"
			tabIndex={visible ? 1 : -1}
			role="dialog"
			aria-labelledby={title}
			aria-hidden={visible ? "true" : "false"}
		>
			<div className="modal-dialog" role="document">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">
							{title}
						</h5>
						<button
							type="button"
							className="close"
							data-dismiss="modal"
							aria-label="Close"
						>
							<span aria-hidden={visible? "true": "false"}>×</span>
						</button>
					</div>
					<div className="modal-body">{content}</div>
					<div className="modal-footer">
						<button
							type="button"
							className="btn btn-secondary"
							data-dismiss="modal"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ErrorPopup;
