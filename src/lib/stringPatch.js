const OPERATION_REMOVE = 'rm';
const OPERATION_INSERT = 'ins';
const OPERATION_REPLACE = 'rep';

export function createPatch(from, to) {
    var lastRow = null;
    var fromString = ' ' + from;
    var toString = ' ' + to;

    for (var rowIndex = 0; rowIndex < toString.length; rowIndex++) {
        var row = {};
        for (var colIndex = 0; colIndex < fromString.length; colIndex++) {
            var insertDistance = Number.MAX_VALUE;
            var replaceDistance = Number.MAX_VALUE;
            var removeDistance = Number.MAX_VALUE;

            var charsAreEqual = toString.charAt(rowIndex) == fromString.charAt(colIndex);

            if (rowIndex > 0) insertDistance = lastRow[colIndex].distance + 1;
            if (colIndex > 0) removeDistance = row[colIndex - 1].distance + 1;
            if (rowIndex > 0 && colIndex > 0) replaceDistance = lastRow[colIndex - 1].distance + (charsAreEqual ? 0 : 1);

            if (rowIndex == 0 && colIndex == 0) {
                row[colIndex] = {
                    distance: charsAreEqual ? 0 : 1,
                    positionModifier: 0,
                    patch: charsAreEqual
                        ? null
                        : {
                            operation: OPERATION_REPLACE,
                            char: toString.charAt(rowIndex),
                            position: rowIndex,
                        },
                    predecessor: null,
                };
            } else if (insertDistance <= removeDistance && insertDistance <= replaceDistance) {
                row[colIndex] = {
                    distance: insertDistance,
                    positionModifier: lastRow[colIndex].positionModifier + 1,
                    patch: {
                        operation: OPERATION_INSERT,
                        char: toString.charAt(rowIndex),
                        position: colIndex + lastRow[colIndex].positionModifier,
                    },
                    predecessor: lastRow[colIndex],
                };
            } else if (removeDistance <= replaceDistance) {
                row[colIndex] = {
                    distance: removeDistance,
                    positionModifier: row[colIndex - 1].positionModifier - 1,
                    patch: {
                        operation: OPERATION_REMOVE,
                        position: colIndex + row[colIndex - 1].positionModifier - 1,
                    },
                    predecessor: row[colIndex - 1],
                };
            } else {
                row[colIndex] = {
                    distance: replaceDistance,
                    positionModifier: lastRow[colIndex - 1].positionModifier,
                    patch: charsAreEqual
                        ? null
                        : {
                            operation: OPERATION_REPLACE,
                            char: toString.charAt(rowIndex),
                            position: colIndex + lastRow[colIndex - 1].positionModifier - 1,
                        },
                    predecessor: lastRow[colIndex - 1],
                };
            }
        }
        lastRow = row;
    }
    var patchPath = [];
    var lastItem = lastRow[fromString.length - 1];
    do {
        if (lastItem.patch) patchPath.push(lastItem.patch);
        lastItem = lastItem.predecessor;
    } while (lastItem != null);
    return patchPath.reverse();
}

export function applyPatch(string, patch) {
    var res = string;
    for (var i = 0; i < patch.length; i++) {
        var prefix = res.slice(0, patch[i].position);
        var postfix = res.slice(patch[i].position + (patch[i].operation == OPERATION_INSERT ? 0 : 1));
        if (patch[i].operation != OPERATION_REMOVE) prefix += patch[i].char;
        res = prefix + postfix;
    }
    return res;
}

export function applyPatchOnPatch(patchedPatch, patch) {
    for (var i in patch) {
        if (patch[i].operation != OPERATION_REPLACE)
            for (var j in patchedPatch) {
                if (patch[i].operation == OPERATION_INSERT && patchedPatch[j].position >= patch[i].position)
                    patchedPatch[j].position += 1;
                if (patch[i].operation == OPERATION_REMOVE && patchedPatch[j].position > patch[i].position) {
                    if (patchedPatch[j].operation == OPERATION_REPLACE && patchedPatch[j].position == patch[i].position) {
                        patchedPatch[j].removed = true;
                    }
                    patchedPatch[j].position -= 1;
                }
            }
    }
    return patchedPatch.filter(p => !p.removed);
}

export default function smartMerge(fromString, toString, overwritingString, transformPositions) {
    var patch1 = createPatch(fromString, toString);
    var patch2 = createPatch(fromString, overwritingString);
    if (transformPositions !== undefined) {
        for (var i = 0; i < patch1.length; i++) {
            for (var j = 0; j < transformPositions.length; j++) {
                if (patch1[i].operation == OPERATION_INSERT && transformPositions[j] >= patch1[i].position) transformPositions[j]++;
                else if (patch1[i].operation == OPERATION_REMOVE && transformPositions[j] >= patch1[i].position)
                    transformPositions[j]--;
            }
        }
    }
    patch2 = applyPatchOnPatch(patch2, patch1);
    return applyPatch(toString, patch2);
}
