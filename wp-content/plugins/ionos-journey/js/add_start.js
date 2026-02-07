class StartButton {
	constructor( label ) {
		this.label = label;

		this.toolbar = document.body.querySelector(
			'#wp-admin-bar-top-secondary'
		);
		this.checkMediaQuery(
			'min-width: 992px',
			[
				() => {
					this.addButton();
				},
			],
			[
				() => {
					this.removeButton();
				},
			]
		);
	}

	removeButton() {
		if ( this.button !== undefined ) this.button.remove();
	}

	/**
	 * Add start button to the admin bar
	 */
	addButton() {
		this.button = this.createButton(
			'journey-start',
			'ionos-journey-container'
		);
		this.button.addEventListener( 'click', () => {
			const url = new URL( window.location );
			url.searchParams.append( 'wp_tour', 'started' );
			window.history.pushState( {}, '', url );

			location.reload();
		} );
	}

	checkMediaQuery( mediaQuery, onMatch = [], onNotMatch = [] ) {
		const mql = window.matchMedia( '(' + mediaQuery + ')' );
		let matching = mql.matches;
		// Execute onMatch when screen is matching at the beginning
		if ( matching ) {
			onMatch.forEach( ( fn ) => {
				fn();
			} );
		}
		mql.addEventListener( 'change', ( event ) => {
			if ( event.matches && ! matching ) {
				matching = event.matches;
				onMatch.forEach( ( fn ) => {
					fn();
				} );
			} else if ( matching ) {
				matching = event.matches;
				onNotMatch.forEach( ( fn ) => {
					fn();
				} );
			}
		} );
	}

	/**
	 * Button creation function
	 *
	 * @param {string} id
	 * @param {string} containerClass
	 */
	createButton( id, containerClass ) {
		const container = document.createElement( 'LI' );
		container.classList.add( containerClass );

		const button = document.createElement( 'A' );
		button.id = id;
		button.classList.add( 'ab-item' );
		button.href = '#';

		this.toolbar.appendChild( container );
		container.appendChild( button );
		button.appendChild( this.addSpan( '', 'ab-icon' ) );
		button.appendChild( this.addSpan( this.label, 'ab-label' ) );

		return button;
	}

	/**
	 * Span creation function
	 *
	 * @param {string} label
	 * @param {string} className
	 */
	addSpan( label, className ) {
		const span = document.createElement( 'SPAN' );
		span.classList.add( className );
		span.innerText = label;
		return span;
	}
}

if ( ! IONOS.wp.journey.label === false ) {
	new StartButton( IONOS.wp.journey.label );
}
