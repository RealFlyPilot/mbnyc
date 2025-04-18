<?php

if ( ! class_exists( 'GFForms' ) ) {
	die();
}

require_once( plugin_dir_path( __FILE__ ) . 'class-gf-field-multiple-choice.php' );

class GF_Field_Image_Choice extends GF_Field_Multiple_Choice {

	public $type = 'image_choice';

	public $checkbox_choice;

	public function __construct( $data = array() ) {
		if ( ! has_action( 'gform_after_save_form', array( __class__, 'resize_images' ) ) ) {
			add_action( 'gform_after_save_form', array( __class__, 'resize_images' ), 10, 2 );
		}

		if ( ! has_action( 'gform_forms_post_import', array( __class__, 'resize_images_after_import' ) ) ) {
			add_action( 'gform_forms_post_import', array( __class__, 'resize_images_after_import' ), 10, 2 );
		}

		parent::__construct( $data );
	}

	public function get_form_editor_field_title() {
		return esc_attr__( 'Image Choice', 'gravityforms' );
	}

	/**
	 * Returns the field's form editor description.
	 *
	 * @since 2.5
	 *
	 * @return string
	 */
	public function get_form_editor_field_description() {
		return esc_attr__( 'Allow users to choose from a list of images.', 'gravityforms' );
	}

	/**
	 * Returns the field's form editor icon.
	 *
	 * This could be an icon url or a gform-icon class.
	 *
	 * @since 2.5
	 *
	 * @return string
	 */
	public function get_form_editor_field_icon() {
		return 'gform-icon--image_choice';
	}

	function get_form_editor_field_settings() {
		return array(
			'conditional_logic_field_setting',
			'prepopulate_field_setting',
			'error_message_setting',
			'label_setting',
			'label_placement_setting',
			'admin_label_setting',
			'choices_setting',
			'rules_setting',
			'visibility_setting',
			'description_setting',
			'css_class_setting',
			'enable_multiple_selections_setting',
			'choice_min_max_setting',
			'image_choice_ui_show_label_setting'
		);
	}

	/*
	 * Generate the needed image sizes for the image choice field.
	 *
	 * @since 2.9.3
	 *
	 * @param array $form The form.
	 * @param bool $is_new_form Is the form new.
	 */
	public static function resize_images( $form, $is_new_form ) {

		// Put our registered image sizes back temporarily.
		remove_filter( 'intermediate_image_sizes_advanced', array( 'GFForms', 'remove_image_sizes' ) );

		$image_sizes = GFForms::get_image_sizes();

		foreach ( $form['fields'] as $field ) {
			if ( $field->type == 'image_choice' ) {
				foreach ( $field->choices as $choice ) {
					if ( rgar( $choice, 'attachment_id' ) ) {
						// get the image to check if it has already been resized or not
						$image = wp_get_attachment_image_src(
							$choice['attachment_id'],
							'gform-' .  key( $image_sizes )
						);

						if ( is_array( $image ) && $image[3] === false ) {
							GFCommon::log_debug( __METHOD__ . '(): Resizing image attachment id ' . $choice['attachment_id'] . ' for the image choice field in form ' . $form['id'] );
							$file_path   = get_attached_file( $choice['attachment_id'] );
							$attach_data = wp_generate_attachment_metadata( $choice['attachment_id'], $file_path );
							wp_update_attachment_metadata( $choice['attachment_id'], $attach_data );
						}
					}
				}
			}
		}

		// Take our registered image sizes back out
		add_filter( 'intermediate_image_sizes_advanced', array( 'GFForms', 'remove_image_sizes' ), 10, 2 );
	}

	/**
	 * Trigger the resizing of images after form import.
	 *
	 * @since 2.9.3
	 *
	 * @param array $forms The forms being imported.
	 */
	public static function resize_images_after_import( $forms ) {
		if ( ! rgpost( 'gf_import_media' ) ) {
			return;
		}

		foreach ( $forms as $form ) {
			self::resize_images( $form, false );
		}
	}


