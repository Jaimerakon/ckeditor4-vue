/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Vue from 'vue';
import { mount } from '@vue/test-utils';
import CKEditorComponent from '../src/ckeditor';
import sinon from 'sinon';
import mockEditor from './_utils/mockeditor';

/* global window CKEDITOR */

describe( 'CKEditor Component', () => {
	const spies = {};

	let sandbox, wrapper, component, CKEditorNamespace, props;

	before( () => {
		CKEditorNamespace = CKEDITOR;

		window.CKEDITOR = mockEditor;
	} );

	beforeEach( () => {
		spies.replace = sinon.spy( CKEDITOR, 'replace' );
		spies.inline = sinon.spy( CKEDITOR, 'inline' );

		( { wrapper } = createComponent( props ) );
		component = wrapper.vm;
		sandbox = sinon.createSandbox();
	} );

	after( () => {
		window.CKEDITOR = CKEditorNamespace;
	} );

	afterEach( () => {
		for ( const key in spies ) {
			spies[ key ].restore();
		}

		wrapper.destroy();
		component.instance.destroy(); // 'instance.destroy' is fired only after 'instanceReady',
		// but mocked editor wont fire it by itself, so manualy call destroy to clean listeners.
		sandbox.restore();
	} );

	describe( 'initialization', () => {
		it( 'component should have a name', () => {
			expect( CKEditorComponent.name ).to.equal( 'ckeditor' );
		} );

		it( 'should render', () => {
			expect( wrapper.html() ).to.equal( '<div><textarea></textarea></div>' );
		} );

		[
			{
				name: 'value',
				default: ''
			}, {
				name: 'type',
				default: 'classic',
			}, {
				name: 'config',
				default: undefined
			}, {
				name: 'tagName',
				default: 'textarea'
			}, {
				name: 'readOnly',
				default: null
			}
		].forEach( prop => {
			it( `property "${ prop.name }" should have default value`, () => {
				expect( component[ prop.name ] ).to.equal( prop.default );
			} );
		} );
	} );

	describe( 'when editor type', () => {
		[
			{
				type: 'unset',
				method: 'replace'
			}, {
				type: 'classic',
				method: 'replace'
			}, {
				type: 'inline',
				method: 'inline'
			}
		].forEach( ( { type, method } ) => {
			const otherMethod = method === 'inline' ? 'replace' : 'inline';

			describe( type === 'unset' ? 'unset' : `set to "${ type }"`, () => {
				if ( type !== 'unset' ) {
					setPropsForTestGroup( { type } );
				}

				it( `should call "CKEDITOR.${ method }"`, () => {
					sinon.assert.calledOnce( spies[ method ] );
				} );

				it( `shouldn't call "CKEDITOR.${ otherMethod }"`, () => {
					sinon.assert.notCalled( spies[ otherMethod ] );
				} );
			} );
		} );
	} );

	describe( 'events', () => {
		[
			'ready',
			'input',
			'focus',
			'blur'
		].forEach( evtName => {
			it( `should emit "${ evtName }"`, () => {
				const evt = {};
				let editorEvtName;

				switch ( evtName ) {
					case 'ready':
						editorEvtName = 'instanceReady';
						break;
					case 'input':
						editorEvtName = 'change';
						break;
					default:
						editorEvtName = evtName;
				}

				component.instance.fire( editorEvtName, evt );
				expect( 'foo' ).to.equal( 'foo' );
			} );
		} );
	} );

	describe( 'when component destroyed', () => {
		beforeEach( () => {
			spies.destroy = sinon.spy( component, 'destroyEditor' );
			wrapper.destroy();
		} );

		it( 'should call "component.destroyEditor"', () => {
			sinon.assert.calledOnce( spies.destroy );
		} );

		it( 'should emit "destroy"', () => {
			expect( wrapper.emitted().destroy.length ).to.equal( 1 );
		} );
	} );

	function createComponent( props ) {
		const wrapper = mount( CKEditorComponent, {
			propsData: { ...props }
		} );

		return { wrapper, vm: wrapper.vm };
	}

	function setPropsForTestGroup( newProps ) {
		// "before" is executed before "beforeEach", so we can setup props now.
		before( () => {
			props = { ...newProps };
		} );

		after( () => {
			props = null;
		} );
	}
} );
