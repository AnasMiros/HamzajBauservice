import History from './helpers/history.js';
import Bubble from './parts/bubble.js';
import Focus from './parts/focus.js';
import Guide from './parts/guide.js';
import Overlay from './parts/overlay.js';
import UrlHelper from './helpers/url-helper.js';
import Helper from './helpers/helper.js';
import Navigation from './parts/navigation.js';
import ConfigParser from './parts/config-parser.js';
import ProgressPopup from './parts/progress-popup.js';
import Autoplay from './parts/autoplay.js';
import Progress from './helpers/progress.js';

export default class Player {
	constructor( config, progress, userId, trans, colors ) {
		Progress.init( progress, userId );

		this.translations = JSON.parse( trans );
		this.urlParams = UrlHelper.getAllParams();
		this.configParser = new ConfigParser( config );
		this.colors = colors;

		Helper.checkMediaQuery(
			'min-width: 992px',
			[
				() => {
					this.initialize();
				},
			],
			[
				() => {
					this.stop();
				},
			]
		);
	}

	initialize() {
		this.overlay = new Overlay();
		this.overlay.onClick.push( () => {
			document
				.querySelectorAll( '.clickable-highlighted' )
				.forEach( ( element ) => {
					element.className = 'clickable-highlighted active';
					setTimeout( () => {
						element.className = 'clickable-highlighted';
					}, 500 );
				} );
		} );

		this.navigation = new Navigation();
		this.navigation.onEnter.push( () => {
			this.click();
		} );
		this.navigation.onNext.push( () => {
			this.next();
		} );
		this.navigation.onPrev.push( () => {
			this.prev();
		} );
		this.navigation.onStop.push( () => {
			this.stop();
		} );
		this.navigation.onAuto.push( () => {
			this.auto();
		} );

		Helper.disableScrolling();

		if ( UrlHelper.getParam( 'tour_index' ) ) {
			this.configParser.currentIndex = parseInt(
				UrlHelper.getParam( 'tour_index' )
			);
			setTimeout( () => {
				this.start();
			}, 5 );
		} else if ( History.get().length === 0 && Progress.get().length > 0 ) {
			// Ask for restart or continue of the tour
			const popup = new ProgressPopup(
				this.overlay,
				this.translations.modal
			);

			popup.onAccept.push( () => {
				History.store( Progress.get() );
				popup.hide();

				if ( History.getLast().pageName !== UrlHelper.getPageName() ) {
					UrlHelper.redirectToPage(
						History.getLast().pageName,
						History.getLast().urlParams
					);
				} else {
					setTimeout( () => {
						this.start();
					}, 5 );
				}
			} );

			popup.onDeny.push( () => {
				Progress.clear();
				popup.hide();
				this.start();
			} );

			popup.onCancel.push( () => {
				this.stop( false );
			} );

			popup.show();
		} else {
			setTimeout( () => {
				this.start();
			}, 5 );
		}
	}

	/*
	 * Start the tour after construction
	 */
	start() {
		this.focus = new Focus( this.overlay.getHtmlElement() );
		this.focus.onClick.push( () => {
			this.click();
		} );

		this.guide = new Guide(
			this.overlay.getHtmlElement(),
			JSON.parse( this.colors ).colors[ 2 ]
		);
		this.guide.onUpperBoundaryReached.push( () => {
			this.next();
		} );
		this.guide.onLowerBoundaryReached.push( () => {
			this.prev();
		} );
		this.guide.onStop.push( () => {
			this.stop();
		} );

		this.bubble = new Bubble(
			this.overlay.getHtmlElement(),
			this.focus,
			JSON.parse( this.colors ).colors[ 2 ]
		);
		this.bubble.onNext.push( () => {
			this.next();
		} );
		this.bubble.onPrev.push( () => {
			this.prev();
		} );
		this.bubble.onStop.push( () => {
			this.stop();
		} );

		this.autoplay = new Autoplay( this );

		this.configParser.loadHistory();
		this.step();
	}

	/*
	 * Simulate an click on the current element
	 * + Only when it should be clickable
	 */
	click() {
		if ( this.updating ) return;

		if ( this.current !== undefined && this.current.isClickable ) {
			const currentElement = document.body.querySelector(
				this.current.htmlSelector + ' a'
			);
			Progress.store( History.get() );
			if ( currentElement !== null ) {
				const pageName =
					currentElement.href.split( '/' ).pop() || 'index.php';
				UrlHelper.redirectToPage( pageName, {} );
			} else {
				/* eslint-disable-next-line no-shadow */
				const currentElement = document.body.querySelector(
					this.current.htmlSelector
				);
				if ( currentElement !== null ) {
					const pageName =
						currentElement.href.split( '/' ).pop() || 'index.php';
					UrlHelper.redirectToPage( pageName, {} );
				}
			}
		} else if ( ! this.current.isClickable ) {
			document
				.querySelectorAll( '.clickable-highlighted' )
				.forEach( ( element ) => {
					element.className = 'clickable-highlighted active';
					setTimeout( () => {
						element.className = 'clickable-highlighted';
					}, 500 );
				} );
		}
	}

