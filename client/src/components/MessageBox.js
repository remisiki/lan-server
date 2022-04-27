export function MessageBox({text}) {
	return (
		<div id="message-box" className="float">
			{text}
		</div>
	);
}

export function toggleMessageBox(text = "", duration = 2000) {
	const message_box = document.getElementById('message-box');
	message_box.innerText = text;
	message_box.classList.add('slide-in');
	setTimeout(() => {
		message_box.classList.remove('slide-in');
	}, duration);
}