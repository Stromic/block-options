/**
 * External dependencies
 */
import classnames from 'classnames';
import has from 'lodash';

/**
 * WordPress Dependencies
 */
const { addFilter } = wp.hooks;
const { Fragment } = wp.element;
const { createHigherOrderComponent } = wp.compose;
const { hasBlockSupport } = wp.blocks;

const restrictedBlocks = [ 'core/freeform', 'core/shortcode', 'core/nextpage' ];
const blocksWithLinkToolbar = [ 'core/group', 'core/column', 'core/cover' ];

/**
 * Filters registered block settings, extending attributes with anchor using ID
 * of the first node.
 *
 * @param {Object} settings Original block settings.
 *
 * @return {Object} Filtered block settings.
 */
function addAttributes( settings ) {
	if ( typeof settings.attributes !== 'undefined' && ! restrictedBlocks.includes( settings.name ) ) {
		settings.attributes = Object.assign( settings.attributes, {
			editorskit: {
				type: 'object',
				default: {
					devices: false,
					desktop: true,
					tablet: true,
					mobile: true,
					loggedin: true,
					loggedout: true,
					acf_visibility: '',
					acf_field: '',
					acf_condition: '',
					acf_value: '',
					migrated: false,
					unit_test: false,
				},
			},
		} );

		// for version 1 compatibility and migration.
		settings.attributes = Object.assign( settings.attributes, {
			blockOpts: { type: 'object' },
		} );

		// Add LinkToolbar Support
		if ( blocksWithLinkToolbar.includes( settings.name ) || hasBlockSupport( settings, 'editorsKitLinkToolbar' ) ) {
			if ( typeof settings.attributes !== 'undefined' ) {
				settings.attributes = Object.assign( settings.attributes, {
					href: {
						type: 'string',
					},
					linkDestination: {
						type: 'string',
						default: 'none',
					},
					opensInNewTab: {
						type: 'boolean',
						default: false,
					},
					linkNoFollow: {
						type: 'boolean',
						default: false,
					},
					linkSponsored: {
						type: 'boolean',
						default: false,
					},
					hasAnimation: {
						type: 'boolean',
						default: false,
					},
				} );
			}
		}
	}

	return settings;
}

/**
 * Add custom EditorsKit attributes to selected blocks
 *
 * @param {Function} BlockEdit Original component.
 * @return {string} Wrapped component.
 */
const withAttributes = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const {
			attributes,
		} = props;

		if ( typeof attributes.editorskit === 'undefined' ) {
			attributes.editorskit = [];
		}

		return (
			<Fragment>
				<BlockEdit { ...props } />
			</Fragment>
		);
	};
}, 'withAttributes' );

/**
 * Override props assigned to save component to inject atttributes
 *
 * @param {Object} extraProps Additional props applied to save element.
 * @param {Object} blockType  Block type.
 * @param {Object} attributes Current block attributes.
 *
 * @return {Object} Filtered props applied to save element.
 */
function applyExtraClass( extraProps, blockType, attributes ) {
	const {
		href,
	} = attributes;


	if (
		( blocksWithLinkToolbar.includes( blockType.name ) ||
			hasBlockSupport( blockType.name, 'editorsKitLinkToolbar' ) ) &&
		typeof href !== 'undefined' &&
		href
	) {
		extraProps.className = classnames( extraProps.className, 'ek-linked-block' );
	}

	return extraProps;
}

const addEditorBlockAttributes = createHigherOrderComponent( ( BlockListBlock ) => {
	return ( props ) => {
		const { name, attributes } = props;
		const { isHeightFullScreen, isFullWidth } = attributes;

		let wrapperProps 	= props.wrapperProps;
		let customData 	 	= {};

		wrapperProps = {
			...wrapperProps,
			...customData,
		};

		return <BlockListBlock { ...props } wrapperProps={ wrapperProps } />;
	};
}, 'addEditorBlockAttributes' );

addFilter(
	'blocks.registerBlockType',
	'editorskit/custom/attributes',
	addAttributes
);

addFilter(
	'editor.BlockEdit',
	'editorskit/attributes',
	withAttributes
);

addFilter(
	'blocks.getSaveContent.extraProps',
	'editorskit/applyExtraClass',
	applyExtraClass
);

addFilter(
	'editor.BlockListBlock',
	'editorskit/addEditorBlockAttributes',
	addEditorBlockAttributes
);