	// Sopping the tour
	stop( saveProgress = true ) {
		Helper.enableScrolling();

		UrlHelper.deleteParam( 'wp_tour' );
		if ( UrlHelper.getParam( 'autoplay' ) !== null ) {
			UrlHelper.deleteParam( 'autoplay' );
		}
		if ( UrlHelper.getParam( 'tour_index' ) !== null ) {
			UrlHelper.deleteParam( 'tour_index' );
		}

		this.configParser.next();
		History.clear( saveProgress );

		location.reload();
	}

	// Forwards -> Tour Navigation
	next() {
		if ( this.updating ) return;

		if ( UrlHelper.getParam( 'tour_index' ) ) {
			UrlHelper.deleteParam( 'tour_index' );
		}
		if ( this.current.type === 'guide' ) {
			if (
				this.guide.currentIndex <
				Object.keys( this.guide.elements ).length - 1
			) {
				this.guide.next();
				return;
			}
		}
		const next = this.configParser.next();
		if (
			next === null &&
			History.getFirst() !== null &&
			History.getFirst().pageName === UrlHelper.getPageName()
		) {
			this.stop( true );
		} else if ( next !== null && this.current.type !== 'redirect' ) {
			this.step();
		}
	}

	// Backwards -> Tour Navigation
	prev() {
		if ( this.updating ) return;

		if ( this.current.type === 'guide' ) {
			if ( this.guide.currentIndex > 0 ) {
				this.guide.back();
				return;
			}
		}

		if ( this.configParser.prev() !== null ) {
			this.step();
		}
	}

	/*
	 * Enables/Disables the autoplay
	 */
	auto() {
		this.autoplay.switch();
	}

	/*
	 * Function for updating everything on back and forward
	 */
	step() {
		if ( this.current !== undefined && this.current.type !== 'guide' ) {
			this.bubble.hide();
		}

		this.current = this.configParser.current();
		if ( this.tryRedirect() ) return;

		if ( this.current.type !== 'guide' ) {
			this.guide.hide();
		} else {
			this.bubble.hide();
		}

		this.updateFocus( () => {
			this.focus.move(
				this.currentRect.x,
				this.currentRect.y,
				this.currentRect.width,
				this.currentRect.height,
				() => {
					if ( this.current.type === 'guide' ) {
						this.guide.show(
							this.current,
							Helper.isLastStep(
								this.configParser.currentIndex,
								this.configParser.maxIndex
							)
						);
					} else {
						if ( this.current.isClickable ) {
							this.focus.addAnimation();
						}
						this.bubble.show(
							this.current,
							Helper.isLastStep(
								this.configParser.currentIndex,
								this.configParser.maxIndex
							)
						);
					}
					this.updating = false;
					this.autoplay.start();
				}
			);
		} );
	}

	/*
	 * Implementation for page redirects
	 */
	tryRedirect() {
		if ( this.current.type === 'redirect' ) {
			if (
				( History.getFirst() !== null &&
					History.getFirst().pageName !== UrlHelper.getPageName() ) ||
				History.getFirst() === null
			) {
				const params = this.current.urlParams || {};
				if ( UrlHelper.getParam( 'autoplay' ) !== null ) {
					params.autoplay = 'enabled';
				}

				Progress.store( History.get() );
				UrlHelper.redirectToPage( this.current.page, params );
			} else {
				this.stop( false );
			}
			return true;
		}
		return false;
	}

	/*
	 * Function for moving the focus to the current element
	 */
	updateFocus( callback = null ) {
		this.updating = true;
		this.focus.rmvAnimation();

		const currentElement = document.body.querySelector(
			this.current.type === 'guide'
				? '#ionos-journey-guide'
				: this.current.htmlSelector
		);

		if ( currentElement === null ) {
			this.next();
			return;
		}

		this.currentRect = currentElement.getBoundingClientRect();
		const vpPosition = Helper.isInViewport( currentElement );
		if ( vpPosition !== 'VISIBLE' ) {
			if ( vpPosition === 'ABOVE' ) {
				this.focus.moveToBottom();
			} else if ( vpPosition === 'BELOW' ) {
				this.focus.moveToTop();
			}

			Helper.scrollToElement( currentElement, () => {
				this.currentRect = currentElement.getBoundingClientRect();

				if ( this.current.type === 'guide' ) {
					this.focus.setColor( 'transparent' );
				} else {
					this.focus.setColor(
						JSON.parse( this.colors ).colors[ 2 ]
					);
				}

				if ( callback !== null ) callback();
			} );
			return;
		}
		if ( this.current.type === 'guide' ) {
			this.focus.setColor( 'transparent' );
		} else {
			this.focus.setColor( JSON.parse( this.colors ).colors[ 2 ] );
		}
		if ( callback !== null ) callback();
	}
}

if (
	! IONOS === false &&
	! IONOS.wp === false &&
	! IONOS.wp.journey === false
) {
	const player = new Player(
		IONOS.wp.journey.config,
		IONOS.wp.journey.progress,
		IONOS.wp.journey.id,
		IONOS.wp.journey.language,
		IONOS.wp.journey.color
	);
	window.player = player;
}
