import * as ts from 'typescript'

// alter the default implementation so anything can be decorated
(ts as any).nodeCanBeDecorated = () => true

export type GenerateScopedNameFn = (name: string, filepath: string, css: string) => string

/**
 * Primarily from https://github.com/css-modules/css-modules-require-hook
 *
 * @export
 * @interface Opts
 */
export interface Opts {
    devMode?: boolean
}
interface TypeNodeWithTypeName extends ts.TypeNode {
    typeName: ts.Expression
}

interface HasReactive extends ts.Node {
    isReactive: boolean
}

function getTypeDescriptor(property: ts.PropertyDeclaration): ts.Expression {
    let type = property.type
    if (!type) {
        if (property.initializer) {
            switch (property.initializer.kind) {
                case ts.SyntaxKind.StringLiteral:
                    return ts.createLiteral('string')
                case ts.SyntaxKind.FirstLiteralToken:
                    return ts.createLiteral('number')
            }
        }
        return ts.createLiteral('any')
    }
    switch (type.kind) {
        case ts.SyntaxKind.StringKeyword:
            return ts.createLiteral('string')
        case ts.SyntaxKind.NumberKeyword:
            return ts.createLiteral('number')
        case ts.SyntaxKind.StringKeyword:
            return ts.createLiteral('boolean')
        case ts.SyntaxKind.TypeReference:
            return ts.createIdentifier((type as TypeNodeWithTypeName).typeName.getText())
        case ts.SyntaxKind.TypeLiteral:
            throw new Error('type literal, NIY')
        default:
            throw new Error('Unknown type ' + ts.SyntaxKind[type.kind])
    }
}

function visitor(ctx: ts.TransformationContext, sf: ts.SourceFile) {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
        if (node.decorators && node.decorators.some((decorator, i) => {
            if (decorator.expression.getText(sf) === 'reactive') {
                node.decorators.splice(i, 1)
                if (node.decorators.length == 0)
                    node.decorators = undefined
                ;(node as HasReactive).isReactive = true
                return true
            }
        })) {
            return reactiveVisitor(node)
        }
        return ts.visitEachChild(node, visitor, ctx)
    }
    const reactiveVisitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
        if (node.decorators && node.decorators.some((decorator, i) => {
            if (decorator.expression.getText(sf) === 'direct') {
                node.decorators.splice(i, 1)
                if (node.decorators.length == 0)
                    node.decorators = undefined
                return true
            }
        })) {
            return visitor(node)
        }
        switch(node.kind) {
            case ts.SyntaxKind.ClassDeclaration:
                let classDeclaration = node as ts.ClassDeclaration
                getClassDescriptor(classDeclaration)
                break

            case ts.SyntaxKind.PropertyDeclaration:
            debugger
                let property = node as ts.PropertyDeclaration
                let parentClass = node.parent
                if (node.parent.kind != ts.SyntaxKind.ClassDeclaration) {
                    throw new Error('Property declared in non-class')
                }
                let classDescriptor = getClassDescriptor(parentClass)
                let propertyDescriptor = ts.createPropertyAssignment(property.name, getTypeDescriptor(property))
                classDescriptor.properties.push(propertyDescriptor)
                break

            case ts.SyntaxKind.BinaryExpression:
                let binary = node as ts.BinaryExpression
                //let operator = binary.operatorToken
                let binaryCall = ts.createCall(
                    ts.createPropertyAccess(
                        ts.createIdentifier('reactive'),
                        ts.createIdentifier('operator')),
                    [],
                    [binary.left, binary.right])
                return binaryCall

            case ts.SyntaxKind.CallExpression:
                let call = node as ts.CallExpression
                let target = call.expression
                if (target.kind == ts.SyntaxKind.PropertyAccessExpression) {
                    let callProperty = target as ts.PropertyAccessExpression
                    return ts.createCall(
                        ts.createPropertyAccess(
                            ts.createIdentifier('reactive'),
                            ts.createIdentifier('mcall')),
                        [],
                        [callProperty.expression, callProperty.name, ts.createArrayLiteral(call.arguments)])
                } else {
                    return ts.createCall(
                        ts.createPropertyAccess(
                            ts.createIdentifier('reactive'),
                            ts.createIdentifier('fcall')),
                        [],
                        [target, ts.createArrayLiteral(call.arguments)])
                }
            case ts.SyntaxKind.Block:
            debugger
                if (!(node.parent as HasReactive).isReactive) {
                    return visitor(node)
                }
                break
            case ts.SyntaxKind.Decorator:
                return node // don't want to double process decorators

          //  default:

        }
        return ts.visitEachChild(node, reactiveVisitor, ctx)
    }
    function getClassDescriptor(parentClass: ts.Node): ts.ObjectLiteralExpression {
        if (!parentClass.decorators) {
            parentClass.decorators = ts.createNodeArray()
        }

        for (let decorator of parentClass.decorators) {
            if (decorator.expression.kind == ts.SyntaxKind.CallExpression) {
                let call = decorator.expression as ts.CallExpression
                if (call.expression.kind == ts.SyntaxKind.PropertyAccessExpression) {
                    let propertyAccess = call.expression as ts.PropertyAccessExpression
                    if (propertyAccess.name.text === 'cls') {
                        for (let arg of call.arguments) {
                            return arg as ts.ObjectLiteralExpression
                        }
                    }
                }
            }
        }

        let classDescriptor: ts.ObjectLiteralExpression
        parentClass.decorators.push(
            ts.createDecorator(
                ts.createCall(
                    ts.createPropertyAccess(
                        ts.createIdentifier('reactive'),
                        ts.createIdentifier('cls')),
                    [],
                    [classDescriptor = ts.createObjectLiteral([])])))
        return classDescriptor

    }

    return visitor
}

export default function(opts: Opts) {
    console.log(opts)
    return (ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
        return (sf: ts.SourceFile) => ts.visitNode(sf, visitor(ctx, sf))
    }
}
