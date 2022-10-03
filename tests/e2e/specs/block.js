import {
	activatePlugin,
	deactivatePlugin,
	enablePageDialogAccept,
	createNewPost,
	insertBlock,
	openDocumentSettingsSidebar,
	getEditedPostContent,
	__experimentalRest as rest,
	pressKeyWithModifier,
	setBrowserViewport,
	clickOnMoreMenuItem,
	clickButton,
} from "@wordpress/e2e-test-utils";
import { addQueryArgs } from "@wordpress/url";

const PLUGIN_SLUG = "responsive-navigation-block";
const NAVIGATION_MENUS_ENDPOINT = "/wp/v2/navigation";
const STATE_HIDDEN = "Hidden";
const STATE_VISIBLE = "Visible";
const MOBILE = "Mobile";
const TABLET = "Tablet";
const DESKTOP = "Desktop";

const BLOCK_SELECTOR = `[aria-label="Editor content"][role="region"] [aria-label="Block: Navigation"]`;

describe("Rendering", () => {
	beforeAll(async () => {
		await activatePlugin(PLUGIN_SLUG);
		await enablePageDialogAccept();
	});
	beforeEach(async () => {
		await deleteAll([NAVIGATION_MENUS_ENDPOINT]);
		await setBrowserViewport("large");
		await createNewPost();
	});
	afterAll(async () => {
		await deleteAll([NAVIGATION_MENUS_ENDPOINT]);
		await deactivatePlugin(PLUGIN_SLUG);
	});

	it("adds Responsive tools to Navigation block inspector controls", async () => {
		await insertBlock("Navigation");

		const createNewMenuButton = await page.waitForXPath(
			'//button[contains(., "Start empty")]'
		);
		await createNewMenuButton.click();

		await page.waitForXPath(
			'//div[@class="components-snackbar__content"][contains(text(), "Navigation Menu successfully created.")]'
		);

		const appender = await page.waitForSelector(
			".wp-block-navigation .block-editor-button-block-appender"
		);

		await appender.click();

		// Add a link to the Link block.
		await updateActiveNavigationLink({
			url: "https://wordpress.org",
			label: "Desktop Navigation Item",
			type: "url",
		});

		await selectNavigationBlock();

		await openDocumentSettingsSidebar();

		// Switch overlay to be always off.
		await page.click(
			`[aria-label="Configure overlay menu"] [aria-label="Off"]`
		);

		await setResponsiveControl(MOBILE, STATE_HIDDEN);

		await setResponsiveControl(TABLET, STATE_HIDDEN);

		await setResponsiveControl(DESKTOP, STATE_VISIBLE);

		expect(await getStableEditedPostContent()).toMatchSnapshot();
	});

	it.only("hides block based on responsive settings", async () => {
		// Now we have Nav Menu items resolved. Continue to assert.
		await clickOnMoreMenuItem("Code editor");

		const codeEditorInput = await page.waitForSelector(
			".editor-post-text-editor"
		);

		await codeEditorInput.click();

		const markup =
			'<!-- wp:navigation {"hideOnMobile":true,"hideOnTablet":true} /-->';

		await page.keyboard.type(markup);

		await clickButton("Exit code editor");

		// Check settings - visible on desktop and hidden on smaller viewports.

		await page.waitForSelector(BLOCK_SELECTOR, {
			hidden: false,
		});

		await setBrowserViewport("medium");

		await page.waitForSelector(BLOCK_SELECTOR, {
			hidden: true,
		});

		await setBrowserViewport("small");

		await page.waitForSelector(BLOCK_SELECTOR, {
			hidden: true,
		});

		// Check inverse settings - hidden on desktop and visible on smaller viewports.
		await setBrowserViewport("large");

		await selectNavigationBlock();

		await setResponsiveControl(MOBILE, STATE_VISIBLE);

		await setResponsiveControl(TABLET, STATE_VISIBLE);

		await setResponsiveControl(DESKTOP, STATE_HIDDEN);

		await page.waitForSelector(BLOCK_SELECTOR, {
			hidden: true,
		});

		await setBrowserViewport("medium");

		await page.waitForSelector(BLOCK_SELECTOR, {
			hidden: false,
		});

		await setBrowserViewport("small");

		await page.waitForSelector(BLOCK_SELECTOR, {
			hidden: false,
		});
	});
});

async function selectNavigationBlock() {
	return page.click(BLOCK_SELECTOR);
}

async function getStableEditedPostContent() {
	const editedPostContent = await getEditedPostContent();

	return editedPostContent.replace(/"ref":(\d+)/, '"ref":1234567');
}

async function setResponsiveControl(controlName, value) {
	if (!controlName || !value) {
		return;
	}

	return page.click(
		`[aria-label="${controlName} visibility"] [aria-label="${value}"]`
	);
}

async function updateActiveNavigationLink({ url, label, type }) {
	const typeClasses = {
		create: "block-editor-link-control__search-create",
		entity: "is-entity",
		url: "is-url",
	};

	if (url) {
		const input = await page.waitForSelector(
			'input[placeholder="Search or type url"]'
		);
		await input.type(url);

		const suggestionPath = `//button[contains(@class, 'block-editor-link-control__search-item') and contains(@class, '${typeClasses[type]}') and contains(., "${url}")]`;

		// Wait for the autocomplete suggestion item to appear.
		await page.waitForXPath(suggestionPath);
		// Set the suggestion.
		const suggestion = await page.waitForXPath(suggestionPath);

		// Select it (so we're clicking the right one, even if it's further down the list).
		await suggestion.click();
	}

	if (label) {
		// Wait for rich text editor input to be focused before we start typing the label.
		await page.waitForSelector(":focus.rich-text");

		// With https://github.com/WordPress/gutenberg/pull/19686, we're auto-selecting the label if the label is URL-ish.
		// In this case, it means we have to select and delete the label if it's _not_ the url.
		if (label !== url) {
			// Ideally this would be `await pressKeyWithModifier( 'primary', 'a' )`
			// to select all text like other tests do.
			// Unfortunately, these tests don't seem to pass on Travis CI when
			// using that approach, while using `Home` and `End` they do pass.
			await page.keyboard.press("Home");
			await pressKeyWithModifier("shift", "End");
			await page.keyboard.press("Backspace");
		}

		await page.keyboard.type(label);
	}
}

async function deleteAll(endpoints) {
	for (const endpoint of endpoints) {
		const defaultArgs = { per_page: -1 };
		const isArrayEndpoint = Array.isArray(endpoint);
		const path = isArrayEndpoint ? endpoint[0] : endpoint;
		const args = isArrayEndpoint
			? { ...defaultArgs, ...endpoint[1] }
			: defaultArgs;

		const items = await rest({
			path: addQueryArgs(path, args),
		});

		for (const item of items) {
			await rest({
				method: "DELETE",
				path: `${path}/${item.id}?force=true`,
			});
		}
	}
}