	/**
	 * Get the choice labels visibility setting default for the image choice field.
	 *
	 * @since 2.9.0
	 *
	 * @param object $field The field object.
	 *
	 * @return string
	 */
	public static function get_image_choice_label_visibility_setting_default( $form_id ) {
		/**
		 * A filter that allows for the managing of the default image choice labels visibility setting.
		 * Default is show. Options are 'show' and 'hide'.
		 *
		 * @since 2.9
		 *
		 * @param string $label_visibility_default The default image choice labels visibility.
		 *
		 * @return string
		 */
		return gf_apply_filters( array( 'gform_image_choice_label_visibility_default', $form_id ), 'show' );
	}

	/**
	 * Get the choice labels visibility setting for the given image choice field.
	 *
	 * @since 2.9.0
	 *
	 * @param object $field The field object.
	 *
	 * @return string
	 */
	public static function get_image_choice_label_visibility_setting( $field ) {
		return $field->imageChoiceLabelVisibility;
	}

	/**
	 * Get the choice inputs visibility setting for the given image choice field.
	 *
	 * @since 2.9.0
	 *
	 * @param object $field The field object.
	 *
	 * @return string
	 */
	public static function get_image_choice_input_visibility_setting( $field ) {
		/**
		 * A filter that allows for the managing of image choice inputs visibility.
		 * Default is show. Options are 'show' and 'hide'.
		 * If image choice labels are hidden, the inputs will also be hidden.
		 *
		 * @since 2.9
		 *
		 * @param string $input_visibility The image choice inputs visibility.
		 * @param object $field            The current field object.
		 */
		return gf_apply_filters( array( 'gform_image_choice_input_visibility', $field->formId ), 'show', $field );
	}

	public function get_form_editor_inline_script_on_page_render() {
		// Set the field settings default values
		$js = sprintf( '
            function SetDefaultValues_%1$s( field ) {
            	if ( ! field.imageChoiceLabelVisibility ) {
                    field.imageChoiceLabelVisibility = "%2$s";
                }
            };',
			$this->type,
			self::get_image_choice_label_visibility_setting_default( rgget( 'id' ) )
		) . PHP_EOL;

		// Initialize the field settings values
		$js .= 'jQuery( document ).on( "gform_load_field_settings", function( event, field, form ) {
			if ( field.type !== "image_choice" ) {
				return;
			}

		    document.getElementById("image_choice_ui_show_label").value = field.imageChoiceLabelVisibility;
		    
	        if ( field.type === "image_choice" && field.imageChoiceLabelVisibility === "hide" ) {
				SetFieldAccessibilityWarning( "image_choice_ui_show_label_setting", "above" );
			}
		} );' . PHP_EOL;

		// Update the field settings values on change of the setting
		$js .= 'function SetFieldImageChoiceLabelVisibility( visibility ) {
			SetFieldProperty( "imageChoiceLabelVisibility", visibility );

			if ( visibility === "hide" ) {
				SetFieldAccessibilityWarning( "image_choice_ui_show_label_setting", "above" );
			} else {
				ResetFieldAccessibilityWarning( "image_choice_ui_show_label_setting" );
			}
		
			RefreshSelectedFieldPreview();
		}' . PHP_EOL;

		return $js;
	}

	/**
	 * Returns the image URL for a choice to display in a merge tage with the "img_url" modifier.
	 *
	 * @since 2.9.0
	 *
	 * @param string $value    The value of the merge tag.
	 * @param string $input_id The ID of the input.
	 * @param array  $entry    The entry currently being processed.
	 * @param array  $form     The form currently being processed.
	 * @param object $field    The field currently being processed.
	 *
	 * @return string|array
	 */
	public function get_merge_tag_img_url( $value, $input_id, $entry, $form, $field ) {
		if ( ! is_array( $field->choices ) ) {
			return $value;
		}

		foreach ( $field->choices as $choice ) {
			if ( is_array( $value ) && GFFormsModel::choice_value_match( $field, $choice, $value[ $input_id ] ) ) {
				return rgar( $choice, 'file_url' ) ? $choice['file_url'] : '';
			} else if ( ! is_array( $value ) && GFFormsModel::choice_value_match( $field, $choice, $value ) ) {
				return rgar( $choice, 'file_url' ) ? $choice['file_url'] : '';
			}
		}

		return '';
	}

}

GF_Fields::register( new GF_Field_Image_Choice() );
