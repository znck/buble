import Node from '../Node.js';
import isReference from '../../utils/isReference.js';
import { loopStatement } from '../../utils/patterns.js';
import globals from '../../utils/globals.js';

const isDeclaration = type => /Declaration$/.test(type)
const isFunction = type => /Function(Expression|Declaration)$/.test(type)

export default class Identifier extends Node {
	findScope ( functionScope ) {
		if ( this.parent.params && ~this.parent.params.indexOf( this ) ) {
			return this.parent.body.scope;
		}

		if ( this.parent.type === 'FunctionExpression' && this === this.parent.id ) {
			return this.parent.body.scope;
		}

		return this.parent.findScope( functionScope	);
	}

	initialise ( transforms ) {
		if ( transforms.arrow && isReference( this, this.parent ) ) {
			if ( this.name === 'arguments' && !this.findScope( false ).contains( this.name ) ) {
				const lexicalBoundary = this.findLexicalBoundary();
				const arrowFunction = this.findNearest( 'ArrowFunctionExpression' );
				const loop = this.findNearest( loopStatement );

				if ( arrowFunction && arrowFunction.depth > lexicalBoundary.depth ) {
					this.alias = lexicalBoundary.getArgumentsAlias();
				}

				if ( loop && loop.body.contains( this ) && loop.depth > lexicalBoundary.depth ) {
					this.alias = lexicalBoundary.getArgumentsAlias();
				}
			}

			this.findScope( false ).addReference( this );
		}
	}

	transpile ( code, transforms ) {
		if ( this.alias ) {
			code.overwrite( this.start, this.end, this.alias, true );
		}

		// rewrite identifiers inside Vue render function `with` blocks
		if (
			this.program.inWith > 0 &&
			// not id of a Declaration
			!(isDeclaration(this.parent.type) && this.parent.id === this) &&
			// not a params of a function
			!(isFunction(this.parent.type) && this.parent.params.indexOf(this) > -1) &&
			// not a key of Property
			!(this.parent.type === 'Property' && this.parent.key === this && !this.parent.computed) &&
			// not a property of a MemberExpression
			!(this.parent.type === 'MemberExpression' && this.parent.property === this && !this.parent.computed) &&
			// not in an Array destructure pattern
			!(this.parent.type === 'ArrayPattern') &&
			// not in an Object destructure pattern
			!(this.parent.parent.type === 'ObjectPattern') &&
			// skip globals + commonly used shorthands
			!globals[this.name] &&
			// local import
			!/^__vue_[a-z0-9_]+__$/i.test(this.name) &&
			// not already in scope
			!this.findScope(false).contains(this.name)
		) {
			code.overwrite(this.start, this.end, `__vue_context__.${this.name}`)
		}
	}
}
