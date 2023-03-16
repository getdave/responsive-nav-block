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

function ResponsiveVisibilityControl({ label, value, onChange }) {
	return (
		<ToggleGroupControl
			label={label}
			value={value}
			onChange={onChange}
			isAdaptiveWidth
		>
			<ToggleGroupControlOption label="Visible" value={false} />
			<ToggleGroupControlOption label="Hidden" value={true} />
		</ToggleGroupControl>
	);
}

const withInspectorControls = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { name, attributes, setAttributes } = props;

		if (name !== "core/navigation") {
			return <BlockEdit {...props} />;
		}

		const { mobile, desktop } = attributes?.getdaveResponsiveNavBlock;

		const isAllHidden = mobile && desktop;

		function resetAll() {
			setAttributes({
				getdaveResponsiveNavBlock: {
					mobile: false,
					desktop: false,
				},
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

						{isAllHidden && (
							<Notice status="warning" isDismissible={false}>
								{__(
									"This Navigation is hidden on all screen sizes.",
									"getdave/responsive-nav-block"
								)}
							</Notice>
						)}

						<ResponsiveVisibilityControl
							label={__("Desktop visibility", "getdave/responsive-nav-block")}
							value={desktop}
							onChange={() =>
								setAttributes({
									getdaveResponsiveNavBlock: {
										...attributes.getdaveResponsiveNavBlock,
										desktop: !desktop,
									},
								})
							}
						/>

						<ResponsiveVisibilityControl
							label={__("Mobile visibility", "getdave/responsive-nav-block")}
							value={mobile}
							onChange={() =>
								setAttributes({
									getdaveResponsiveNavBlock: {
										...attributes.getdaveResponsiveNavBlock,
										mobile: !mobile,
									},
								})
							}
						/>

						<Button onClick={resetAll} variant="tertiary">
							{__("Reset all", "getdave/responsive-nav-block")}
						</Button>
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
		getdaveResponsiveNavBlock: {
			type: "object",
			default: {
				mobile: false,
				desktop: false,
			},
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

		const { mobile, desktop } = attributes.getdaveResponsiveNavBlock;

		const classNames = classnames({
			...props?.className,
			"hide-on-desktop": desktop,
			"hide-on-mobile": mobile,
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
