import { parse } from '@babel/parser';
import * as t from '@babel/types';
import { getPluginInstance } from './pluginInstance';

let pluginInstance: ReturnType<typeof getPluginInstance> | null = null;

const getPlugin = () => {
    if (!pluginInstance) {
        pluginInstance = getPluginInstance();
    }
    return pluginInstance;
};

const debugLog = (...args: unknown[]) => {
    if (getPlugin().settings.isDebug) {
        console.error('[dv-query]', ...args);
    }
};

type DvQuery = {
    from: string;
    select?: string;
    wheres: string[];
    sorts: { field: string; direction: 'asc' | 'desc' }[];
    groups: string[];
    flattens: string[];
    limit?: number;
};

function buildQueryString(q: DvQuery): string {
    const head = q.select ? `LIST ${q.select}` : 'LIST';
    const clauses: string[] = [head];

    if (q.from) clauses.push(`FROM ${q.from}`);
    q.flattens.forEach(f => clauses.push(`FLATTEN ${f}`));
    if (q.wheres.length) clauses.push(`WHERE ${q.wheres.join(' AND ')}`);
    if (q.sorts.length) clauses.push(
        `SORT ${q.sorts.map(s => `${s.field} ${s.direction}`).join(', ')}`
    );
    if (q.groups.length) clauses.push(`GROUP BY ${q.groups.join(', ')}`);
    if (q.limit != null) clauses.push(`LIMIT ${q.limit}`);

    return clauses.join(' ');
}
/**
 * Пытается распознать шаблон вида
 *   ["#tag",…].every(tag => obj.tags.includes(tag))
 * или .some(…)
 * и вернуть выражение вида
 *   contains(file.tags, "#tag") AND … 
 */
function tryParseTags(bodyRaw: string): string | undefined {
    try {

        const file = parse(`(${bodyRaw})`, {/* … */ });
        const predAst = (file.program.body[0] as t.ExpressionStatement).expression;

        if (
            t.isCallExpression(predAst) && // *.every(...)
            t.isMemberExpression(predAst.callee) &&
            t.isArrayExpression(predAst.callee.object) &&  // ["#tag", ...]
            t.isIdentifier(predAst.callee.property) &&
            (predAst.callee.property.name === 'every' ||
                predAst.callee.property.name === 'some') &&

            // arrow-функция – аргумент вызова every/some
            predAst.arguments.length === 1 &&
            t.isArrowFunctionExpression(predAst.arguments[0])
        ) {
            const arrow = predAst.arguments[0] as t.ArrowFunctionExpression;
            if (arrow.params.length !== 1 || !t.isIdentifier(arrow.params[0])) {
                throw new Error('unexpected arrow params');
            }
            const iterIdent = (arrow.params[0] as t.Identifier).name;

            // тело arrow – <obj>.tags.includes(iterIdent)
            if (
                t.isCallExpression(arrow.body) &&
                t.isMemberExpression(arrow.body.callee) &&
                t.isIdentifier(arrow.body.callee.property) &&
                arrow.body.callee.property.name === 'includes' &&
                arrow.body.arguments.length === 1 &&
                t.isIdentifier(arrow.body.arguments[0]) &&
                (arrow.body.arguments[0] as t.Identifier).name === iterIdent
            ) {
                const isCallerEvery = predAst.callee.property.name === 'every'
                const isCallerSome = predAst.callee.property.name === 'some'

                const logicalOperation = isCallerEvery ? ' AND ' : ' OR ';

                const tags = predAst.callee.object.elements
                    .filter((e): e is t.StringLiteral => t.isStringLiteral(e))
                    .map(e => e.value);

                if (tags.length === 0) return undefined;      // массив без строк – не берём

                let tagsExpression = tags.map(tag => `contains(file.tags, "${tag}")`).join(logicalOperation);

                //Wrapping the expression in parentheses
                if (isCallerSome) {
                    tagsExpression = `(${tagsExpression})`
                }

                return `${tagsExpression}`
            }
        }
    } catch {
        /* не распознали – пойдём в «старую» цепочку */
    }
    return undefined
}

