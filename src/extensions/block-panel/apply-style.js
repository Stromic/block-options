/**
 * External dependencies
 */
import { find } from 'lodash';

function applyStyle( attributes, blockName, props = {} ) {
	const {
		fontSizes,
		colors,
	} = props;

	const {
		editorskit,
		textColor,
		customTextColor,
		backgroundColor,
		bulletColor,
		fontSize,
		customFontSize,
		start,
	} = attributes;

	const style = {};

	if ( typeof fontSize !== 'undefined' ) {
		const fontSizeObject = find( fontSizes, { slug: fontSize } );
		if ( typeof fontSizeObject !== 'undefined' && typeof fontSizeObject.size !== 'undefined' ) {
			style.fontSize = fontSizeObject.size;
		}
	} else if ( typeof customFontSize !== 'undefined' ) {
		style.fontSize = customFontSize;
	}

	if ( typeof textColor !== 'undefined' ) {
		if ( typeof colors !== 'undefined' ) {
			const textColorValue = find( colors, { slug: textColor } );
			if ( typeof textColorValue !== 'undefined' && typeof textColorValue.color !== 'undefined' ) {
				style.color = textColorValue.color;
			}
		}
	} else if ( typeof customTextColor !== 'undefined' ) {
		style.color = customTextColor;
	}

	if ( typeof bulletColor !== 'undefined' ) {
		style[ '--ek-bullet-color' ] = bulletColor;

		if ( [ 'core/list' ].includes( blockName ) ) {
			if ( typeof start !== 'undefined' ) {
				style[ '--li-start' ] = ( start - 1 ) + '';
			}
		}
	}

	if ( typeof editorskit.indent !== 'undefined' ) {
		style[ '--ek-indent' ] = editorskit.indent + 'px';
	}

	return style;
}

export default applyStyle;
