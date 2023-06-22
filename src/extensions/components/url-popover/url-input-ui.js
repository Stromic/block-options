/**
 * WordPress dependencies
 */
const { __ } = wp.i18n;
const { useRef, useState, useCallback, Fragment } = wp.element;
const {
	Button,
	ToggleControl,
} = wp.components;
const { URLPopover } = wp.blockEditor;
const { LEFT, RIGHT, UP, DOWN, BACKSPACE, ENTER } = wp.keycodes;

const URLInputUI = ( {
	onChangeUrl,
	url,
	opensInNewTab,
	linkNoFollow,
	linkSponsored,
	hasAnimation,
} ) => {
	const [ isOpen, setIsOpen ] = useState( false );
	const openLinkUI = useCallback( () => {
		setIsOpen( true );
	} );

	const [ isEditingLink, setIsEditingLink ] = useState( false );
	const [ urlInput, setUrlInput ] = useState( null );

	const autocompleteRef = useRef( null );

	const stopPropagation = ( event ) => {
		event.stopPropagation();
	};

	const stopPropagationRelevantKeys = ( event ) => {
		if ( [ LEFT, DOWN, RIGHT, UP, BACKSPACE, ENTER ].indexOf( event.keyCode ) > -1 ) {
			// Stop the key event from propagating up to ObserveTyping.startTypingInTextField.
			event.stopPropagation();
		}
	};

	const startEditLink = useCallback( () => {
		setIsEditingLink( true );
	} );

	const stopEditLink = useCallback( () => {
		setIsEditingLink( false );
	} );

	const closeLinkUI = useCallback( () => {
		setUrlInput( null );
		stopEditLink();
		setIsOpen( false );
	} );

	const onFocusOutside = useCallback( () => {
		return ( event ) => {
			// The autocomplete suggestions list renders in a separate popover (in a portal),
			// so onFocusOutside fails to detect that a click on a suggestion occurred in the
			// LinkContainer. Detect clicks on autocomplete suggestions using a ref here, and
			// return to avoid the popover being closed.
			const autocompleteElement = autocompleteRef.current;
			if ( autocompleteElement && autocompleteElement.contains( event.target ) ) {
				return;
			}
			setIsOpen( false );
			setUrlInput( null );
			stopEditLink();
		};
	} );

	const onSubmitLinkChange = useCallback( () => {
		return ( event ) => {
			if ( urlInput ) {
				onChangeUrl( { href: urlInput } );
			}
			stopEditLink();
			setUrlInput( null );
			event.preventDefault();
		};
	} );

	const onLinkRemove = useCallback( () => {
		onChangeUrl( {
			href: '',
		} );
	} );

	const onSetNewTab = ( value ) => {
		onChangeUrl( { opensInNewTab: value } );
	};

	const onSetLinkNoFollow = ( value ) => {
		onChangeUrl( { linkNoFollow: value } );
	};

	const onSetLinkSponsored = ( value ) => {
		onChangeUrl( { linkSponsored: value } );
	};

	const onSetLinkAnimation = ( value ) => {
		onChangeUrl( { hasAnimation: value } );
	};

	const advancedOptions = (
		<>
			<ToggleControl
				label={ __( 'Open in New Tab', 'block-options' ) }
				onChange={ onSetNewTab }
				checked={ opensInNewTab }
			/>
			<ToggleControl
				label={ __( 'No Follow', 'block-options' ) }
				onChange={ onSetLinkNoFollow }
				checked={ linkNoFollow }
			/>
			<ToggleControl
				label={ __( 'Sponsored', 'block-options' ) }
				onChange={ onSetLinkSponsored }
				checked={ linkSponsored }
			/>
			<ToggleControl
				label={ __( 'Hover Animation', 'block-options' ) }
				onChange={ onSetLinkAnimation }
				checked={ hasAnimation }
			/>
		</>
	);

	const linkEditorValue = urlInput !== null ? urlInput : url;

	return (
		<Fragment>
			<Button
				icon={ () => (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
					<path d="M15.6 7.2H14v1.5h1.6c2 0 3.7 1.7 3.7 3.7s-1.7 3.7-3.7 3.7H14v1.5h1.6c2.8 0 5.2-2.3 5.2-5.2 0-2.9-2.3-5.2-5.2-5.2zM4.7 12.4c0-2 1.7-3.7 3.7-3.7H10V7.2H8.4c-2.9 0-5.2 2.3-5.2 5.2 0 2.9 2.3 5.2 5.2 5.2H10v-1.5H8.4c-2 0-3.7-1.7-3.7-3.7zm4.6.9h5.3v-1.5H9.3v1.5z"/>
				</svg>
				) }
				className="components-toolbar__control"
				label={
					url ?
						__( 'Edit link', 'block-options' ) :
						__( 'Insert link', 'block-options' )
				}
				aria-expanded={ isOpen }
				onClick={ openLinkUI }
			/>
			{ isOpen && (
				<URLPopover
					onFocusOutside={ onFocusOutside() }
					onClose={ closeLinkUI }
					renderSettings={ () => advancedOptions }
				>
					{ ( ! url || isEditingLink ) && (
						<URLPopover.LinkEditor
							className="block-editor-format-toolbar__link-container-content"
							value={ linkEditorValue }
							onChangeInputValue={ setUrlInput }
							onKeyDown={ stopPropagationRelevantKeys }
							onKeyPress={ stopPropagation }
							onSubmit={ onSubmitLinkChange() }
							autocompleteRef={ autocompleteRef }
						/>
					) }
					{ url && ! isEditingLink && (
						<>
							<URLPopover.LinkViewer
								className="block-editor-format-toolbar__link-container-content"
								onKeyPress={ stopPropagation }
								url={ url }
								onEditLinkClick={ startEditLink }
							/>
							<Button
								icon="no"
								label={ __( 'Remove link', 'block-options' ) }
								onClick={ onLinkRemove }
							/>
						</>
					) }
				</URLPopover>
			) }
		</Fragment>
	);
};

export default URLInputUI;
