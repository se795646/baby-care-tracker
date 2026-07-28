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
 * 嘗試在語句中解析出「時間點」或「時間差」
 * @param {string} normalizedText
 * @param {Date} now
 * @returns {number|null} timestamp 如果有解析出時間，回傳 timestamp，否則回傳 null
 */
export function parseVoiceTimestamp(normalizedText, now = new Date()) {
    // 1. 優先匹配時間差，如 "半小時前", "10分鐘前", "1小時前"
    // A. "x個半小時前" 或 "半小時前"
    const halfBeforeRegex =
        /(?:(\d+|[一二兩三四五六七八九十]))?\s*(?:個)?半(?:小)?時前/;
    const halfBeforeMatch = normalizedText.match(halfBeforeRegex);
    if (halfBeforeMatch) {
        const hoursPart = halfBeforeMatch[1]
            ? chineseToNumber(halfBeforeMatch[1])
            : 0;
        const diffMs = (hoursPart * 60 + 30) * 60000;
        return now.getTime() - diffMs;
    }

    // B. "x小時前"
    const hoursBeforeRegex =
        /(\d+|[一二兩三四五六七八九十]+)\s*(?:個)?\s*小時前/;
    const hoursBeforeMatch = normalizedText.match(hoursBeforeRegex);
    if (hoursBeforeMatch) {
        const hours = chineseToNumber(hoursBeforeMatch[1]);
        return now.getTime() - hours * 60 * 60000;
    }

    // C. "x分鐘前" 或 "x分前"
    const minsBeforeRegex = /(\d+|[一二兩三四五六七八九十]+)\s*(?:分鐘|分)前/;
    const minsBeforeMatch = normalizedText.match(minsBeforeRegex);
    if (minsBeforeMatch) {
        const mins = chineseToNumber(minsBeforeMatch[1]);
        return now.getTime() - mins * 60000;
    }

    // 2. 匹配特定時間點，如 "下午兩點半", "10:30"
    const timePointRegex =
        /(?:下午|晚上|早上|上午|pm|am|下|晚|早|上)?\s*(?:\d{1,2}\s*:\s*\d{2}|\d+|[一二兩三四五六七八九十百]+)\s*(?:點|點鐘|時)(?:\d+|[一二兩三四五六七八九十]+|半)?\s*(?:分|分鐘)?/;
    const timePointMatch = normalizedText.match(timePointRegex);
    if (timePointMatch) {
        const tp = parseTimePoint(timePointMatch[0], now);
        if (tp) {
            return tp.getTime();
        }
    }

    // 如果含有 ":" 如 "14:30"
    const colonMatch = normalizedText.match(/(\d{1,2})\s*:\s*(\d{2})/);
    if (colonMatch) {
        const tp = parseTimePoint(colonMatch[0], now);
        if (tp) {
            return tp.getTime();
        }
    }

    return null;
}

/**
 * 解析語音文字
 * @param {string} text
 * @returns {Object|null} 解析結果
 */