function parsePredicate(fnSrc: string): string | undefined {
    try {
        const m = fnSrc.match(/^\s*(\w+)\s*=>\s*(.+)$/s);
        if (!m) return undefined;

        const [, param, bodyRaw] = m;

        // 1) Попытаться через AST-анализ
        const tagExpr = tryParseTags(bodyRaw)
        if (tagExpr) return tagExpr

        // 2) Фоллбэк: простые регулярки
        let expr = transformExpression(bodyRaw, param);

        // Wrapping the expression in parentheses
        if (expr.includes(' OR ')) {
            expr = `(${expr})`;
        }

        return expr;
    } catch (err) {
        debugLog('parsePredicate error:', err, 'src =', fnSrc);
        return undefined;
    }
}

function transformExpression(bodyRaw: string, param: string) {
    let expr = bodyRaw.replace(/\s+/g, ' '); // normalize whitespace

    expr = expr.replace(new RegExp(`\\b${param}\\.`, 'g'), ''); // Was: obj.field → Now: field

    expr = expr
        .replace(/===/g, '=') // меняем на =
        .replace(/==/g, '=') // меняем на =
        .replace(/!==/g, '!=') // меняем на !=
        .replace(/!=/g, '!=') // меняем на !=
        .replace(/&&/g, ' AND ')
        .replace(/\|\|/g, ' OR ')
        .replace(
            // convert .includes("val") → contains(obj, "val")
            /([\w.]+)\.includes\s*\(\s*(['"])(.*?)\2\s*\)/g,
            (_, obj: string, q: string, val: string) => `contains(${obj}, ${q}${val}${q})`
        );

    expr = expr
        .replace(
            // <obj==="val"> → <obj = "val">
            /([\w.]+)\s*===\s*(['"])(.*?)\2/g,
            (_, obj: string, q: string, val: string) => `${obj} = ${q}${val}${q}`
        )
        .replace(
            // <obj!="val"> → <obj != "val">
            /([\w.]+)\s*!=\s*(['"])(.*?)\2/g,
            (_, obj: string, q: string, val: string) => `${obj} != ${q}${val}${q}`
        );
    return expr;
}

function parseKeyFunction(fnSrc: string): string | undefined {
    try {
        const body = fnSrc
            .trim();

        // p.file.name  →  file.name
        const dotted = body.replace(/^\s*\w+\./, '');

        // letters, numbers, underscores, and dots between them are allowed
        return /^[\w.]+$/.test(dotted) ? dotted : undefined;
    } catch (err) {
        debugLog('parseKeyFunction error:', err, 'src =', fnSrc);
        return undefined;
    }
}

function parseFlatMapFunction(fnSrc: string): string | undefined {
    try {
        const body = fnSrc
            .replace(/^.*?\./, '')   // note.field -> field
            .trim();
        return /^\w+$/.test(body) ? body : undefined;
    } catch (err) {
        debugLog('parseFlatMapFunction error:', err, 'src =', fnSrc);
        return undefined;
    }
}

type MethodCall = { method: string; args: string[] };
type MethodChain = { source: string; methods: MethodCall[] };

export function convertDvjsToDvQuery(src: string): string | undefined {
    if(!src)
        debugLog('src is undefined');

    try {
        const chain = extractMethodChain(src);
        if (!chain) {
            debugLog('extractMethodChain вернул undefined', src);
            return undefined;
        }

        const query = convertToDvQuery(chain.source, chain.methods);
        if (!query) debugLog('convertToDvQuery вернул undefined', src);

        return query;
    } catch (err) {
        debugLog('convertDvjsToDvQuery: необработанное исключение', err, src);
        return undefined;
    }
}

function extractMethodChain(code: string): MethodChain | undefined {
    try {
        // Was: raw “dv.pages(…)” → Now: “(dv.pages(…))” so Babel parses it as an Expression
        const wrapped = `(${code})`;

        const ast = parse(wrapped, {
            plugins: ['typescript'],
            sourceType: 'module',
            errorRecovery: true
        });

        if (ast.program.body.length === 0) return undefined;
        const stmt = ast.program.body[0];
        if (!t.isExpressionStatement(stmt)) return undefined;

        let cur: t.Expression = stmt.expression as t.Expression;
        if (!t.isCallExpression(cur)) return undefined;

        // Offset adjustments because we added an opening "("
        const offset = 1;
        // Was: lost original source for complex args → Now: can recover any JS text fallback
        const srcOf = (n: t.Node) =>
            code.slice((n as any).start - offset, (n as any).end - offset);

        const methods: MethodCall[] = [];
        let source = '';

        // Walk the chain from outermost call down to the `dv` base
        while (t.isCallExpression(cur)) {
            if (!t.isMemberExpression(cur.callee)) return undefined;

            const member = cur.callee as t.MemberExpression;
            const prop = member.property;

            // Get method name even if it's a string literal
            const method =
                t.isIdentifier(prop) ? prop.name :
                    t.isStringLiteral(prop) ? prop.value : undefined;
            if (!method) return undefined;


            // Extract arguments, falling back to source code for non‐literal args
            const args = cur.arguments.map(a => {
                const argNode = t.isSpreadElement(a) ? a.argument : a;

                // 1. Строковый литерал            dv.pages("#3done")
                if (t.isStringLiteral(argNode)) return argNode.value;

                // 2. Число                        .limit(10)
                if (t.isNumericLiteral(argNode)) return String(argNode.value);

                // 3. Шаблон без подстановок       dv.pages(`#3done`)
                // if (t.isTemplateLiteral(argNode) && argNode.expressions.length === 0)
                //     return argNode.quasis[0].value.cooked ?? '';

                // 4. Всё остальное – исходный код
                return srcOf(argNode as t.Node);
            });

            methods.push({ method, args });

            if (method === 'pages') {
                source = args[0] ?? '';
            }

            // we go down to the next object in the chain
            if (t.isCallExpression(member.object)) {
                cur = member.object;
            } else {
                break;         // reached `dv`
            }
        }

        // the methods are now in the order "map, limit, pages" → reverse
        methods.reverse();

        return { source, methods };
    } catch (err) {
        debugLog('extractMethodChain: исключение', err, code);
        return undefined;
    }
}

function convertToDvQuery(source: string, calls: MethodCall[]): string | undefined {
    const q: DvQuery = {
        from: '',
        wheres: [],
        sorts: [],
        groups: [],
        flattens: []
    };

    const trimmed = source.trim();
    if (trimmed) {
        if (trimmed.startsWith('#')) {
            q.wheres.push(`contains(file.tags, "${trimmed}")`);
        } else {
            q.from = trimmed;
        }
    }

    for (const { method, args } of calls) {
        if (method === 'pages') continue; // already handled

        const argSrc = args[0] ?? '';

        switch (method) {
            case 'where':
            case 'filter': {
                const cond = parsePredicate(argSrc);
                if (!cond) {
                    debugLog(`where/filter: не смогли распарсить`, argSrc);
                    return undefined;
                }
                q.wheres.push(cond);
                break;
            }

            case 'map': {
                const field = parseKeyFunction(argSrc);
                if (!field) {
                    debugLog('map: неверный selector', argSrc);
                    return undefined;
                }
                q.select = field;
                break;
            }

            case 'flatMap': {
                const field = parseFlatMapFunction(argSrc);
                if (!field) {
                    debugLog('flatMap: неверное поле', argSrc);
                    return undefined;
                }
                q.flattens.push(field);
                break;
            }

            case 'sort': {
                const field = parseKeyFunction(argSrc);
                if (!field) return undefined;
                q.sorts.push({ field, direction: 'asc' });
                break;
            }
            case 'sortDesc': {
                const field = parseKeyFunction(argSrc);
                if (!field) return undefined;
                q.sorts.push({ field, direction: 'desc' });
                break;
            }
            case 'limit': {
                const n = Number(argSrc);
                if (Number.isFinite(n)) q.limit = n;
                break;
            }
            default:
                debugLog(`неизвестный метод ${method}`, args);
                return undefined;
        }
    }

    return buildQueryString(q);
}