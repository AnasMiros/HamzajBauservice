import UrlHelper from '../helpers/url-helper.js';

export default class Navigation {
	constructor() {
		this.parentSelector = '#wp-admin-bar-top-secondary';
		this.parent = document.querySelector( this.parentSelector );
		if ( this.parent !== null ) {
			this.createNavigation();
			this.registerClickEvent();
			this.registerKeyEvent();
		}

		/* Array of functions to call on event */
		this.onNext = [];
		this.onPrev = [];
		this.onStop = [];
		this.onAuto = [];
		this.onEnter = [];
	}

	getHtmlElement() {
		return document.querySelector();
	}

	createNavigation() {
		this.prevButton = this.createButton( 'journey-prev' );
		this.stopButton = this.createButton( 'journey-stop' );
		this.autoButton = this.createButton( 'journey-auto' );
		if ( UrlHelper.getParam( 'autoplay' ) !== null ) {
			this.autoButton.children[ 0 ].id = 'journey-auto-active';
		}

		this.nextButton = this.createButton( 'journey-next' );
		this.parent.append(
			this.nextButton,
			this.autoButton,
			this.stopButton,
			this.prevButton
		);
	}

	createStartButton() {
		this.startButton = this.createButton(
			'journey-start',
			'IONOS Group Journey'
		);
		this.parent.append( this.startButton );
	}

	createButton( id, text = '' ) {
		const anchor = document.createElement( 'A' );
		anchor.id = id;
		anchor.classList.add( 'ab-item' );

		// anchor.href = '#';
		const iconSpan = document.createElement( 'SPAN' );
		iconSpan.classList.add( 'ab-icon' );

		const labelSpan = document.createElement( 'SPAN' );
		labelSpan.classList.add( 'ab-label' );
		labelSpan.innerText = text;
		anchor.append( iconSpan, labelSpan );

		const button = document.createElement( 'LI' );
		button.classList.add( 'ionos-journey-container' );
		button.append( anchor );

		return button;
	}

	registerClickEvent() {
		this.prevButton.addEventListener( 'click', () => {
			this.prev();
		} );
		this.stopButton.addEventListener( 'click', () => {
			this.stop();
		} );
		this.nextButton.addEventListener( 'click', () => {
			this.next();
		} );
		this.autoButton.addEventListener( 'click', () => {
			this.onAuto.forEach( ( fn ) => {
				fn();
			} );
		} );
	}

	registerKeyEvent() {
		window.onkeyup = ( e ) => {
			if ( e.defaultPrevented ) {
				return; // We could also stop the propagation of this event
			}

			e.preventDefault();
			e.stopPropagation();
			switch ( e.key ) {
				case 'ArrowRight':
					if ( ! this.nextButton.classList.contains( 'wait' ) ) {
						this.next();
					}
					break;
				case 'ArrowLeft':
					if ( ! this.nextButton.classList.contains( 'wait' ) ) {
						this.prev();
					}
					break;
				case 'Escape':
					this.stop();
					break;
				case 'Enter': {
					this.enter();
					break;
				}
			}
		};
	}

	next() {
		this.onNext.forEach( ( fn ) => {
			fn();
		} );
	}

	stop() {
		this.onStop.forEach( ( fn ) => {
			fn();
		} );
	}

	prev() {
		this.onPrev.forEach( ( fn ) => {
			fn();
		} );
	}

	enter() {
		this.onEnter.forEach( ( fn ) => {
			fn();
		} );
	}
}
