/**
 * 將中文數字字串轉為數字 (支援 0-999 的繁體/簡體中文數字，並過濾掉量詞如 "個")
 * @param {string} cnStr
 * @returns {number}
 */
export function chineseToNumber(cnStr) {
    if (!cnStr) return 0;

    // 如果直接是數字字串，轉成 Number
    if (/^\d+(\.\d+)?$/.test(cnStr)) {
        return Number(cnStr);
    }

    // 清理常見的量詞或輔助詞，如 "個"
    const cleanStr = cnStr.replace(/個/g, '').trim();

    const cnNums = {
        零: 0,
        一: 1,
        二: 2,
        兩: 2,
        三: 3,
        四: 4,
        五: 5,
        六: 6,
        七: 7,
        八: 8,
        九: 9,
        十: 10,
        百: 100
    };

    if (cnNums[cleanStr] !== undefined) {
        return cnNums[cleanStr];
    }

    let total = 0;
    let r = 0; // 暫存區

    for (let i = 0; i < cleanStr.length; i++) {
        const char = cleanStr[i];
        const val = cnNums[char];

        if (val === undefined) continue;

        if (val === 10) {
            if (r === 0) r = 1;
            total += r * 10;
            r = 0;
        } else if (val === 100) {
            if (r === 0) r = 1;
            total += r * 100;
            r = 0;
        } else {
            r = val;
        }
    }

    if (r > 0) {
        // 口語中的 "一百二" 代表 120，此時 r (2) 應乘 10
        if (
            cleanStr.includes('百') &&
            !cleanStr.includes('十') &&
            cleanStr.indexOf('百') === cleanStr.length - 2
        ) {
            total += r * 10;
        } else {
            total += r;
        }
    }

    return total;
}

/**
 * 解析語音文字
 * @param {string} text
 * @returns {Object|null} 解析結果
 */
