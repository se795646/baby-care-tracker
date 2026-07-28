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
 * 解析時間點字串，回傳當天（或前一天）的 Date 物件
 * @param {string} str
 * @param {Date} now
 * @returns {Date|null}
 */
export function parseTimePoint(str, now = new Date()) {
    if (!str) return null;

    const clean = str.trim().replace(/個/g, '');
    let isPM = false;

    // 判定下午/晚上
    if (
        clean.includes('下午') ||
        clean.includes('晚上') ||
        clean.includes('pm') ||
        clean.includes('下') ||
        clean.includes('晚')
    ) {
        isPM = true;
    }

    let hour = -1;
    let min = 0;

    // 1. 匹配 24 小時制或帶冒號的時間，如 "14:30", "2:30"
    const colonMatch = clean.match(/(\d{1,2})\s*:\s*(\d{2})/);
    if (colonMatch) {
        hour = Number(colonMatch[1]);
        min = Number(colonMatch[2]);
    } else {
        // 2. 匹配 "x點y分" 或是 "x點半"
        const hourMatch = clean.match(
            /(\d+|[一二兩三四五六七八九十百]+)\s*(?:點|點鐘|時)/
        );
        if (hourMatch) {
            hour = chineseToNumber(hourMatch[1]);

            if (clean.includes('半')) {
                min = 30;
            } else {
                const afterHour = clean.substring(
                    hourMatch.index + hourMatch[0].length
                );
                const minMatch = afterHour.match(
                    /^(\d+|[一二兩三四五六七八九十]+)\s*(?:分|分鐘)?/
                );
                if (minMatch) {
                    min = chineseToNumber(minMatch[1]);
                }
            }
        }
    }

    if (hour === -1) return null;

    // 轉換 12 小時制
    if (isPM && hour < 12) {
        hour += 12;
    } else if (
        !isPM &&
        hour === 12 &&
        (clean.includes('上午') ||
            clean.includes('早上') ||
            clean.includes('am'))
    ) {
        hour = 0;
    }

    const targetDate = new Date(now.getTime());
    targetDate.setHours(hour, min, 0, 0);

    // 防呆：如果解析出的時間晚於當前時間，代表它是昨天的時間點
    if (targetDate.getTime() > now.getTime()) {
        targetDate.setDate(targetDate.getDate() - 1);
    }

    return targetDate;
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
        let computedStartTime = null;
        let computedEndTime = null;

        const now = new Date();

        // A. 處理「從 A 睡到 剛剛/現在」
        const toNowMatch = normalizedText.match(
            /(?:從)?\s*(.+?)\s*(?:開始)?睡\s*(?:到|至)\s*(?:剛剛|現在)/
        );
        if (toNowMatch) {
            const startPoint = parseTimePoint(toNowMatch[1], now);
            if (startPoint) {
                matched = true;
                computedStartTime = startPoint.getTime();
                computedEndTime = now.getTime();
                durationMinutes = Math.round(
                    (computedEndTime - computedStartTime) / 60000
                );
            }
        }

        // B. 處理「從 A 睡到 B」
        if (!matched) {
            const splitMatch = normalizedText.match(
                /(?:從)?\s*(.+?)\s*(?:開始)?睡\s*(?:到|至)\s*(.+)/
            );
            if (splitMatch) {
                const startPoint = parseTimePoint(splitMatch[1], now);
                const endPoint = parseTimePoint(splitMatch[2], now);
                if (startPoint && endPoint) {
                    matched = true;
                    // 如果結束時間早於開始時間（例如跨子夜，23:00 睡到 1:00），將結束時間加一天
                    if (endPoint.getTime() < startPoint.getTime()) {
                        endPoint.setDate(endPoint.getDate() + 1);
                    }
                    computedStartTime = startPoint.getTime();
                    computedEndTime = endPoint.getTime();
                    durationMinutes = Math.round(
                        (computedEndTime - computedStartTime) / 60000
                    );
                }
            }
        }

        // C. 處理「睡了多久」時長模式
        if (!matched) {
            const halfHourRegex =
                /(?:(\d+|[一二兩三四五六七八九十]))?\s*(?:個)?半(?:小)?時/;
            const halfHourMatch = normalizedText.match(halfHourRegex);
            if (halfHourMatch) {
                matched = true;
                const hoursPart = halfHourMatch[1]
                    ? chineseToNumber(halfHourMatch[1])
                    : 0;
                durationMinutes = hoursPart * 60 + 30;
            }

            if (!matched) {
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
                    const numOnlyMatch = normalizedText.match(
                        /(?:睡了|睡了有|睡了大概)\s*(\d+)/
                    );
                    if (numOnlyMatch) {
                        matched = true;
                        const val = Number(numOnlyMatch[1]);
                        durationMinutes = val < 10 ? val * 60 : val;
                    }
                }
            }
        }

        if (matched && durationMinutes > 0) {
            return {
                type: 'sleep',
                duration: durationMinutes,
                timestamp: computedStartTime,
                endTime: computedEndTime,
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
        let milkType = 'formula';
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
