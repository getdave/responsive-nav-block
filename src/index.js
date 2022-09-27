import { createHigherOrderComponent } from "@wordpress/compose";
import {
	PanelBody,
	ToggleControl,
	Button,
	Notice,
} from "@wordpress/components";
import { InspectorControls } from "@wordpress/block-editor";
import { addFilter } from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";
import classnames from "classnames";

// /**
//  * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
//  * All files containing `style` keyword are bundled together. The code used
//  * gets applied both to the front of your site and to the editor.
//  *
//  * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
//  */
import "./style.scss";

const withInspectorControls = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { name, attributes, setAttributes } = props;

		if (name !== "core/navigation") {
			return <BlockEdit {...props} />;
		}

		const { hideOnMobile, hideOnTablet, hideOnDesktop } = attributes;

		const isAllHidden = hideOnMobile && hideOnTablet && hideOnDesktop;

		function resetAll() {
			setAttributes({
				hideOnMobile: false,
				hideOnTablet: false,
				hideOnDesktop: false,
			});
		}

		return (
			<>
				<BlockEdit {...props} />
				<InspectorControls>
					<PanelBody
						icon="mobile"
						title={__("Responsive", "getdave/responsive-nav-block")}
					>
						<ToggleControl
							checked={hideOnMobile}
							label={__("Hide on mobile", "getdave/responsive-nav-block")}
							onChange={() => setAttributes({ hideOnMobile: !hideOnMobile })}
						/>
						<ToggleControl
							checked={hideOnTablet}
							label={__("Hide on tablet", "getdave/responsive-nav-block")}
							onChange={() => setAttributes({ hideOnTablet: !hideOnTablet })}
						/>
						<ToggleControl
							checked={hideOnDesktop}
							label={__("Hide on desktop", "getdave/responsive-nav-block")}
							onChange={() => setAttributes({ hideOnDesktop: !hideOnDesktop })}
						/>
						<Button onClick={resetAll} isTertiary>
							Reset
						</Button>

						{isAllHidden && (
							<Notice status="warning" isDismissible={false}>
								{__("Your block will currently be hidden at all screen sizes.")}
							</Notice>
						)}
					</PanelBody>
				</InspectorControls>
			</>
		);
	};
}, "withInspectorControl");

const addResponsiveAttributes = (settings) => {
	settings.attributes = {
		...settings.attributes,
		hideOnMobile: {
			type: "boolean",
			default: false,
		},
		hideOnTablet: {
			type: "boolean",
			default: false,
		},

		hideOnDesktop: {
			type: "boolean",
			default: false,
		},
	};

	return settings;
};

const withBlockClassnames = createHigherOrderComponent((BlockListBlock) => {
	return (props) => {
		const { name, attributes } = props;

		if (name !== "core/navigation") {
			return <BlockListBlock {...props} />;
		}

		const classNames = classnames({
			...props?.className,
			"hide-on-desktop": attributes.hideOnDesktop,
			"hide-on-tablet": attributes.hideOnTablet,
			"hide-on-mobile": attributes.hideOnMobile,
		});

		return <BlockListBlock {...props} className={classNames} />;
	};
}, "withBlockClassnames");

addFilter(
	"editor.BlockListBlock",
	"getdave/with-block-classes",
	withBlockClassnames
);

addFilter(
	"blocks.registerBlockType",
	"getdave/add-attributes",
	addResponsiveAttributes
);

addFilter(
	"editor.BlockEdit",
	"getdave/with-inspector-controls",
	withInspectorControls
);
