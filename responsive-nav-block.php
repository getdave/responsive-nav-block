<?php
/**
 * Plugin Name:       Responsive Navigation block
 * Description:       Extends the Core Navigation block to facilitate creation of per breakpoint navigation menus.
 * Requires at least: 5.9
 * Requires PHP:      7.0
 * Version:           1.0.0
 * Author:            Dave Smith
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       getdave-responsive-nav-block
 *
 * @package getdave
 */

/**
 * Init. Register scripts and styles.
 *
 * @return void
 */
function getdave_responsive_nav_block_sidebar_plugin_register() {
	// Deps generated by @wordpress/scripts.
	$manifest = include 'build/index.asset.php';

	// Enqueued in below.
	// see getdave_enqueue_responsive_nav_block_editor_assets.
	wp_register_script(
		'getdave-responsive-nav-block-js',
		plugins_url( 'build/index.js', __FILE__ ),
		$manifest['dependencies'],
		$manifest['version'],
		true // in footer.
	);

	wp_register_style(
		'getdave-responsive-nav-block-css',
		plugins_url( 'build/style-index.css', __FILE__ ),
		null, // no dependencies.
		$manifest['version'],
	);

	// Only include the styles when Navigation block is present.
	wp_enqueue_block_style(
		'core/navigation',
		array(
			'handle' => 'getdave-responsive-nav-block-css',
			'deps'   => $manifest['dependencies'],
			'ver'    => $manifest['version'],
		)
	);
}
add_action( 'init', 'getdave_responsive_nav_block_sidebar_plugin_register' );

function getdave_responsive_nav_block_enqueue_block_editor_assets() {
	// Deps generated by @wordpress/scripts.
	$manifest = include 'build/index.asset.php';

	wp_enqueue_style(
		'getdave-responsive-nav-block-editor-css',
		plugins_url( 'build/index.css', __FILE__ ),
		null, // no dependencies.
		$manifest['version']
	);
}
add_action( 'enqueue_block_editor_assets', 'getdave_responsive_nav_block_enqueue_block_editor_assets' );


/**
 * Enqueues the Editor JavaScript
 *
 * @return void
 */
function getdave_enqueue_responsive_nav_block_editor_assets() {
	wp_enqueue_script( 'getdave-responsive-nav-block-js' );
}
add_action(
	'enqueue_block_editor_assets',
	'getdave_enqueue_responsive_nav_block_editor_assets'
);

/**
 * Adds responsive classnames to the frontend output of the Navigation block.
 *
 * @param Array $parsed_block the parsed block.
 * @return Array
 */
function getdave_responsive_nav_block_block_data( $parsed_block ) {

	// Ignore non-Navigation block.
	if ( 'core/navigation' !== $parsed_block['blockName'] ) {
		return $parsed_block;
	}

	$class_names = array_filter(
		array(
			'hide-on-desktop' => ! empty( $parsed_block['attrs']['getdaveResponsiveNavBlock']['desktop'] ),
			'hide-on-mobile'  => ! empty( $parsed_block['attrs']['getdaveResponsiveNavBlock']['mobile'] ),
		)
	);

	$class_names = implode( ' ', array_keys( $class_names ) );

	// Set the parsed block className attribute to include the responsive classnames.
	$parsed_block['attrs']['className'] = ! empty( $parsed_block['attrs']['className'] ) ? $parsed_block['attrs']['className'] . ' ' . $class_names : $class_names;

	return $parsed_block;
}
add_filter( 'render_block_data', 'getdave_responsive_nav_block_block_data' );
