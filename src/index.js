import { createHigherOrderComponent } from "@wordpress/compose";
import {
	PanelBody,
	ToggleControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	Button,
	Notice,
} from "@wordpress/components";
import { InspectorControls } from "@wordpress/block-editor";
import { addFilter } from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";
import { mobile } from "@wordpress/icons";
import classnames from "classnames";

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * All files containing `style` keyword are bundled together. The code used
 * gets applied both to the front of your site and to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
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
				<InspectorControls>
					<PanelBody
						icon={mobile}
						title={__("Responsive", "getdave/responsive-nav-block")}
						className="getdave-responsive-nav-block-inspector-controls"
					>
						<p>
							{__(
								"Control the visibility of this Navigation on a per device basis.",
								"getdave/responsive-nav-block"
							)}
						</p>
						<ToggleGroupControl
							label={__("Mobile visibility", "getdave/responsive-nav-block")}
							value={hideOnMobile}
							onChange={() =>
								setAttributes({
									hideOnMobile: !hideOnMobile,
								})
							}
							isAdaptiveWidth
						>
							<ToggleGroupControlOption label="Visible" value={false} />
							<ToggleGroupControlOption label="Hidden" value={true} />
						</ToggleGroupControl>

						<ToggleGroupControl
							label={__("Tablet visibility", "getdave/responsive-nav-block")}
							value={hideOnTablet}
							onChange={() =>
								setAttributes({
									hideOnTablet: !hideOnTablet,
								})
							}
							isAdaptiveWidth
						>
							<ToggleGroupControlOption label="Visible" value={false} />
							<ToggleGroupControlOption label="Hidden" value={true} />
						</ToggleGroupControl>

						<ToggleGroupControl
							label={__("Desktop visibility", "getdave/responsive-nav-block")}
							value={hideOnDesktop}
							onChange={() =>
								setAttributes({
									hideOnDesktop: !hideOnDesktop,
								})
							}
							isAdaptiveWidth
						>
							<ToggleGroupControlOption label="Visible" value={false} />
							<ToggleGroupControlOption label="Hidden" value={true} />
						</ToggleGroupControl>

						<Button onClick={resetAll} isTertiary>
							{__("Reset all", "getdave/responsive-nav-block")}
						</Button>

						{isAllHidden && (
							<Notice status="warning" isDismissible={false}>
								{__(
									"This Navigation will currently be hidden on all screen sizes.",
									"getdave/responsive-nav-block"
								)}
							</Notice>
						)}
					</PanelBody>
				</InspectorControls>
				<BlockEdit {...props} />
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