export function parseVoiceInput(text) {
    if (!text) return null;

    const normalizedText = text.toLowerCase().trim();
    const now = new Date();

    // 用於記錄扣除時間文字後的內容，防止 Regex 匹配到時間點裡的數字而干擾奶量
    let textWithoutTime = normalizedText;
    let parsedTimestamp = null;

    // 1. 優先匹配時間差
    // A. "x個半小時前" 或 "半小時前"
    const halfBeforeRegex =
        /(?:(\d+|[一二兩三四五六七八九十]))?\s*(?:個)?半(?:小)?時前/;
    const halfBeforeMatch = normalizedText.match(halfBeforeRegex);
    if (halfBeforeMatch) {
        const hoursPart = halfBeforeMatch[1]
            ? chineseToNumber(halfBeforeMatch[1])
            : 0;
        const diffMs = (hoursPart * 60 + 30) * 60000;
        parsedTimestamp = now.getTime() - diffMs;
        textWithoutTime = textWithoutTime.replace(halfBeforeMatch[0], '');
    }

    // B. "x小時前"
    if (!parsedTimestamp) {
        const hoursBeforeRegex =
            /(\d+|[一二兩三四五六七八九十]+)\s*(?:個)?\s*小時前/;
        const hoursBeforeMatch = normalizedText.match(hoursBeforeRegex);
        if (hoursBeforeMatch) {
            const hours = chineseToNumber(hoursBeforeMatch[1]);
            parsedTimestamp = now.getTime() - hours * 60 * 60000;
            textWithoutTime = textWithoutTime.replace(hoursBeforeMatch[0], '');
        }
    }

    // C. "x分鐘前" 或 "x分前"
    if (!parsedTimestamp) {
        const minsBeforeRegex =
            /(\d+|[一二兩三四五六七八九十]+)\s*(?:分鐘|分)前/;
        const minsBeforeMatch = normalizedText.match(minsBeforeRegex);
        if (minsBeforeMatch) {
            const mins = chineseToNumber(minsBeforeMatch[1]);
            parsedTimestamp = now.getTime() - mins * 60000;
            textWithoutTime = textWithoutTime.replace(minsBeforeMatch[0], '');
        }
    }

    // 2. 匹配特定時間點，如 "下午兩點半", "10:30"
    if (!parsedTimestamp) {
        const timePointRegex =
            /(?:下午|晚上|早上|上午|pm|am|下|晚|早|上)?\s*(?:\d{1,2}\s*:\s*\d{2}|\d+|[一二兩三四五六七八九十百]+)\s*(?:點|點鐘|時)(?:\d+|[一二兩三四五六七八九十]+|半)?\s*(?:分|分鐘)?/;
        const timePointMatch = normalizedText.match(timePointRegex);
        if (timePointMatch) {
            const tp = parseTimePoint(timePointMatch[0], now);
            if (tp) {
                parsedTimestamp = tp.getTime();
                textWithoutTime = textWithoutTime.replace(
                    timePointMatch[0],
                    ''
                );
            }
        }
    }

    if (!parsedTimestamp) {
        const colonMatch = normalizedText.match(/(\d{1,2})\s*:\s*(\d{2})/);
        if (colonMatch) {
            const tp = parseTimePoint(colonMatch[0], now);
            if (tp) {
                parsedTimestamp = tp.getTime();
                textWithoutTime = textWithoutTime.replace(colonMatch[0], '');
            }
        }
    }

    // ─── 1. 偵測是否為睡眠記錄 ───
    if (normalizedText.includes('睡') || normalizedText.includes('眠')) {
        let durationMinutes = 0;
        let matched = false;
        let computedStartTime = null;
        let computedEndTime = null;

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
                    /(\d+|[原二兩三四五六七八九十百]+)\s*(?:個)?\s*(?:分鐘|分)/
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

    // ─── 2. 偵測是否為餵奶記錄 ───
    const isMilk =
        textWithoutTime.includes('奶') ||
        textWithoutTime.includes('喝') ||
        textWithoutTime.includes('餵') ||
        textWithoutTime.includes('吃') ||
        textWithoutTime.includes('ml') ||
        textWithoutTime.includes('cc') ||
        textWithoutTime.includes('副食') ||
        textWithoutTime.includes('毫升');

    if (isMilk) {
        let milkType = 'formula';
        if (
            textWithoutTime.includes('親餵') ||
            textWithoutTime.includes('直接')
        ) {
            milkType = 'breast_direct';
        } else if (
            textWithoutTime.includes('瓶餵') ||
            textWithoutTime.includes('母乳瓶')
        ) {
            milkType = 'breast_bottle';
        } else if (
            textWithoutTime.includes('母乳') ||
            textWithoutTime.includes('母奶')
        ) {
            milkType = 'breast_bottle';
        } else if (
            textWithoutTime.includes('副食') ||
            textWithoutTime.includes('粥') ||
            textWithoutTime.includes('泥') ||
            textWithoutTime.includes('麥精') ||
            textWithoutTime.includes('米精') ||
            textWithoutTime.includes('固體')
        ) {
            milkType = 'solid';
        }

        if (milkType === 'breast_direct') {
            const leftMatch = textWithoutTime.match(
                /(?:左邊|左)\s*(\d+|[一二兩三四五六七八九十]+)\s*(?:個)?\s*(?:分鐘|分)/
            );
            const rightMatch = textWithoutTime.match(
                /(?:右邊|右)\s*(\d+|[一二兩三四五六七八九十]+)\s*(?:個)?\s*(?:分鐘|分)/
            );
            const generalMatch = textWithoutTime.match(
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
                    const numberMatch = textWithoutTime.match(
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
                    timestamp: parsedTimestamp,
                    note: `語音匯入：「${text}」`
                };
            }
        } else {
            const amountMatch = textWithoutTime.match(
                /(\d+|[一二兩三四五六七八九十百]+)\s*(?:cc|ml|毫升|克|g|個)?/
            );
            const amountMatch2 = textWithoutTime.match(
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
                    timestamp: parsedTimestamp,
                    note: `語音匯入：「${text}」`
                };
            }
        }
    }

    // ─── 3. 偵測是否為尿布記錄 ───
    const isDiaper =
        textWithoutTime.includes('尿布') ||
        textWithoutTime.includes('尿尿') ||
        textWithoutTime.includes('大便') ||
        textWithoutTime.includes('便便') ||
        textWithoutTime.includes('乾淨') ||
        textWithoutTime.includes('檢查');

    if (isDiaper) {
        let diaperType = 'wet'; // 預設為尿尿
        if (
            (textWithoutTime.includes('尿') &&
                textWithoutTime.includes('大便')) ||
            (textWithoutTime.includes('尿') && textWithoutTime.includes('便便'))
        ) {
            diaperType = 'both';
        } else if (
            textWithoutTime.includes('大便') ||
            textWithoutTime.includes('便便') ||
            textWithoutTime.includes('便')
        ) {
            diaperType = 'dirty';
        } else if (
            textWithoutTime.includes('乾淨') ||
            textWithoutTime.includes('檢查')
        ) {
            diaperType = 'dry';
        } else if (textWithoutTime.includes('尿')) {
            diaperType = 'wet';
        }

        // 解析大便顏色 (僅在大便或兩者都有時適用)
        let poopColor = null;
        if (diaperType === 'dirty' || diaperType === 'both') {
            poopColor = 'normal_yellow'; // 預設正常黃
            if (textWithoutTime.includes('灰白')) {
                poopColor = 'abnormal_white';
            } else if (textWithoutTime.includes('淡黃')) {
                poopColor = 'abnormal_light_yellow';
            } else if (
                textWithoutTime.includes('紅') ||
                textWithoutTime.includes('血')
            ) {
                poopColor = 'red';
            } else if (textWithoutTime.includes('黑')) {
                poopColor = 'black';
            } else if (textWithoutTime.includes('綠')) {
                poopColor = 'normal_green';
            } else if (normalizedText.includes('褐')) {
                poopColor = 'normal_brown';
            } else if (normalizedText.includes('黃')) {
                poopColor = 'normal_yellow';
            }
        }

        // 解析大便狀態 (僅在大便或兩者都有時適用)
        let poopStatus = null;
        if (diaperType === 'dirty' || diaperType === 'both') {
            poopStatus = 'soft'; // 預設軟便
            if (
                normalizedText.includes('稀') ||
                normalizedText.includes('糊')
            ) {
                poopStatus = 'loose';
            } else if (
                normalizedText.includes('硬') ||
                normalizedText.includes('乾')
            ) {
                poopStatus = 'hard';
            } else if (
                normalizedText.includes('水') ||
                normalizedText.includes('瀉') ||
                normalizedText.includes('拉肚子')
            ) {
                poopStatus = 'watery';
            } else if (normalizedText.includes('軟')) {
                poopStatus = 'soft';
            }
        }

        return {
            type: 'diaper',
            diaperType,
            poopColor,
            poopStatus,
            timestamp: parseVoiceTimestamp(normalizedText, now),
            note: `語音匯入：「${text}」`
        };
    }

    return null;
}