export function parseVoiceInput(text) {
    if (!text) return null;

    // 統一轉成小寫，方便比對 ml, cc 等
    const normalizedText = text.toLowerCase().trim();

    // 1. 偵測是否為睡眠記錄
    if (normalizedText.includes('睡') || normalizedText.includes('眠')) {
        let durationMinutes = 0;
        let matched = false;

        // 匹配 "一個半小時", "兩半小時", "1個半小時", "1半小時", "半小時"
        const halfHourRegex =
            /(?:(\d+|[一二兩三四五六七八九十]))?\s*(?:個)?半(?:小)?時/;
        const halfHourMatch = normalizedText.match(halfHourRegex);
        if (halfHourMatch) {
            matched = true;
            const hoursPart = halfHourMatch[1]
                ? chineseToNumber(halfHourMatch[1])
                : 0;
            // 「一個半小時」 hoursPart = 1 -> 90 分鐘
            // 「兩個半小時」 hoursPart = 2 -> 150 分鐘
            // 「半小時」 hoursPart = 0 -> 30 分鐘
            durationMinutes = hoursPart * 60 + 30;
        }

        if (!matched) {
            // 匹配 "x 小時 y 分鐘" 或 "x 小時" 或 "y 分鐘"
            const hasHours = normalizedText.match(
                /(\d+|[一二兩三四五六七八九十百]+)\s*(?:個)?\s*小時/
            );
            const hasMins = normalizedText.match(
                /(\d+|[一二兩三四五六七八九十百]+)\s*(?:個)?\s*(?:分鐘|分)/
            );

            if (hasHours || hasMins) {
                matched = true;
                let hours = 0;
                let mins = 0;
                if (hasHours) {
                    hours = chineseToNumber(hasHours[1]);
                }
                if (hasMins) {
                    mins = chineseToNumber(hasMins[1]);
                }
                durationMinutes = hours * 60 + mins;
            } else {
                // 如果只說 "睡了 60", "睡了 30" 這種沒有帶單位的
                const numOnlyMatch = normalizedText.match(
                    /(?:睡了|睡了有|睡了大概)\s*(\d+)/
                );
                if (numOnlyMatch) {
                    matched = true;
                    const val = Number(numOnlyMatch[1]);
                    // 如果大於 10 通常當做分鐘，小於 10 當作小時
                    durationMinutes = val < 10 ? val * 60 : val;
                }
            }
        }

        if (matched && durationMinutes > 0) {
            return {
                type: 'sleep',
                duration: durationMinutes,
                note: `語音匯入：「${text}」`
            };
        }
    }

    // 2. 偵測是否為餵奶記錄
    const isMilk =
        normalizedText.includes('奶') ||
        normalizedText.includes('喝') ||
        normalizedText.includes('餵') ||
        normalizedText.includes('吃') ||
        normalizedText.includes('ml') ||
        normalizedText.includes('cc') ||
        normalizedText.includes('副食') ||
        normalizedText.includes('毫升');

    if (isMilk) {
        // 判定喝奶種類
        let milkType = 'formula'; // 預設為配方奶
        if (
            normalizedText.includes('親餵') ||
            normalizedText.includes('直接')
        ) {
            milkType = 'breast_direct';
        } else if (
            normalizedText.includes('瓶餵') ||
            normalizedText.includes('母乳瓶')
        ) {
            milkType = 'breast_bottle';
        } else if (
            normalizedText.includes('母乳') ||
            normalizedText.includes('母奶')
        ) {
            milkType = 'breast_bottle';
        } else if (
            normalizedText.includes('副食') ||
            normalizedText.includes('粥') ||
            normalizedText.includes('泥') ||
            normalizedText.includes('麥精') ||
            normalizedText.includes('米精') ||
            normalizedText.includes('固體')
        ) {
            milkType = 'solid';
        }

        if (milkType === 'breast_direct') {
            // 親餵主要看時間 (分鐘)
            const leftMatch = normalizedText.match(
                /(?:左邊|左)\s*(\d+|[一二兩三四五六七八九十]+)\s*(?:個)?\s*(?:分鐘|分)/
            );
            const rightMatch = normalizedText.match(
                /(?:右邊|右)\s*(\d+|[一二兩三四五六七八九十]+)\s*(?:個)?\s*(?:分鐘|分)/
            );
            const generalMatch = normalizedText.match(
                /(?:親餵|餵|時間)\s*(\d+|[一二兩三四五六七八九十]+)\s*(?:個)?\s*(?:分鐘|分)/
            );

            let leftDuration = 0;
            let rightDuration = 0;

            if (leftMatch) {
                leftDuration = chineseToNumber(leftMatch[1]);
            }
            if (rightMatch) {
                rightDuration = chineseToNumber(rightMatch[1]);
            }

            if (!leftMatch && !rightMatch) {
                if (generalMatch) {
                    const totalDur = chineseToNumber(generalMatch[1]);
                    leftDuration = Math.round(totalDur / 2);
                    rightDuration = totalDur - leftDuration;
                } else {
                    const numberMatch = normalizedText.match(
                        /(\d+|[一二兩三四五六七八九十]+)\s*(?:個)?\s*(?:分鐘|分)/
                    );
                    if (numberMatch) {
                        const totalDur = chineseToNumber(numberMatch[1]);
                        leftDuration = Math.round(totalDur / 2);
                        rightDuration = totalDur - leftDuration;
                    }
                }
            }

            if (leftDuration > 0 || rightDuration > 0) {
                return {
                    type: 'milk',
                    milkType,
                    amount: 0,
                    leftDuration,
                    rightDuration,
                    note: `語音匯入：「${text}」`
                };
            }
        } else {
            // 瓶餵或配方奶或副食品，主要看奶量 (ml/cc/g)
            const amountMatch = normalizedText.match(
                /(\d+|[一二兩三四五六七八九十百]+)\s*(?:cc|ml|毫升|克|g|個)?/
            );
            const amountMatch2 = normalizedText.match(
                /(?:餵|喝|吃|量|額)\s*(\d+|[一二兩三四五六七八九十百]+)/
            );

            let amount = 0;
            if (amountMatch) {
                amount = chineseToNumber(amountMatch[1]);
            } else if (amountMatch2) {
                amount = chineseToNumber(amountMatch2[1]);
            }

            if (amount > 0) {
                return {
                    type: 'milk',
                    milkType,
                    amount,
                    leftDuration: 0,
                    rightDuration: 0,
                    note: `語音匯入：「${text}」`
                };
            }
        }
    }

    return null;
}
