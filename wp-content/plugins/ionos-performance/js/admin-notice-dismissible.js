/* eslint-disable */
( function ( $ ) {
	'use strict';
	$( function () {
		$( 'div[data-dismissible].is-dismissible' ).on(
			'click',
			'.notice-dismiss',
			function ( event, el ) {
				const $notice = $( this ).parent( '.notice.is-dismissible' );
				const dismiss_option = $notice.attr( 'data-dismissible' );
				if ( dismiss_option ) {
					const data = {
						action: 'ionos_perfomance_dismiss_admin_notice',
						option_name: dismiss_option,
					};
					$.post( ajaxurl, data );
				}
			}
		);
	} );
} )( jQuery );
