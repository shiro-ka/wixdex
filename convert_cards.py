#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path

input_file = Path('/home/shiroka/ドキュメント/wixdex/static/assets/cards_json/WX26-CP1')
output_file = Path('/home/shiroka/ドキュメント/wixdex/static/assets/cards_json/WX26-CP1.json')

with open(input_file, 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
cards = []
current_card = None
i = 0

def hiragana(text):
    """簡易的なひらがな変換（カタカナをひらがなに）"""
    katakana_map = {
        'ア': 'あ', 'イ': 'い', 'ウ': 'う', 'エ': 'え', 'オ': 'お',
        'カ': 'か', 'キ': 'き', 'ク': 'く', 'ケ': 'け', 'コ': 'こ',
        'サ': 'さ', 'シ': 'し', 'ス': 'す', 'セ': 'せ', 'ソ': 'そ',
        'タ': 'た', 'チ': 'ち', 'ツ': 'つ', 'テ': 'て', 'ト': 'と',
        'ナ': 'な', 'ニ': 'に', 'ヌ': 'ぬ', 'ネ': 'ね', 'ノ': 'の',
        'ハ': 'は', 'ヒ': 'ひ', 'フ': 'ふ', 'ヘ': 'へ', 'ホ': 'ほ',
        'マ': 'ま', 'ミ': 'み', 'ム': 'む', 'メ': 'め', 'モ': 'も',
        'ヤ': 'や', 'ユ': 'ゆ', 'ヨ': 'よ',
        'ラ': 'ら', 'リ': 'り', 'ル': 'る', 'レ': 'れ', 'ロ': 'ろ',
        'ワ': 'わ', 'ヲ': 'を', 'ン': 'ん',
        'ガ': 'が', 'ギ': 'ぎ', 'グ': 'ぐ', 'ゲ': 'げ', 'ゴ': 'ご',
        'ザ': 'ざ', 'ジ': 'じ', 'ズ': 'ず', 'ゼ': 'ぜ', 'ゾ': 'ぞ',
        'ダ': 'だ', 'ヂ': 'ぢ', 'ヅ': 'づ', 'デ': 'で', 'ド': 'ど',
        'バ': 'ば', 'ビ': 'び', 'ブ': 'ぶ', 'ベ': 'べ', 'ボ': 'ぼ',
        'パ': 'ぱ', 'ピ': 'ぴ', 'プ': 'ぷ', 'ペ': 'ぺ', 'ポ': 'ぽ',
        'ッ': 'っ', 'ャ': 'ゃ', 'ュ': 'ゅ', 'ョ': 'ょ'
    }
    result = []
    for char in text:
        result.append(katakana_map.get(char, char))
    return ''.join(result)

def get_next_indented_lines():
    """次のインデント付き行をすべて取得"""
    global i
    i += 1
    values = []
    while i < len(lines) and lines[i].startswith('    '):
        values.append(lines[i].strip())
        i += 1
    i -= 1
    return values

def normalize_text(text):
    """全角数字と記号を半角に正規化"""
    replacements = {
        '１': '1', '２': '2', '３': '3', '４': '4', '５': '5',
        '６': '6', '７': '7', '８': '8', '９': '9', '０': '0',
        '　': ' '
    }
    for full, half in replacements.items():
        text = text.replace(full, half)
    return text

def parse_cost(cost_lines):
    """コストをパース"""
    if not cost_lines or (len(cost_lines) == 1 and cost_lines[0] == '-'):
        return None
    cost_dict = {}
    for line in cost_lines:
        if line == '-':
            continue
        # 《白》×１ のような形式をパース
        match = re.match(r'《(.+?)》×(\d+)', line)
        if match:
            color = match.group(1)
            count = int(match.group(2))
            cost_dict[color] = count
    return cost_dict if cost_dict else None

def parse_timing(timing_lines):
    """タイミングをパース"""
    if not timing_lines or (len(timing_lines) == 1 and timing_lines[0] == '-'):
        return None
    return timing_lines

def parse_color(color_lines):
    """色をパース"""
    if not color_lines or (len(color_lines) == 1 and color_lines[0] == '-'):
        return None
    return color_lines

def parse_level(level_lines):
    """レベルをパース"""
    if level_lines and level_lines[0] != '-':
        try:
            return int(level_lines[0])
        except:
            return None
    return None

def parse_power(power_lines):
    """パワーをパース"""
    if power_lines and power_lines[0] != '-':
        try:
            return int(power_lines[0])
        except:
            return None
    return None

while i < len(lines):
    line = lines[i].strip()

    # カードID行の判定
    if re.match(r'^WX\d+-[A-Z]{2}\d+-\d+$', line):
        if current_card:
            cards.append(current_card)
        current_card = {
            'cardID': line,
            'productID': line.rsplit('-', 1)[0],
            'image': f'public/assets/cards_img/{line.rsplit("-", 1)[0]}/{line}.webp',
            'name': '',
            'subName': [],
            'rarity': '',
            'illust': '',
            'cardType': [],
            'lrigTypeClass': None,
            'color': None,
            'level': None,
            'cost': None,
            'power': None,
            'timing': None,
            'lifeBurst': None,
            'text': {},
            'flavorText': '',
            'faq': {},
            'tags': [],
            'additionalInfo': {}
        }
        i += 1
        continue

    if not current_card:
        i += 1
        continue

    # カード名＜フリガナ＞
    if 'name' in current_card and not current_card['name'] and '＜' in line and '＞' in line:
        match = re.match(r'^(.+?)＜(.+?)＞$', line)
        if match:
            name = match.group(1).replace('　', ' ')
            furigana = match.group(2)
            current_card['name'] = name
            current_card['subName'] = [hiragana(furigana)]
        i += 1
        continue

    # レアリティ
    if current_card['name'] and not current_card['rarity'] and line in ['C', 'R', 'SR', 'LR', 'PI', 'PR', 'SP']:
        current_card['rarity'] = line
        i += 1
        continue

    # Illust
    if line.startswith('Illust '):
        illust = line[7:].strip()
        current_card['illust'] = '' if illust == '-' else illust
        i += 1
        continue

    # セクション処理
    if line == 'カード種類':
        current_card['cardType'] = get_next_indented_lines()
        i += 1
        continue

    if line == 'カードタイプ':
        values = get_next_indented_lines()
        if values and values[0] != '-':
            current_card['lrigTypeClass'] = values
        i += 1
        continue

    if line == '色':
        current_card['color'] = parse_color(get_next_indented_lines())
        i += 1
        continue

    if line == 'レベル':
        current_card['level'] = parse_level(get_next_indented_lines())
        i += 1
        continue

    if line == 'コスト':
        current_card['cost'] = parse_cost(get_next_indented_lines())
        i += 1
        continue

    if line == 'パワー':
        current_card['power'] = parse_power(get_next_indented_lines())
        i += 1
        continue

    if line == '使用タイミング':
        current_card['timing'] = parse_timing(get_next_indented_lines())
        i += 1
        continue

    if line == '使用条件':
        current_card['timing'] = parse_timing(get_next_indented_lines())
        i += 1
        continue

    # テキスト抽出（ラベル【...】の処理）
    if line and line.startswith('【') and '】' in line and ':' not in current_card.get('cardType', []):
        text_lines = []
        while i < len(lines):
            current_line = lines[i].strip()
            if not current_line or current_line in ['FAQ', 'ストーリー', 'フォーマット', 'カード種類']:
                break
            text_lines.append(normalize_text(current_line))
            i += 1
        if text_lines:
            full_text = '\n'.join(text_lines)
            # 【能力】：テキスト の形式を抽出
            if '：' in full_text:
                parts = full_text.split('：', 1)
                key = parts[0].replace('【', '').replace('】', '')
                value = parts[1].strip()
                current_card['text'][key] = value
            else:
                current_card['text']['効果'] = full_text
        continue

    # テキスト抽出（通常テキスト）
    if current_card['cardType'] and line and not any(kw in line for kw in ['カード種類', 'カードタイプ', '色', 'コスト', 'レベル', 'パワー', 'リミット', 'グロウコスト', '使用タイミング', 'ストーリー', 'フォーマット', 'FAQ', '限定条件']):
        if line not in ['', '-'] and not line.startswith('Illust'):
            if 'FAQ' not in line and not re.match(r'^WX\d+-', line):
                # テキスト行として処理
                if '【' in line:
                    # ラベル付きテキスト
                    match = re.match(r'^【(.+?)】[:：](.+)$', line)
                    if match:
                        key = match.group(1)
                        value = normalize_text(match.group(2))
                        current_card['text'][key] = value
                    i += 1
                    continue
                elif not current_card['text'] and line != '-':
                    # フレーバーテキスト候補
                    if line not in current_card.get('text', {}).values():
                        current_card['text'][''] = normalize_text(line)

    # FAQ処理
    if line == 'FAQ':
        faq_dict = {}
        i += 1
        while i < len(lines):
            q_line = lines[i].strip()
            if not q_line or re.match(r'^WX\d+-', q_line):
                break
            if q_line and not q_line.startswith('    '):
                # 質問行
                i += 1
                if i < len(lines):
                    a_line = lines[i].strip()
                    if a_line:
                        faq_dict[normalize_text(q_line)] = normalize_text(a_line)
            i += 1
        current_card['faq'] = faq_dict
        continue

    i += 1

if current_card and current_card['cardID']:
    cards.append(current_card)

# JSON出力
output_json = json.dumps(cards, ensure_ascii=False, indent=2)
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(output_json)

print(f"変換完了: {len(cards)}枚のカード")
print(f"出力: {output_file}")
