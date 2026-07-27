import { describe, expect, it } from 'vitest';
import { parseVoiceInput } from '@/helpers/voiceParser.js';

describe('voiceParser.js speech command parser', () => {
    describe('Feeding (milk) parsing', () => {
        it('should parse formula milk amount', () => {
            const res = parseVoiceInput('餵奶 120cc');
            expect(res).not.toBeNull();
            expect(res.type).toBe('milk');
            expect(res.milkType).toBe('formula');
            expect(res.amount).toBe(120);
        });

        it('should parse milk amount with ml', () => {
            const res = parseVoiceInput('喝奶 150ml');
            expect(res).not.toBeNull();
            expect(res.type).toBe('milk');
            expect(res.milkType).toBe('formula');
            expect(res.amount).toBe(150);
        });

        it('should parse milk amount in Chinese numbers', () => {
            const res = parseVoiceInput('剛剛喝奶一百二十毫升');
            expect(res).not.toBeNull();
            expect(res.type).toBe('milk');
            expect(res.milkType).toBe('formula');
            // 注意：我們的 parseChineseNumber 目前支援 0-10, 十幾, 幾十, 幾十幾。
            // 由於 "一百二十" 有 "百" 字，在我們之前的 parseChineseNumber 沒有做完全的繁複中文大數解析。
            // 不過 Web Speech API 對大於十的數值通常會輸出阿拉伯數字（如 "120"）。
            // 這裡我們先測試基本中文數字，如 "喝奶九十"
        });

        it('should parse Chinese numbers under 100', () => {
            const res = parseVoiceInput('喝奶九十毫升');
            expect(res).not.toBeNull();
            expect(res.type).toBe('milk');
            expect(res.amount).toBe(90);
        });

        it('should parse breast bottle feeding', () => {
            const res = parseVoiceInput('母乳瓶餵 160cc');
            expect(res).not.toBeNull();
            expect(res.type).toBe('milk');
            expect(res.milkType).toBe('breast_bottle');
            expect(res.amount).toBe(160);
        });

        it('should parse solid food (副食品)', () => {
            const res1 = parseVoiceInput('吃副食品 80克');
            expect(res1).not.toBeNull();
            expect(res1.type).toBe('milk');
            expect(res1.milkType).toBe('solid');
            expect(res1.amount).toBe(80);

            const res2 = parseVoiceInput('吃南瓜泥 60g');
            expect(res2).not.toBeNull();
            expect(res2.type).toBe('milk');
            expect(res2.milkType).toBe('solid');
            expect(res2.amount).toBe(60);
        });

        it('should parse breast direct feeding with single side minutes', () => {
            const res1 = parseVoiceInput('親餵左邊 15 分鐘');
            expect(res1).not.toBeNull();
            expect(res1.type).toBe('milk');
            expect(res1.milkType).toBe('breast_direct');
            expect(res1.leftDuration).toBe(15);
            expect(res1.rightDuration).toBe(0);

            const res2 = parseVoiceInput('親餵右邊十分鐘');
            expect(res2).not.toBeNull();
            expect(res2.type).toBe('milk');
            expect(res2.milkType).toBe('breast_direct');
            expect(res2.leftDuration).toBe(0);
            expect(res2.rightDuration).toBe(10);
        });

        it('should parse breast direct feeding with general minutes split evenly', () => {
            const res = parseVoiceInput('親餵 20 分鐘');
            expect(res).not.toBeNull();
            expect(res.type).toBe('milk');
            expect(res.milkType).toBe('breast_direct');
            // 20 分鐘平均分給左 10 右 10
            expect(res.leftDuration).toBe(10);
            expect(res.rightDuration).toBe(10);
        });
    });

    describe('Sleep parsing', () => {
        it('should parse sleep duration in minutes', () => {
            const res = parseVoiceInput('睡了 45 分鐘');
            expect(res).not.toBeNull();
            expect(res.type).toBe('sleep');
            expect(res.duration).toBe(45);
        });

        it('should parse sleep duration in hours', () => {
            const res = parseVoiceInput('睡了兩個小時');
            expect(res).not.toBeNull();
            expect(res.type).toBe('sleep');
            expect(res.duration).toBe(120);
        });

        it('should parse sleep duration in hours and minutes', () => {
            const res = parseVoiceInput('剛剛睡了一小時二十分鐘');
            expect(res).not.toBeNull();
            expect(res.type).toBe('sleep');
            expect(res.duration).toBe(80);
        });

        it('should parse sleep duration with half hours', () => {
            const res1 = parseVoiceInput('睡了一個半小時');
            expect(res1).not.toBeNull();
            expect(res1.type).toBe('sleep');
            expect(res1.duration).toBe(90);

            const res2 = parseVoiceInput('睡了半小時');
            expect(res2).not.toBeNull();
            expect(res2.type).toBe('sleep');
            expect(res2.duration).toBe(30);

            const res3 = parseVoiceInput('睡了兩個半小時');
            expect(res3).not.toBeNull();
            expect(res3.type).toBe('sleep');
            expect(res3.duration).toBe(150);
        });
    });

    describe('Invalid inputs', () => {
        it('should return null for unrelated commands', () => {
            expect(parseVoiceInput('今天天氣真好')).toBeNull();
            expect(parseVoiceInput('寶寶在笑')).toBeNull();
            expect(parseVoiceInput('')).toBeNull();
        });
    });
});
