import React, { useEffect } from 'react';

export function scrollToTop() {
	window.scrollTo({
		top: 0,
		left: 0,
		behavior: 'smooth'
	});
}

export function ScrollHandler() {
	useEffect(() => {
		window.addEventListener('scroll', scrollListener);
	}, []);
	return (
		<>
			<img id="totop" alt="go to page top" onClick={scrollToTop} src="/assets/up-arrow.svg" />
		</>
	);
}

function scrollListener() {
	const y = document.documentElement.scrollTop;
	const h = document.documentElement.clientHeight;
	const top_btn = document.getElementById('totop');
	if (y > h / 2) {
		top_btn.classList.add('slide-in');
	}
	else {
		top_btn.classList.remove('slide-in');
	}
}