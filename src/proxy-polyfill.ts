import * as ts from 'typescript'
//import { resolve, dirname } from 'path'

function visitor(ctx: ts.TransformationContext, sf: ts.SourceFile) {
    const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
        switch (node.kind) {
            case ts.SyntaxKind.PropertyAccessExpression:
                console.log('found property name', (node as ts.PropertyAccessExpression).name.getText(sf))
                break
        }
        return ts.visitEachChild(node, visitor, ctx)
    }

    return visitor
}

export default function() {
    return (ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
        return (sf: ts.SourceFile) => ts.visitNode(sf, visitor(ctx, sf))
    }
}
