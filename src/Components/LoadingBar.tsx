function LoadingBar() {
	return (
		<div>
			<p className="text-white fs-3">Loading</p>
			<div className="progress">
				<div
					className="progress-bar progress-bar-striped progress-bar-animated"
					role="progressbar"
					aria-valuenow={75}
					aria-valuemin={0}
					aria-valuemax={100}
					style={{ width: "350px" }}
				/>
			</div>
		</div>
	);
}

export default LoadingBar;
