import History from '../helpers/history.js';

export default class Guide {
	constructor( parent, color ) {
		this.parent = parent;
		this.color = color;
		this.id = 'ionos-journey-guide';
		this.htmlElement = null;
		this.elements = null;
		this.currentIndex = 0;

		this.init();
	}

	init() {
		const guideContainer = document.createElement( 'DIV' );
		guideContainer.id = this.id;
		this.htmlElement = guideContainer;

		const page = document.createElement( 'DIV' );
		page.className = 'ionos-journey-guide-page';

		this.header = document.createElement( 'DIV' );
		this.header.className = 'ionos-journey-guide-header';

		this.stopButton = document.createElement( 'A' );
		this.stopButton.className = 'ionos-journey-button-stop';

		this.progressBar = document.createElement( 'DIV' );
		this.progressBar.className = 'ionos-journey-guide-progress';

		this.image = document.createElement( 'IMG' );
		this.image.className = 'ionos-journey-guide-image';

		this.autoplayBar = document.createElement( 'DIV' );
		this.autoplayBar.className = 'ionos-journey-guide-autoplay';

		this.header.append(
			this.stopButton,
			this.image,
			this.autoplayBar,
			this.progressBar
		);

		this.content = document.createElement( 'DIV' );
		this.content.className = 'ionos-journey-guide-content';

		this.headline = document.createElement( 'H1' );
		this.headline.className = 'ionos-journey-guide-headline';

		this.text = document.createElement( 'P' );
		this.text.className = 'ionos-journey-guide-text';

		this.content.append( this.headline, this.text );

		this.footer = document.createElement( 'DIV' );
		this.footer.className = 'ionos-journey-guide-footer';

		page.append( this.header, this.content );

		guideContainer.append( page, this.footer );
		this.parent.prepend( this.htmlElement );

		this.createNavigationBar();

		/* Array of functions to call on event */
		this.onUpperBoundaryReached = [];
		this.onLowerBoundaryReached = [];
		this.onStop = [];

		this.onUpdate = [];

		/* eslint-disable-next-line no-unused-vars */
		this.stopButton.addEventListener( 'click', ( e ) => {
			this.onStop.forEach( ( fn ) => {
				fn();
			} );
		} );
	}

	createAutoplayBar() {
		if ( this.autoplayBar !== null && this.autoplayBar !== undefined ) {
			this.header.removeChild( this.autoplayBar );
		}

		this.autoplayBar = document.createElement( 'div' );
		this.autoplayBar.className = 'ionos-journey-guide-autoplay';

		this.autoplayBarProgress = document.createElement( 'DIV' );
		this.autoplayBarProgress.className = 'progress-bar';
		this.autoplayBarProgress.style.background = this.color;

		this.autoplayBar.append( this.autoplayBarProgress );

		this.header.append( this.autoplayBar );
	}

	createNavigationBar() {
		const navBar = document.createElement( 'DIV' );
		navBar.id = 'ionos-journey-guide-navigation';

		this.nextButton = document.createElement( 'a' );
		this.nextButton.id = 'ionos-journey-bubble-next';
		if ( this.isLast && this.currentIndex === this.elements.length ) {
			this.nextButton.className = 'disabled';
		} else {
			this.nextButton.className = 'clickable-highlighted';
		}

		this.backButton = document.createElement( 'a' );
		this.backButton.id = 'ionos-journey-bubble-back';
		if ( History.get().length === 0 && this.currentIndex === 0 ) {
			this.backButton.className = 'disabled';
		} else {
			this.backButton.className = 'clickable-highlighted';
		}

		navBar.append( this.nextButton, this.backButton );
		this.footer.append( navBar );

		/* eslint-disable-next-line no-unused-vars */
		this.nextButton.addEventListener( 'click', ( e ) => {
			this.next();
			this.onUpdate.forEach( ( fn ) => {
				fn();
			} );
		} );

		/* eslint-disable-next-line no-unused-vars */
		this.backButton.addEventListener( 'click', ( e ) => {
			this.back();
			this.onUpdate.forEach( ( fn ) => {
				fn();
			} );
		} );
	}

	show( configItem, isLast ) {
		this.isLast = isLast;
		this.currentIndex = 0;

		this.htmlElement.style.visibility = 'visible';
		this.elements = configItem.children;

		if ( Object.keys( this.elements ).length > 0 ) {
			this.update();
		}

		this.htmlElement.style.opacity = '1';
	}

	hide() {
		this.htmlElement.style.opacity = '0';
		this.htmlElement.style.visibility = 'hidden';
	}

	createProgressBar() {
		this.header.removeChild( this.progressBar );

		const bar = document.createElement( 'UL' );
		bar.className = 'ionos-journey-guide-progress';

		Object.keys( this.elements ).forEach( ( index ) => {
			const barItem = document.createElement( 'LI' );
			const barItemButton = document.createElement( 'BUTTON' );
			const buttonImage =
				'<svg width="8" height="8" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false">' +
				'<circle cx="4" cy="4" r="4" fill=' +
				( parseInt( index ) === this.currentIndex
					? this.color
					: 'lightgray' ) +
				'></circle>' +
				'</svg>';

			barItemButton.className =
				'ionos-journey-guide-targeted components-button has-icon';
			barItemButton.setAttribute( 'data-index', index );

			barItemButton.innerHTML = buttonImage;
			barItem.append( barItemButton );

			barItemButton.addEventListener( 'click', ( e ) => {
				this.showIndex( e.currentTarget.getAttribute( 'data-index' ) );
				this.onUpdate.forEach( ( fn ) => {
					fn();
				} );
			} );
			bar.append( barItem );
		} );

		this.header.append( bar );
		this.progressBar = bar;
	}

	update() {
		const element = this.elements[ this.currentIndex ];
		this.image.src = element.imageUrl;

		this.headline.innerHTML = element.headline;
		this.text.innerHTML = element.htmlContent;

		if ( History.get().length === 0 && this.currentIndex === 0 ) {
			this.backButton.className = 'disabled';
		} else {
			this.backButton.className = 'clickable-highlighted';
		}

		if ( this.isLast && this.currentIndex === this.elements.length ) {
			this.nextButton.className = 'disabled';
		} else {
			this.nextButton.className = 'clickable-highlighted';
		}

		this.createAutoplayBar();
		this.createProgressBar();
	}

	showIndex( index ) {
		const i = Number.parseInt( index );
		if (
			i < Object.keys( this.elements ).length &&
			i !== this.currentIndex
		) {
			this.currentIndex = i;
			this.update();
		}
	}

	next() {
		if ( this.currentIndex + 1 < Object.keys( this.elements ).length ) {
			this.currentIndex++;
			this.update();
			return true;
		}
		this.onUpperBoundaryReached.forEach( ( fn ) => {
			fn();
		} );
		return false;
	}

	back() {
		if ( this.currentIndex > 0 ) {
			this.currentIndex--;
			this.update();
		} else {
			this.onLowerBoundaryReached.forEach( ( fn ) => {
				fn();
			} );
		}
	}

	showAutoplayBar( timeout ) {
		this.autoplayBar.style.visibility = 'visible';
		this.autoplayBar.style.opacity = '1';

		this.autoplayBarProgress.style.animation =
			'progress-animation ' + timeout / 1000 + 's ease-in-out';
		this.autoplayBarProgress.style.width = '100%';
	}

	targeted() {}
}
