document.addEventListener('DOMContentLoaded', function () {
	document
		.querySelectorAll('.ionos-blueprint-slide-up-down')
		.forEach((silderUpDown) => {
			silderUpDown.addEventListener('click', function () {
				document
					.querySelector(silderUpDown.dataset.target)
					.classList.toggle('slided-up');
			});
		});

	document
		.querySelectorAll('[data-parent]')
		.forEach((element) => {
			element.addEventListener('click', function () {
				if(this.checked == true){
					document.getElementById(element.dataset.parent).checked = true;
					document.getElementById(element.dataset.parent).setAttribute('disabled', '');
				} else {
					document.getElementById(element.dataset.parent).removeAttribute('disabled');
				}
			});

			const hint = document.createElement("span");
			hint.classList.add("hint");;
			hint.innerText = ionosBlueprint.messages.parent_theme;
			document.querySelector('[for=' + element.dataset.parent + ']').appendChild(hint);
		});

	document
		.querySelector('#ionos-blueprint-generate')
		.addEventListener('submit', function (event) {
			event.preventDefault();

			const formData = new FormData(
				document.querySelector('#ionos-blueprint-generate')
			);
			const payload = {
				all_themes: formData.has('all-themes'),
				themes: formData.getAll('theme'),
				all_plugins: formData.has('all-plugins'),
				plugins: formData.getAll('plugin'),
			};

			// eslint-disable-next-line no-undef
			fetch(ionosBlueprint.ajax_url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body:
					'action=ionos-blueprint-generate&nonce=' +
					ionosBlueprint.nonce + // eslint-disable-line no-undef
					'&payload=' +
					JSON.stringify(payload),
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error(ionosBlueprint.messages.error); // eslint-disable-line no-undef
					}

					return response.text();
				})
				.then((data) => {
					const link = document.createElement('a');
					link.download = 'blueprint.json';
					link.href = 'data:application/text;base64,' + btoa(data);
					link.click();
				})
				.catch((error) => {
					alert(error); // eslint-disable-line no-alert
				});
		});
});
